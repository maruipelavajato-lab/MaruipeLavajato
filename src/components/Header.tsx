import React, { useState } from 'react';
import { ShoppingBag, Calendar, Smartphone, Menu, X, ShieldCheck, Bell } from 'lucide-react';
import { CompanyConfig } from '../types';

interface HeaderProps {
  config: CompanyConfig;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSchedule: () => void;
  onOpenAppDownload: () => void;
  onOpenAdmin: () => void;
  isAppMode: boolean;
  onToggleAppMode: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  cartCount,
  onOpenCart,
  onOpenSchedule,
  onOpenAppDownload,
  onOpenAdmin,
  isAppMode,
  onToggleAppMode,
  unreadNotificationsCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/98 border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Zone 1: Single Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#inicio" className="group flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
                MARUÍPE LAVA JATO
              </span>
              <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-amber-500 uppercase whitespace-nowrap">
                ESTÉTICA AUTOMOTIVA
              </span>
            </a>
          </div>

          {/* Zone 2: Navigation Links (single line, unboxed) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-300">
            <a href="#inicio" className="hover:text-amber-400 transition-colors whitespace-nowrap">Início</a>
            <a href="#lavagens" className="hover:text-amber-400 transition-colors whitespace-nowrap">Lavagens</a>
            <a href="#estetica" className="hover:text-amber-400 transition-colors whitespace-nowrap">Estética</a>
            <a href="#catalogo" className="hover:text-amber-400 transition-colors whitespace-nowrap">Catálogo</a>
            <a href="#agendamento" className="hover:text-amber-400 transition-colors whitespace-nowrap">Agendamento</a>
            <a href="#baixar-app" className="hover:text-amber-400 transition-colors whitespace-nowrap">Baixar App</a>
            <a href="#sobre" className="hover:text-amber-400 transition-colors whitespace-nowrap">Sobre</a>
            <a href="#contato" className="hover:text-amber-400 transition-colors whitespace-nowrap">Contato</a>
          </nav>

          {/* Zone 3: Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* View Switch: Site vs Mobile App View */}
            <button
              onClick={onToggleAppMode}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:text-white hover:border-amber-500/60 transition-all whitespace-nowrap"
              title="Alternar entre visualização de Site e Aplicativo Mobile"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAppMode ? 'Ver Site Web' : '📱 Modo App'}</span>
            </button>

            {/* Permanent App Download Button */}
            <button
              onClick={onOpenAppDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all whitespace-nowrap"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">📱</span>
              <span>BAIXE O APP</span>
            </button>

            {/* Schedule Button */}
            <button
              onClick={onOpenSchedule}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 shadow-sm transition-all whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>AGENDAR</span>
            </button>

            {/* Cart Button with Counter */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-200 hover:text-white hover:border-neutral-700 transition-colors"
              aria-label="Abrir carrinho de serviços"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-neutral-950 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin notifications icon */}
            <button
              onClick={onOpenAdmin}
              className="relative p-2.5 rounded-lg border border-neutral-850 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors"
              title="Painel Administrativo"
              aria-label="Painel Administrativo"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-300 hover:text-white"
              aria-label="Menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-neutral-800 bg-neutral-950 px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-neutral-300">
            <a
              href="#inicio"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white"
            >
              Início
            </a>
            <a
              href="#lavagens"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white"
            >
              Lavagens
            </a>
            <a
              href="#estetica"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white"
            >
              Estética Automotiva
            </a>
            <a
              href="#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white"
            >
              Catálogo
            </a>
            <a
              href="#agendamento"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white"
            >
              Agendamento Inteligente
            </a>
            <a
              href="#baixar-app"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white text-amber-400 font-semibold"
            >
              📱 Baixar Nosso Aplicativo
            </a>
            <a
              href="#sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white"
            >
              Sobre Nós
            </a>
            <a
              href="#contato"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white"
            >
              Contato & Localização
            </a>
          </nav>

          <div className="pt-2 border-t border-neutral-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onToggleAppMode();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-200"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>{isAppMode ? 'Visualizar Site Completo' : 'Abrir Modo Aplicativo Mobile'}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSchedule();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg bg-amber-500 text-neutral-950 font-bold"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Agora</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
