import { Appointment, OwnerNotification } from '../types';

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
      status: 'confirmado',
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
      status: 'confirmado',
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

  const newAppointment: Appointment = {
    ...data,
    id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: 'confirmado',
    createdAt: new Date().toISOString(),
  };

  const updated = [newAppointment, ...currentAppointments];
  saveAppointments(updated);

  // Send owner notification
  const ownerNotifications = getOwnerNotifications();
  const newNotification: OwnerNotification = {
    id: `notif-${Date.now()}`,
    title: `Novo Agendamento: ${data.clientName}`,
    message: `${data.serviceNames.join(' + ')} em ${data.date} às ${data.time} (${data.vehicleModel || 'Veículo não informado'}). Telefone: ${data.clientPhone}`,
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

  return `*AGENDAMENTO - ${companyName.toUpperCase()}*

Olá! Gostaria de confirmar o meu agendamento:

👤 *Cliente:* ${appointment.clientName}
📱 *WhatsApp:* ${appointment.clientPhone}
🚗 *Veículo:* ${appointment.vehicleModel || 'Não especificado'}
🧼 *Serviço(s):* ${servicesList}
📅 *Data:* ${dateFormatted}
⏰ *Horário:* ${appointment.time} (Duração est.: ~${appointment.durationMinutes} min)
💰 *Valor:* ${priceText}
${appointment.notes ? `💬 *Observações:* ${appointment.notes}\n` : ''}
📍 *Local:* Rua Daniel Abreu Machado, 1406 – Vitória/ES

_Por favor, confirme a disponibilidade da vaga!_`;
}

/**
 * Builds direct WhatsApp URL
 */
export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}
