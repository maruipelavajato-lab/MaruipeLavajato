import React, { useState } from 'react';
import { Smartphone, Apple, Play, QrCode, CheckCircle2, Sparkles, ExternalLink, ArrowRight, Download } from 'lucide-react';
import { CompanyConfig } from '../types';

interface DownloadAppSectionProps {
  config: CompanyConfig;
  onOpenMobileAppMode: () => void;
}

export const DownloadAppSection: React.FC<DownloadAppSectionProps> = ({
  config,
  onOpenMobileAppMode,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | null>(null);

  const handleDownloadClick = (platform: 'android' | 'ios') => {
    setActivePlatform(platform);
    const link = platform === 'android' ? config.androidAppLink : config.iosAppLink;
    
    // Check if real link has been configured
    if (
      !link ||
      link === 'COLOCAR_LINK_DA_PLAY_STORE_AQUI' ||
      link === 'COLOCAR_LINK_DA_APP_STORE_AQUI' ||
      link.trim() === ''
    ) {
      setModalOpen(true);
    } else {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="baixar-app" className="py-24 bg-neutral-950 relative overflow-hidden border-t border-neutral-800/80">
      
      {/* Background Decorative Lighting (GPU safe radial gradient) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-8 sm:p-12 lg:p-16 shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-amber-500 uppercase">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Aplicativo Oficial Exclusivo</span>
              </div>

              {/* Title exactly as requested */}
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                BAIXE NOSSO APLICATIVO
              </h2>

              {/* Texts exactly as requested */}
              <div className="space-y-3">
                <p className="text-xl sm:text-2xl font-bold text-amber-400">
                  Tenha o Maruípe Lava Jato na palma da sua mão.
                </p>
                <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl">
                  Agende seu serviço, confira nosso catálogo e acompanhe seus pedidos pelo aplicativo.
                </p>
              </div>

              {/* Feature Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Agendamento rápido em menos de 1 minuto',
                  'Histórico completo de serviços do seu carro',
                  'Notificações de horário e status pelo WhatsApp',
                  'Descontos e promoções exclusivas no app',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* 2 Official Download Buttons as requested */}
              <div className="pt-4 flex flex-wrap gap-4">
                {/* ANDROID BUTTON */}
                <button
                  onClick={() => handleDownloadClick('android')}
                  className="flex-1 min-w-[200px] py-3.5 px-5 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-500/70 transition-all flex items-center gap-3.5 shadow-lg group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-950 flex items-center justify-center shrink-0 border border-neutral-800 text-white group-hover:text-amber-400">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                      Disponível na
                    </span>
                    <span className="block text-sm sm:text-base font-bold text-white whitespace-nowrap">
                      📱 BAIXAR PARA ANDROID
                    </span>
                  </div>
                </button>

                {/* IPHONE BUTTON */}
                <button
                  onClick={() => handleDownloadClick('ios')}
                  className="flex-1 min-w-[200px] py-3.5 px-5 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-500/70 transition-all flex items-center gap-3.5 shadow-lg group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-950 flex items-center justify-center shrink-0 border border-neutral-800 text-white group-hover:text-amber-400">
                    <Apple className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                      Disponível na
                    </span>
                    <span className="block text-sm sm:text-base font-bold text-white whitespace-nowrap">
                      🍎 BAIXAR PARA IPHONE
                    </span>
                  </div>
                </button>
              </div>

              {/* Live Web App Simulation Button */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={onOpenMobileAppMode}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors py-1"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Quer testar agora mesmo sem baixar da loja? Abrir o Aplicativo Web no Navegador</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="/maruipe-lavajato-projeto.zip"
                  download="maruipe-lavajato-projeto.zip"
                  className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors pt-1"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Baixar pacote completo de arquivos do site (.ZIP)</span>
                </a>
              </div>

            </div>

            {/* Right Column: QR Code Container */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Download Imediato</span>
                </div>

                {/* QR Code Container with sleek automotive frame */}
                <div className="relative mx-auto w-52 h-52 bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner">
                  {/* Visual QR Code Representation prepared for official release */}
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full text-neutral-950"
                    fill="currentColor"
                  >
                    {/* Corner positioning marks */}
                    <rect x="10" y="10" width="50" height="50" rx="6" />
                    <rect x="20" y="20" width="30" height="30" fill="white" />
                    <rect x="27" y="27" width="16" height="16" />

                    <rect x="140" y="10" width="50" height="50" rx="6" />
                    <rect x="150" y="20" width="30" height="30" fill="white" />
                    <rect x="157" y="27" width="16" height="16" />

                    <rect x="10" y="140" width="50" height="50" rx="6" />
                    <rect x="20" y="150" width="30" height="30" fill="white" />
                    <rect x="27" y="157" width="16" height="16" />

                    {/* QR Code Matrix Pattern */}
                    <rect x="70" y="20" width="12" height="12" />
                    <rect x="90" y="20" width="12" height="12" />
                    <rect x="110" y="30" width="12" height="12" />
                    <rect x="70" y="45" width="12" height="12" />
                    <rect x="100" y="50" width="12" height="12" />
                    <rect x="120" y="50" width="12" height="12" />

                    <rect x="20" y="70" width="12" height="12" />
                    <rect x="40" y="80" width="12" height="12" />
                    <rect x="70" y="80" width="20" height="20" />
                    <rect x="100" y="80" width="12" height="12" />
                    <rect x="130" y="70" width="15" height="15" />
                    <rect x="160" y="80" width="15" height="15" />

                    <rect x="20" y="105" width="15" height="15" />
                    <rect x="50" y="110" width="12" height="12" />
                    <rect x="80" y="110" width="15" height="15" />
                    <rect x="110" y="105" width="20" height="12" />
                    <rect x="145" y="110" width="12" height="12" />
                    <rect x="165" y="105" width="15" height="15" />

                    <rect x="70" y="145" width="15" height="15" />
                    <rect x="95" y="140" width="15" height="15" />
                    <rect x="120" y="150" width="20" height="12" />
                    <rect x="150" y="145" width="15" height="15" />
                    <rect x="80" y="170" width="15" height="15" />
                    <rect x="110" y="170" width="15" height="15" />
                    <rect x="140" y="170" width="25" height="15" />
                  </svg>

                  {/* Little badge in center */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-amber-500 text-neutral-950 font-black text-[9px] px-2 py-0.5 rounded shadow">
                      MARUÍPE
                    </span>
                  </div>
                </div>

                {/* Text exactly as requested */}
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-white">
                    Aponte a câmera do celular para baixar nosso aplicativo.
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Compatível com Android e iOS (iPhone)
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Modal 'Aplicativo em breve' */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
              <Smartphone className="w-7 h-7" />
            </div>

            <h3 className="font-display text-xl font-black text-white">
              Aplicativo em Breve na {activePlatform === 'android' ? 'Google Play Store' : 'Apple App Store'}!
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              O aplicativo oficial do <strong>Maruípe Lava Jato</strong> está em fase final de homologação nas lojas de aplicativos.
            </p>

            <div className="p-3.5 bg-neutral-950 border border-neutral-850 rounded-xl text-xs text-neutral-400 text-left space-y-1.5">
              <p className="text-white font-semibold">💡 Dica para o Administrador:</p>
              <p>
                Quando seu aplicativo for publicado na Google Play ou App Store, basta inserir os links reais no <strong>Painel Administrativo</strong> ou diretamente nas variáveis <code className="text-amber-400">ANDROID_APP_LINK</code> e <code className="text-amber-400">IOS_APP_LINK</code>.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setModalOpen(false);
                  onOpenMobileAppMode();
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs sm:text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span>Usar Aplicativo Web Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setModalOpen(false)}
                className="w-full py-2 text-xs text-neutral-400 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
