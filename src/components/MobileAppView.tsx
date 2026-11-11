import React, { useState } from 'react';
import {
  Home,
  BookOpen,
  Calendar,
  ShoppingBag,
  User,
  MessageCircle,
  CreditCard,
  QrCode,
  Copy,
  Plus,
  Minus,
  Trash2,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Service, CartItem, Appointment, CompanyConfig } from '../types';
import {
  getStoredAppointments,
  getAvailableSlotsForDay,
  getUpcomingBookingDates,
  bookAppointment,
  buildWhatsAppUrl,
  buildWhatsAppBookingMessage,
} from '../utils/scheduling';

interface MobileAppViewProps {
  services: Service[];
  config: CompanyConfig;
  cartItems: CartItem[];
  onAddToCart: (service: Service) => void;
  onUpdateCartQuantity: (serviceId: string, qty: number) => void;
  onRemoveFromCart: (serviceId: string) => void;
  onClearCart: () => void;
  onSwitchToWebsite: () => void;
}

type AppTab = 'inicio' | 'catalogo' | 'agendamento' | 'carrinho' | 'perfil' | 'pagamentos';

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  services,
  config,
  cartItems,
  onAddToCart,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onClearCart,
  onSwitchToWebsite,
}) => {
  const [currentTab, setCurrentTab] = useState<AppTab>('inicio');

  // Customer Profile state (stored in local storage so non-mandatory registration persists)
  const [clientProfile, setClientProfile] = useState<{
    name: string;
    phone: string;
    vehicle: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('maruipe_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { name: '', phone: '', vehicle: '' };
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Scheduling Tab State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || 'lavagem-especial');
  const upcomingDates = getUpcomingBookingDates(14);
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDates[0] || '');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appNotes, setAppNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // PIX copy state
  const [copiedPix, setCopiedPix] = useState(false);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const allAppointments = React.useMemo(() => getStoredAppointments(), [bookingSuccess]);
  const dayAvailability = React.useMemo(() => {
    return selectedDate
      ? getAvailableSlotsForDay(allAppointments, selectedDate, selectedService?.durationMinutes || 60, config.slotIntervalMinutes)
      : null;
  }, [allAppointments, selectedDate, selectedService?.durationMinutes, config.slotIntervalMinutes]);

  // Cart totals
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.service.price || 0) * item.quantity, 0);
  const hasQuoteItems = cartItems.some((item) => item.service.price === null);

  // User's appointments for the Perfil / Histórico tab
  const userAppointments = React.useMemo(() => {
    return allAppointments.filter((apt) => {
      if (!clientProfile?.phone) return false;
      const cleanUserPhone = (clientProfile.phone || '').replace(/\D/g, '');
      const cleanAptPhone = (apt?.clientPhone || '').replace(/\D/g, '');
      const clientNameLower = (clientProfile.name || '').toLowerCase();
      const aptNameLower = (apt?.clientName || '').toLowerCase();
      const matchesName = clientNameLower && aptNameLower ? aptNameLower.includes(clientNameLower) : false;
      return cleanUserPhone && cleanAptPhone && (cleanUserPhone === cleanAptPhone || matchesName);
    });
  }, [allAppointments, clientProfile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('maruipe_user_profile', JSON.stringify(clientProfile));
    setIsEditingProfile(false);
  };

  const handleAppBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    const nameToUse = clientProfile.name.trim();
    const phoneToUse = clientProfile.phone.trim();

    if (!nameToUse) {
      setBookingError('Por favor informe seu Nome.');
      return;
    }
    if (!phoneToUse || phoneToUse.replace(/\D/g, '').length < 8) {
      setBookingError('Por favor informe seu WhatsApp com DDD.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      setBookingError('Escolha a data e o horário disponível.');
      return;
    }

    const result = bookAppointment({
      clientName: nameToUse,
      clientPhone: phoneToUse,
      vehicleModel: clientProfile.vehicle || undefined,
      serviceIds: [selectedService.id],
      serviceNames: [selectedService.name],
      date: selectedDate,
      time: selectedTime,
      durationMinutes: selectedService.durationMinutes,
      totalPrice: selectedService.price ?? undefined,
      hasQuoteItems: selectedService.price === null,
      notes: appNotes || undefined,
    });

    if (!result.success || !result.appointment) {
      setBookingError(result.error || 'Erro ao realizar agendamento.');
      return;
    }

    // Save profile for future visits
    localStorage.setItem('maruipe_user_profile', JSON.stringify(clientProfile));

    setBookingSuccess(result.appointment);
  };

  const handleCartCheckoutInApp = () => {
    if (cartItems.length === 0) return;
    setCurrentTab('agendamento');
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(config.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const generalWhatsAppUrl = buildWhatsAppUrl(
    config.whatsappDigits,
    'Olá! Estou usando o aplicativo do Maruípe Lava Jato e gostaria de tirar uma dúvida.'
  );

  return (
    <div className="min-h-screen bg-neutral-950 py-4 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-center">
      
      {/* Top Banner with Switch Back to Website */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between px-2">
        <button
          onClick={onSwitchToWebsite}
          className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>← Voltar ao Site Oficial</span>
        </button>
        <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider">
          Aplicativo Mobile PWA
        </span>
      </div>

      {/* Smartphone Frame Simulation */}
      <div className="w-full max-w-md h-[840px] max-h-[92vh] bg-neutral-950 rounded-[40px] border-4 border-neutral-800 shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Phone Notch & Status Bar */}
        <div className="h-6 bg-neutral-950 flex items-center justify-between px-6 pt-1 text-[10px] text-neutral-400 font-semibold select-none shrink-0">
          <span>09:41</span>
          <div className="w-20 h-4 bg-neutral-900 rounded-b-xl -mt-1 mx-auto" />
          <span>5G 100%</span>
        </div>

        {/* App Bar / Header */}
        <div className="px-5 py-3.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-display text-base font-black text-white tracking-tight leading-none">
              MARUÍPE LAVA JATO
            </h1>
            <span className="text-[9px] font-bold tracking-widest text-amber-500 uppercase">
              ESTÉTICA AUTOMOTIVA
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('carrinho')}
              className="relative p-2 rounded-lg bg-neutral-950 text-neutral-200 border border-neutral-800"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-neutral-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab View Container */}
        <div className="flex-1 overflow-y-auto bg-neutral-950 p-4 scrollbar-thin">
          
          {/* TAB 1: INÍCIO */}
          {currentTab === 'inicio' && (
            <div className="space-y-4">
              
              {/* Highlight Promotion Banner as requested */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/40 p-4 space-y-3 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Promoção em Destaque
                    </span>
                    <h2 className="font-display text-xl font-black text-white">
                      LAVAGEM ESPECIAL
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Apenas</span>
                    <div className="text-2xl font-black text-amber-400">R$ 50</div>
                  </div>
                </div>

                <p className="text-xs text-neutral-300">
                  Lavagem + aspiração + pretinho + cera + revitalização dos plásticos por dentro e por fora.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      const especial = services.find((s) => s.id === 'lavagem-especial');
                      if (especial) onAddToCart(especial);
                    }}
                    className="py-2 px-3 text-xs font-bold rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center gap-1.5 shadow"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedServiceId('lavagem-especial');
                      setCurrentTab('agendamento');
                    }}
                    className="py-2 px-3 text-xs font-bold rounded-xl bg-neutral-800 text-white border border-neutral-700 flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Agendar Já</span>
                  </button>
                </div>
              </div>

              {/* 4 Main Action Buttons requested in prompt:
                  AGENDAR, CATÁLOGO, CARRINHO, WHATSAPP */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setCurrentTab('agendamento')}
                  className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 flex flex-col items-center text-center gap-2 group transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-amber-400">
                      AGENDAR
                    </span>
                    <span className="block text-[10px] text-neutral-400">Escolha dia e hora</span>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentTab('catalogo')}
                  className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 flex flex-col items-center text-center gap-2 group transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-amber-400">
                      CATÁLOGO
                    </span>
                    <span className="block text-[10px] text-neutral-400">Todos os serviços</span>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentTab('carrinho')}
                  className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 flex flex-col items-center text-center gap-2 group transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-amber-400">
                      CARRINHO
                    </span>
                    <span className="block text-[10px] text-neutral-400">{cartItems.length} selecionados</span>
                  </div>
                </button>

                <a
                  href={generalWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 flex flex-col items-center text-center gap-2 group transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-emerald-400">
                      WHATSAPP
                    </span>
                    <span className="block text-[10px] text-neutral-400">(27) 99286-9471</span>
                  </div>
                </a>
              </div>

              {/* Fast Service Showcase */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white">Serviços Populares</span>
                  <button
                    onClick={() => setCurrentTab('catalogo')}
                    className="text-amber-400 hover:underline"
                  >
                    Ver todos →
                  </button>
                </div>

                <div className="space-y-2">
                  {services.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-900 border border-neutral-850"
                    >
                      <img
                        src={s.image}
                        alt={s.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{s.name}</h4>
                        <span className="text-[11px] text-amber-400 font-semibold">
                          {s.price ? `R$ ${s.price}` : s.priceLabel || 'Consultar preço'}
                        </span>
                      </div>
                      <button
                        onClick={() => onAddToCart(s)}
                        className="p-2 rounded-lg bg-neutral-800 text-amber-400 hover:bg-neutral-750 text-xs"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Info Box */}
              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-850 text-xs text-neutral-400 space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Rua Daniel Abreu Machado, 1406 – Vitória/ES</span>
                </div>
                <p className="text-[11px]">Seg a Sex: 08h às 18h | Sáb: 08h às 15h</p>
              </div>

            </div>
          )}

          {/* TAB 2: CATÁLOGO */}
          {currentTab === 'catalogo' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white mb-2">Catálogo de Serviços</h3>
              
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2"
                  >
                    <div className="flex gap-3">
                      <img
                        src={service.image}
                        alt={service.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {service.name}
                          </h4>
                          <span className="text-xs font-bold text-amber-400 shrink-0">
                            {service.price ? `R$ ${service.price}` : service.priceLabel || 'Consultar'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                          {service.description}
                        </p>
                        <span className="text-[10px] text-neutral-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-amber-500" /> ~{service.durationMinutes} min
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => onAddToCart(service)}
                        className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3 text-amber-400" />
                        <span>No Carrinho</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedServiceId(service.id);
                          setCurrentTab('agendamento');
                        }}
                        className="py-1.5 px-2 text-xs font-bold rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Agendar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AGENDAMENTO INTELIGENTE */}
          {currentTab === 'agendamento' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Agendamento no App</h3>

              {!bookingSuccess ? (
                <form onSubmit={handleAppBooking} className="space-y-3.5">
                  {/* Select Service */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Serviço Desejado
                    </label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => {
                        setSelectedServiceId(e.target.value);
                        setSelectedTime('');
                      }}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.price ? `R$ ${s.price}` : s.priceLabel || 'Consultar'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Pick */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Data
                    </label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      {upcomingDates.slice(0, 10).map((d) => {
                        const [y, m, dt] = d.split('-').map(Number);
                        const obj = new Date(y, m - 1, dt);
                        const isSun = obj.getDay() === 0;
                        const isSel = selectedDate === d;

                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              setSelectedDate(d);
                              setSelectedTime('');
                            }}
                            className={`min-w-[55px] py-1.5 px-1 rounded-xl text-center border text-[10px] ${
                              isSel
                                ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                                : isSun
                                ? 'bg-neutral-900/40 text-neutral-600 border-neutral-850'
                                : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                            }`}
                          >
                            <span className="block uppercase font-semibold">
                              {obj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                            </span>
                            <span className="block text-sm font-bold">{dt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Slot Pick with Anti Double-Booking */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-neutral-400">
                        Horários Livres
                      </label>
                      <span className="text-[10px] text-amber-500">Sem sobreposição</span>
                    </div>

                    {dayAvailability?.isClosed ? (
                      <p className="text-xs text-neutral-500 text-center py-2 bg-neutral-900 rounded-lg">
                        Fechado neste dia. Aberto Seg a Sáb (07h às 18h) e Dom (08h às 14h).
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1">
                        {dayAvailability?.slots.map((s) => (
                          <button
                            key={s.time}
                            type="button"
                            disabled={!s.available}
                            onClick={() => setSelectedTime(s.time)}
                            className={`py-1.5 px-1 text-xs rounded-lg border text-center transition-all ${
                              selectedTime === s.time
                                ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                                : s.available
                                ? 'bg-neutral-900 text-neutral-200 border-neutral-800'
                                : 'bg-neutral-900/40 text-neutral-600 border-neutral-850 line-through opacity-40'
                            }`}
                          >
                            {s.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form fields */}
                  <div className="space-y-2 pt-2 border-t border-neutral-850">
                    <div>
                      <label className="block text-[10px] text-neutral-400">Nome</label>
                      <input
                        type="text"
                        required
                        placeholder="Seu nome"
                        value={clientProfile.name}
                        onChange={(e) => setClientProfile({ ...clientProfile, name: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-400">WhatsApp (com DDD)</label>
                      <input
                        type="tel"
                        required
                        placeholder="(27) 99999-9999"
                        value={clientProfile.phone}
                        onChange={(e) => setClientProfile({ ...clientProfile, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-400">Veículo (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Civic Preto"
                        value={clientProfile.vehicle}
                        onChange={(e) => setClientProfile({ ...clientProfile, vehicle: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-400">Observações</label>
                      <input
                        type="text"
                        placeholder="Ex: Carro com lama / película"
                        value={appNotes}
                        onChange={(e) => setAppNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  {bookingError && (
                    <p className="text-xs text-red-400 bg-red-950/50 p-2 rounded-lg">{bookingError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedTime}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                      selectedTime
                        ? 'bg-amber-500 text-neutral-950 shadow-md'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedTime ? `Confirmar (${selectedTime})` : 'Selecione um Horário'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Agendamento Realizado!</h4>
                    <p className="text-xs text-neutral-400">
                      {bookingSuccess.date.split('-').reverse().join('/')} às {bookingSuccess.time}
                    </p>
                  </div>

                  <a
                    href={buildWhatsAppUrl(
                      config.whatsappDigits,
                      buildWhatsAppBookingMessage(bookingSuccess, config.name)
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Confirmar no WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      setBookingSuccess(null);
                      setCurrentTab('inicio');
                    }}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Voltar ao Início
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CARRINHO DO APP */}
          {currentTab === 'carrinho' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Carrinho de Serviços</h3>

              {cartItems.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-400">Seu carrinho está vazio.</p>
                  <button
                    onClick={() => setCurrentTab('catalogo')}
                    className="py-1.5 px-3 bg-amber-500 text-neutral-950 font-bold text-xs rounded-lg"
                  >
                    Abrir Catálogo
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.service.id}
                      className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-2.5"
                    >
                      <img
                        src={item.service.image}
                        alt={item.service.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.service.name}</h4>
                        <span className="text-[11px] text-amber-400 font-semibold">
                          {item.service.price ? `R$ ${(item.service.price * item.quantity).toFixed(2)}` : 'Consultar preço'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateCartQuantity(item.service.id, item.quantity - 1)}
                          className="p-1 rounded bg-neutral-800 text-neutral-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white px-1">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateCartQuantity(item.service.id, item.quantity + 1)}
                          className="p-1 rounded bg-neutral-800 text-neutral-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Total dos itens:</span>
                      <span className="font-bold text-amber-400">
                        R$ {cartTotal.toFixed(2).replace('.', ',')}
                        {hasQuoteItems && ' (+ orçamentos)'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCartCheckoutInApp}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs shadow-md"
                  >
                    FINALIZAR PEDIDO (AGENDAR)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PERFIL E HISTÓRICO */}
          {currentTab === 'perfil' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Perfil do Cliente</h3>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  {isEditingProfile ? 'Cancelar' : 'Editar Dados'}
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2.5">
                  <div>
                    <label className="text-[10px] text-neutral-400">Nome</label>
                    <input
                      type="text"
                      value={clientProfile.name}
                      onChange={(e) => setClientProfile({ ...clientProfile, name: e.target.value })}
                      placeholder="Seu nome"
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">WhatsApp</label>
                    <input
                      type="tel"
                      value={clientProfile.phone}
                      onChange={(e) => setClientProfile({ ...clientProfile, phone: e.target.value })}
                      placeholder="(27) 99999-9999"
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Veículo Principal</label>
                    <input
                      type="text"
                      value={clientProfile.vehicle}
                      onChange={(e) => setClientProfile({ ...clientProfile, vehicle: e.target.value })}
                      placeholder="Ex: Corolla Preto"
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 text-neutral-950 text-xs font-bold rounded-lg"
                  >
                    Salvar Dados
                  </button>
                </form>
              ) : (
                <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {clientProfile.name || 'Cliente Visitante'}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {clientProfile.phone || 'Telefone não configurado'}
                      </p>
                    </div>
                  </div>
                  {clientProfile.vehicle && (
                    <p className="text-[11px] text-amber-400/90 pt-1 border-t border-neutral-800">
                      🚗 Veículo cadastrado: <strong>{clientProfile.vehicle}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Histórico de Serviços / Agendamentos */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Histórico de Agendamentos & Pedidos
                </h4>

                {allAppointments.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-4 bg-neutral-900/40 rounded-xl">
                    Nenhum serviço realizado ainda.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {allAppointments.slice(0, 4).map((apt) => (
                      <div
                        key={apt.id}
                        className="p-3 bg-neutral-900 border border-neutral-850 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex justify-between font-bold">
                          <span className="text-white truncate">{apt.serviceNames.join(', ')}</span>
                          <span className="text-amber-400">
                            {apt.date.split('-').reverse().join('/')}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-neutral-400">
                          <span>Horário: {apt.time}</span>
                          <span className="text-emerald-400 font-semibold uppercase">{apt.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 6: PAGAMENTOS */}
          {currentTab === 'pagamentos' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Opções de Pagamento</h3>

              {/* PIX */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <QrCode className="w-4 h-4" />
                  <span>PAGAMENTO INSTANTÂNEO VIA PIX</span>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl text-xs space-y-1">
                  <span className="text-neutral-400 block text-[10px]">Chave PIX (Telefone):</span>
                  <p className="font-mono text-sm font-bold text-white">{config.pixKey}</p>
                </div>

                <button
                  onClick={handleCopyPix}
                  className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedPix ? 'Chave Copiada!' : 'COPIAR CHAVE PIX'}</span>
                </button>
              </div>

              {/* Cartão */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>PAGAMENTO COM CARTÃO</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Aceitamos cartões de crédito e débito das principais bandeiras na entrega ou online.
                </p>
                <button
                  onClick={() => {
                    if (!config.paymentLink || config.paymentLink === 'COLOCAR_LINK_DE_PAGAMENTO_AQUI') {
                      alert('Link de pagamento com cartão em configuração pelo administrador.');
                    } else {
                      window.open(config.paymentLink, '_blank');
                    }
                  }}
                  className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-750 flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>PAGAR COM CARTÃO</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Native-feel Bottom Navigation Bar */}
        <div className="h-16 bg-neutral-900 border-t border-neutral-800 flex items-center justify-around px-2 shrink-0">
          <button
            onClick={() => setCurrentTab('inicio')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentTab === 'inicio' ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Início</span>
          </button>

          <button
            onClick={() => setCurrentTab('catalogo')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentTab === 'catalogo' ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Catálogo</span>
          </button>

          <button
            onClick={() => setCurrentTab('agendamento')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentTab === 'agendamento' ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar</span>
          </button>

          <button
            onClick={() => setCurrentTab('carrinho')}
            className={`relative flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentTab === 'carrinho' ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Carrinho</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('perfil')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              currentTab === 'perfil' ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Perfil</span>
          </button>
        </div>

      </div>
    </div>
  );
};
