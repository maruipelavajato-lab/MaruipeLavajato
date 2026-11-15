import 'dotenv/config';
import crypto from 'crypto';
import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  text: string;
}

interface ServiceSummary {
  id: string;
  name: string;
  category: string;
  price: number | null;
  pricePrefix?: string;
  priceLabel?: string;
  durationMinutes: number;
  description: string;
  includes?: string[];
  isPromo?: boolean;
}

interface CompanySummary {
  name?: string;
  address?: string;
  whatsappPhone?: string;
  pixKey?: string;
  businessHoursWeekdays?: string;
  businessHoursSunday?: string;
}

function buildZionSystemInstruction(services?: ServiceSummary[], company?: CompanySummary): string {
  const companyName = company?.name || 'Maruípe Lava Jato Estética Automotiva';
  const address = company?.address || 'Rua Daniel Abreu Machado, 406 – Vitória/ES';
  const whatsapp = company?.whatsappPhone || '(27) 99286-9471';
  const pixKey = company?.pixKey || '27 99286-9471';
  const hoursWeekdays = company?.businessHoursWeekdays || '07:00 às 18:00';
  const hoursSunday = company?.businessHoursSunday || '08:00 às 14:00';

  const catalogLines =
    services && services.length > 0
      ? services
          .map((s) => {
            const priceText =
              s.price !== null
                ? `${s.pricePrefix ? s.pricePrefix + ' ' : ''}R$ ${s.price}`
                : s.priceLabel || 'Consultar preço';
            const promoTag = s.isPromo ? ' [PROMOÇÃO DESTAQUE]' : '';
            const incText = s.includes && s.includes.length > 0 ? ` Inclui: ${s.includes.join(', ')}.` : '';
            return `- ${s.name}${promoTag}: ${priceText} (Duração média: ~${s.durationMinutes} min). ${s.description}${incText}`;
          })
          .join('\n')
      : `- Lavagem Simples: R$ 35 (~45 min). Lavar + aspirar + pretinho nos pneus.
- Lavagem Especial [PROMOÇÃO DESTAQUE]: R$ 50 (~60 min). Lavagem + aspiração + pretinho + cera protetora + revitalização dos plásticos por dentro e por fora.
- Lavagem Premium Detalhada: A partir de R$ 90 (~90 min). Lavagem detalhada com pincelamento + cera premium + revitalização dos plásticos + acabamento premium.
- Polimento de Farol: Consultar preço (~60 min). Restauração de transparência e selante UV.
- Polimento Automotivo: Consultar preço (~180 min). Remoção de riscos, swirls e restauração de brilho.
- Micropolimento: Consultar preço (~120 min). Polimento refinado sem desbaste agressivo do verniz.
- Lavagem de Motor: Consultar preço (~60 min). Limpeza técnica com isolamento elétrico e verniz protetor.
- Higienização das Rodas: Consultar preço (~45 min). Descontaminação ferrosa de aros, pinças e pretinho hidrofóbico.
- Cera Premium: Consultar preço (~45 min). Cera nobre com alto poder hidrofóbico e brilho espelhado.
- Revitalização dos Plásticos: Consultar preço (~40 min). Restauração do preto original e proteção UV interna e externa.
- Higienização Automotiva: Consultar preço (~120 min). Extração profunda de estofados, carpetes, teto e painel com bactericida.
- Vitrificação Automotiva: Consultar valores (~240 min). Coating cerâmico protetor para pintura com brilho espelhado e proteção UV.`;

  return `Você é **Zion**, a Inteligência Artificial oficial do **${companyName}** — um assistente completo, inteligente, amigável e versátil.

SUA CAPACIDADE UNIVERSAL:
- Você responde **QUALQUER PERGUNTA sobre QUALQUER ASSUNTO** que o cliente quiser perguntar, mesmo que não tenha nenhuma relação com lava jato ou carros (exemplos: matemática, receitas culinárias, história, tecnologia, programação, saúde no dia a dia, curiosidades, traduções, estudos, negócios, mecânica geral, dicas práticas, etc.).
- Nunca recuse perguntas por serem fora do tema automotivo e nunca force propaganda do lava jato no final de respostas sobre assuntos gerais. Responda de forma útil, clara, precisa e natural em Português do Brasil.
- Se a pergunta for sobre carros, estética automotiva ou sobre o **${companyName}**, use os dados oficiais abaixo com máxima precisão.

DADOS OFICIAIS DO ${companyName.toUpperCase()}:
- Nome: ${companyName}
- Endereço: ${address} (Maruípe, Vitória/ES)
- WhatsApp oficial: ${whatsapp}
- Chave PIX: ${pixKey}
- Horário de funcionamento: Segunda a Sábado das ${hoursWeekdays} | Domingos das ${hoursSunday}
- Modalidade de atendimento: O cliente pode **levar o carro até o lava jato** (${address}) ou solicitar que a equipe **busque o carro no local (Leva e Traz)**, selecionando essa opção e informando o endereço direto no agendamento do site ou aplicativo (com confirmação de região e disponibilidade pelo WhatsApp ${whatsapp}).
- Formas de pagamento: PIX (chave ${pixKey}), Cartão de Crédito, Cartão de Débito e pagamento presencial na entrega/recepção.
- Sistema do site/app: O cliente pode adicionar serviços ao Carrinho, escolher data e horário exato no Agendamento Inteligente (sem fila e sem risco de conflito de horários) ou chamar direto no WhatsApp.

CATÁLOGO OFICIAL DE SERVIÇOS DO LAVA JATO:
${catalogLines}

REGRAS DE CONDUTA DO ZION:
1. Responda sempre em Português do Brasil com clareza, simpatia e objetividade (adaptando o tamanho da resposta ao que foi perguntado).
2. Para perguntas gerais (não relacionadas ao lava jato): responda diretamente com conhecimento completo e confiável, sem empurrar serviços ou preços.
3. Para dúvidas sobre estética automotiva ou serviços do ${companyName}: diagnostique a necessidade do veículo, recomende o serviço exato do catálogo acima e explique prazos/valores com precisão.
4. Para serviços com preço "Consultar preço" ou "Consultar valores", informe o que está incluso e explique que o orçamento exato depende da avaliação do veículo, orientando clicar em "Agendar" ou falar no WhatsApp ${whatsapp}.
5. Nunca invente preços, endereços, serviços ou promoções do ${companyName} que não estejam listados acima.`;
}

async function createServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '1mb' }));

  app.options('/api/admin/verify', (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  });

  app.post('/api/admin/verify', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const configuredPassword = (process.env.ADMIN_PASSWORD || '').trim();
    if (!configuredPassword) {
      return res.status(503).json({
        authenticated: false,
        notConfigured: true,
        error:
          'Painel bloqueado por segurança: defina a variável ADMIN_PASSWORD no servidor / Vercel (ou em Settings > Secrets) para liberar o acesso exclusivo do proprietário.',
      });
    }

    const provided = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
    if (!provided) {
      return res.status(400).json({
        authenticated: false,
        error: 'Digite a senha do proprietário para acessar o painel.',
      });
    }

    const inputHash = crypto.createHash('sha256').update(provided, 'utf8').digest();
    const secretHash = crypto.createHash('sha256').update(configuredPassword, 'utf8').digest();
    if (!crypto.timingSafeEqual(inputHash, secretHash)) {
      return res.status(401).json({
        authenticated: false,
        error: 'Senha incorreta. Apenas o proprietário autorizado pode alterar o sistema.',
      });
    }

    return res.status(200).json({ authenticated: true });
  });

  app.options('/api/zion/chat', (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  });

  app.post('/api/zion/chat', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error:
            'A chave GEMINI_API_KEY ainda não está configurada no servidor. Verifique Settings > Secrets.',
        });
      }

      const { messages, services, config } = req.body as {
        messages?: ChatHistoryItem[];
        services?: ServiceSummary[];
        config?: CompanySummary;
      };

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Envie pelo menos uma mensagem para conversar com o Zion.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents = messages
        .filter((m) => m && typeof m.text === 'string' && m.text.trim().length > 0)
        .slice(-16)
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.text.trim() }],
        }));

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: buildZionSystemInstruction(services, config),
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        return res.status(502).json({
          error: 'O Zion não conseguiu formular uma resposta agora. Tente perguntar novamente.',
        });
      }

      return res.json({ reply: replyText });
    } catch (err: unknown) {
      console.error('Erro no endpoint /api/zion/chat:', err);
      const errObj = err as { status?: number; message?: string };
      const errMsg = errObj?.message || (err instanceof Error ? err.message : String(err));
      const status = errObj?.status;

      if (status === 401 || status === 403 || status === 400 || errMsg.includes('403') || errMsg.includes('401') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('API_KEY_INVALID')) {
        return res.status(status === 400 ? 400 : status === 401 ? 401 : 403).json({
          error: 'A chave GEMINI_API_KEY configurada está inativa ou inválida. Por favor, selecione ou atualize a chave em Settings > Secrets.',
        });
      }
      if (status === 404 || errMsg.includes('NOT_FOUND')) {
        return res.status(404).json({
          error: 'Modelo de IA temporariamente indisponível. Tente novamente em instantes.',
        });
      }
      if (status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({
          error: 'Muitas solicitações ao Zion no momento. Aguarde alguns segundos e tente novamente.',
        });
      }

      return res.status(500).json({
        error: `Ocorreu uma instabilidade ao consultar o Zion (${status || 'erro interno'}). Você também pode falar direto pelo WhatsApp (27) 99286-9471.`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Maruípe Lava Jato server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer();
