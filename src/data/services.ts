import { Service } from '../types';

export const INITIAL_SERVICES: Service[] = [
  // --- LAVAGENS ---
  {
    id: 'lavagem-simples',
    name: 'Lavagem Simples',
    category: 'lavagens',
    price: 35,
    durationMinutes: 45,
    description: 'Lavar + aspirar + pretinho nos pneus com produtos de alta performance.',
    image: '/assets/images/lavagem_simples_limpo_1794408423912.jpg',
    includes: [
      'Lavagem externa completa',
      'Aspiração interna detalhada',
      'Aplicação de pretinho de longa duração nos pneus',
    ],
  },
  {
    id: 'lavagem-especial',
    name: 'Lavagem Especial',
    category: 'lavagens',
    price: 50,
    durationMinutes: 60,
    isPromo: true,
    description: 'Lavagem + aspirar + pretinho + cera + revitalização dos plásticos por dentro e por fora.',
    image: '/assets/images/lavagem_carro_espuma_1794408379220.jpg',
    includes: [
      'Lavagem externa com shampoo neutro automotivo e snow foam',
      'Aspiração detalhada de carpetes e estofados',
      'Pretinho nos pneus com efeito acetinado',
      'Aplicação de cera protetora com brilho espelhado',
      'Revitalização dos plásticos internos e externos',
    ],
  },
  {
    id: 'lavagem-premium',
    name: 'Lavagem Premium Detalhada',
    category: 'lavagens',
    price: 90,
    pricePrefix: 'A partir de',
    durationMinutes: 90,
    description: 'Lavagem detalhada + cera premium + revitalização dos plásticos + acabamento premium.',
    image: '/assets/images/hero_car_detailing_1794352174735.jpg',
    includes: [
      'Lavagem técnica detalhada com pincelamento em cantos e grades',
      'Descontaminação superficial da pintura',
      'Cera nobre de carnaúba / sintética premium',
      'Revitalização e proteção UV de plásticos e borrachas',
      'Limpeza minuciosa de vidros e caixas de roda',
      'Acabamento premium de alta durabilidade',
    ],
  },

  // --- ESTÉTICA AUTOMOTIVA ---
  {
    id: 'polimento-farol',
    name: 'Polimento de Farol',
    category: 'estetica',
    price: null,
    priceLabel: 'Consultar preço',
    durationMinutes: 60,
    description: 'Restauração da transparência das lentes dos faróis, eliminando o amarelado, riscos e devolvendo o foco e segurança com selante UV.',
    image: '/assets/images/detailing_polimento_farol_1794352175374.jpg',
    includes: [
      'Lixamento técnico das lentes em etapas graduais',
      'Composto polidor de corte e refino ótico',
      'Aplicação de selante com proteção anti-UV',
    ],
  },
  {
    id: 'polimento-automotivo',
    name: 'Polimento Automotivo',
    category: 'estetica',
    price: null,
    priceLabel: 'Consultar preço',
    durationMinutes: 180,
    description: 'Correção de pintura com remoção de riscos superficiais, marcas de lavagens anteriores (swirls) e restauração do brilho e profundidade da cor.',
    image: '/assets/images/detailing_polimento_carro_1794352177308.jpg',
    includes: [
      'Descontaminação de pintura com clay bar',
      'Etapas de corte, refino e lustro com politriz e boinas nobres',
      'Eliminação de hologramas e micro-riscos',
      'Proteção final com cera ou selante de alta resistência',
    ],
  },
  {
    id: 'micropolimento',
    name: 'Micropolimento',
    category: 'estetica',
    price: null,
    priceLabel: 'Consultar preço',
    durationMinutes: 120,
    description: 'Polimento técnico refinado de alta precisão para restauração de brilho intenso sem desbaste agressivo do verniz original.',
    image: '/assets/images/detailing_polimento_carro_1794352177308.jpg',
    includes: [
      'Inspeção da espessura do verniz com iluminação técnica',
      'Refino e lustro de ultra precisão',
      'Eliminação de névoas e opacidade da pintura',
      'Proteção com repelência a água e sujeira',
    ],
  },
  {
    id: 'lavagem-motor',
    name: 'Lavagem de Motor',
    category: 'estetica',
    price: null,
    priceLabel: 'Consultar preço',
    durationMinutes: 60,
    description: 'Limpeza técnica detalhada do cofre do motor com isolamento elétrico, produtos biodegradáveis e acabamento com verniz de motor.',
    image: '/assets/images/detailing_motor_limpo_1794352175818.jpg',
    includes: [
      'Isolamento preventivo de componentes sensíveis',
      'Pincelamento técnico e desengraxe ecológico',
      'Secagem completa por ar pressurizado',
      'Verniz protetor térmico para mangueiras e plásticos',
    ],
  },
  {
    id: 'higienizacao-rodas',
    name: 'Higienização das Rodas',
    category: 'estetica',
    price: null,
    priceLabel: 'Consultar preço',
    durationMinutes: 45,
    description: 'Remoção minuciosa de fuligem de freio, descontaminação ferrosa de pinças e aros com proteção repelente de poeira e alta temperatura.',
    image: '/assets/images/detailing_rodas_higienizacao_1794352175873.jpg',
    includes: [
      'Descontaminante ferroso que dissolve pó de pastilha',
      'Escovação técnica da face e interior da roda',
      'Limpeza e detalhamento das pinças de freio',
      'Condicionamento hidrofóbico das borrachas dos pneus',
    ],
  },
  {
    id: 'cera-premium',
    name: 'Cera Premium',
    category: 'estetica',
    price: null,
    priceLabel: 'Consultar preço',
    durationMinutes: 45,
    description: 'Aplicação manual de cera nobre importada com altíssimo poder hidrofóbico, toque aveludado e proteção contra raios solares e seiva.',
    image: '/assets/images/cera_premium_carro_1794408438834.jpg',
    includes: [
      'Descontaminação rápida da lataria',
      'Aplicação de cera premium de alta carnaúba com aplicador manual',
      'Remoção com microfibra felpuda sem atrito',
      'Efeito gota (beading) e brilho espelhado',
    ],
  },
  {
    id: 'revitalizacao-plasticos',
    name: 'Revitalização dos Plásticos',
    category: 'estetica',
    price: null,
    priceLabel: 'Consultar preço',
    durationMinutes: 40,
    description: 'Condicionamento profissional e restauração da cor original dos plásticos ressecados pelo sol, tanto na cabine quanto nos para-choques.',
    image: '/assets/images/revitalizacao_trim_1794408408935.jpg',
    includes: [
      'Higienização com APC bactericida neutro',
      'Nutrição profunda com polímeros resistentes a água',
      'Acabamento fosco ou acetinado original de fábrica',
      'Barreira com proteção contra radiação ultravioleta',
    ],
  },
  {
    id: 'higienizacao-automotiva',
    name: 'Higienização Automotiva',
    category: 'estetica',
    price: null,
    priceLabel: 'Consultar preço',
    durationMinutes: 120,
    description: 'Higienização interna completa de estofados, carpetes, teto, painel e forros de porta com extração profunda, eliminando ácaros e odores.',
    image: '/assets/images/higienizacao_interior_1794408393733.jpg',
    includes: [
      'Extração profunda por extratora profissional a vapor',
      'Bactericida e fungicida de grau hospitalar',
      'Limpeza de cintos de segurança, teto e porta-malas',
      'Secagem e aromatização suave do habitáculo',
    ],
  },
];

const SERVICES_STORAGE_KEY = 'maruipe_services_catalog';

function normalizeImagePath(path: string): string {
  if (path && path.startsWith('/src/assets/images/')) {
    return path.replace('/src/assets/images/', '/assets/images/');
  }
  return path;
}

export function getStoredServices(): Service[] {
  if (typeof window === 'undefined') return INITIAL_SERVICES;
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Map stored services, ensuring initial services use their curated official image
        const initialMap = new Map(INITIAL_SERVICES.map((s) => [s.id, s.image]));
        return parsed.map((s) => {
          const officialImg = initialMap.get(s.id);
          return {
            ...s,
            image: officialImg || normalizeImagePath(s.image),
          };
        });
      }
    }
  } catch (err) {
    console.error('Erro ao ler catálogo de serviços:', err);
  }
  return INITIAL_SERVICES;
}

export function saveStoredServices(services: Service[]): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized = services.map((s) => ({
      ...s,
      image: normalizeImagePath(s.image),
    }));
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(normalized));
  } catch (err) {
    console.error('Erro ao salvar serviços:', err);
  }
}
