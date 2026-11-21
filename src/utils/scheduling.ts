import { Appointment, AppointmentStatus, OwnerNotification, ServiceDeliveryMode } from '../types';

export type NormalizedOrderStatus = 'pendente' | 'em_execucao' | 'concluido' | 'cancelado';

export interface OrderStatusMeta {
  normalized: NormalizedOrderStatus;
  label: string;
  description: string;
  step: number; // 1: Pendente, 2: Em Execução, 3: Concluído, 0: Cancelado
  badgeClass: string;
}

export function normalizeAppointmentStatus(status?: AppointmentStatus): NormalizedOrderStatus {
  if (status === 'em_execucao' || status === 'em_andamento') return 'em_execucao';
  if (status === 'concluido') return 'concluido';
  if (status === 'cancelado') return 'cancelado';
  return 'pendente';
}

export function getAppointmentStatusMeta(status?: AppointmentStatus): OrderStatusMeta {
  const normalized = normalizeAppointmentStatus(status);
  switch (normalized) {
    case 'em_execucao':
      return {
        normalized,
        label: 'Em Execução',
        description: 'Nossa equipe está cuidando do seu veículo neste momento.',
        step: 2,
        badgeClass: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
      };
    case 'concluido':
      return {
        normalized,
        label: 'Concluído',
        description: 'Serviço finalizado! Seu carro está pronto para retirada ou entrega.',
        step: 3,
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      };
    case 'cancelado':
      return {
        normalized,
        label: 'Cancelado',
        description: 'Agendamento cancelado e horário liberado na agenda.',
        step: 0,
        badgeClass: 'bg-red-500/15 text-red-400 border border-red-500/30',
      };
    case 'pendente':
    default:
      return {
        normalized: 'pendente',
        label: 'Pendente',
        description: 'Pedido recebido e aguardando o horário de início do atendimento.',
        step: 1,
        badgeClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      };
  }
}

export function formatDeliveryModeLabel(mode?: ServiceDeliveryMode): string {
  return mode === 'leva_traz'
    ? 'Buscar veículo no local (Leva e Traz)'
    : 'Cliente traz o carro até o lava jato';
}

export interface TimeSlot {
  time: string; // "08:00"
  available: boolean;
  conflictReason?: string;
}

export interface DayAvailability {
  date: string; // "YYYY-MM-DD"
  formattedDate: string; // "Qua, 12 Nov"
  isClosed: boolean;
  reason?: string;
  slots: TimeSlot[];
}

const APPOINTMENTS_STORAGE_KEY = 'maruipe_appointments';
const NOTIFICATIONS_STORAGE_KEY = 'maruipe_owner_notifications';
const MY_APPOINTMENT_IDS_KEY = 'maruipe_my_appointment_ids';

export function getMyAppointmentIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MY_APPOINTMENT_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    }
  } catch {
    // ignore
  }
  return [];
}

export function rememberMyAppointmentId(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    const current = getMyAppointmentIds();
    if (!current.includes(id)) {
      localStorage.setItem(MY_APPOINTMENT_IDS_KEY, JSON.stringify([id, ...current].slice(0, 30)));
    }
  } catch {
    // ignore
  }
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getStoredAppointments(): Appointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Erro ao ler agendamentos:', err);
  }

  // Initial realistic sample appointments to demonstrate double-booking prevention immediately
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const sample: Appointment[] = [
    {
      id: 'apt-sample-1',
      clientName: 'Carlos Eduardo',
      clientPhone: '(27) 99888-1234',
      vehicleModel: 'Corolla Cross Prata',
      serviceIds: ['lavagem-especial'],
      serviceNames: ['Lavagem Especial'],
      date: tomorrowStr,
      time: '09:00',
      durationMinutes: 60,
      totalPrice: 50,
      hasQuoteItems: false,
      status: 'pendente',
      createdAt: new Date().toISOString(),
      notes: 'Carro muito empoeirado da estrada',
    },
    {
      id: 'apt-sample-2',
      clientName: 'Marina Valença',
      clientPhone: '(27) 99777-5678',
      vehicleModel: 'Compass Preto',
      serviceIds: ['polimento-farol'],
      serviceNames: ['Polimento de Farol'],
      date: tomorrowStr,
      time: '14:00',
      durationMinutes: 60,
      hasQuoteItems: true,
      status: 'em_execucao',
      createdAt: new Date().toISOString(),
      notes: 'Farol dianteiro esquerdo fosco',
    },
  ];

  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(sample));
  } catch {
    // ignore
  }

  return sample;
}

export function saveAppointments(appointments: Appointment[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  } catch (err) {
    console.error('Erro ao salvar agendamentos:', err);
  }
}

export function getOwnerNotifications(): OwnerNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler notificações:', err);
  }
  return [
    {
      id: 'notif-1',
      title: 'Sistema de Agendamento Ativo',
      message: 'O sistema inteligente do Maruípe Lava Jato está pronto para evitar conflitos de horário e receber agendamentos via WhatsApp.',
      createdAt: new Date().toISOString(),
      read: false,
    },
  ];
}

export function saveOwnerNotifications(notifications: OwnerNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Erro ao salvar notificações:', err);
  }
}

/**
 * Calculates open and closing minutes for a given date
 */
export function getBusinessHoursForDate(dateStr: string): { isOpen: boolean; openMin: number; closeMin: number; dayLabel: string } {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.includes('-')) {
    return { isOpen: true, openMin: 7 * 60, closeMin: 18 * 60, dayLabel: 'Segunda a Sábado (07:00 às 18:00)' };
  }
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return { isOpen: true, openMin: 7 * 60, closeMin: 18 * 60, dayLabel: 'Segunda a Sábado (07:00 às 18:00)' };
  }
  const [year, month, day] = parts;
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = isNaN(dateObj.getTime()) ? 1 : dateObj.getDay();

  if (dayOfWeek === 0) {
    // Domingo: 08:00 às 14:00
    return { isOpen: true, openMin: 8 * 60, closeMin: 14 * 60, dayLabel: 'Domingo (08:00 às 14:00)' };
  } else if (dayOfWeek === 6) {
    // Sábado: 07:00 às 18:00
    return { isOpen: true, openMin: 7 * 60, closeMin: 18 * 60, dayLabel: 'Sábado (07:00 às 18:00)' };
  } else {
    // Segunda a Sexta: 07:00 às 18:00
    return { isOpen: true, openMin: 7 * 60, closeMin: 18 * 60, dayLabel: 'Segunda a Sexta (07:00 às 18:00)' };
  }
}

/**
 * Checks if a requested slot [reqStart, reqStart + reqDuration] overlaps with existing active bookings
 */
export function checkDoubleBooking(
  appointments: Appointment[],
  date: string,
  time: string,
  durationMinutes: number,
  excludeAppointmentId?: string
): { hasConflict: boolean; conflictingWith?: Appointment } {
  const reqStart = timeToMinutes(time);
  const reqEnd = reqStart + durationMinutes;

  const sameDayAppointments = (appointments || []).filter(
    (apt) => apt && apt.date === date && apt.status !== 'cancelado' && apt.id !== excludeAppointmentId
  );

  for (const existing of sameDayAppointments) {
    if (!existing.time) continue;
    const existStart = timeToMinutes(existing.time);
    const existEnd = existStart + (existing.durationMinutes || 60);

    // Overlap condition: startA < endB && endA > startB
    if (reqStart < existEnd && reqEnd > existStart) {
      return { hasConflict: true, conflictingWith: existing };
    }
  }

  return { hasConflict: false };
}

/**
 * Computes all slots for a given day and duration
 */
export function getAvailableSlotsForDay(
  appointments: Appointment[],
  dateStr: string,
  durationMinutes: number = 60,
  slotIntervalMinutes: number = 30
): DayAvailability {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.includes('-')) {
    return {
      date: dateStr || '',
      formattedDate: '',
      isClosed: false,
      slots: [],
    };
  }

  const { isOpen, openMin, closeMin, dayLabel } = getBusinessHoursForDate(dateStr);
  const parts = dateStr.split('-').map(Number);
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);

  let formattedDate = dateStr;
  try {
    if (!isNaN(dateObj.getTime())) {
      formattedDate = dateObj.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      });
    }
  } catch {
    formattedDate = dateStr;
  }

  if (!isOpen) {
    return {
      date: dateStr,
      formattedDate,
      isClosed: true,
      reason: dayLabel,
      slots: [],
    };
  }

  const slots: TimeSlot[] = [];

  for (let current = openMin; current + durationMinutes <= closeMin; current += slotIntervalMinutes) {
    const slotTimeStr = minutesToTime(current);
    const conflict = checkDoubleBooking(appointments, dateStr, slotTimeStr, durationMinutes);

    if (conflict.hasConflict) {
      slots.push({
        time: slotTimeStr,
        available: false,
        conflictReason: `Horário já reservado (${conflict.conflictingWith?.serviceNames.join(', ') || 'Ocupado'})`,
      });
    } else {
      slots.push({
        time: slotTimeStr,
        available: true,
      });
    }
  }

  return {
    date: dateStr,
    formattedDate,
    isClosed: false,
    slots,
  };
}

/**
 * Generates an array of consecutive upcoming dates (today + N days)
 */
export function getUpcomingBookingDates(daysCount: number = 14): string[] {
  const dates: string[] = [];
  const now = new Date();

  for (let i = 0; i < daysCount; i++) {
    const target = new Date();
    target.setDate(now.getDate() + i);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }

  return dates;
}

/**
 * Atomic reservation handler with anti-double-booking guarantee
 */
export function bookAppointment(
  data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
): { success: boolean; appointment?: Appointment; error?: string } {
  const currentAppointments = getStoredAppointments();

  // Safety check for double-booking
  const conflict = checkDoubleBooking(
    currentAppointments,
    data.date,
    data.time,
    data.durationMinutes
  );

  if (conflict.hasConflict) {
    return {
      success: false,
      error: `Desculpe! O horário ${data.time} no dia ${data.date} acabou de ser reservado por outro cliente. Por favor, escolha outro horário disponível.`,
    };
  }

  const deliveryMode: ServiceDeliveryMode = data.deliveryMode ?? 'cliente_traz';

  const newAppointment: Appointment = {
    ...data,
    deliveryMode,
    pickupAddress: deliveryMode === 'leva_traz' ? data.pickupAddress : undefined,
    id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: 'pendente',
    createdAt: new Date().toISOString(),
  };

  const updated = [newAppointment, ...currentAppointments];
  saveAppointments(updated);
  rememberMyAppointmentId(newAppointment.id);

  // Send owner notification
  const ownerNotifications = getOwnerNotifications();
  const deliverySummary =
    data.deliveryMode === 'leva_traz'
      ? `Buscar no local: ${data.pickupAddress || 'Endereço a confirmar'}`
      : 'Cliente traz na loja';
  const newNotification: OwnerNotification = {
    id: `notif-${Date.now()}`,
    title: `Novo Agendamento: ${data.clientName}`,
    message: `${data.serviceNames.join(' + ')} em ${data.date} às ${data.time} (${data.vehicleModel || 'Veículo não informado'} · ${deliverySummary}). Telefone: ${data.clientPhone}`,
    appointmentId: newAppointment.id,
    createdAt: new Date().toISOString(),
    read: false,
  };
  saveOwnerNotifications([newNotification, ...ownerNotifications]);

  return {
    success: true,
    appointment: newAppointment,
  };
}

/**
 * Builds the WhatsApp message for customer confirmation
 */
export function buildWhatsAppBookingMessage(
  appointment: Appointment,
  companyName: string = 'Maruípe Lava Jato Estética Automotiva'
): string {
  const dateFormatted = appointment.date.split('-').reverse().join('/');
  const servicesList = appointment.serviceNames.join(' + ');
  const priceText = appointment.totalPrice ? `R$ ${appointment.totalPrice.toFixed(2).replace('.', ',')}` : 'A consultar';
  const deliveryLabel = formatDeliveryModeLabel(appointment.deliveryMode);
  const pickupLine =
    appointment.deliveryMode === 'leva_traz' && appointment.pickupAddress
      ? `🏠 *Endereço para Busca:* ${appointment.pickupAddress}\n`
      : '';

  return `*AGENDAMENTO - ${companyName.toUpperCase()}*

Olá! Gostaria de confirmar o meu agendamento:

👤 *Cliente:* ${appointment.clientName}
📱 *WhatsApp:* ${appointment.clientPhone}
🚗 *Veículo:* ${appointment.vehicleModel || 'Não especificado'}
🚙 *Modalidade:* ${deliveryLabel}
${pickupLine}🧼 *Serviço(s):* ${servicesList}
📅 *Data:* ${dateFormatted}
⏰ *Horário:* ${appointment.time} (Duração est.: ~${appointment.durationMinutes} min)
💰 *Valor:* ${priceText}
${appointment.notes ? `💬 *Observações:* ${appointment.notes}\n` : ''}
📍 *Local:* Rua Daniel Abreu Machado, 406 – Vitória/ES

_Por favor, confirme a disponibilidade da vaga!_`;
}

/**
 * Builds direct WhatsApp URL
 */
export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}
