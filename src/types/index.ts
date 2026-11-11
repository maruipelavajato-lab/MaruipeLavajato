export type ServiceCategory = 'lavagens' | 'estetica';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number | null; // null represents 'Consultar preço'
  pricePrefix?: string; // e.g. 'A partir de'
  priceLabel?: string; // e.g. 'Consultar preço'
  durationMinutes: number;
  description: string;
  image: string;
  includes?: string[];
  isPromo?: boolean;
}

export interface CartItem {
  service: Service;
  quantity: number;
  vehicleModel?: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  serviceIds: string[];
  serviceNames: string[];
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  totalPrice?: number;
  hasQuoteItems: boolean;
  notes?: string;
  status: 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  createdAt: string;
}

export interface OwnerNotification {
  id: string;
  title: string;
  message: string;
  appointmentId?: string;
  createdAt: string;
  read: boolean;
}

export interface CompanyConfig {
  name: string;
  address: string;
  whatsappPhone: string; // formatted e.g. "(27) 99286-9471"
  whatsappDigits: string; // "5527992869471"
  pixKey: string; // "27 99286-9471"
  pixName: string; // "Maruípe Lava Jato"
  paymentLink: string; // PAYMENT_LINK
  androidAppLink: string; // ANDROID_APP_LINK
  iosAppLink: string; // IOS_APP_LINK
  businessHoursWeekdays: string;
  businessHoursSaturday: string;
  businessHoursSunday?: string;
  slotIntervalMinutes: number;
}
