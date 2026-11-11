import React, { useState } from 'react';
import { MapPin, Phone, Clock, QrCode, Copy, Shield, Sparkles, Navigation, ExternalLink, CreditCard } from 'lucide-react';
import { CompanyConfig } from '../types';

interface AboutAndContactProps {
  config: CompanyConfig;
  onOpenSchedule: () => void;
}

export const AboutAndContact: React.FC<AboutAndContactProps> = ({ config, onOpenSchedule }) => {
  const [copiedPix, setCopiedPix] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(config.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Rua Daniel Abreu Machado, 1406, Vitória, ES'
  )}`;

  return (
    <>
      {/* SOBRE NÓS */}
      <section id="sobre" className="py-20 bg-neutral-900/50 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-bold tracking-widest text-amber-500 uppercase">
                Sobre a Empresa
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                MARUÍPE LAVA JATO & ESTÉTICA AUTOMOTIVA
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-neutral-300 leading-relaxed">
                <p>
                  Localizado no coração de <strong>Vitória/ES</strong>, o Maruípe Lava Jato nasceu da paixão por cuidar de cada detalhe automotivo. Combinamos técnicas modernas de detalhamento com produtos de altíssimo padrão para garantir que seu carro tenha sempre o aspecto de zero quilômetro.
                </p>
                <p>
                  Aqui você conta com atendimento transparente, hora marcada para eliminar esperas desnecessárias, e uma equipe dedicada a preservar a pintura, os plásticos e o interior do seu veículo contra o desgaste do tempo.
                </p>
              </div>

              {/* Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-white text-sm">Garantia & Cuidado</h4>
                  <p className="text-xs text-neutral-400">Processos seguros que não agridem a pintura.</p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-white text-sm">Sem Filas</h4>
                  <p className="text-xs text-neutral-400">Horário reservado exclusivamente para você.</p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-white text-sm">Produtos Premium</h4>
                  <p className="text-xs text-neutral-400">Shampoos neutros, ceras nobres e selantes UV.</p>
                </div>
              </div>
            </div>

            {/* Right Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950">
                <img
                  src="/assets/images/detailing_polimento_carro_1794352177308.jpg"
                  alt="Profissional de estética automotiva realizando polimento detalhado"
                  referrerPolicy="no-referrer"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-neutral-950/80 backdrop-blur-md border border-neutral-800">
                  <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Profissionalismo & Paixão
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Acabamento espelhado e higienização profunda em Vitória.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CONTATO, LOCALIZAÇÃO & PAGAMENTOS */}
      <section id="contato" className="py-20 bg-neutral-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="text-xs font-bold tracking-widest text-amber-500 uppercase">
              Onde Estamos & Pagamentos
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              CONTATO & LOCALIZAÇÃO
            </h2>
            <p className="text-sm sm:text-base text-neutral-400">
              Venha tomar um café enquanto cuidamos do seu carro ou reserve seu horário com antecedência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Endereço */}
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">Endereço</h3>
                <p className="text-sm text-neutral-300">
                  {config.address}
                </p>
                <p className="text-xs text-neutral-400">
                  Próximo às principais vias de Maruípe com fácil acesso e estacionamento.
                </p>
              </div>

              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 pt-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Como Chegar (Google Maps)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Atendimento & Horários */}
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">Horário de Funcionamento</h3>
                <div className="space-y-2 text-xs sm:text-sm text-neutral-300">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Segunda a Sábado:</span>
                    <span className="font-bold text-white">{config.businessHoursWeekdays || '07:00 às 18:00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Domingo:</span>
                    <span className="font-bold text-amber-400">{config.businessHoursSunday || '08:00 às 14:00'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenSchedule}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white border border-neutral-700 transition-colors"
              >
                Agendar Horário Online
              </button>
            </div>

            {/* Pagamentos: PIX & Cartão de Crédito / Débito */}
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-display text-lg font-bold text-white">PIX & Cartão de Crédito / Débito</h3>
                
                {/* PIX Key */}
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Chave PIX Oficial:</span>
                  <p className="font-mono text-sm font-bold text-amber-400">{config.pixKey}</p>
                </div>

                {/* Card Info */}
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Cartão de Crédito ou Débito:</span>
                  <p className="text-xs text-neutral-200">
                    Aceitamos todas as bandeiras (Visa, Mastercard, Elo, Hipercard) na maquininha sem fio na entrega ou via link online.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCopyPix}
                  className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedPix ? 'Chave Copiada com Sucesso!' : 'COPIAR CHAVE PIX'}</span>
                </button>

                <button
                  onClick={() => {
                    if (!config.paymentLink || config.paymentLink === 'COLOCAR_LINK_DE_PAGAMENTO_AQUI') {
                      alert('Aceitamos cartão de crédito e débito na maquininha sem fio no local ou na entrega do seu veículo! Caso deseje pagar por link antecipado, solicite diretamente pelo WhatsApp.');
                    } else {
                      window.open(config.paymentLink, '_blank');
                    }
                  }}
                  className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white border border-neutral-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>PAGAR COM CARTÃO (Crédito / Débito)</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>
    </>
  );
};
