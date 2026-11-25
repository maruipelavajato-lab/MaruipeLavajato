import React, { useState, useRef, useEffect } from 'react';
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
  Clock,
  MapPin,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Bot,
  Sparkles,
  Send,
  Loader2,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  Globe,
  Navigation,
  ClipboardList,
  Search,
  X,
} from 'lucide-react';
import { Service, CartItem, Appointment, CompanyConfig, ServiceDeliveryMode } from '../types';
import {
  getStoredAppointments,
  getAvailableSlotsForDay,
  getUpcomingBookingDates,
  bookAppointment,
  buildWhatsAppUrl,
  buildWhatsAppBookingMessage,
  formatDeliveryModeLabel,
  getAppointmentStatusMeta,
  normalizeAppointmentStatus,
  getMyAppointmentIds,
} from '../utils/scheduling';
import { queryZionAssistant } from '../utils/zionClient';
import { copyToClipboard } from '../utils/clipboard';
import { PWAInstallButton } from './PWAInstallButton';

interface MobileAppViewProps {
  services: Service[];
  config: CompanyConfig;
  cartItems: CartItem[];
  appointments?: Appointment[];
  onAppointmentBooked?: (appointment: Appointment) => void;
  onAddToCart: (service: Service) => void;
  onUpdateCartQuantity: (serviceId: string, qty: number) => void;
  onRemoveFromCart: (serviceId: string) => void;
  onClearCart: () => void;
  onSwitchToWebsite: () => void;
  onOpenZion?: () => void;
  onOpenAdmin?: () => void;
  onOpenPrivacyPolicy?: () => void;
}

type AppTab = 'inicio' | 'catalogo' | 'agendamento' | 'zion' | 'carrinho' | 'perfil' | 'pagamentos';
type CatalogFilter = 'all' | 'lavagens' | 'estetica';
type PaymentMethod = 'cartao_credito' | 'cartao_debito' | 'pix' | 'local';

interface AppChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isError?: boolean;
}

const ZION_APP_PROMPTS = [
  'Qual lavagem você indica pro meu carro?',
  'Como funciona o Leva e Traz?',
  'Me ajude com uma dúvida de qualquer assunto',
  'Me dê uma curiosidade ou dica útil',
];

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  services,
  config,
  cartItems,
  appointments,
  onAppointmentBooked,
  onAddToCart,
  onUpdateCartQuantity,
  onClearCart,
  onSwitchToWebsite,
  onOpenAdmin,
  onOpenPrivacyPolicy,
}) => {
  const [currentTab, setCurrentTab] = useState<AppTab>('inicio');
  const [agendaSubTab, setAgendaSubTab] = useState<'novo' | 'pedidos'>('novo');
  const [orderLookupPhone, setOrderLookupPhone] = useState('');
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>('all');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Detect standalone installed mode or Capacitor native Android shell
  const cap =
    typeof window !== 'undefined'
      ? (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
      : undefined;
  const isCapacitorNative =
    typeof window !== 'undefined' &&
    (Boolean(cap?.isNativePlatform?.()) ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      (window.location.protocol === 'https:' &&
        window.location.hostname === 'localhost' &&
        window.location.port === ''));

  const isStandalone =
    isCapacitorNative ||
    (typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true));

  // Customer Profile state
  const [clientProfile, setClientProfile] = useState<{
    name: string;
    phone: string;
    vehicle: string;
    address?: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('maruipe_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { name: '', phone: '', vehicle: '', address: '' };
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Scheduling Tab State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services[0]?.id || 'lavagem-especial'
  );
  const [bookingFromCart, setBookingFromCart] = useState<boolean>(false);
  const upcomingDates = React.useMemo(() => getUpcomingBookingDates(14), []);
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDates[0] || '');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [deliveryMode, setDeliveryMode] = useState<ServiceDeliveryMode>('cliente_traz');
  const [pickupAddress, setPickupAddress] = useState<string>(() => clientProfile.address || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cartao_credito');
  const [appNotes, setAppNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    if (services.length > 0 && !services.some((s) => s.id === selectedServiceId)) {
      setSelectedServiceId(services[0].id);
    }
  }, [services, selectedServiceId]);

  // Payments state
  const [copiedPix, setCopiedPix] = useState(false);
  const [cardNotice, setCardNotice] = useState<string | null>(null);

  // Native Zion AI Tab State
  const initialZionMsg: AppChatMessage = {
    id: 'zion-app-welcome',
    role: 'assistant',
    text: `Olá! Eu sou o **Zion**, a Inteligência Artificial do app do **${config.name}**.\n\nPode perguntar **qualquer coisa** — sobre lavagens, vitrificação, Leva e Traz, horários (Seg–Sáb 07h–18h | Dom 08h–14h) ou **qualquer assunto geral** (dicas, cálculos, receitas, estudos, curiosidades e muito mais)!`,
  };
  const [zionMessages, setZionMessages] = useState<AppChatMessage[]>([initialZionMsg]);
  const [zionInput, setZionInput] = useState('');
  const [zionLoading, setZionLoading] = useState(false);
  const zionEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentTab === 'zion') {
      setTimeout(() => {
        zionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentTab, zionMessages]);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const allAppointments = React.useMemo(
    () => (appointments && appointments.length >= 0 ? appointments : getStoredAppointments()),
    [appointments, bookingSuccess]
  );
  const dayAvailability = React.useMemo(() => {
    return selectedDate
      ? getAvailableSlotsForDay(
          allAppointments,
          selectedDate,
          selectedService?.durationMinutes || 60,
          config.slotIntervalMinutes
        )
      : null;
  }, [allAppointments, selectedDate, selectedService?.durationMinutes, config.slotIntervalMinutes]);

  const filteredCatalog = React.useMemo(() => {
    const norm = (val: string) =>
      val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    const q = norm(catalogSearch.trim());
    return services.filter((s) => {
      const catOk = catalogFilter === 'all' || s.category === catalogFilter;
      if (!q) return catOk;
      return (
        catOk &&
        (norm(s.name).includes(q) ||
          norm(s.description).includes(q) ||
          (s.includes?.some((inc) => norm(inc).includes(q)) ?? false))
      );
    });
  }, [services, catalogFilter, catalogSearch]);

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.service.price || 0) * item.quantity, 0);
  const hasQuoteItems = cartItems.some((item) => item.service.price === null);

  const userAppointments = React.useMemo(() => {
    const myIds = getMyAppointmentIds();
    const lookupDigits = orderLookupPhone.replace(/\D/g, '');
    const profileDigits = (clientProfile?.phone || '').replace(/\D/g, '');

    return allAppointments.filter((apt) => {
      if (myIds.includes(apt.id)) return true;
      const cleanAptPhone = (apt?.clientPhone || '').replace(/\D/g, '');
      if (!cleanAptPhone) return false;
      if (profileDigits.length >= 8 && cleanAptPhone === profileDigits) return true;
      if (lookupDigits.length >= 8 && cleanAptPhone.endsWith(lookupDigits.slice(-8))) return true;
      return false;
    });
  }, [allAppointments, clientProfile, orderLookupPhone, bookingSuccess]);

  const paymentLabels: Record<PaymentMethod, string> = {
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    pix: `PIX (${config.pixKey})`,
    local: 'Pagar na Entrega (Local)',
  };

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
    if (deliveryMode === 'leva_traz' && pickupAddress.trim().length < 6) {
      setBookingError('Informe o endereço completo (rua, número e bairro) para buscarmos seu carro.');
      return;
    }

    const useCart = bookingFromCart && cartItems.length > 0;
    const serviceIds = useCart ? cartItems.map((c) => c.service.id) : [selectedService.id];
    const serviceNames = useCart
      ? cartItems.map((c) => (c.quantity > 1 ? `${c.service.name} (${c.quantity}x)` : c.service.name))
      : [selectedService.name];
    const totalDuration = useCart
      ? cartItems.reduce((acc, c) => acc + c.service.durationMinutes * c.quantity, 0)
      : selectedService.durationMinutes;
    const totalPrice = useCart ? cartTotal : selectedService.price ?? undefined;
    const hasQuote = useCart ? hasQuoteItems : selectedService.price === null;

    const fullNotes = [
      `Pagamento: ${paymentLabels[paymentMethod]}`,
      appNotes.trim() ? appNotes.trim() : null,
    ]
      .filter(Boolean)
      .join(' | ');

    const result = bookAppointment({
      clientName: nameToUse,
      clientPhone: phoneToUse,
      vehicleModel: clientProfile.vehicle || undefined,
      deliveryMode,
      pickupAddress: deliveryMode === 'leva_traz' ? pickupAddress.trim() : undefined,
      serviceIds,
      serviceNames,
      date: selectedDate,
      time: selectedTime,
      durationMinutes: totalDuration,
      totalPrice,
      hasQuoteItems: hasQuote,
      notes: fullNotes,
    });

    if (!result.success || !result.appointment) {
      setBookingError(result.error || 'Erro ao realizar agendamento.');
      return;
    }

    const updatedProfile = {
      ...clientProfile,
      address: deliveryMode === 'leva_traz' && pickupAddress.trim() ? pickupAddress.trim() : clientProfile.address,
    };
    setClientProfile(updatedProfile);
    localStorage.setItem('maruipe_user_profile', JSON.stringify(updatedProfile));
    if (useCart) {
      onClearCart();
      setBookingFromCart(false);
    }
    onAppointmentBooked?.(result.appointment);
    setBookingSuccess(result.appointment);
  };

  const handleCartCheckoutInApp = () => {
    if (cartItems.length === 0) return;
    setBookingFromCart(true);
    setBookingSuccess(null);
    setBookingError(null);
    setAgendaSubTab('novo');
    setCurrentTab('agendamento');
  };

  const handleCopyPix = async () => {
    const ok = await copyToClipboard(config.pixKey);
    if (ok) {
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  const sendZionMessage = async (textOverride?: string) => {
    const trimmed = (textOverride ?? zionInput).trim();
    if (!trimmed || zionLoading) return;

    const userMsg: AppChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextMessages = [...zionMessages, userMsg];
    setZionMessages(nextMessages);
    if (!textOverride) setZionInput('');
    setZionLoading(true);

    try {
      const { reply } = await queryZionAssistant({
        messages: nextMessages
          .filter((m) => !m.isError)
          .map((m) => ({ role: m.role, text: m.text })),
        services,
        config,
      });

      setZionMessages((prev) => [
        ...prev,
        {
          id: `zion-${Date.now()}`,
          role: 'assistant',
          text: reply,
        },
      ]);
    } catch {
      setZionMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `Sem conexão com o servidor do Zion agora. Chame direto no WhatsApp ${config.whatsappPhone}.`,
          isError: true,
        },
      ]);
    } finally {
      setZionLoading(false);
    }
  };

  const generalWhatsAppUrl = buildWhatsAppUrl(
    config.whatsappDigits,
    'Olá! Estou usando o aplicativo do Maruípe Lava Jato e gostaria de tirar uma dúvida.'
  );

  const hasValidCardLink =
    Boolean(config.paymentLink) && config.paymentLink !== 'COLOCAR_LINK_DE_PAGAMENTO_AQUI';

  return (
    <div
      className={
        isStandalone
          ? 'min-h-[100dvh] bg-neutral-950 flex flex-col'
          : 'min-h-screen bg-neutral-950 py-2 sm:py-6 px-0 sm:px-4 flex flex-col items-center justify-center'
      }
    >
      {/* Top Banner with Switch Back to Website & Install PWA */}
      {!isStandalone && (
        <div className="w-full max-w-md mb-2.5 flex items-center justify-between px-3">
          <button
            onClick={onSwitchToWebsite}
            className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>← Voltar ao Site</span>
          </button>
          <PWAInstallButton compact label="Instalar App" />
        </div>
      )}

      {/* App Shell Container */}
      <div
        className={
          isStandalone
            ? 'flex-1 w-full bg-neutral-950 flex flex-col overflow-hidden'
            : 'w-full max-w-md h-[100dvh] sm:h-[840px] sm:max-h-[92vh] bg-neutral-950 sm:rounded-[38px] sm:border-4 sm:border-neutral-800 shadow-2xl overflow-hidden flex flex-col relative'
        }
      >
        {/* Decorative Smartphone Notch on desktop */}
        {!isStandalone && (
          <div className="hidden sm:flex h-6 bg-neutral-950 items-center justify-between px-6 pt-1 text-[10px] text-neutral-400 font-semibold select-none shrink-0">
            <span>Maruípe App</span>
            <div className="w-20 h-4 bg-neutral-900 rounded-b-xl -mt-1 mx-auto" />
            <span>Vitória/ES</span>
          </div>
        )}

        {/* App Bar / Header */}
        <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-display text-base font-black text-white tracking-tight leading-none">
              MARUÍPE LAVA JATO
            </h1>
            <span className="text-[9px] font-bold tracking-widest text-amber-500 uppercase">
              ESTÉTICA AUTOMOTIVA · ZION IA
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('zion')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-colors ${
                currentTab === 'zion'
                  ? 'bg-amber-500 text-neutral-950 border-amber-500'
                  : 'bg-neutral-950 text-amber-400 border-amber-500/40'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Zion</span>
            </button>

            <button
              onClick={() => setCurrentTab('pagamentos')}
              className="p-2 rounded-lg bg-neutral-950 text-neutral-200 border border-neutral-800"
              aria-label="Pagamentos"
              title="PIX e Cartão"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={() => setCurrentTab('carrinho')}
              className="relative p-2 rounded-lg bg-neutral-950 text-neutral-200 border border-neutral-800"
              aria-label="Carrinho"
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
        <div className="flex-1 overflow-y-auto bg-neutral-950 p-4">
          {/* TAB 1: INÍCIO */}
          {currentTab === 'inicio' && (
            <div className="space-y-4">
              {/* Highlight Promotion Banner */}
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
                      setBookingFromCart(false);
                      setBookingSuccess(null);
                      setAgendaSubTab('novo');
                      setCurrentTab('agendamento');
                    }}
                    className="py-2 px-3 text-xs font-bold rounded-xl bg-neutral-800 text-white border border-neutral-700 flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Agendar Já</span>
                  </button>
                </div>
              </div>

              {/* Agente IA Zion Banner Card */}
              <button
                type="button"
                onClick={() => setCurrentTab('zion')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-950 border border-amber-500/60 hover:border-amber-400 flex items-center justify-between gap-3 text-left transition-all shadow-lg shadow-amber-500/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 flex items-center justify-center shrink-0 shadow">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-amber-400">AGENTE IA ZION</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="block text-[11px] text-neutral-300">
                      IA Universal no app · Pergunte sobre qualquer assunto
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
              </button>

              {/* 4 Main Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setBookingFromCart(false);
                    setAgendaSubTab('novo');
                    setCurrentTab('agendamento');
                  }}
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
                  onClick={() => setCurrentTab('pagamentos')}
                  className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 flex flex-col items-center text-center gap-2 group transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white group-hover:text-amber-400">
                      PAGAMENTOS
                    </span>
                    <span className="block text-[10px] text-neutral-400">PIX e Cartões</span>
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
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onAddToCart(s)}
                          className="p-2 rounded-lg bg-neutral-800 text-amber-400 hover:bg-neutral-750 text-xs"
                          title="Adicionar ao carrinho"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedServiceId(s.id);
                            setBookingFromCart(false);
                            setBookingSuccess(null);
                            setAgendaSubTab('novo');
                            setCurrentTab('agendamento');
                          }}
                          className="px-2.5 py-2 rounded-lg bg-amber-500 text-neutral-950 font-bold text-[11px] flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Agendar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leva e Traz Highlight Card */}
              <button
                type="button"
                onClick={() => {
                  setDeliveryMode('leva_traz');
                  setCurrentTab('agendamento');
                }}
                className="w-full p-3 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 flex items-center justify-between gap-3 text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white">
                      Buscamos no local (Leva e Traz)
                    </span>
                    <span className="block text-[10px] text-neutral-400">
                      Ou traga seu carro na loja · Escolha ao agendar
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
              </button>

              {/* Company Info Box */}
              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-850 text-xs text-neutral-400 space-y-2">
                <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{config.address}</span>
                </div>
                <p className="text-[11px]">
                  Seg a Sáb: {config.businessHoursWeekdays} | Dom: {config.businessHoursSunday}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Abrir Localização no Google Maps</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: CATÁLOGO COMPLETO COM FILTROS */}
          {currentTab === 'catalogo' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Catálogo Completo</h3>
                <span className="text-[11px] text-neutral-400">{filteredCatalog.length} serviços</span>
              </div>

              {/* App Catalog Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Pesquisar serviço pelo nome..."
                  className="w-full pl-9 pr-8 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:border-amber-500 outline-none"
                />
                {catalogSearch && (
                  <button
                    type="button"
                    onClick={() => setCatalogSearch('')}
                    aria-label="Limpar busca"
                    className="p-1 text-neutral-400 hover:text-white absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                {(
                  [
                    { id: 'all', label: 'Todos' },
                    { id: 'lavagens', label: 'Lavagens' },
                    { id: 'estetica', label: 'Estética' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCatalogFilter(tab.id)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                      catalogFilter === tab.id
                        ? 'bg-amber-500 text-neutral-950'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredCatalog.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                    <p className="text-xs font-bold text-white">
                      Nenhum serviço encontrado para “{catalogSearch}”
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogSearch('');
                        setCatalogFilter('all');
                      }}
                      className="py-1.5 px-3 rounded-lg bg-amber-500 text-neutral-950 font-bold text-[11px]"
                    >
                      Limpar filtro
                    </button>
                  </div>
                ) : (
                filteredCatalog.map((service) => (
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
                            {service.price
                              ? `${service.pricePrefix ? service.pricePrefix + ' ' : ''}R$ ${service.price}`
                              : service.priceLabel || 'Consultar'}
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
                          setBookingFromCart(false);
                          setBookingSuccess(null);
                          setAgendaSubTab('novo');
                          setCurrentTab('agendamento');
                        }}
                        className="py-1.5 px-2 text-xs font-bold rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Agendar</span>
                      </button>
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AGENDAMENTO INTELIGENTE + STATUS DE PEDIDOS */}
          {currentTab === 'agendamento' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white">Agendamentos & Pedidos</h3>
                <button
                  type="button"
                  onClick={() => {
                    setBookingSuccess(null);
                    setAgendaSubTab(agendaSubTab === 'novo' ? 'pedidos' : 'novo');
                  }}
                  className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>{agendaSubTab === 'novo' ? `Ver Status (${userAppointments.length})` : 'Fazer Agendamento'}</span>
                </button>
              </div>

              {/* Sub-tab Switcher */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setAgendaSubTab('novo')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors ${
                    agendaSubTab === 'novo'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  Novo Agendamento
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBookingSuccess(null);
                    setAgendaSubTab('pedidos');
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    agendaSubTab === 'pedidos'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <span>Meus Pedidos</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      agendaSubTab === 'pedidos'
                        ? 'bg-neutral-950 text-amber-400'
                        : 'bg-neutral-800 text-amber-400'
                    }`}
                  >
                    {userAppointments.length}
                  </span>
                </button>
              </div>

              {agendaSubTab === 'pedidos' ? (
                <div className="space-y-3">
                  {/* Optional Phone Filter */}
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                    <label className="block text-[10px] font-semibold text-neutral-400">
                      Localizar pedido pelo seu WhatsApp (com DDD)
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: (27) 99999-9999"
                      value={orderLookupPhone}
                      onChange={(e) => setOrderLookupPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  {userAppointments.length === 0 ? (
                    <div className="text-center py-8 px-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                      <ClipboardList className="w-9 h-9 text-neutral-600 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">Nenhum pedido localizado ainda</p>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          Seus novos agendamentos feitos no site ou aplicativo aparecerão aqui automaticamente com status ao vivo (Pendente, Em Execução e Concluído).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAgendaSubTab('novo')}
                        className="py-2 px-4 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
                      >
                        Agendar Primeiro Serviço
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userAppointments.map((apt) => {
                        const statusMeta = getAppointmentStatusMeta(apt.status);
                        const normalized = normalizeAppointmentStatus(apt.status);
                        const steps = [
                          { step: 1, label: 'Pendente' },
                          { step: 2, label: 'Em Execução' },
                          { step: 3, label: 'Concluído' },
                        ];

                        return (
                          <div
                            key={apt.id}
                            className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white leading-snug">
                                  {apt.serviceNames.join(' + ')}
                                </h4>
                                <p className="text-[11px] text-neutral-400 mt-0.5">
                                  {apt.date.split('-').reverse().join('/')} às <strong className="text-neutral-200">{apt.time}</strong>
                                  {apt.vehicleModel ? ` · ${apt.vehicleModel}` : ''}
                                </p>
                              </div>
                              <span
                                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${statusMeta.badgeClass}`}
                              >
                                {statusMeta.label}
                              </span>
                            </div>

                            {/* 3-Step Visual Progress Tracker */}
                            {normalized !== 'cancelado' && (
                              <div className="space-y-2 pt-1">
                                <div className="grid grid-cols-3 gap-1.5">
                                  {steps.map((s) => {
                                    const active = statusMeta.step >= s.step;
                                    const isCurrent = statusMeta.step === s.step;
                                    return (
                                      <div key={s.step} className="space-y-1">
                                        <div
                                          className={`h-1.5 rounded-full transition-colors ${
                                            active
                                              ? normalized === 'concluido'
                                                ? 'bg-emerald-500'
                                                : normalized === 'em_execucao'
                                                ? 'bg-sky-500'
                                                : 'bg-amber-500'
                                              : 'bg-neutral-800'
                                          }`}
                                        />
                                        <span
                                          className={`block text-[10px] font-semibold text-center ${
                                            isCurrent
                                              ? 'text-white font-bold'
                                              : active
                                              ? 'text-neutral-300'
                                              : 'text-neutral-600'
                                          }`}
                                        >
                                          {s.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <p className="text-[11px] text-neutral-300 bg-neutral-950/70 border border-neutral-850 rounded-xl px-3 py-2 leading-relaxed">
                              {statusMeta.description}
                            </p>

                            <div className="flex items-center justify-between gap-2 text-[10px] text-neutral-400 pt-0.5">
                              <span>
                                {apt.deliveryMode === 'leva_traz' ? 'Leva e Traz' : 'Na loja'}
                                {apt.deliveryMode === 'leva_traz' && apt.pickupAddress
                                  ? ` · ${apt.pickupAddress}`
                                  : ''}
                              </span>
                              <a
                                href={buildWhatsAppUrl(
                                  config.whatsappDigits,
                                  `Olá! Gostaria de acompanhar meu pedido (${apt.serviceNames.join(', ')}) agendado para ${apt.date.split('-').reverse().join('/')} às ${apt.time}. Status atual: ${statusMeta.label}.`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 font-bold hover:underline shrink-0"
                              >
                                Falar no WhatsApp →
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : !bookingSuccess ? (
                <form onSubmit={handleAppBooking} className="space-y-3.5">
                  {bookingFromCart && cartItems.length > 0 ? (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-400">
                          Agendando itens do Carrinho ({cartItems.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setBookingFromCart(false)}
                          className="text-[10px] font-semibold text-neutral-300 hover:text-white underline"
                        >
                          Escolher 1 serviço
                        </button>
                      </div>
                      <ul className="space-y-1 text-[11px] text-neutral-200">
                        {cartItems.map((item) => (
                          <li key={item.service.id} className="flex justify-between gap-2">
                            <span className="truncate">
                              {item.quantity}x {item.service.name}
                            </span>
                            <span className="text-amber-400 font-semibold shrink-0">
                              {item.service.price ? `R$ ${(item.service.price * item.quantity).toFixed(2)}` : 'Consultar'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                        Serviço Desejado
                      </label>
                      <select
                        value={selectedServiceId}
                        onChange={(e) => {
                          setSelectedServiceId(e.target.value);
                          setBookingFromCart(false);
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
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Data
                    </label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {upcomingDates.slice(0, 10).map((d) => {
                        const [y, m, dt] = d.split('-').map(Number);
                        const obj = new Date(y, m - 1, dt);
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

                  {/* Delivery Mode Selector (Leva e Traz vs Vou Levar) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">
                      Como prefere o atendimento?
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryMode('cliente_traz');
                          setBookingError(null);
                        }}
                        className={`p-2 rounded-xl text-left border transition-colors ${
                          deliveryMode === 'cliente_traz'
                            ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-[11px] font-bold">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>Vou levar</span>
                        </span>
                        <span className="block text-[9px] text-neutral-400 mt-0.5">
                          Trazer até o lava jato
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryMode('leva_traz');
                          setBookingError(null);
                        }}
                        className={`p-2 rounded-xl text-left border transition-colors ${
                          deliveryMode === 'leva_traz'
                            ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                        }`}
                      >
                        <span className="flex items-center gap-1 text-[11px] font-bold">
                          <Navigation className="w-3 h-3 shrink-0" />
                          <span>Buscar no local</span>
                        </span>
                        <span className="block text-[9px] text-neutral-400 mt-0.5">
                          Leva e Traz em Vitória
                        </span>
                      </button>
                    </div>

                    {deliveryMode === 'leva_traz' && (
                      <div className="mt-2 p-2.5 rounded-xl bg-neutral-900 border border-amber-500/30 space-y-1">
                        <label className="block text-[10px] font-semibold text-amber-400">
                          Endereço para Busca e Devolução *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Rua, número, bairro e referência..."
                          value={pickupAddress}
                          onChange={(e) => setPickupAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                        <p className="text-[10px] text-neutral-400">
                          Confirmamos pelo WhatsApp a disponibilidade conforme seu bairro.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">
                      Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: 'cartao_credito', label: 'Cartão Crédito' },
                          { id: 'cartao_debito', label: 'Cartão Débito' },
                          { id: 'pix', label: 'PIX (27 99286-9471)' },
                          { id: 'local', label: 'Pagar na Entrega' },
                        ] as const
                      ).map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-colors ${
                            paymentMethod === pm.id
                              ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                          }`}
                        >
                          {pm.label}
                        </button>
                      ))}
                    </div>
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
                    <p className="text-[11px] text-amber-400 font-semibold mt-1">
                      {formatDeliveryModeLabel(bookingSuccess.deliveryMode)}
                    </p>
                    {bookingSuccess.deliveryMode === 'leva_traz' && bookingSuccess.pickupAddress && (
                      <p className="text-[11px] text-neutral-300 mt-0.5">
                        Busca: {bookingSuccess.pickupAddress}
                      </p>
                    )}
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
                    type="button"
                    onClick={() => {
                      setBookingSuccess(null);
                      setAgendaSubTab('pedidos');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 border border-amber-500/40 text-amber-400 font-bold text-xs hover:bg-neutral-800 transition-colors"
                  >
                    Acompanhar Status do Pedido (Pendente → Concluído)
                  </button>

                  <button
                    onClick={() => {
                      setBookingSuccess(null);
                      setCurrentTab('inicio');
                    }}
                    className="text-xs text-neutral-400 hover:text-white block mx-auto"
                  >
                    Voltar ao Início
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AGENTE IA ZION NATIVO NO APP */}
          {currentTab === 'zion' && (
            <div className="flex flex-col h-full min-h-[460px] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">ZION · Agente IA</h3>
                    <p className="text-[10px] text-amber-400">IA Universal · Responde Qualquer Assunto</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setZionMessages([initialZionMsg])}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800"
                  title="Reiniciar conversa"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {zionMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-end gap-2 ${
                      m.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        {m.isError ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        ) : (
                          <Bot className="w-3.5 h-3.5" />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                        m.role === 'user'
                          ? 'bg-amber-500 text-neutral-950 font-medium rounded-br-sm'
                          : m.isError
                          ? 'bg-red-950/50 border border-red-500/40 text-red-200 rounded-bl-sm'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-sm'
                      }`}
                    >
                      {m.text.replace(/\*\*/g, '')}
                    </div>
                  </div>
                ))}

                {zionLoading && (
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Zion está digitando...</span>
                  </div>
                )}

                {zionMessages.length <= 2 && !zionLoading && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ZION_APP_PROMPTS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendZionMessage(q)}
                        className="text-left text-[11px] px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 text-neutral-300"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={zionEndRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendZionMessage();
                }}
                className="pt-2 border-t border-neutral-800 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={zionInput}
                  onChange={(e) => setZionInput(e.target.value)}
                  placeholder="Pergunte qualquer coisa ao Zion..."
                  disabled={zionLoading}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-amber-500 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={!zionInput.trim() || zionLoading}
                  className="p-2.5 rounded-xl bg-amber-500 text-neutral-950 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: CARRINHO DO APP */}
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
                          {item.service.price
                            ? `R$ ${(item.service.price * item.quantity).toFixed(2)}`
                            : 'Consultar preço'}
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

          {/* TAB 6: PERFIL E HISTÓRICO */}
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
                <form
                  onSubmit={handleSaveProfile}
                  className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2.5"
                >
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
                  <div>
                    <label className="text-[10px] text-neutral-400">Endereço (para Leva e Traz)</label>
                    <input
                      type="text"
                      value={clientProfile.address || ''}
                      onChange={(e) => {
                        setClientProfile({ ...clientProfile, address: e.target.value });
                        setPickupAddress(e.target.value);
                      }}
                      placeholder="Rua, número e bairro"
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
                      {clientProfile.vehicle && (
                        <p className="text-[11px] text-amber-400">{clientProfile.vehicle}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentTab('pagamentos')}
                className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs font-semibold text-white hover:border-amber-500/50"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Pagamentos (PIX & Cartão)</span>
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onSwitchToWebsite}
                  className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-200 hover:border-amber-500/50"
                >
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Site Completo</span>
                </button>
                {onOpenAdmin && (
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-200 hover:border-amber-500/50"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Área Restrita</span>
                  </button>
                )}
              </div>

              {/* Verified App Security & Privacy Card */}
              <div className="p-3.5 bg-neutral-900 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Aplicativo Oficial Verificado &amp; Seguro</span>
                </div>
                <ul className="text-[11px] text-neutral-300 space-y-1">
                  <li>• Conexão criptografada HTTPS/TLS exclusiva</li>
                  <li>• Permissão mínima (apenas Internet — sem GPS, câmera ou contatos)</li>
                  <li>• Identidade oficial: <code className="text-amber-400">com.maruipelavajato.app</code></li>
                  <li>• Dados locais protegidos e conformidade LGPD</li>
                </ul>
                {onOpenPrivacyPolicy && (
                  <button
                    type="button"
                    onClick={onOpenPrivacyPolicy}
                    className="text-[11px] font-bold text-amber-400 hover:underline pt-0.5"
                  >
                    Ver Política de Privacidade &amp; Desenvolvedor →
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Histórico de Agendamentos
                </h4>

                {userAppointments.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-4 bg-neutral-900/40 rounded-xl">
                    Nenhum agendamento encontrado para o seu cadastro.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {userAppointments
                      .slice(0, 5)
                      .map((apt) => {
                        const statusMeta = getAppointmentStatusMeta(apt.status);
                        return (
                          <div
                            key={apt.id}
                            className="p-3 bg-neutral-900 border border-neutral-850 rounded-xl text-xs space-y-1.5"
                          >
                            <div className="flex justify-between font-bold gap-2">
                              <span className="text-white truncate">{apt.serviceNames.join(', ')}</span>
                              <span className="text-amber-400 shrink-0">
                                {apt.date.split('-').reverse().join('/')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-neutral-400">
                              <span>
                                Horário: {apt.time} ·{' '}
                                {apt.deliveryMode === 'leva_traz' ? 'Leva e Traz' : 'Na loja'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusMeta.badgeClass}`}>
                                {statusMeta.label}
                              </span>
                            </div>
                            {apt.deliveryMode === 'leva_traz' && apt.pickupAddress && (
                              <p className="text-[10px] text-amber-400/90 truncate">
                                Busca: {apt.pickupAddress}
                              </p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: PAGAMENTOS */}
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

              {/* Cartão Crédito / Débito */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>CARTÃO DE CRÉDITO E DÉBITO</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Aceitamos cartões de crédito e débito das principais bandeiras na entrega ou pelo link de pagamento online.
                </p>

                {hasValidCardLink ? (
                  <a
                    href={config.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-750 flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>PAGAR COM CARTÃO</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setCardNotice(
                        'Pagamento presencial na maquininha (Crédito/Débito) disponível na recepção! Ou configure seu link online no Painel Admin.'
                      )
                    }
                    className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-750 flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>PAGAR COM CARTÃO</span>
                  </button>
                )}

                {cardNotice && (
                  <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
                    {cardNotice}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Native-feel Bottom Navigation Bar (6 tabs including Zion IA) */}
        <div className="h-16 bg-neutral-900 border-t border-neutral-800 grid grid-cols-6 items-center px-1 shrink-0">
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
            onClick={() => setCurrentTab('zion')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              currentTab === 'zion' ? 'text-amber-400' : 'text-amber-300/80 hover:text-amber-400'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Zion IA</span>
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
              <span className="absolute -top-0.5 right-2 w-2 h-2 rounded-full bg-amber-400" />
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
