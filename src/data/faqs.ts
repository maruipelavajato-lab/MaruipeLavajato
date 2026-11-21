import { FaqItem } from '../types';

export const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Atendimento & Leva e Traz',
    question: 'Como funciona o serviço de buscar o carro no local (Leva e Traz)?',
    answer:
      'No formulário de agendamento do site ou aplicativo, basta selecionar a opção "Buscar veículo no local (Leva e Traz)" e informar seu endereço em Vitória/ES. Nossa equipe confirma a disponibilidade do horário pelo WhatsApp e realiza a coleta e devolução do veículo com toda segurança.',
    visible: true,
  },
  {
    id: 'faq-2',
    category: 'Agendamento',
    question: 'Preciso agendar horário ou posso ir direto ao lava jato?',
    answer:
      'Recomendamos agendar pelo site ou aplicativo para garantir sua vaga na hora exata desejada, sem filas e sem espera. Caso prefira, você também pode trazer o carro diretamente na Rua Daniel Abreu Machado, 406, em Maruípe.',
    visible: true,
  },
  {
    id: 'faq-3',
    category: 'Horários',
    question: 'Qual o horário de funcionamento do Maruípe Lava Jato?',
    answer:
      'Atendemos de Segunda a Sábado das 07:00 às 18:00 e aos Domingos das 08:00 às 14:00.',
    visible: true,
  },
  {
    id: 'faq-4',
    category: 'Serviços',
    question: 'Qual a diferença entre a Lavagem Especial (R$ 50) e a Lavagem Premium Detalhada?',
    answer:
      'A Lavagem Especial (R$ 50) inclui lavagem completa, aspiração interna, pretinho nos pneus, cera protetora e revitalização dos plásticos internos e externos. Já a Lavagem Premium Detalhada (a partir de R$ 90) adiciona detalhamento com pincelamento técnico em emblemas, frestas e cantos com acabamento refinado.',
    visible: true,
  },
  {
    id: 'faq-5',
    category: 'Estética Automotiva',
    question: 'Como funciona o orçamento da Vitrificação Automotiva e do Polimento?',
    answer:
      'Serviços técnicos como Vitrificação Automotiva, Polimento Automotivo, Micropolimento e Higienização Interna têm valor sob consulta, pois dependem do porte e estado atual do veículo. Agende uma avaliação rápida sem compromisso ou envie fotos pelo nosso WhatsApp (27) 99286-9471.',
    visible: true,
  },
  {
    id: 'faq-6',
    category: 'Pagamento',
    question: 'Quais são as formas de pagamento aceitas?',
    answer:
      'Aceitamos PIX (chave 27 99286-9471), Cartão de Crédito, Cartão de Débito e pagamento presencial na retirada ou entrega do veículo.',
    visible: true,
  },
];

const STORAGE_KEY = 'maruipe_faqs';

export function getStoredFaqs(): FaqItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (item): item is FaqItem =>
            Boolean(item) &&
            typeof item.id === 'string' &&
            typeof item.question === 'string' &&
            typeof item.answer === 'string'
        );
        let migrated = false;
        const normalized = valid.map((item) => {
          const nextAnswer = item.answer.replace(
            /Rua Daniel Abreu Machado,\s*1406/gi,
            'Rua Daniel Abreu Machado, 406'
          );
          if (nextAnswer !== item.answer) {
            migrated = true;
            return { ...item, answer: nextAnswer };
          }
          return item;
        });
        if (migrated) {
          saveStoredFaqs(normalized);
        }
        return normalized;
      }
    }
  } catch (e) {
    console.warn('Falha ao carregar perguntas frequentes salvas:', e);
  }
  return INITIAL_FAQS;
}

export function saveStoredFaqs(faqs: FaqItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(faqs));
  } catch (e) {
    console.warn('Falha ao salvar perguntas frequentes:', e);
  }
}
