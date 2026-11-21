import React from 'react';
import { X, ShieldCheck, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import { CompanyConfig } from '../types';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CompanyConfig;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Política de Privacidade e Informações do Desenvolvedor"
    >
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto text-neutral-300 text-xs sm:text-sm">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-display text-base sm:text-lg font-black text-white">
              Privacidade & Desenvolvedor
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar Política de Privacidade"
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Identificação do Desenvolvedor / Controlador
            </p>
            <p className="font-bold text-white">{config.name}</p>
            <p className="flex items-center gap-1.5 text-xs text-neutral-400">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{config.address}</span>
            </p>
            <p className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>maruipelavajato@gmail.com</span>
            </p>
            <p className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>WhatsApp: {config.whatsappPhone}</span>
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-1">1. Dados Coletados</h4>
            <p className="text-xs text-neutral-400">
              Coletamos apenas Nome, WhatsApp e Modelo do Veículo quando você preenche voluntariamente o agendamento ou seu perfil, além das perguntas enviadas ao assistente Zion.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-1">2. Permissões e Segurança</h4>
            <p className="text-xs text-neutral-400">
              O aplicativo utiliza exclusivamente conexão segura HTTPS e não coleta localização em segundo plano, câmera, microfone, contatos ou SMS. Seus dados locais permanecem apenas no seu dispositivo e nunca são vendidos a terceiros.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-1">3. Exclusão de Dados (LGPD)</h4>
            <p className="text-xs text-neutral-400">
              Para solicitar alteração ou remoção de qualquer dado, envie e-mail para{' '}
              <a href="mailto:maruipelavajato@gmail.com" className="text-amber-400 underline">
                maruipelavajato@gmail.com
              </a>
              .
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <a
            href="/privacidade.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Versão Web Pública</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
