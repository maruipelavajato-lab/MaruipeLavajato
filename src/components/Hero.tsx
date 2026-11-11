import React from 'react';
import { Calendar, Sparkles, BookOpen, MapPin, Clock, Shield } from 'lucide-react';
import { CompanyConfig } from '../types';

interface HeroProps {
  config: CompanyConfig;
  onOpenSchedule: () => void;
  onViewServices: () => void;
  onOpenCatalog: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  config,
  onOpenSchedule,
  onViewServices,
  onOpenCatalog,
}) => {
  return (
    <section id="inicio" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Background Image with Measured Scrim & Visual Polish */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/images/hero_car_detailing_1794352174735.jpg"
          alt="Carro espelhado em estúdio de estética automotiva Maruípe Lava Jato"
          referrerPolicy="no-referrer"
          draggable={false}
          className="w-full h-full object-cover object-center pointer-events-none select-none"
        />
        {/* Gradients ensuring 4.5:1 text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-3xl space-y-6">
          
          {/* Editorial Location & Quality Indicators (unboxed) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-amber-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Vitória / ES</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-300">Maruípe</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-300">Atendimento com Hora Marcada</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-300">Garantia de Acabamento</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] text-balance">
            Seu carro limpo, protegido e com aparência de novo.
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-neutral-300 leading-relaxed max-w-2xl text-pretty">
            Lavagem e estética automotiva em Vitória/ES. Cuidado, qualidade e acabamento profissional para o seu veículo.
          </p>

          {/* 3 Action Buttons Requested */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={onOpenSchedule}
              className="px-6 py-3.5 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Calendar className="w-5 h-5 text-neutral-950" />
              <span>AGENDAR AGORA</span>
            </button>

            <button
              onClick={onViewServices}
              className="px-6 py-3.5 text-sm sm:text-base font-semibold rounded-xl bg-neutral-900/90 text-white border border-neutral-700 hover:border-amber-500/60 hover:bg-neutral-800 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>VER SERVIÇOS</span>
            </button>

            <button
              onClick={onOpenCatalog}
              className="px-6 py-3.5 text-sm sm:text-base font-semibold rounded-xl bg-neutral-900/90 text-white border border-neutral-700 hover:border-amber-500/60 hover:bg-neutral-800 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>ABRIR CATÁLOGO</span>
            </button>
          </div>

          {/* Proof Strip */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-800/80">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">Produtos Nobres</p>
                <p className="text-xs text-neutral-400">Ceras importadas, pH neutro e proteção UV</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">Pontualidade Real</p>
                <p className="text-xs text-neutral-400">Sem filas: horário reservado e respeitado</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">Localização Fácil</p>
                <p className="text-xs text-neutral-400">Rua Daniel Abreu Machado, 1406 – Vitória</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
