import React from 'react';
import { ShoppingBag, MessageCircle, Sparkles, Check } from 'lucide-react';
import { Service, CompanyConfig } from '../types';
import { buildWhatsAppUrl } from '../utils/scheduling';

interface PromoBannerProps {
  promoService: Service;
  config: CompanyConfig;
  onAddToCart: (service: Service) => void;
  onOpenSchedule: (service: Service) => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  promoService,
  config,
  onAddToCart,
  onOpenSchedule,
}) => {
  const whatsappPromoMsg = `Olá! Vi o banner de promoção no site do Maruípe Lava Jato e quero agendar a *Lavagem Especial de R$ 50*. Como estão os horários hoje ou amanhã?`;
  const whatsappUrl = buildWhatsAppUrl(config.whatsappDigits, whatsappPromoMsg);

  return (
    <section className="relative -mt-6 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/40 bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-neutral-950 p-6 sm:p-8 lg:p-10 shadow-2xl shadow-amber-500/10">
        
        {/* Subtle GPU-safe glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.1)_0%,_transparent_60%)] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Info */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400 uppercase">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Destaque Exclusivo · O Mais Procurado</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                LAVAGEM ESPECIAL
              </h2>
              <div className="flex items-baseline gap-1 text-amber-400">
                <span className="text-xl font-bold">R$</span>
                <span className="font-display text-4xl sm:text-5xl font-black text-white">50</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-neutral-300">
              O pacote completo que restaura o brilho e a proteção do seu automóvel com custo-benefício imbatível em Vitória/ES.
            </p>

            {/* Included items */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                Inclui neste serviço:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'Lavagem técnica externa',
                  'Aspiração detalhada de cabine e porta-malas',
                  'Pretinho nos pneus com acabamento acetinado',
                  'Cera protetora com alto brilho',
                  'Revitalização dos plásticos por dentro e por fora',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-neutral-200">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right / Actions */}
          <div className="lg:col-span-5 flex flex-col gap-3 justify-center bg-neutral-950/70 p-6 rounded-2xl border border-neutral-800">
            <div className="text-center sm:text-left mb-1">
              <span className="text-xs text-neutral-400">Duração média estimada:</span>
              <p className="text-sm font-semibold text-neutral-200">Aproximadamente 60 minutos</p>
            </div>

            <button
              onClick={() => onAddToCart(promoService)}
              className="w-full py-3.5 px-6 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 active:scale-[0.98] shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-neutral-950" />
              <span>ADICIONAR AO CARRINHO</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-950"
            >
              <MessageCircle className="w-4 h-4" />
              <span>AGENDAR PELO WHATSAPP</span>
            </a>

            <button
              onClick={() => onOpenSchedule(promoService)}
              className="w-full py-2.5 px-4 text-xs font-medium rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-center"
            >
              Ou agende escolhendo o dia e horário online
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
