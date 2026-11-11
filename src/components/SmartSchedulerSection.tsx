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
  CreditCard,
  QrCode
} from 'lucide-react';
import { Service, Appointment, CompanyConfig } from '../types';
import {
  getAvailableSlotsForDay,
  getUpcomingBookingDates,
  bookAppointment,
  buildWhatsAppBookingMessage,
  buildWhatsAppUrl,
} from '../utils/scheduling';

interface SmartSchedulerSectionProps {
  services: Service[];
  config: CompanyConfig;
  appointments: Appointment[];
  onAppointmentBooked: (appointment: Appointment) => void;
}

export const SmartSchedulerSection: React.FC<SmartSchedulerSectionProps> = ({
  services,
  config,
  appointments,
  onAppointmentBooked,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services[0]?.id || 'lavagem-especial'
  );

  const upcomingDates = useMemo(() => getUpcomingBookingDates(14), []);
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDates[0] || '');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Form fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [notes, setNotes] = useState('');

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const selectedService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  const durationMinutes = selectedService?.durationMinutes || 60;

  const dayAvailability = useMemo(() => {
    if (!selectedDate) return null;
    return getAvailableSlotsForDay(
      appointments,
      selectedDate,
      durationMinutes,
      config.slotIntervalMinutes
    );
  }, [appointments, selectedDate, durationMinutes, config.slotIntervalMinutes]);

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
    onAppointmentBooked(result.appointment);
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
    <section id="agendamento" className="py-20 bg-neutral-900/40 border-t border-neutral-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="text-xs font-bold tracking-widest text-amber-500 uppercase">
            Sem Filas · Atendimento VIP com Hora Marcada
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            AGENDAMENTO INTELIGENTE
          </h2>
          <p className="text-sm sm:text-base text-neutral-300">
            Escolha o serviço, selecione o dia e o horário livre. Nosso sistema calcula a duração exata e garante sua vaga sem risco de sobreposição.
          </p>
        </div>

        {/* Scheduler Card */}
        <div className="max-w-3xl mx-auto bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {!confirmedAppointment ? (
            <form onSubmit={handleConfirmBooking} className="space-y-6">
              
              {/* 1. Escolha o Serviço */}
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
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.price ? `R$ ${s.price}` : s.priceLabel || 'Consultar preço'} (~{s.durationMinutes} min)
                    </option>
                  ))}
                </select>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Duração estimada na oficina: <strong className="text-white">{durationMinutes} minutos</strong></span>
                </div>
              </div>

              {/* 2. Escolha o Dia */}
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
                            ? 'bg-neutral-900/40 text-neutral-600 border-neutral-850 hover:border-neutral-700'
                            : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
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

              {/* 3. Horários Disponíveis */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    3. Horários Livres (Prevenção de duplicidade ativa)
                  </label>
                  <span className="text-[11px] text-amber-500 font-semibold">
                    ~{durationMinutes} min reservados
                  </span>
                </div>

                {dayAvailability?.isClosed ? (
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-sm text-neutral-400">
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
                              ? 'bg-neutral-900 text-neutral-200 border-neutral-800 hover:border-amber-500/60 hover:text-white'
                              : 'bg-neutral-900/40 text-neutral-600 border-neutral-850 line-through cursor-not-allowed opacity-60'
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
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-sm text-neutral-400">
                    Nenhum horário com duração de {durationMinutes} min disponível nesta data.
                  </div>
                )}
              </div>

              {/* 4. Dados para Confirmação */}
              <div className="space-y-3 pt-3 border-t border-neutral-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  4. Seus Dados de Contato
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
                        placeholder="Ex: Carlos Eduardo"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
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
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
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
                        placeholder="Ex: Corolla Preto (Placa ODK-1020)"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
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
                        className="w-full pl-9 pr-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {bookingError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedTime}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
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

            </form>
          ) : (
            /* Confirmation State */
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
              <div className="text-left bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2.5 max-w-md mx-auto text-xs sm:text-sm">
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Cliente:</span>
                  <span className="font-semibold text-white">{confirmedAppointment.clientName}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Serviço:</span>
                  <span className="font-semibold text-amber-400">
                    {Array.isArray(confirmedAppointment.serviceNames) ? confirmedAppointment.serviceNames.join(', ') : ''}
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Data e Horário:</span>
                  <span className="font-bold text-white">
                    {confirmedAppointment.date ? confirmedAppointment.date.split('-').reverse().join('/') : ''} às {confirmedAppointment.time}
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Duração estimada:</span>
                  <span className="text-neutral-200">~{confirmedAppointment.durationMinutes} minutos</span>
                </div>
                {confirmedAppointment.vehicleModel && (
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
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

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 max-w-md mx-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>ENVIAR CONFIRMAÇÃO NO WHATSAPP</span>
                </a>

                {/* PIX copy */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">PIX Oficial da Oficina:</span>
                    <span className="font-bold text-amber-400">{config.pixKey}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copiedPix ? 'Chave PIX Copiada!' : 'COPIAR CHAVE PIX'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmedAppointment(null)}
                  className="py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Fazer outro agendamento
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </section>
  );
};
