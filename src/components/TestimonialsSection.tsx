import React from 'react';
import { Star, Quote, CheckCircle2, Calendar, Car } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  onOpenSchedule: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  onOpenSchedule,
}) => {
  const visibleTestimonials = testimonials.filter((t) => t.visible);

  if (visibleTestimonials.length === 0) {
    return null;
  }

  const averageRating =
    visibleTestimonials.reduce((acc, item) => acc + Math.min(5, Math.max(1, item.rating)), 0) /
    visibleTestimonials.length;

  return (
    <section
      id="depoimentos"
      className="py-24 bg-neutral-950 relative border-t border-neutral-800/80 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.06)_0%,_transparent_65%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header & Rating Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-amber-500 uppercase">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Depoimentos de Clientes</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              QUEM CUIDA DO CARRO AQUI, RECOMENDA
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              Confira avaliações reais de motoristas de Vitória que confiam no padrão artesanal, pontualidade e cuidado do Maruípe Lava Jato.
            </p>
          </div>

          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-neutral-900 border border-neutral-800 shrink-0 shadow-lg">
            <div className="text-center pr-4 border-r border-neutral-800">
              <span className="font-display text-3xl font-black text-amber-400 block leading-none">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-[11px] text-neutral-400 font-semibold">de 5,0</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-neutral-300 font-medium">
                {visibleTestimonials.length}{' '}
                {visibleTestimonials.length === 1 ? 'avaliação verificada' : 'avaliações verificadas'}
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTestimonials.map((item) => {
            const clampedRating = Math.min(5, Math.max(1, item.rating));
            const initials = item.clientName
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join('');

            return (
              <article
                key={item.id}
                className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/40 transition-all shadow-xl space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-0.5" aria-label={`Nota ${clampedRating} de 5`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= clampedRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-amber-500/30 shrink-0" />
                  </div>

                  {item.serviceName && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.serviceName}</span>
                    </div>
                  )}

                  <p className="text-sm text-neutral-200 leading-relaxed">
                    “{item.comment}”
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 font-black text-xs flex items-center justify-center shrink-0">
                    {initials || 'CL'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{item.clientName}</h3>
                    {item.vehicle ? (
                      <p className="text-xs text-neutral-400 flex items-center gap-1 truncate">
                        <Car className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{item.vehicle}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-500">Cliente Maruípe Lava Jato</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-sm sm:text-base font-bold text-white">
              Quer o mesmo padrão de brilho e proteção no seu carro?
            </p>
            <p className="text-xs sm:text-sm text-neutral-400">
              Agende em segundos trazendo na loja ou escolhendo nosso serviço Leva e Traz.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenSchedule}
            className="shrink-0 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold text-xs sm:text-sm hover:brightness-110 shadow-lg flex items-center gap-2 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Meu Horário</span>
          </button>
        </div>
      </div>
    </section>
  );
};
