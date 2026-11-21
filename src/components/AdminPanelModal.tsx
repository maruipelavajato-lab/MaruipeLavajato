import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Calendar,
  DollarSign,
  Bell,
  Trash2,
  CheckCircle2,
  Save,
  Lock,
  LogOut,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Star,
  Eye,
  EyeOff,
  Plus,
  Pencil,
  HelpCircle,
} from 'lucide-react';
import { Service, Appointment, AppointmentStatus, CompanyConfig, OwnerNotification, Testimonial, FaqItem } from '../types';
import { saveCompanyConfig } from '../config/constants';
import {
  saveAppointments,
  saveOwnerNotifications,
  getAppointmentStatusMeta,
  normalizeAppointmentStatus,
} from '../utils/scheduling';
import { saveStoredServices } from '../data/services';
import { saveStoredTestimonials } from '../data/testimonials';
import { saveStoredFaqs } from '../data/faqs';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CompanyConfig;
  onUpdateConfig: (newConfig: CompanyConfig) => void;
  services: Service[];
  onUpdateServices: (services: Service[]) => void;
  appointments: Appointment[];
  onUpdateAppointments: (appointments: Appointment[]) => void;
  notifications: OwnerNotification[];
  onUpdateNotifications: (notifications: OwnerNotification[]) => void;
  testimonials: Testimonial[];
  onUpdateTestimonials: (testimonials: Testimonial[]) => void;
  faqs: FaqItem[];
  onUpdateFaqs: (faqs: FaqItem[]) => void;
}

const REMOTE_ADMIN_VERIFY_ENDPOINT = 'https://maruipe-lavajato-one.vercel.app/api/admin/verify';

function getAdminVerifyEndpoint(): string {
  if (typeof window === 'undefined') return '/api/admin/verify';
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  const isCapacitor =
    Boolean(cap?.isNativePlatform?.()) ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'file:' ||
    (window.location.hostname === 'localhost' && window.location.port === '');
  return isCapacitor ? REMOTE_ADMIN_VERIFY_ENDPOINT : '/api/admin/verify';
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  services,
  onUpdateServices,
  appointments,
  onUpdateAppointments,
  notifications,
  onUpdateNotifications,
  testimonials,
  onUpdateTestimonials,
  faqs,
  onUpdateFaqs,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('maruipe_admin_unlocked') === '1';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'geral' | 'agendamentos' | 'precos' | 'depoimentos' | 'faq' | 'notificacoes'>('geral');
  const [tempConfig, setTempConfig] = useState<CompanyConfig>({ ...config });
  const [tempServices, setTempServices] = useState<Service[]>([...services]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteTestimonialId, setConfirmDeleteTestimonialId] = useState<string | null>(null);
  const [confirmDeleteFaqId, setConfirmDeleteFaqId] = useState<string | null>(null);

  // Testimonials Form State (Create / Edit)
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [depClientName, setDepClientName] = useState('');
  const [depVehicle, setDepVehicle] = useState('');
  const [depServiceName, setDepServiceName] = useState('');
  const [depRating, setDepRating] = useState<number>(5);
  const [depComment, setDepComment] = useState('');
  const [depVisible, setDepVisible] = useState(true);

  // FAQ Form State (Create / Edit)
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqCategory, setFaqCategory] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqVisible, setFaqVisible] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setTempConfig({ ...config });
      setTempServices([...services]);
      setAuthError(null);
      setConfirmDeleteId(null);
      setConfirmDeleteTestimonialId(null);
      setConfirmDeleteFaqId(null);
    }
  }, [isOpen, config, services]);

  if (!isOpen) return null;

  const handleVerifyOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwd = passwordInput.trim();
    if (!pwd || authLoading) return;

    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(getAdminVerifyEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.authenticated) {
        try {
          sessionStorage.setItem('maruipe_admin_unlocked', '1');
        } catch {
          // ignore
        }
        setIsAuthenticated(true);
        setPasswordInput('');
      } else {
        setAuthError(
          data?.error || 'Não foi possível validar a senha do proprietário.'
        );
      }
    } catch {
      setAuthError('Sem conexão com o servidor para verificar sua senha de proprietário.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLockAdmin = () => {
    try {
      sessionStorage.removeItem('maruipe_admin_unlocked');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
  };

  const handleSaveGeneralConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(tempConfig);
    saveCompanyConfig(tempConfig);
    setSaveSuccessMsg('Configurações da empresa salvas com sucesso!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handlePriceChange = (serviceId: string, newPriceStr: string) => {
    const updated = tempServices.map((s) => {
      if (s.id === serviceId) {
        const parsed = parseFloat(newPriceStr);
        return {
          ...s,
          price: isNaN(parsed) ? null : parsed,
        };
      }
      return s;
    });
    setTempServices(updated);
  };

  const handleSaveServices = () => {
    onUpdateServices(tempServices);
    saveStoredServices(tempServices);
    setSaveSuccessMsg('Preços e serviços salvos com sucesso!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleUpdateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    const updated = appointments.map((apt) => (apt.id === id ? { ...apt, status } : apt));
    onUpdateAppointments(updated);
    saveAppointments(updated);
    const meta = getAppointmentStatusMeta(status);
    setSaveSuccessMsg(`Status atualizado para "${meta.label}".`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleDeleteAppointment = (id: string) => {
    const updated = appointments.filter((apt) => apt.id !== id);
    onUpdateAppointments(updated);
    saveAppointments(updated);
    setConfirmDeleteId(null);
  };

  const handleMarkNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    onUpdateNotifications(updated);
    saveOwnerNotifications(updated);
  };

  const resetTestimonialForm = () => {
    setEditingTestimonialId(null);
    setDepClientName('');
    setDepVehicle('');
    setDepServiceName('');
    setDepRating(5);
    setDepComment('');
    setDepVisible(true);
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = depClientName.trim();
    const cleanComment = depComment.trim();
    if (!cleanName || !cleanComment) return;

    let updated: Testimonial[];
    if (editingTestimonialId) {
      updated = testimonials.map((item) =>
        item.id === editingTestimonialId
          ? {
              ...item,
              clientName: cleanName,
              vehicle: depVehicle.trim() || undefined,
              serviceName: depServiceName.trim() || undefined,
              rating: Math.min(5, Math.max(1, depRating)),
              comment: cleanComment,
              visible: depVisible,
            }
          : item
      );
      setSaveSuccessMsg('Depoimento atualizado com sucesso!');
    } else {
      const newItem: Testimonial = {
        id: `dep-${Date.now()}`,
        clientName: cleanName,
        vehicle: depVehicle.trim() || undefined,
        serviceName: depServiceName.trim() || undefined,
        rating: Math.min(5, Math.max(1, depRating)),
        comment: cleanComment,
        visible: depVisible,
        createdAt: new Date().toISOString(),
      };
      updated = [newItem, ...testimonials];
      setSaveSuccessMsg('Novo depoimento publicado com sucesso!');
    }

    onUpdateTestimonials(updated);
    saveStoredTestimonials(updated);
    resetTestimonialForm();
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleEditTestimonial = (item: Testimonial) => {
    setEditingTestimonialId(item.id);
    setDepClientName(item.clientName);
    setDepVehicle(item.vehicle || '');
    setDepServiceName(item.serviceName || '');
    setDepRating(item.rating);
    setDepComment(item.comment);
    setDepVisible(item.visible);
  };

  const handleToggleTestimonialVisibility = (id: string) => {
    const updated = testimonials.map((item) =>
      item.id === id ? { ...item, visible: !item.visible } : item
    );
    onUpdateTestimonials(updated);
    saveStoredTestimonials(updated);
  };

  const handleDeleteTestimonial = (id: string) => {
    const updated = testimonials.filter((item) => item.id !== id);
    onUpdateTestimonials(updated);
    saveStoredTestimonials(updated);
    setConfirmDeleteTestimonialId(null);
    if (editingTestimonialId === id) {
      resetTestimonialForm();
    }
    setSaveSuccessMsg('Depoimento excluído com sucesso.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const resetFaqForm = () => {
    setEditingFaqId(null);
    setFaqQuestion('');
    setFaqCategory('');
    setFaqAnswer('');
    setFaqVisible(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQ = faqQuestion.trim();
    const cleanA = faqAnswer.trim();
    if (!cleanQ || !cleanA) return;

    let updated: FaqItem[];
    if (editingFaqId) {
      updated = faqs.map((item) =>
        item.id === editingFaqId
          ? {
              ...item,
              question: cleanQ,
              category: faqCategory.trim() || undefined,
              answer: cleanA,
              visible: faqVisible,
            }
          : item
      );
      setSaveSuccessMsg('Pergunta frequente atualizada com sucesso!');
    } else {
      const newFaq: FaqItem = {
        id: `faq-${Date.now()}`,
        question: cleanQ,
        category: faqCategory.trim() || undefined,
        answer: cleanA,
        visible: faqVisible,
      };
      updated = [newFaq, ...faqs];
      setSaveSuccessMsg('Nova pergunta frequente adicionada!');
    }

    onUpdateFaqs(updated);
    saveStoredFaqs(updated);
    resetFaqForm();
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleEditFaq = (item: FaqItem) => {
    setEditingFaqId(item.id);
    setFaqQuestion(item.question);
    setFaqCategory(item.category || '');
    setFaqAnswer(item.answer);
    setFaqVisible(item.visible);
  };

  const handleToggleFaqVisibility = (id: string) => {
    const updated = faqs.map((item) =>
      item.id === id ? { ...item, visible: !item.visible } : item
    );
    onUpdateFaqs(updated);
    saveStoredFaqs(updated);
  };

  const handleDeleteFaq = (id: string) => {
    const updated = faqs.filter((item) => item.id !== id);
    onUpdateFaqs(updated);
    saveStoredFaqs(updated);
    setConfirmDeleteFaqId(null);
    if (editingFaqId === id) {
      resetFaqForm();
    }
    setSaveSuccessMsg('Pergunta removida com sucesso.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5">
          <button
            onClick={onClose}
            aria-label="Fechar login do proprietário"
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="font-display text-xl font-black text-white">
              Área Exclusiva do Proprietário
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Protegido por senha no servidor. Somente você pode visualizar agendamentos ou alterar preços e configurações.
            </p>
          </div>

          <form onSubmit={handleVerifyOwner} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Senha do Proprietário
              </label>
              <input
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                placeholder="Digite sua senha secreta..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                disabled={authLoading}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!passwordInput.trim() || authLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold text-sm hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Desbloquear Painel</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Painel Exclusivo do Proprietário
              </h2>
              <p className="text-xs text-neutral-400">
                Gerenciamento restrito de dados, agendamentos, preços, links e notificações
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLockAdmin}
              title="Bloquear Painel"
              className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-xs font-semibold text-neutral-300 hover:text-amber-400 hover:border-amber-500/40 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bloquear</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-neutral-800 px-6 bg-neutral-950/40 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('geral')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'geral'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Empresa & Links
          </button>
          <button
            onClick={() => setActiveTab('agendamentos')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'agendamentos'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agendamentos ({appointments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('precos')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'precos'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Preços & Catálogo</span>
          </button>
          <button
            onClick={() => setActiveTab('depoimentos')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'depoimentos'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Depoimentos ({testimonials.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'faq'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQ ({faqs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notificacoes')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'notificacoes'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notificações ({notifications.filter((n) => !n.read).length})</span>
          </button>
        </div>

        {/* Feedback message */}
        {saveSuccessMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          
          {/* TAB 1: EMPRESA & LINKS */}
          {activeTab === 'geral' && (
            <form onSubmit={handleSaveGeneralConfig} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    value={tempConfig.name}
                    onChange={(e) => setTempConfig({ ...tempConfig, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={tempConfig.address}
                    onChange={(e) => setTempConfig({ ...tempConfig, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    WhatsApp (Visual)
                  </label>
                  <input
                    type="text"
                    value={tempConfig.whatsappPhone}
                    onChange={(e) => setTempConfig({ ...tempConfig, whatsappPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    value={tempConfig.pixKey}
                    onChange={(e) => setTempConfig({ ...tempConfig, pixKey: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500 outline-none"
                  />
                </div>

              </div>

              {/* Links Configurations */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Configuração de Links Oficiais (Conforme solicitado)
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Link de Pagamento com Cartão (PAYMENT_LINK)
                  </label>
                  <input
                    type="text"
                    value={tempConfig.paymentLink}
                    onChange={(e) => setTempConfig({ ...tempConfig, paymentLink: e.target.value })}
                    placeholder="COLOCAR_LINK_DE_PAGAMENTO_AQUI"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500 outline-none font-mono"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Insira aqui seu link de checkout do Mercado Pago, PagSeguro, InfinitePay, etc.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Link Google Play Store (ANDROID_APP_LINK)
                    </label>
                    <input
                      type="text"
                      value={tempConfig.androidAppLink}
                      onChange={(e) => setTempConfig({ ...tempConfig, androidAppLink: e.target.value })}
                      placeholder="COLOCAR_LINK_DA_PLAY_STORE_AQUI"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Link Apple App Store (IOS_APP_LINK)
                    </label>
                    <input
                      type="text"
                      value={tempConfig.iosAppLink}
                      onChange={(e) => setTempConfig({ ...tempConfig, iosAppLink: e.target.value })}
                      placeholder="COLOCAR_LINK_DA_APP_STORE_AQUI"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Horário Segunda a Sábado
                    </label>
                    <input
                      type="text"
                      value={tempConfig.businessHoursWeekdays}
                      onChange={(e) => setTempConfig({ ...tempConfig, businessHoursWeekdays: e.target.value, businessHoursSaturday: e.target.value })}
                      placeholder="07:00 às 18:00"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Horário Domingo
                    </label>
                    <input
                      type="text"
                      value={tempConfig.businessHoursSunday || '08:00 às 14:00'}
                      onChange={(e) => setTempConfig({ ...tempConfig, businessHoursSunday: e.target.value })}
                      placeholder="08:00 às 14:00"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

              </div>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Dados da Empresa</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: AGENDAMENTOS */}
          {activeTab === 'agendamentos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-neutral-400">
                <span>Total de agendamentos registrados: {appointments.length}</span>
                <span className="text-amber-400">O sistema previne conflitos de horário automaticamente.</span>
              </div>

              {appointments.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-8">Nenhum agendamento encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => {
                    const statusMeta = getAppointmentStatusMeta(apt.status);
                    const normalized = normalizeAppointmentStatus(apt.status);
                    return (
                      <div
                        key={apt.id}
                        className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{apt.clientName}</span>
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${statusMeta.badgeClass}`}
                            >
                              {statusMeta.label}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-300">
                            {Array.isArray(apt.serviceNames) ? apt.serviceNames.join(' + ') : ''} · <strong>{apt.date ? apt.date.split('-').reverse().join('/') : ''} às {apt.time || ''}</strong> (~{apt.durationMinutes || 60} min)
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            WhatsApp: {apt.clientPhone} {apt.vehicleModel && `· Veículo: ${apt.vehicleModel}`}
                          </p>
                          <p className="text-[11px] text-amber-400 font-medium">
                            {apt.deliveryMode === 'leva_traz'
                              ? `Buscamos no local (Leva e Traz)${apt.pickupAddress ? `: ${apt.pickupAddress}` : ''}`
                              : 'Cliente traz até o lava jato'}
                          </p>
                          {apt.notes && (
                            <p className="text-[11px] text-neutral-500 italic">Obs: {apt.notes}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'pendente')}
                            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                              normalized === 'pendente'
                                ? 'bg-amber-500 text-neutral-950 border-amber-500'
                                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-amber-500/50'
                            }`}
                          >
                            Pendente
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'em_execucao')}
                            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                              normalized === 'em_execucao'
                                ? 'bg-sky-500 text-neutral-950 border-sky-500'
                                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-sky-500/50'
                            }`}
                          >
                            Em Execução
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'concluido')}
                            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                              normalized === 'concluido'
                                ? 'bg-emerald-500 text-neutral-950 border-emerald-500'
                                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-emerald-500/50'
                            }`}
                          >
                            Concluído
                          </button>
                          {normalized !== 'cancelado' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateAppointmentStatus(apt.id, 'cancelado')}
                              className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400"
                            >
                              Cancelar
                            </button>
                          )}
                          {confirmDeleteId === apt.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDeleteAppointment(apt.id)}
                                className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-red-600 text-white hover:bg-red-500"
                              >
                                Confirmar Exclusão
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1.5 text-[11px] text-neutral-400 hover:text-white"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(apt.id)}
                              className="p-2 text-neutral-500 hover:text-red-400"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PREÇOS & CATÁLOGO */}
          {activeTab === 'precos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400">Altere os preços dos serviços em tempo real:</span>
                <button
                  onClick={handleSaveServices}
                  className="py-2 px-4 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Alterações</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {tempServices.map((service) => (
                  <div
                    key={service.id}
                    className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={service.image}
                        alt={service.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="truncate">
                        <span className="font-bold text-white block truncate">{service.name}</span>
                        <span className="text-[11px] text-neutral-400">
                          {service.category === 'lavagens' ? 'Lavagem' : 'Estética'} · ~{service.durationMinutes} min
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-neutral-400">R$</span>
                      <input
                        type="number"
                        placeholder="Consultar"
                        value={service.price ?? ''}
                        onChange={(e) => handlePriceChange(service.id, e.target.value)}
                        className="w-24 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-bold text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DEPOIMENTOS DE CLIENTES */}
          {activeTab === 'depoimentos' && (
            <div className="space-y-6">
              {/* Form Adicionar / Editar */}
              <form
                onSubmit={handleSaveTestimonial}
                className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>
                      {editingTestimonialId ? 'Editar Depoimento Selecionado' : 'Adicionar Novo Depoimento'}
                    </span>
                  </h4>
                  {editingTestimonialId && (
                    <button
                      type="button"
                      onClick={resetTestimonialForm}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Lucas Ferreira"
                      value={depClientName}
                      onChange={(e) => setDepClientName(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Veículo (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Corolla Prata"
                      value={depVehicle}
                      onChange={(e) => setDepVehicle(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Serviço Realizado (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Vitrificação Automotiva"
                      value={depServiceName}
                      onChange={(e) => setDepServiceName(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Comentário do Cliente *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Escreva aqui o depoimento do cliente..."
                    value={depComment}
                    onChange={(e) => setDepComment(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:border-amber-500 outline-none resize-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-neutral-400">Nota:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setDepRating(star)}
                          className="p-0.5"
                          title={`${star} estrela(s)`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= depRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-neutral-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={depVisible}
                        onChange={(e) => setDepVisible(e.target.checked)}
                        className="accent-amber-500"
                      />
                      <span>Visível na página inicial</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingTestimonialId ? 'Atualizar Depoimento' : 'Publicar Depoimento'}</span>
                  </button>
                </div>
              </form>

              {/* Lista de Depoimentos Cadastrados */}
              <div className="space-y-2.5">
                <p className="text-xs text-neutral-400">
                  Depoimentos cadastrados ({testimonials.filter((t) => t.visible).length} visíveis no site):
                </p>

                {testimonials.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-6">
                    Nenhum depoimento cadastrado. Adicione acima para exibir na página inicial.
                  </p>
                ) : (
                  testimonials.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row justify-between items-start gap-3 ${
                        item.visible
                          ? 'bg-neutral-950 border-neutral-800'
                          : 'bg-neutral-950/50 border-neutral-850 opacity-65'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white">{item.clientName}</span>
                          {item.vehicle && (
                            <span className="text-[11px] text-neutral-400">· {item.vehicle}</span>
                          )}
                          {item.serviceName && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-semibold">
                              {item.serviceName}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.visible
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {item.visible ? 'Visível' : 'Oculto'}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-neutral-300 leading-relaxed">“{item.comment}”</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTestimonialVisibility(item.id)}
                          title={item.visible ? 'Ocultar do site' : 'Mostrar no site'}
                          className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400"
                        >
                          {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditTestimonial(item)}
                          title="Editar comentário"
                          className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {confirmDeleteTestimonialId === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteTestimonial(item.id)}
                              className="px-2 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-bold"
                            >
                              Excluir
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteTestimonialId(null)}
                              className="px-1.5 py-1.5 text-[10px] text-neutral-400 hover:text-white"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTestimonialId(item.id)}
                            title="Excluir comentário"
                            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PERGUNTAS FREQUENTES (FAQ) */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveFaq}
                className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>
                      {editingFaqId ? 'Editar Pergunta Frequente' : 'Adicionar Nova Pergunta & Resposta'}
                    </span>
                  </h4>
                  {editingFaqId && (
                    <button
                      type="button"
                      onClick={resetFaqForm}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Pergunta do Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Vocês buscam o carro no meu trabalho?"
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Categoria (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Leva e Traz, Pagamento..."
                      value={faqCategory}
                      onChange={(e) => setFaqCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Resposta Oficial *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Escreva uma resposta clara e útil para o cliente..."
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:border-amber-500 outline-none resize-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={faqVisible}
                      onChange={(e) => setFaqVisible(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>Visível na página inicial</span>
                  </label>

                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingFaqId ? 'Atualizar Pergunta' : 'Adicionar Pergunta'}</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2.5">
                <p className="text-xs text-neutral-400">
                  Perguntas cadastradas ({faqs.filter((f) => f.visible).length} visíveis no site):
                </p>

                {faqs.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-6">
                    Nenhuma pergunta cadastrada. Adicione acima para exibir na página inicial.
                  </p>
                ) : (
                  faqs.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row justify-between items-start gap-3 ${
                        item.visible
                          ? 'bg-neutral-950 border-neutral-800'
                          : 'bg-neutral-950/50 border-neutral-850 opacity-65'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.category && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-semibold">
                              {item.category}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.visible
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {item.visible ? 'Visível' : 'Oculta'}
                          </span>
                        </div>
                        <p className="font-bold text-white">{item.question}</p>
                        <p className="text-neutral-300 leading-relaxed">{item.answer}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleFaqVisibility(item.id)}
                          title={item.visible ? 'Ocultar do site' : 'Mostrar no site'}
                          className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400"
                        >
                          {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditFaq(item)}
                          title="Editar pergunta"
                          className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-400"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {confirmDeleteFaqId === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteFaq(item.id)}
                              className="px-2 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-bold"
                            >
                              Excluir
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteFaqId(null)}
                              className="px-1.5 py-1.5 text-[10px] text-neutral-400 hover:text-white"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteFaqId(item.id)}
                            title="Excluir pergunta"
                            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: NOTIFICAÇÕES RECEBIDAS */}
          {activeTab === 'notificacoes' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-400">
                Notificações instantâneas enviadas ao proprietário a cada agendamento:
              </p>

              {notifications.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-8">Nenhuma notificação.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        notif.read
                          ? 'bg-neutral-950 border-neutral-850 text-neutral-400'
                          : 'bg-neutral-950 border-amber-500/40 text-neutral-200'
                      }`}
                    >
                      <div className="flex justify-between font-bold">
                        <span className="text-white flex items-center gap-1.5">
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(notif.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300">{notif.message}</p>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkNotificationRead(notif.id)}
                          className="text-[10px] text-amber-400 font-semibold hover:underline pt-1 block"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
