import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  Calendar,
  Clock,
  User,
  Phone,
  Car,
  MessageSquare,
  Copy,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { CartItem, CompanyConfig, Appointment } from '../types';
import {
  getStoredAppointments,
  getAvailableSlotsForDay,
  getUpcomingBookingDates,
  bookAppointment,
  buildWhatsAppUrl,
} from '../utils/scheduling';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  config: CompanyConfig;
  onUpdateQuantity: (serviceId: string, quantity: number) => void;
  onRemoveItem: (serviceId: string) => void;
  onClearCart: () => void;
  onAppointmentBooked: (appointment: Appointment) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  config,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAppointmentBooked,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');

  // Checkout form
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [notes, setNotes] = useState('');
  
  const upcomingDates = getUpcomingBookingDates(14);
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDates[0] || '');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [copiedPix, setCopiedPix] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastAppointment, setLastAppointment] = useState<Appointment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'local'>('pix');

  if (!isOpen) return null;

  // Totals calculations
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.service.price || 0) * item.quantity;
  }, 0);

  const hasQuoteItems = items.some((item) => item.service.price === null);
  const totalDurationMinutes = items.reduce((sum, item) => {
    return sum + item.service.durationMinutes * item.quantity;
  }, 0);

  // Slots availability for the combined duration
  const allAppointments = React.useMemo(() => getStoredAppointments(), [isOpen]);
  const dayAvailability = React.useMemo(() => {
    return selectedDate
      ? getAvailableSlotsForDay(allAppointments, selectedDate, totalDurationMinutes || 60, config.slotIntervalMinutes)
      : null;
  }, [allAppointments, selectedDate, totalDurationMinutes, config.slotIntervalMinutes]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(config.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handlePayWithCard = () => {
    if (
      !config.paymentLink ||
      config.paymentLink === 'COLOCAR_LINK_DE_PAGAMENTO_AQUI' ||
      config.paymentLink.trim() === ''
    ) {
      alert(
        'O link oficial de pagamento com cartão ainda está em configuração pelo proprietário. Você pode pagar via PIX ou diretamente na loja.'
      );
      return;
    }
    window.open(config.paymentLink, '_blank', 'noopener,noreferrer');
  };

  const handleFinalizeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!clientName.trim()) {
      setCheckoutError('Por favor informe seu nome.');
      return;
    }
    if (!clientPhone.trim() || clientPhone.replace(/\D/g, '').length < 8) {
      setCheckoutError('Por favor informe seu WhatsApp com DDD.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      setCheckoutError('Por favor escolha a data e o horário para o atendimento.');
      return;
    }

    const serviceIds = items.map((i) => i.service.id);
    const serviceNames = items.map((i) => `${i.service.name} (${i.quantity}x)`);

    const result = bookAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      vehicleModel: vehicleModel.trim() || undefined,
      serviceIds,
      serviceNames,
      date: selectedDate,
      time: selectedTime,
      durationMinutes: totalDurationMinutes,
      totalPrice: subtotal > 0 ? subtotal : undefined,
      hasQuoteItems,
      notes: notes.trim() ? `${notes.trim()} | Método preferido: ${paymentMethod.toUpperCase()}` : `Método preferido: ${paymentMethod.toUpperCase()}`,
    });

    if (!result.success || !result.appointment) {
      setCheckoutError(result.error || 'Erro ao agendar pedido.');
      return;
    }

    setLastAppointment(result.appointment);
    onAppointmentBooked(result.appointment);
    setStep('success');
    onClearCart();
  };

  // WhatsApp Message for Cart Order
  const generateWhatsAppOrderText = () => {
    if (!lastAppointment) return '';
    const dateFormatted = lastAppointment.date ? lastAppointment.date.split('-').reverse().join('/') : '';
    const servicesText = Array.isArray(lastAppointment.serviceNames) ? lastAppointment.serviceNames.join('\n- ') : '';
    const totalText = subtotal > 0 ? `R$ ${subtotal.toFixed(2).replace('.', ',')}` : 'A consultar';

    return `*NOVO PEDIDO / AGENDAMENTO - ${config.name.toUpperCase()}*

Olá! Gostaria de confirmar meu agendamento realizado pelo site:

👤 *Cliente:* ${lastAppointment.clientName}
📱 *WhatsApp:* ${lastAppointment.clientPhone}
🚗 *Veículo:* ${lastAppointment.vehicleModel || 'Não informado'}
📅 *Data:* ${dateFormatted}
⏰ *Horário:* ${lastAppointment.time} (Duração est.: ~${lastAppointment.durationMinutes} min)

📋 *Serviços Selecionados:*
- ${servicesText}

💰 *Total:* ${totalText}${hasQuoteItems ? ' (Itens de estética sob consulta no local)' : ''}
💳 *Forma de Pagamento:* ${paymentMethod.toUpperCase()}
${notes ? `💬 *Observações:* ${notes}\n` : ''}
📍 *Endereço do Lava Jato:* ${config.address}

Por favor, confirme meu horário!`;
  };

  const whatsappUrl = buildWhatsAppUrl(
    config.whatsappDigits,
    generateWhatsAppOrderText()
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/80 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-lg bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-lg font-bold text-white">
              {step === 'cart' && `Seu Carrinho (${totalItemsCount})`}
              {step === 'checkout' && 'Finalizar Agendamento'}
              {step === 'success' && 'Pedido Confirmado!'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: CART LIST */}
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 text-neutral-500 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-white">Seu carrinho está vazio</p>
                    <p className="text-xs text-neutral-400">
                      Explore nosso catálogo de lavagens e estética para adicionar serviços.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-amber-500 text-neutral-950 hover:brightness-110"
                  >
                    Ver Catálogo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.service.id}
                      className="flex gap-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800"
                    >
                      <img
                        src={item.service.image}
                        alt={item.service.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover shrink-0 border border-neutral-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-display text-sm font-bold text-white truncate">
                            {item.service.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.service.id)}
                            className="text-neutral-500 hover:text-red-400 p-1"
                            title="Remover serviço"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-neutral-400 line-clamp-1 mb-2">
                          {item.service.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 bg-neutral-900 px-2 py-1 rounded-md border border-neutral-800">
                            <button
                              onClick={() => onUpdateQuantity(item.service.id, item.quantity - 1)}
                              className="text-neutral-400 hover:text-white p-0.5"
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-white px-1.5">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.service.id, item.quantity + 1)}
                              className="text-neutral-400 hover:text-white p-0.5"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            {item.service.price !== null ? (
                              <span className="text-sm font-bold text-amber-400">
                                R$ {(item.service.price * item.quantity).toFixed(2).replace('.', ',')}
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-amber-400/90">
                                Consultar preço
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}

                  {/* Summary Box */}
                  <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-2.5">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Duração estimada na oficina:</span>
                      <span className="text-neutral-200 font-semibold">~{totalDurationMinutes} min</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Subtotal de itens com preço fixo:</span>
                      <span className="text-neutral-200">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    {hasQuoteItems && (
                      <div className="text-[11px] text-amber-400/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        * Há serviços de estética automotiva inclusos cujo valor final será orçado conforme o estado da pintura/veículo.
                      </div>
                    )}
                    <div className="flex justify-between items-baseline pt-2 border-t border-neutral-800">
                      <span className="text-sm font-bold text-white">Total:</span>
                      <div className="text-right">
                        <span className="font-display text-2xl font-black text-amber-400">
                          R$ {subtotal.toFixed(2).replace('.', ',')}
                        </span>
                        {hasQuoteItems && (
                          <span className="block text-[10px] text-neutral-400">+ itens a consultar</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT & SCHEDULING FORM */}
          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleFinalizeOrder} className="space-y-5">
              
              {/* Client Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  1. Dados de Contato
                </h4>
                
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Seu Nome *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Nome completo"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">WhatsApp com DDD *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="(27) 99286-9471"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Veículo (Marca / Modelo / Placa)</label>
                  <div className="relative">
                    <Car className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ex: Corolla Preto (Placa ODK-1020)"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="space-y-3 pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    2. Escolha Data e Horário
                  </h4>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    ~{totalDurationMinutes} min livres necessários
                  </span>
                </div>

                {/* Dates horizontal list */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {upcomingDates.slice(0, 7).map((dStr) => {
                    const [y, m, d] = dStr.split('-').map(Number);
                    const dt = new Date(y, m - 1, d);
                    const isSun = dt.getDay() === 0;
                    const isSel = selectedDate === dStr;

                    return (
                      <button
                        key={dStr}
                        type="button"
                        onClick={() => {
                          setSelectedDate(dStr);
                          setSelectedTime('');
                        }}
                        className={`min-w-[65px] py-2 px-2 rounded-xl text-center border transition-all ${
                          isSel
                            ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                            : isSun
                            ? 'bg-neutral-950/40 text-neutral-600 border-neutral-850'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <span className="block text-[10px] uppercase">{dt.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                        <span className="block text-base font-black">{dt.getDate()}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Slots */}
                {dayAvailability?.isClosed ? (
                  <p className="text-xs text-neutral-400 text-center py-2">Fechado neste dia. Aberto Seg a Sáb (07h às 18h) e Dom (08h às 14h).</p>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1">
                    {dayAvailability?.slots.map((s) => (
                      <button
                        key={s.time}
                        type="button"
                        disabled={!s.available}
                        onClick={() => setSelectedTime(s.time)}
                        className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-all ${
                          selectedTime === s.time
                            ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                            : s.available
                            ? 'bg-neutral-950 text-neutral-200 border-neutral-800 hover:border-amber-500'
                            : 'bg-neutral-950/50 text-neutral-600 border-neutral-850 line-through opacity-50'
                        }`}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3 pt-3 border-t border-neutral-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  3. Pagamento
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'pix'
                        ? 'bg-amber-500 text-neutral-950 border-amber-500'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>PIX</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cartao')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'cartao'
                        ? 'bg-amber-500 text-neutral-950 border-amber-500'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('local')}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'local'
                        ? 'bg-amber-500 text-neutral-950 border-amber-500'
                        : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Na Entrega</span>
                  </button>
                </div>

                {/* PIX Details */}
                {paymentMethod === 'pix' && (
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400">Chave PIX (Telefone):</span>
                      <span className="font-bold text-amber-400">{config.pixKey}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{copiedPix ? 'Chave PIX Copiada!' : 'COPIAR CHAVE PIX'}</span>
                    </button>
                  </div>
                )}

                {/* Card Payment Button */}
                {paymentMethod === 'cartao' && (
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <p className="text-xs text-neutral-400">
                      Pague online de forma segura com cartão de crédito/débito através do checkout:
                    </p>
                    <button
                      type="button"
                      onClick={handlePayWithCard}
                      className="w-full py-2.5 px-3 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>PAGAR COM CARTÃO</span>
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Observações adicionais</label>
                  <input
                    type="text"
                    placeholder="Instruções para o lavador..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && lastAppointment && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-2xl font-black text-white">
                  Pedido e Agendamento Realizados!
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-sm mx-auto">
                  Sua vaga está reservada. Clique abaixo para enviar a confirmação automática pelo WhatsApp da empresa.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Cliente:</span>
                  <span className="font-bold text-white">{lastAppointment.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Horário:</span>
                  <span className="font-bold text-amber-400">
                    {lastAppointment.date.split('-').reverse().join('/')} às {lastAppointment.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Serviços:</span>
                  <span className="text-white text-right font-medium truncate max-w-[200px]">
                    {lastAppointment.serviceNames.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-850">
                  <span className="text-neutral-400">Total:</span>
                  <span className="font-bold text-white">
                    {lastAppointment.totalPrice ? `R$ ${lastAppointment.totalPrice.toFixed(2).replace('.', ',')}` : 'A consultar'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>ENVIAR MENSAGEM NO WHATSAPP</span>
                </a>

                {paymentMethod === 'pix' && (
                  <button
                    onClick={handleCopyPix}
                    className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 hover:text-white flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copiedPix ? 'Chave PIX Copiada!' : 'Copiar Chave PIX (27 99286-9471)'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setStep('cart');
                    onClose();
                  }}
                  className="py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Fechar Carrinho
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Drawer Footer Actions */}
        {items.length > 0 && step !== 'success' && (
          <div className="p-6 border-t border-neutral-800 bg-neutral-950 space-y-3">
            {step === 'cart' ? (
              <button
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold text-sm hover:brightness-110 active:scale-[0.98] shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>FINALIZAR PEDIDO & AGENDAR</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="w-1/3 py-3 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-semibold hover:text-white"
                >
                  Voltar
                </button>
                <button
                  form="checkout-form"
                  type="submit"
                  disabled={!selectedTime}
                  className={`w-2/3 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                    selectedTime
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <span>CONFIRMAR AGENDAMENTO</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
