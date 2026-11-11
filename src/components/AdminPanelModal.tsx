import React, { useState } from 'react';
import {
  X,
  Settings,
  Calendar,
  DollarSign,
  Bell,
  Trash2,
  CheckCircle2,
  Save,
  Clock,
  Phone,
  MapPin,
  QrCode,
  CreditCard,
  Smartphone,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Service, Appointment, CompanyConfig, OwnerNotification } from '../types';
import { saveCompanyConfig } from '../config/constants';
import { saveAppointments, saveOwnerNotifications } from '../utils/scheduling';
import { saveStoredServices } from '../data/services';

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
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'agendamentos' | 'precos' | 'notificacoes'>('geral');
  const [tempConfig, setTempConfig] = useState<CompanyConfig>({ ...config });
  const [tempServices, setTempServices] = useState<Service[]>([...services]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const handleCancelAppointment = (id: string) => {
    const updated = appointments.map((apt) =>
      apt.id === id ? { ...apt, status: 'cancelado' as const } : apt
    );
    onUpdateAppointments(updated);
    saveAppointments(updated);
  };

  const handleCompleteAppointment = (id: string) => {
    const updated = appointments.map((apt) =>
      apt.id === id ? { ...apt, status: 'concluido' as const } : apt
    );
    onUpdateAppointments(updated);
    saveAppointments(updated);
  };

  const handleDeleteAppointment = (id: string) => {
    if (confirm('Deseja realmente excluir este agendamento do sistema?')) {
      const updated = appointments.filter((apt) => apt.id !== id);
      onUpdateAppointments(updated);
      saveAppointments(updated);
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    onUpdateNotifications(updated);
    saveOwnerNotifications(updated);
  };

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
                Painel Administrativo do Maruípe Lava Jato
              </h2>
              <p className="text-xs text-neutral-400">
                Gerenciamento de dados, agendamentos, preços, links e notificações
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
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

                <a
                  href="/maruipe-lavajato-projeto.zip"
                  download="maruipe-lavajato-projeto.zip"
                  className="py-3 px-5 rounded-xl bg-neutral-950 border border-neutral-700 hover:border-amber-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Baixar Arquivos do Site (.ZIP)</span>
                </a>
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
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{apt.clientName}</span>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              apt.status === 'confirmado'
                                ? 'bg-amber-500/20 text-amber-400'
                                : apt.status === 'concluido'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-300">
                          {Array.isArray(apt.serviceNames) ? apt.serviceNames.join(' + ') : ''} · <strong>{apt.date ? apt.date.split('-').reverse().join('/') : ''} às {apt.time || ''}</strong> (~{apt.durationMinutes || 60} min)
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          WhatsApp: {apt.clientPhone} {apt.vehicleModel && `· Veículo: ${apt.vehicleModel}`}
                        </p>
                        {apt.notes && (
                          <p className="text-[11px] text-neutral-500 italic">Obs: {apt.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {apt.status === 'confirmado' && (
                          <>
                            <button
                              onClick={() => handleCompleteAppointment(apt.id)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900"
                            >
                              Concluir
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(apt.id)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 text-neutral-300 hover:text-red-400"
                            >
                              Liberar Vaga
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="p-2 text-neutral-500 hover:text-red-400"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
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

          {/* TAB 4: NOTIFICAÇÕES RECEBIDAS */}
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
