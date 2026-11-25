import { CompanyConfig, Service } from '../types';

export interface ZionMessageInput {
  role: 'user' | 'assistant';
  text: string;
}

interface QueryZionParams {
  messages: ZionMessageInput[];
  services: Service[];
  config: CompanyConfig;
}

export interface QueryZionResult {
  reply: string;
  mode: 'gemini' | 'local';
}

const REMOTE_ZION_ENDPOINT = 'https://maruipe-lavajato-one.vercel.app/api/zion/chat';

function getZionEndpoint(): string {
  if (typeof window === 'undefined') return '/api/zion/chat';

  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  const isCapacitor =
    Boolean(cap?.isNativePlatform?.()) ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'file:' ||
    (window.location.protocol === 'https:' && window.location.hostname === 'localhost' && window.location.port === '');

  return isCapacitor ? REMOTE_ZION_ENDPOINT : '/api/zion/chat';
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatServicePrice(service: Service): string {
  if (service.price !== null) {
    return `${service.pricePrefix ? service.pricePrefix + ' ' : ''}R$ ${service.price}`;
  }
  return service.priceLabel || 'Consultar preço';
}

function tryEvaluatePercentageOrMath(userText: string): string | null {
  const cleanedPercent = userText
    .toLowerCase()
    .replace(/,/g, '.')
    .match(/(-?\d+(?:\.\d+)?)\s*%\s*de\s*(-?\d+(?:\.\d+)?)/i);

  if (cleanedPercent) {
    const pct = Number(cleanedPercent[1]);
    const base = Number(cleanedPercent[2]);
    if (Number.isFinite(pct) && Number.isFinite(base)) {
      const result = (pct / 100) * base;
      const formatted = Number.isInteger(result) ? String(result) : result.toFixed(2).replace(/\.?0+$/, '');
      return `**${pct}% de ${base}** é igual a **${formatted}**.`;
    }
  }

  let exprSource = userText
    .replace(/,/g, '.')
    .replace(/÷/g, '/')
    .replace(/×/g, '*')
    .replace(/(\d)\s*[xX]\s*(\d)/g, '$1 * $2');

  const mathMatch = exprSource.match(/(-?\d+(?:\.\d+)?(?:\s*[-+*/]\s*\(?\s*-?\d+(?:\.\d+)?\s*\)?)+)/);
  if (!mathMatch) return null;

  const rawExpr = mathMatch[1].replace(/\s+/g, '');
  if (!/^[0-9+\-*/().]+$/.test(rawExpr) || rawExpr.length > 64) return null;

  // Tokenize and evaluate safely with recursive descent (no eval/Function)
  const tokens = rawExpr.match(/\d+(?:\.\d+)?|[+\-*/()]/g);
  if (!tokens || tokens.length < 3) return null;

  let idx = 0;
  const parseExpr = (): number => {
    let val = parseTerm();
    while (tokens[idx] === '+' || tokens[idx] === '-') {
      const op = tokens[idx++];
      const rhs = parseTerm();
      val = op === '+' ? val + rhs : val - rhs;
    }
    return val;
  };
  const parseTerm = (): number => {
    let val = parseFactor();
    while (tokens[idx] === '*' || tokens[idx] === '/') {
      const op = tokens[idx++];
      const rhs = parseFactor();
      if (op === '/' && rhs === 0) throw new Error('div0');
      val = op === '*' ? val * rhs : val / rhs;
    }
    return val;
  };
  const parseFactor = (): number => {
    if (tokens[idx] === '+') {
      idx++;
      return parseFactor();
    }
    if (tokens[idx] === '-') {
      idx++;
      return -parseFactor();
    }
    if (tokens[idx] === '(') {
      idx++;
      const inner = parseExpr();
      if (tokens[idx] !== ')') throw new Error('paren');
      idx++;
      return inner;
    }
    const num = Number(tokens[idx++]);
    if (!Number.isFinite(num)) throw new Error('nan');
    return num;
  };

  try {
    const value = parseExpr();
    if (idx !== tokens.length || !Number.isFinite(value)) return null;
    const formatted = Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/\.?0+$/, '');
    return `O resultado de **${rawExpr}** é **${formatted}**.`;
  } catch {
    return null;
  }
}

export function buildLocalZionReply(
  userText: string,
  services: Service[],
  config: CompanyConfig,
  backendError?: string
): string {
  const q = normalizeText(userText);

  const byId = (id: string) => services.find((s) => s.id === id);
  const lavEspecial = byId('lavagem-especial');
  const lavPremium = byId('lavagem-premium') || byId('lavagem-premium-detalhada');
  const farol = byId('polimento-farol') || byId('polimento-de-farol');
  const polimento = byId('polimento-automotivo');
  const micropolimento = byId('micropolimento');
  const motor = byId('lavagem-de-motor');
  const rodas = byId('higienizacao-das-rodas');
  const cera = byId('cera-premium');
  const plasticos = byId('revitalizacao-dos-plasticos');
  const higienizacao = byId('higienizacao-automotiva');
  const vitrificacao = byId('vitrificacao-automotiva');

  if (
    /^(oi|ola|bom dia|boa tarde|boa noite|e ai|opa|hey|hello|tudo bem|como vai)\b/.test(q) ||
    q.includes('quem e voce') ||
    q.includes('o que voce faz')
  ) {
    return `Olá! Sou o **Zion**, a Inteligência Artificial do **${config.name}**!\n\nVocê pode me perguntar **qualquer coisa** sobre **qualquer assunto** (dúvidas do dia a dia, cálculos, receitas, estudos, curiosidades) ou sobre nossos serviços automotivos (como a **Lavagem Especial por R$ 50**, **Vitrificação** e **Leva e Traz**). Como posso ajudar?`;
  }

  if (
    q.includes('horario') ||
    q.includes('abre') ||
    q.includes('fecha') ||
    q.includes('domingo') ||
    q.includes('sabado') ||
    q.includes('segunda') ||
    q.includes('funcionamento') ||
    q.includes('aberto')
  ) {
    return `Nosso horário de funcionamento no **${config.name}** é:\n- **Segunda a Sábado:** ${config.businessHoursWeekdays}\n- **Domingos:** ${config.businessHoursSunday}\n\nVocê pode garantir seu horário exato na aba **Agendar** sem esperar em fila!`;
  }

  if (
    q.includes('buscar') ||
    q.includes('busca') ||
    q.includes('leva e traz') ||
    q.includes('leva-e-traz') ||
    q.includes('levar') ||
    q.includes('trazer') ||
    q.includes('retirar') ||
    q.includes('domicilio') ||
    q.includes('em casa') ||
    q.includes('trabalho') ||
    q.includes('delivery')
  ) {
    return `Você pode escolher como prefere no **${config.name}**:\n- **Buscamos no local (Leva e Traz):** nossa equipe retira e devolve o veículo com segurança (informe seu endereço direto no agendamento).\n- **Você traz até o lava jato:** na **${config.address}**.\n\nNa aba **Agendar** ou no carrinho do site/app, basta selecionar a opção desejada e confirmar a disponibilidade pelo WhatsApp **${config.whatsappPhone}**!`;
  }

  if (
    q.includes('endereco') ||
    q.includes('onde fica') ||
    q.includes('localizacao') ||
    q.includes('mapa') ||
    q.includes('rua') ||
    q.includes('bairro') ||
    q.includes('vitoria')
  ) {
    return `Estamos localizados na **${config.address}** (Maruípe, Vitória/ES).\n\nSe preferir, também oferecemos a opção de **buscar seu carro no local (Leva e Traz)** direto no agendamento ou pelo WhatsApp **${config.whatsappPhone}**.`;
  }

  if (
    q.includes('pix') ||
    q.includes('cartao') ||
    q.includes('credito') ||
    q.includes('debito') ||
    q.includes('pagamento') ||
    q.includes('pagar') ||
    q.includes('parcel')
  ) {
    return `Aceitamos todas as formas práticas de pagamento:\n- **PIX:** chave **${config.pixKey}**\n- **Cartão de Crédito e Débito** (na recepção ou link online)\n- **Pagamento presencial na entrega do veículo**\n\nVocê pode escolher sua forma preferida direto ao confirmar na aba **Agendar**.`;
  }

  if (q.includes('farol') || q.includes('amarel') || q.includes('opaco')) {
    const s = farol;
    return `Para farol amarelado ou opaco, recomendamos o **${s?.name || 'Polimento de Farol'}** (~${s?.durationMinutes || 60} min · **${s ? formatServicePrice(s) : 'Consultar preço'}**).\n\n${s?.description || 'Restauramos a transparência original da lente com lixamento técnico, polimento e selante com proteção UV.'}\n\nToque em **Agendar** ou fale no WhatsApp **${config.whatsappPhone}** para avaliar seu veículo!`;
  }

  if (q.includes('vitrifica') || q.includes('ceramica') || q.includes('coating') || q.includes('9h')) {
    const s = vitrificacao;
    return `Nossa **${s?.name || 'Vitrificação Automotiva'}** (~${s?.durationMinutes || 240} min · **${s ? formatServicePrice(s) : 'Consultar valores'}**) cria uma camada cerâmica de alta dureza sobre o verniz, protegendo contra raios UV, seiva, chuva ácida e micro-riscos com brilho vítreo e altíssima repelência à água.\n\nO orçamento depende do porte e estado da pintura do veículo — agende uma avaliação ou chame no WhatsApp **${config.whatsappPhone}**!`;
  }

  if (
    q.includes('risco') ||
    q.includes('arranh') ||
    q.includes('fosco') ||
    q.includes('verniz') ||
    q.includes('micro') ||
    q.includes('polimento') ||
    q.includes('espelha')
  ) {
    if (q.includes('micro') && micropolimento) {
      return `O **${micropolimento.name}** (~${micropolimento.durationMinutes} min · **${formatServicePrice(micropolimento)}**) é ideal para marcas leves e perda de brilho, fazendo refino e lustro técnico sem desbaste agressivo do verniz.\n\nQuer agendar uma avaliação? Toque em **Agendar** ou envie uma foto pelo WhatsApp **${config.whatsappPhone}**!`;
    }
    const s = polimento;
    return `Para riscos, marcas de lavagem (swirls) e pintura opaca, o ideal é o **${s?.name || 'Polimento Automotivo'}** (~${s?.durationMinutes || 180} min · **${s ? formatServicePrice(s) : 'Consultar preço'}**), ou o **Micropolimento** para brilho refinado.\n\nAgende sua avaliação rápida na aba **Agendar** ou pelo WhatsApp **${config.whatsappPhone}**!`;
  }

  if (
    q.includes('banco') ||
    q.includes('estofado') ||
    q.includes('cheiro') ||
    q.includes('odor') ||
    q.includes('mancha') ||
    q.includes('teto') ||
    q.includes('carpete') ||
    q.includes('interno') ||
    q.includes('higieniz')
  ) {
    if (q.includes('roda') || q.includes('pinca') || q.includes('aro')) {
      const r = rodas;
      return `A **${r?.name || 'Higienização das Rodas'}** (~${r?.durationMinutes || 45} min · **${r ? formatServicePrice(r) : 'Consultar preço'}**) faz descontaminação ferrosa completa dos aros, pinças de freio e aplica pretinho hidrofóbico nos pneus.`;
    }
    const s = higienizacao;
    return `Para sujeira profunda, manchas, odores ou ácaros nos bancos, indicamos a **${s?.name || 'Higienização Automotiva'}** (~${s?.durationMinutes || 120} min · **${s ? formatServicePrice(s) : 'Consultar preço'}**).\n\nEla faz extração profunda de estofados, carpetes, teto e painel com ação bactericida. Toque em **Agendar** para reservar!`;
  }

  if (q.includes('motor') || q.includes('capo') || q.includes('oleo')) {
    const s = motor;
    return `Nossa **${s?.name || 'Lavagem de Motor'}** (~${s?.durationMinutes || 60} min · **${s ? formatServicePrice(s) : 'Consultar preço'}**) é feita com isolamento seguro dos componentes elétricos, limpeza técnica e verniz protetor.\n\nToque em **Agendar** para marcar seu horário com segurança!`;
  }

  if (q.includes('plastico') || q.includes('esbranquic') || q.includes('painel') || q.includes('para-choque') || q.includes('parachoque')) {
    const s = plasticos;
    return `Para plásticos internos ou externos esbranquiçados pelo sol, fazemos a **${s?.name || 'Revitalização dos Plásticos'}** (~${s?.durationMinutes || 40} min · **${s ? formatServicePrice(s) : 'Consultar preço'}**), restaurando o preto original com proteção UV.\n\nDica: a **Lavagem Especial (R$ 50)** já inclui revitalização de plásticos!`;
  }

  if (q.includes('cera') || q.includes('carnauba') || q.includes('protecao')) {
    const s = cera;
    return `Nossa **${s?.name || 'Cera Premium'}** (~${s?.durationMinutes || 45} min · **${s ? formatServicePrice(s) : 'Consultar preço'}**) entrega brilho espelhado intenso e proteção hidrofóbica contra sol e chuva.\n\nSe quiser lavar + encerar com ótimo custo-benefício, a **Lavagem Especial** custa apenas **R$ 50**!`;
  }

  if (q.includes('roda') || q.includes('pneu') || q.includes('pretinho')) {
    const s = rodas;
    return `Fazemos a **${s?.name || 'Higienização das Rodas'}** (~${s?.durationMinutes || 45} min · **${s ? formatServicePrice(s) : 'Consultar preço'}**) com remoção de poeira de freio e pretinho de alta durabilidade.`;
  }

  if (q.includes('simples') || q.includes('basica') || q.includes('lavagem de 35') || q.includes('r$ 35')) {
    return `Atualmente trabalhamos a partir da **${lavEspecial?.name || 'Lavagem Especial'}** por apenas **${lavEspecial ? formatServicePrice(lavEspecial) : 'R$ 50'}** (~${lavEspecial?.durationMinutes || 60} min), que já inclui lavagem técnica completa, aspiração, pretinho, cera protetora e revitalização dos plásticos internos e externos!\n\nTambém temos a **${lavPremium?.name || 'Lavagem Premium Detalhada'}** (${lavPremium ? formatServicePrice(lavPremium) : 'A partir de R$ 90'}). Quer agendar?`;
  }

  if (q.includes('especial') || q.includes('promo') || q.includes('50') || q.includes('indica') || q.includes('recomenda') || q.includes('melhor')) {
    return `A nossa campeã em custo-benefício é a **${lavEspecial?.name || 'Lavagem Especial'}** por apenas **${lavEspecial ? formatServicePrice(lavEspecial) : 'R$ 50'}** (~${lavEspecial?.durationMinutes || 60} min)!\n\nEla inclui: **lavagem externa + aspiração + pretinho + cera protetora + revitalização dos plásticos por dentro e por fora**.\n\nVocê pode adicionar ao Carrinho ou clicar em **Agendar** agora mesmo!`;
  }

  if (q.includes('premium') || q.includes('detalhada') || q.includes('90')) {
    return `A **${lavPremium?.name || 'Lavagem Premium Detalhada'}** sai **${lavPremium ? formatServicePrice(lavPremium) : 'A partir de R$ 90'}** (~${lavPremium?.durationMinutes || 90} min) e entrega detalhamento minucioso com pincelamento de emblemas/cantos, cera premium e revitalização completa dos plásticos.`;
  }

  if (
    q.includes('preco') ||
    q.includes('valor') ||
    q.includes('quanto') ||
    q.includes('custa') ||
    q.includes('servico') ||
    q.includes('catalogo') ||
    q.includes('tabela') ||
    q.includes('tudo')
  ) {
    return `Confira nossos principais valores no **${config.name}**:\n- **Lavagem Especial (Promoção):** ${lavEspecial ? formatServicePrice(lavEspecial) : 'R$ 50'}\n- **Lavagem Premium Detalhada:** ${lavPremium ? formatServicePrice(lavPremium) : 'A partir de R$ 90'}\n- **Estética (Vitrificação Automotiva, Farol, Polimento, Micropolimento, Higienização, Motor, Rodas, Cera, Plásticos):** Consultar valores após rápida avaliação.\n\nEscolha no **Catálogo** ou clique em **Agendar**!`;
  }

  if (q.includes('agendar') || q.includes('marcar') || q.includes('reserva') || q.includes('vaga')) {
    return `É super rápido agendar aqui pelo aplicativo:\n1. Toque na aba **Agendar**\n2. Escolha o serviço, o dia e um horário livre (sem filas!)\n3. Escolha entre **Trazer o carro na loja** ou **Buscamos no local (Leva e Traz)**\n4. Selecione **Cartão, PIX ou Pagamento na Entrega** e confirme no WhatsApp.\n\nHorários: Seg a Sáb (${config.businessHoursWeekdays}) e Domingos (${config.businessHoursSunday}).`;
  }

  if (q.includes('whatsapp') || q.includes('telefone') || q.includes('zap') || q.includes('contato') || q.includes('falar')) {
    return `Nosso WhatsApp oficial é **${config.whatsappPhone}**! Você também pode ver tudo por aqui no App, conferir preços no Catálogo e agendar direto pela aba **Agendar**.`;
  }

  if (
    q.includes('lava jato') ||
    q.includes('lavajato') ||
    q.includes('lavagem') ||
    q.includes('lavar') ||
    q.includes('carro') ||
    q.includes('veiculo') ||
    q.includes('estetica')
  ) {
    return `Aqui no **${config.name}** temos:\n- **Lavagem Especial em Promoção (R$ 50)**\n- **Lavagem Premium Detalhada (a partir de R$ 90)**\n- **Estética Completa:** Vitrificação Automotiva, Polimento, Farol, Higienização Interna, Motor, Rodas, Cera e Plásticos\n\nTambém temos **Leva e Traz** (buscamos no local ou você traz na ${config.address}). Toque em **Agendar** ou pergunte mais detalhes!`;
  }

  if (q.includes('que dia') || q.includes('data de hoje') || q.includes('que horas') || q.includes('hora agora')) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `Agora são **${formattedTime}** e hoje é **${formattedDate}**.`;
  }

  const mathAnswer = tryEvaluatePercentageOrMath(userText);
  if (mathAnswer) {
    return mathAnswer;
  }

  const reasonNote = backendError
    ? `(${backendError})`
    : '(sem conexão com o servidor de IA no momento)';

  return `Para responder perguntas abertas sobre **qualquer assunto geral** em tempo real, o Zion utiliza a IA online ${reasonNote}.\n\nSe você estiver no site ou aplicativo em produção, basta confirmar se há conexão com a internet e se a variável **GEMINI_API_KEY** está configurada no servidor/Vercel.\n\nEnquanto estiver no modo offline local, consigo responder na hora sobre **contas matemáticas**, **data/hora atual** e tudo sobre os **serviços, preços e Leva e Traz do ${config.name}**!`;
}

export async function queryZionAssistant({
  messages,
  services,
  config,
}: QueryZionParams): Promise<QueryZionResult> {
  const endpoint = getZionEndpoint();
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.text || '';
  let backendError: string | undefined;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages,
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          price: s.price,
          pricePrefix: s.pricePrefix,
          priceLabel: s.priceLabel,
          durationMinutes: s.durationMinutes,
          description: s.description,
          includes: s.includes,
          isPromo: s.isPromo,
        })),
        config: {
          name: config.name,
          address: config.address,
          whatsappPhone: config.whatsappPhone,
          pixKey: config.pixKey,
          businessHoursWeekdays: config.businessHoursWeekdays,
          businessHoursSunday: config.businessHoursSunday,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.reply && typeof data.reply === 'string') {
        return { reply: data.reply, mode: 'gemini' };
      }
    } else {
      try {
        const errData = await response.json();
        if (errData?.error && typeof errData.error === 'string') {
          backendError = errData.error;
        } else {
          backendError = `Erro HTTP ${response.status}`;
        }
      } catch {
        backendError = `Erro HTTP ${response.status}`;
      }
    }
  } catch {
    backendError = 'Falha de rede ou tempo limite ao conectar ao servidor de IA';
  }

  return {
    reply: buildLocalZionReply(lastUserMsg, services, config, backendError),
    mode: 'local',
  };
}
