import React from 'react';
import { ShieldCheck, MapPin, Phone, Smartphone, Lock } from 'lucide-react';
import { CompanyConfig } from '../types';

interface FooterProps {
  config: CompanyConfig;
  onOpenAdmin: () => void;
  onOpenAppDownload: () => void;
  onOpenSchedule: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  onOpenAdmin,
  onOpenAppDownload,
  onOpenSchedule,
}) => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-850 pt-16 pb-24 md:pb-12 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-neutral-900">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <span className="font-display text-lg font-black tracking-tight text-white block">
              MARUÍPE LAVA JATO
            </span>
            <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase block -mt-2">
              ESTÉTICA AUTOMOTIVA
            </span>
            <p className="text-neutral-400 text-xs leading-relaxed pt-1">
              Seu carro limpo, protegido e com aparência de novo em Vitória/ES. Cuidado artesanal e precisão em cada detalhe.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Navegação
            </h4>
            <ul className="space-y-2">
              <li><a href="#inicio" className="hover:text-amber-400 transition-colors">Início</a></li>
              <li><a href="#lavagens" className="hover:text-amber-400 transition-colors">Lavagens Automotivas</a></li>
              <li><a href="#estetica" className="hover:text-amber-400 transition-colors">Estética Automotiva</a></li>
              <li><a href="#catalogo" className="hover:text-amber-400 transition-colors">Catálogo de Serviços</a></li>
              <li><button onClick={onOpenSchedule} className="hover:text-amber-400 transition-colors">Agendamento Online</button></li>
              <li><button onClick={onOpenAppDownload} className="hover:text-amber-400 transition-colors text-amber-400 font-semibold">Baixar Nosso Aplicativo</button></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Atendimento & Local
            </h4>
            <div className="space-y-2 text-neutral-400">
              <p className="flex items-start gap-1.5 text-neutral-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{config.address}</span>
              </p>
              <p className="flex items-center gap-1.5 text-neutral-300">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>WhatsApp: {config.whatsappPhone}</span>
              </p>
              <p className="text-[11px] pt-1 text-neutral-500">
                PIX Chave Oficial: <strong className="text-neutral-300">{config.pixKey}</strong>
              </p>
            </div>
          </div>

          {/* App & Stores */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Aplicativo Mobile
            </h4>
            <p className="text-xs text-neutral-400">
              Instale ou use o app web para agendamentos rápidos e acompanhamento de ordens de serviço.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={onOpenAppDownload}
                className="w-full py-2 px-3 text-left bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-white font-semibold text-xs flex items-center justify-between"
              >
                <span>📱 Baixar App Android / iOS</span>
                <span className="text-amber-400 text-[10px]">Em breve</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-[11px]">
          <p>© {new Date().getFullYear()} {config.name}. Todos os direitos reservados. Vitória – ES.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-neutral-500 hover:text-amber-400 transition-colors"
              title="Acesso Administrativo da Oficina"
            >
              <Lock className="w-3 h-3" />
              <span>Painel Administrativo</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
