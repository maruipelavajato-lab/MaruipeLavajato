import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import { Service, Appointment, CompanyConfig } from '../types';
import {
  getStoredAppointments,
  getAvailableSlotsForDay,
  getUpcomingBookingDates,
  bookAppointment,
  buildWhatsAppBookingMessage,
  buildWhatsAppUrl,
} from '../utils/scheduling';

interface SmartSchedulerProps {
  services: Service[];
  initialService?: Service | null;
  config: CompanyConfig;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentBooked?: (appointment: Appointment) => void;
}

export const SmartScheduler: React.FC<SmartSchedulerProps> = ({
  services,
  initialService,
  config,
  isOpen,
  onClose,
  onAppointmentBooked,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialService ? initialService.id : services[0]?.id || 'lavagem-especial'
  );

  const upcomingDates = useMemo(() => getUpcomingBookingDates(14), []);
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDates[0] || '');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Form fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [notes, setNotes] = useState('');

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Read current appointments
  const allAppointments = useMemo(() => {
    return getStoredAppointments();
  }, [isOpen, confirmedAppointment]);

  const selectedService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  const durationMinutes = selectedService?.durationMinutes || 60;

  // Calculate day availability for the selected date
  const dayAvailability = useMemo(() => {
    if (!selectedDate) return null;
    return getAvailableSlotsForDay(
      allAppointments,
      selectedDate,
      durationMinutes,
      config.slotIntervalMinutes
    );
  }, [allAppointments, selectedDate, durationMinutes, config.slotIntervalMinutes]);

  if (!isOpen) return null;

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setBookingError(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!clientName.trim()) {
      setBookingError('Por favor, informe seu nome completo.');
      return;
    }
    if (!clientPhone.trim() || clientPhone.replace(/\D/g, '').length < 8) {
      setBookingError('Por favor, informe um WhatsApp válido com DDD.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      setBookingError('Selecione uma data e um horário disponível.');
      return;
    }

    setIsSubmitting(true);

    const result = bookAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      vehicleModel: vehicleModel.trim() || undefined,
      serviceIds: [selectedService.id],
      serviceNames: [selectedService.name],
      date: selectedDate,
      time: selectedTime,
      durationMinutes: selectedService.durationMinutes,
      totalPrice: selectedService.price ?? undefined,
      hasQuoteItems: selectedService.price === null,
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);

    if (!result.success || !result.appointment) {
      setBookingError(result.error || 'Erro ao realizar agendamento.');
      return;
    }

    setConfirmedAppointment(result.appointment);
    if (onAppointmentBooked) {
      onAppointmentBooked(result.appointment);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(config.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const whatsappMessage = confirmedAppointment
    ? buildWhatsAppBookingMessage(confirmedAppointment, config.name)
    : '';
  const whatsappUrl = buildWhatsAppUrl(config.whatsappDigits, whatsappMessage);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                Agendamento Inteligente
              </h2>
              <p className="text-xs text-neutral-400">
                Horários calculados em tempo real com prevenção de conflitos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!confirmedAppointment ? (
            <form onSubmit={handleConfirmBooking} className="space-y-6">
              
              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  1. Escolha o Serviço
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    setSelectedTime('');
                  }}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.price ? `R$ ${s.price}` : s.priceLabel || 'Consultar preço'} (~{s.durationMinutes} min)
                    </option>
                  ))}
                </select>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Duração reservada na oficina: <strong className="text-white">{durationMinutes} minutos</strong></span>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  2. Escolha o Dia
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {upcomingDates.map((dateStr) => {
                    let dayName = '';
                    let dayNumber = 1;
                    let monthName = '';
                    let isSunday = false;
                    try {
                      const [y, m, d] = dateStr.split('-').map(Number);
                      const dateObj = new Date(y, m - 1, d);
                      if (!isNaN(dateObj.getTime())) {
                        dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
                        dayNumber = dateObj.getDate();
                        monthName = dateObj.toLocaleDateString('pt-BR', { month: 'short' });
                        isSunday = dateObj.getDay() === 0;
                      }
                    } catch {
                      dayName = 'Dia';
                    }
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => handleDateChange(dateStr)}
                        className={`flex flex-col items-center justify-center min-w-[70px] py-2.5 px-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold shadow-lg shadow-amber-500/20'
                            : isSunday
                            ? 'bg-neutral-950/40 text-neutral-600 border-neutral-850 hover:border-neutral-700'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
                        }`}
                      >
                        <span className="text-[11px] uppercase font-semibold">
                          {dayName.replace('.', '')}
                        </span>
                        <span className="text-lg font-black">{dayNumber}</span>
                        <span className="text-[10px] capitalize opacity-80">{monthName.replace('.', '')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    3. Horários Disponíveis
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    Prevenção de sobreposição ativada
                  </span>
                </div>

                {dayAvailability?.isClosed ? (
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-sm text-neutral-400">
                    Fechado neste dia. Aberto de Segunda a Sábado (07:00 às 18:00) e Domingo (08:00 às 14:00).
                  </div>
                ) : dayAvailability && dayAvailability.slots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {dayAvailability.slots.map((slot) => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          title={slot.conflictReason || 'Horário livre para agendamento'}
                          className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                            isSelected
                              ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold shadow'
                              : slot.available
                              ? 'bg-neutral-950 text-neutral-200 border-neutral-800 hover:border-amber-500/60 hover:text-white'
                              : 'bg-neutral-950/40 text-neutral-600 border-neutral-850 line-through cursor-not-allowed opacity-60'
                          }`}
                        >
                          {slot.time}
                          {!slot.available && (
                            <span className="block text-[9px] uppercase tracking-tighter text-red-400/80">
                              Ocupado
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-sm text-neutral-400">
                    Nenhum horário com duração de {durationMinutes} min disponível nesta data.
                  </div>
                )}
              </div>

              {/* Client Info */}
              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  4. Seus Dados para Confirmação
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: João da Silva"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      WhatsApp com DDD *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="(27) 99999-9999"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Veículo (Marca / Modelo / Placa)
                    </label>
                    <div className="relative">
                      <Car className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Ex: Civic Preto (Placa ABC-1234)"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Observações ou Solicitações
                    </label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Ex: Cuidado com película / insulfilm"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {bookingError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedTime}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    !selectedTime
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-[0.98]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-neutral-950" />
                  <span>
                    {selectedTime
                      ? `CONFIRMAR AGENDAMENTO (${selectedTime} - ${selectedDate ? selectedDate.split('-').reverse().join('/') : ''})`
                      : 'ESCOLHA UM HORÁRIO ACIMA'}
                  </span>
                </button>
              </div>

            </form>
          ) : (
            /* Confirmation Screen */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-2xl font-black text-white">
                  Agendamento Pré-Reservado com Sucesso!
                </h3>
                <p className="text-sm text-neutral-300 max-w-md mx-auto">
                  A vaga foi bloqueada para evitar duplicidade. Para finalizar e garantir seu atendimento, confirme agora via WhatsApp:
                </p>
              </div>

              {/* Summary Card */}
              <div className="text-left bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-2.5 max-w-md mx-auto text-xs sm:text-sm">
                <div className="flex justify-between border-b border-neutral-850 pb-2">
                  <span className="text-neutral-400">Cliente:</span>
                  <span className="font-semibold text-white">{confirmedAppointment.clientName}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-850 pb-2">
                  <span className="text-neutral-400">Serviço:</span>
                  <span className="font-semibold text-amber-400">{Array.isArray(confirmedAppointment.serviceNames) ? confirmedAppointment.serviceNames.join(', ') : ''}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-850 pb-2">
                  <span className="text-neutral-400">Data e Horário:</span>
                  <span className="font-bold text-white">
                    {confirmedAppointment.date ? confirmedAppointment.date.split('-').reverse().join('/') : ''} às {confirmedAppointment.time}
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-850 pb-2">
                  <span className="text-neutral-400">Duração estimada:</span>
                  <span className="text-neutral-200">~{confirmedAppointment.durationMinutes} minutos</span>
                </div>
                {confirmedAppointment.vehicleModel && (
                  <div className="flex justify-between border-b border-neutral-850 pb-2">
                    <span className="text-neutral-400">Veículo:</span>
                    <span className="text-neutral-200">{confirmedAppointment.vehicleModel}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-400">Valor:</span>
                  <span className="font-bold text-white">
                    {confirmedAppointment.totalPrice ? `R$ ${confirmedAppointment.totalPrice}` : 'Consultar no local'}
                  </span>
                </div>
              </div>

              {/* WhatsApp Action Button */}
              <div className="flex flex-col gap-3 max-w-md mx-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>ENVIAR CONFIRMAÇÃO PELO WHATSAPP</span>
                </a>

                {/* PIX Payment Option */}
                <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Pagamento antecipado via PIX:</span>
                    <span className="font-bold text-amber-400">{config.pixKey}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copiedPix ? 'Chave PIX Copiada com Sucesso!' : 'COPIAR CHAVE PIX'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Concluir e Voltar ao Site
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
