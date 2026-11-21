import React, { useState } from 'react';
import { Smartphone, Apple, Play, QrCode, CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { CompanyConfig } from '../types';

interface DownloadAppSectionProps {
  config: CompanyConfig;
  onOpenMobileAppMode: () => void;
}

const ANDROID_DIRECT_APK_URL =
  'https://github.com/maruipelavajato-lab/MaruipeLavajato/releases/latest/download/Maruipe-Lava-Jato-Zion.apk';

export const DownloadAppSection: React.FC<DownloadAppSectionProps> = ({
  config,
  onOpenMobileAppMode,
}) => {
  const [iosModalOpen, setIosModalOpen] = useState(false);

  const hasAndroidStoreLink =
    Boolean(config.androidAppLink) &&
    config.androidAppLink !== 'COLOCAR_LINK_DA_PLAY_STORE_AQUI' &&
    config.androidAppLink.trim() !== '';

  const hasIosStoreLink =
    Boolean(config.iosAppLink) &&
    config.iosAppLink !== 'COLOCAR_LINK_DA_APP_STORE_AQUI' &&
    config.iosAppLink.trim() !== '';

  const androidDownloadHref = hasAndroidStoreLink ? config.androidAppLink : ANDROID_DIRECT_APK_URL;

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
                <span>Aplicativo Nativo · Android &amp; iOS</span>
              </div>

              {/* Title */}
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                BAIXE NOSSO APLICATIVO
              </h2>

              {/* Texts */}
              <div className="space-y-3">
                <p className="text-xl sm:text-2xl font-bold text-amber-400">
                  Aplicativo completo instalado direto no celular — sem precisar criar atalho.
                </p>
                <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl">
                  Agende lavagens (trazendo o carro ou com busca no local), fale com a IA Zion, confira o catálogo e acompanhe seus pedidos pelo app oficial.
                </p>
              </div>

              {/* Feature Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Instalador oficial Android e publicação na Google Play Store',
                  'Aplicativo oficial para iPhone (iOS) pronto para TestFlight e App Store',
                  'Agendamento na loja ou Leva e Traz + IA Zion integrada',
                  'Sem atalhos de navegador: ícone e aplicativo instalados no aparelho',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* 2 Official Native Download Buttons */}
              <div className="pt-4 flex flex-wrap gap-4">
                {/* ANDROID REAL APK / PLAY STORE BUTTON */}
                <a
                  href={androidDownloadHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[220px] py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 transition-all flex items-center gap-3.5 shadow-lg text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-950/90 flex items-center justify-center shrink-0 text-emerald-400">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-neutral-950/80">
                      {hasAndroidStoreLink ? 'Disponível na Google Play' : 'Instalador Direto Android (.APK)'}
                    </span>
                    <span className="block text-sm sm:text-base font-black text-neutral-950 whitespace-nowrap">
                      BAIXAR PARA ANDROID
                    </span>
                  </div>
                </a>

                {/* IPHONE (iOS) APP STORE / TESTFLIGHT BUTTON */}
                {hasIosStoreLink ? (
                  <a
                    href={config.iosAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[220px] py-3.5 px-5 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-500/70 transition-all flex items-center gap-3.5 shadow-lg group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-neutral-950 flex items-center justify-center shrink-0 border border-neutral-800 text-white group-hover:text-amber-400">
                      <Apple className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                        App Store / TestFlight
                      </span>
                      <span className="block text-sm sm:text-base font-bold text-white whitespace-nowrap">
                        BAIXAR PARA IPHONE (iOS)
                      </span>
                    </div>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIosModalOpen(true)}
                    className="flex-1 min-w-[220px] py-3.5 px-5 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-500/70 transition-all flex items-center gap-3.5 shadow-lg group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-neutral-950 flex items-center justify-center shrink-0 border border-neutral-800 text-white group-hover:text-amber-400">
                      <Apple className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-neutral-400">
                        iPhone / iPad (iOS Nativo)
                      </span>
                      <span className="block text-sm sm:text-base font-bold text-white whitespace-nowrap">
                        BAIXAR PARA IPHONE (iOS)
                      </span>
                    </div>
                  </button>
                )}
              </div>

              {/* Transparent App Security Declaration at Install Time */}
              <div className="p-3.5 rounded-2xl bg-neutral-950/90 border border-emerald-500/30 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Aplicativo Oficial Verificado &amp; Seguro na Instalação</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Assinado digitalmente por <strong>Maruípe Lava Jato Estética Automotiva</strong> (<code className="text-amber-400">com.maruipelavajato.app</code>), conexão exclusiva em <strong>HTTPS</strong> e apenas permissão de <strong>Internet</strong> (sem acesso a câmera, microfone, contatos ou GPS em segundo plano).
                </p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  No Android, ao instalar o <strong>.APK direto</strong> fora da Play Store, o Google Play Protect realiza a verificação padrão de segurança — confirme normalmente sem desativar a proteção. Para publicação pública sem aviso de fonte externa, utilize o pacote <strong>.AAB</strong> na Google Play Console e o <strong>.IPA / TestFlight</strong> na Apple App Store.
                </p>
              </div>

              {/* App Browser Preview */}
              <div className="pt-1 flex flex-col gap-2">
                <button
                  onClick={onOpenMobileAppMode}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors py-1"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Pré-visualizar interface do aplicativo agora no navegador</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right Column: QR Code Container */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>App Oficial Android &amp; iOS</span>
                </div>

                {/* QR Code Container with sleek automotive frame */}
                <div className="relative mx-auto w-52 h-52 bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full text-neutral-950"
                    fill="currentColor"
                  >
                    <rect x="10" y="10" width="50" height="50" rx="6" />
                    <rect x="20" y="20" width="30" height="30" fill="white" />
                    <rect x="27" y="27" width="16" height="16" />

                    <rect x="140" y="10" width="50" height="50" rx="6" />
                    <rect x="150" y="20" width="30" height="30" fill="white" />
                    <rect x="157" y="27" width="16" height="16" />

                    <rect x="10" y="140" width="50" height="50" rx="6" />
                    <rect x="20" y="150" width="30" height="30" fill="white" />
                    <rect x="27" y="157" width="16" height="16" />

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

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-amber-500 text-neutral-950 font-black text-[9px] px-2 py-0.5 rounded shadow">
                      MARUÍPE
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-white">
                    App oficial instalado no Android (.APK) e iPhone (App Store / TestFlight).
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Versão 1.0.0 · Pacote com.maruipelavajato.app
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Modal iOS Native App (App Store / TestFlight) */}
      {iosModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
              <Apple className="w-7 h-7" />
            </div>

            <h3 className="font-display text-xl font-black text-white">
              Aplicativo Oficial para iPhone (iOS)
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              O aplicativo do <strong>Maruípe Lava Jato</strong> para iPhone/iPad (com <strong>Agente IA Zion</strong> e <strong>Leva e Traz</strong>) é distribuído exclusivamente pelos canais oficiais da Apple.
            </p>

            <div className="p-3.5 bg-neutral-950 border border-neutral-850 rounded-xl text-xs text-neutral-300 text-left space-y-2">
              <p className="text-amber-400 font-bold">Instalação segura no iPhone:</p>
              <p>
                Por proteção da Apple, aplicativos de iPhone são instalados apenas via <strong>App Store</strong> ou convite oficial do <strong>TestFlight</strong>.
              </p>
              <p>
                Enquanto o link da App Store é liberado pelo proprietário, você pode abrir o modo aplicativo completo aqui mesmo no celular ou solicitar atendimento pelo nosso WhatsApp.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">

              <button
                onClick={() => {
                  setIosModalOpen(false);
                  onOpenMobileAppMode();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-semibold text-xs sm:text-sm hover:bg-neutral-750 transition-all"
              >
                Visualizar App Agora no Navegador
              </button>

              <button
                onClick={() => setIosModalOpen(false)}
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
