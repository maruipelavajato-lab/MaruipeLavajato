import React from 'react';
import { MessageCircle, Smartphone, ShoppingBag, Calendar } from 'lucide-react';
import { CompanyConfig } from '../types';

interface FloatingActionsProps {
  config: CompanyConfig;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSchedule: () => void;
  onOpenAppDownload: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingActionsProps> = ({
  config,
  cartCount,
  onOpenCart,
  onOpenSchedule,
  onOpenAppDownload,
}) => {
  // Official WhatsApp link with required pre-filled message
  const whatsappUrl = `https://wa.me/5527992869471?text=${encodeURIComponent(
    'Olá! Vim pelo site do Maruípe Lava Jato e gostaria de agendar um serviço.'
  )}`;

  return (
    <>
      {/* Primary Floating WhatsApp Button (bottom right) */}
      <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3">
        
        {/* Floating WhatsApp with pulse */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95"
          aria-label="Falar no WhatsApp oficial"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 fill-current" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
          </div>
          <span className="text-xs font-bold hidden sm:inline whitespace-nowrap">
            Falar no WhatsApp
          </span>
        </a>

      </div>

      {/* Persistent Bottom Bar on Mobile Viewports (Requested: 📱 BAIXE O APP, 📲 WHATSAPP, 🛒 CARRINHO, 📅 AGENDAR) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/98 border-t border-neutral-800 px-3 py-2">
        <div className="grid grid-cols-4 gap-1 text-center">
          
          {/* 📱 BAIXE O APP */}
          <button
            onClick={onOpenAppDownload}
            className="flex flex-col items-center justify-center py-1 text-neutral-300 hover:text-amber-400"
          >
            <Smartphone className="w-4 h-4 text-amber-400 mb-0.5" />
            <span className="text-[10px] font-bold leading-tight">BAIXE O APP</span>
          </button>

          {/* 📲 WHATSAPP */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1 text-neutral-300 hover:text-emerald-400"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 mb-0.5" />
            <span className="text-[10px] font-bold leading-tight">WHATSAPP</span>
          </a>

          {/* 🛒 CARRINHO */}
          <button
            onClick={onOpenCart}
            className="relative flex flex-col items-center justify-center py-1 text-neutral-300 hover:text-amber-400"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-amber-400 mb-0.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-neutral-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold leading-tight">CARRINHO</span>
          </button>

          {/* 📅 AGENDAR */}
          <button
            onClick={onOpenSchedule}
            className="flex flex-col items-center justify-center py-1 text-amber-400 font-bold"
          >
            <Calendar className="w-4 h-4 text-amber-400 mb-0.5" />
            <span className="text-[10px] font-bold leading-tight">AGENDAR</span>
          </button>

        </div>
      </div>
    </>
  );
};
