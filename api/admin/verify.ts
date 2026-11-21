import crypto from 'crypto';

function verifyConstantTime(input: string, secret: string): boolean {
  const inputHash = crypto.createHash('sha256').update(input, 'utf8').digest();
  const secretHash = crypto.createHash('sha256').update(secret, 'utf8').digest();
  return crypto.timingSafeEqual(inputHash, secretHash);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ authenticated: false, error: 'Método não permitido.' });
  }

  const configuredPassword = (process.env.ADMIN_PASSWORD || '').trim();
  if (!configuredPassword) {
    return res.status(503).json({
      authenticated: false,
      notConfigured: true,
      error:
        'Painel bloqueado por segurança: defina a variável ADMIN_PASSWORD nas configurações da Vercel / servidor para liberar o acesso exclusivo do proprietário.',
    });
  }

  const provided = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
  if (!provided) {
    return res.status(400).json({
      authenticated: false,
      error: 'Digite a senha do proprietário para acessar o painel.',
    });
  }

  if (!verifyConstantTime(provided, configuredPassword)) {
    return res.status(401).json({
      authenticated: false,
      error: 'Senha incorreta. Apenas o proprietário autorizado pode alterar o sistema.',
    });
  }

  return res.status(200).json({ authenticated: true });
}
