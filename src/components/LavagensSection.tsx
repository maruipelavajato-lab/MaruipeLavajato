import React from 'react';
import { ShoppingBag, Calendar, Sparkles, Check, Clock } from 'lucide-react';
import { Service } from '../types';

interface LavagensSectionProps {
  services: Service[];
  onAddToCart: (service: Service) => void;
  onOpenSchedule: (service: Service) => void;
}

export const LavagensSection: React.FC<LavagensSectionProps> = ({
  services,
  onAddToCart,
  onOpenSchedule,
}) => {
  const lavagens = services.filter((s) => s.category === 'lavagens');

  return (
    <section id="lavagens" className="py-20 bg-neutral-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="text-xs font-bold tracking-widest text-amber-500 uppercase">
            Cuidado Periódico & Limpeza Profissional
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            LAVAGENS
          </h2>
          <p className="text-sm sm:text-base text-neutral-400">
            Trabalhamos com produtos automotivos de pH neutro que protegem o verniz, borrachas e vidros do seu veículo.
          </p>
        </div>

        {/* 3 Lavagens Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {lavagens.map((service) => {
            const isEspecial = service.id === 'lavagem-especial';
            const isPremium = service.id === 'lavagem-premium';

            return (
              <div
                key={service.id}
                className={`relative flex flex-col justify-between rounded-2xl bg-neutral-900 border ${
                  isEspecial
                    ? 'border-amber-500/80 shadow-xl shadow-amber-500/10 scale-102 lg:-translate-y-2'
                    : 'border-neutral-800 hover:border-neutral-700'
                } p-6 sm:p-7 transition-all`}
              >
                {/* Popular tag for especial */}
                {isEspecial && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-neutral-950 text-[11px] font-black uppercase tracking-wider rounded-full shadow">
                    Mais Popular
                  </div>
                )}

                <div>
                  {/* Photo Thumbnail */}
                  <div className="relative h-44 rounded-xl overflow-hidden mb-5 bg-neutral-950 border border-neutral-800">
                    <img
                      src={service.image}
                      alt={service.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-neutral-950/80 backdrop-blur-sm text-[11px] font-medium text-neutral-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>~{service.durationMinutes} min</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl font-bold text-white mb-2">
                    {service.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-4">
                    {service.pricePrefix && (
                      <span className="text-xs font-semibold text-neutral-400 uppercase">
                        {service.pricePrefix}
                      </span>
                    )}
                    <span className="text-lg font-bold text-amber-500">R$</span>
                    <span className="font-display text-3xl sm:text-4xl font-black text-white">
                      {service.price}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-300 leading-relaxed mb-5">
                    {service.description}
                  </p>

                  {/* Features List */}
                  {service.includes && (
                    <div className="space-y-2.5 pt-4 border-t border-neutral-800/80 mb-6">
                      {service.includes.map((inc, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-300">
                          <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons according to prompt:
                    - Lavagem Simples: ADICIONAR AO CARRINHO
                    - Lavagem Especial: ADICIONAR AO CARRINHO
                    - Lavagem Premium Detalhada: AGENDAR
                */}
                <div className="pt-4 flex flex-col gap-2">
                  {isPremium ? (
                    <button
                      onClick={() => onOpenSchedule(service)}
                      className="w-full py-3 px-4 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>AGENDAR</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onAddToCart(service)}
                      className={`w-full py-3 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                        isEspecial
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 shadow-md shadow-amber-500/20'
                          : 'bg-neutral-800 hover:bg-neutral-750 text-white hover:border-neutral-600'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADICIONAR AO CARRINHO</span>
                    </button>
                  )}

                  {/* Secondary affordance to allow either add or schedule */}
                  <button
                    onClick={() => (isPremium ? onAddToCart(service) : onOpenSchedule(service))}
                    className="w-full py-2 text-xs text-neutral-400 hover:text-white transition-colors text-center"
                  >
                    {isPremium ? '+ Adicionar também ao carrinho' : 'Ou agendar horário direto'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
