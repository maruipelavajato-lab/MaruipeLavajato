import React from 'react';
import { ShoppingBag, Calendar, MessageCircle, Clock, Check, Sparkles } from 'lucide-react';
import { Service, CompanyConfig } from '../types';
import { buildWhatsAppUrl } from '../utils/scheduling';

interface EsteticaSectionProps {
  services: Service[];
  config: CompanyConfig;
  onAddToCart: (service: Service) => void;
  onOpenSchedule: (service: Service) => void;
}

export const EsteticaSection: React.FC<EsteticaSectionProps> = ({
  services,
  config,
  onAddToCart,
  onOpenSchedule,
}) => {
  const esteticaServices = services.filter((s) => s.category === 'estetica');

  return (
    <section id="estetica" className="py-20 bg-neutral-900/60 border-t border-b border-neutral-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="text-xs font-bold tracking-widest text-amber-500 uppercase flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Detalhamento & Proteção Avançada</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            ESTÉTICA AUTOMOTIVA
          </h2>
          <p className="text-sm sm:text-base text-neutral-300">
            Trabalhos minuciosos para quem exige perfeição visual, preservação do patrimônio e acabamento com brilho profundo.
          </p>
        </div>

        {/* Estetica Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {esteticaServices.map((service) => {
            const whatsappInquiry = `Olá! Gostaria de consultar o preço e agendar o serviço de *${service.name}* no Maruípe Lava Jato.`;
            const whatsappUrl = buildWhatsAppUrl(config.whatsappDigits, whatsappInquiry);

            return (
              <div
                key={service.id}
                className="group flex flex-col justify-between rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 transition-all duration-300 overflow-hidden"
              >
                <div>
                  {/* Service Photo with specific matching imagery */}
                  <div className="relative h-48 overflow-hidden bg-neutral-900">
                    <img
                      src={service.image}
                      alt={service.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                    
                    {/* Duration badge */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-neutral-950/80 backdrop-blur-md text-[11px] font-medium text-neutral-300 flex items-center gap-1 border border-neutral-800">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>~{service.durationMinutes} min</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {service.name}
                    </h3>

                    {/* Price tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                        {service.priceLabel || 'Consultar preço'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-3">
                      {service.description}
                    </p>

                    {/* Includes bullets */}
                    {service.includes && (
                      <div className="space-y-1.5 pt-2 border-t border-neutral-850">
                        {service.includes.slice(0, 2).map((inc, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-neutral-300">
                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span className="truncate">{inc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onAddToCart(service)}
                      className="w-full py-2.5 px-2 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-neutral-600 transition-colors flex items-center justify-center gap-1.5"
                      title="Adicionar serviço ao carrinho"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate">Adicionar</span>
                    </button>

                    <button
                      onClick={() => onOpenSchedule(service)}
                      className="w-full py-2.5 px-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="truncate">Agendar</span>
                    </button>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 text-[11px] font-medium rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-400" />
                    <span>Consultar via WhatsApp</span>
                  </a>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
