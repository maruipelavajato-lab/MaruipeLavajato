import { CompanyConfig } from '../types';

/**
 * CONFIGURAÇÃO OFICIAL DA EMPRESA
 * Altere aqui ou através do Painel Administrativo do sistema.
 */
export const DEFAULT_CONFIG: CompanyConfig = {
  name: "Maruípe Lava Jato Estética Automotiva",
  address: "Rua Daniel Abreu Machado, 1406 – Vitória/ES",
  whatsappPhone: "(27) 99286-9471",
  whatsappDigits: "5527992869471",
  pixKey: "27 99286-9471",
  pixName: "Maruípe Lava Jato",
  // Links de pagamento e aplicativos conforme solicitado:
  paymentLink: "COLOCAR_LINK_DE_PAGAMENTO_AQUI",
  androidAppLink: "COLOCAR_LINK_DA_PLAY_STORE_AQUI",
  iosAppLink: "COLOCAR_LINK_DA_APP_STORE_AQUI",
  businessHoursWeekdays: "07:00 às 18:00",
  businessHoursSaturday: "07:00 às 18:00",
  businessHoursSunday: "08:00 às 14:00",
  slotIntervalMinutes: 30,
};

const CONFIG_STORAGE_KEY = 'maruipe_company_config';

export function getStoredCompanyConfig(): CompanyConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure updated business hours take precedence if older defaults exist
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        businessHoursWeekdays: parsed.businessHoursWeekdays || DEFAULT_CONFIG.businessHoursWeekdays,
        businessHoursSaturday: parsed.businessHoursSaturday || DEFAULT_CONFIG.businessHoursSaturday,
        businessHoursSunday: parsed.businessHoursSunday || DEFAULT_CONFIG.businessHoursSunday,
      };
    }
  } catch (err) {
    console.error('Erro ao carregar configurações:', err);
  }
  return DEFAULT_CONFIG;
}

export function saveCompanyConfig(config: CompanyConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Erro ao salvar configurações:', err);
  }
}
