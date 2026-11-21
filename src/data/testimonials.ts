import { Testimonial } from '../types';

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'dep-1',
    clientName: 'Rafael Mendes',
    vehicle: 'Honda Civic Touring',
    serviceName: 'Vitrificação Automotiva',
    rating: 5,
    comment:
      'Fiz a vitrificação no meu Civic e o resultado superou todas as expectativas. O brilho ficou absurdo e a água simplesmente escorre da pintura sem manchar. Atendimento nota 10 aqui em Maruípe!',
    visible: true,
    createdAt: '2026-10-12T14:30:00.000Z',
  },
  {
    id: 'dep-2',
    clientName: 'Camila Siqueira',
    vehicle: 'Jeep Compass',
    serviceName: 'Lavagem Especial + Leva e Traz',
    rating: 5,
    comment:
      'Usei o serviço de busca no local enquanto trabalhava e foi tudo super pontual. Buscaram e devolveram o carro impecável, cheiroso e com os plásticos revitalizados.',
    visible: true,
    createdAt: '2026-10-28T11:15:00.000Z',
  },
  {
    id: 'dep-3',
    clientName: 'Eduardo Vasconcelos',
    vehicle: 'Toyota Corolla Cross',
    serviceName: 'Higienização Automotiva',
    rating: 5,
    comment:
      'Tinha derramado café no banco traseiro e achava que não ia sair. Fizeram a higienização profunda e ficou zerado, sem nenhum odor. Equipe muito cuidadosa.',
    visible: true,
    createdAt: '2026-11-04T16:40:00.000Z',
  },
  {
    id: 'dep-4',
    clientName: 'Thiago Alvarenga',
    vehicle: 'VW Nivus',
    serviceName: 'Polimento de Farol + Lavagem Premium',
    rating: 5,
    comment:
      'Os faróis estavam bem amarelados e voltaram a ficar transparentes como novos. Agendei pelo site sem fila e o carro ficou pronto no horário combinado.',
    visible: true,
    createdAt: '2026-11-09T09:50:00.000Z',
  },
  {
    id: 'dep-5',
    clientName: 'Juliana Ribeiro',
    vehicle: 'Hyundai HB20',
    serviceName: 'Lavagem Especial',
    rating: 5,
    comment:
      'Melhor custo-benefício da região! A Lavagem Especial de R$ 50 deixou a pintura com brilho de cera e os plásticos internos pretinhos sem aspecto engordurado.',
    visible: true,
    createdAt: '2026-11-11T15:20:00.000Z',
  },
  {
    id: 'dep-6',
    clientName: 'Marcelo Coutinho',
    vehicle: 'Fiat Toro',
    serviceName: 'Polimento Automotivo',
    rating: 5,
    comment:
      'Minha caminhonete estava cheia de marcas de lavagem e riscos leves na lataria. Depois do polimento técnico parece que acabou de sair da concessionária.',
    visible: true,
    createdAt: '2026-11-13T17:10:00.000Z',
  },
];

const STORAGE_KEY = 'maruipe_testimonials';

export function getStoredTestimonials(): Testimonial[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is Testimonial =>
            Boolean(item) &&
            typeof item.id === 'string' &&
            typeof item.clientName === 'string' &&
            typeof item.comment === 'string'
        );
      }
    }
  } catch (e) {
    console.warn('Falha ao carregar depoimentos salvos:', e);
  }
  return INITIAL_TESTIMONIALS;
}

export function saveStoredTestimonials(testimonials: Testimonial[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
  } catch (e) {
    console.warn('Falha ao salvar depoimentos:', e);
  }
}
