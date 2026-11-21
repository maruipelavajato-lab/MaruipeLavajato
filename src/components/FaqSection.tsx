import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Bot, MessageCircle } from 'lucide-react';
import { CompanyConfig, FaqItem } from '../types';
import { buildWhatsAppUrl } from '../utils/scheduling';

interface FaqSectionProps {
  faqs: FaqItem[];
  config: CompanyConfig;
  onOpenZion: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs, config, onOpenZion }) => {
  const visibleFaqs = faqs.filter((item) => item.visible);
  const [openId, setOpenId] = useState<string | null>(() => visibleFaqs[0]?.id || null);

  if (visibleFaqs.length === 0) {
    return null;
  }

  const whatsappUrl = buildWhatsAppUrl(
    config.whatsappDigits,
    `Olá! Vi as Perguntas Frequentes no site do ${config.name} e gostaria de tirar uma dúvida.`
  );

  return (
    <section
      id="faq"
      className="py-24 bg-neutral-900/40 relative border-t border-neutral-800/80 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-amber-500 uppercase">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Suporte ao Cliente</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            PERGUNTAS FREQUENTES
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Tire suas principais dúvidas sobre agendamento, serviço Leva e Traz, valores, formas de pagamento e prazos de atendimento.
          </p>
        </div>

        {/* Accordion Items */}
        <div className="space-y-3">
          {visibleFaqs.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-colors ${
                  isOpen
                    ? 'bg-neutral-900 border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    {item.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                        {item.category}
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-bold text-white leading-snug block">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/70">
                    <p className="pt-3">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Banner */}
        <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Ainda ficou com alguma dúvida?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              Pergunte na hora para a IA Zion ou fale diretamente com nossa equipe no WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenZion}
              className="py-2.5 px-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>Perguntar ao Zion</span>
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
