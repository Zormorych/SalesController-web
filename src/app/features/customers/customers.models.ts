export interface Customer {
  id: number;
  name: string;
  // Teléfono de WhatsApp, guardado sin espacios ni guiones: "+34600123456"
  phone: string | null;
  notes: string | null;
}

export interface CustomerRequest {
  name: string;
  phone: string | null;
  notes: string | null;
}

// Mismo patrón que el backend: 6 a 25 caracteres con al menos 6 dígitos; admite +, espacios, puntos, guiones y paréntesis
export const PHONE_PATTERN = /^$|^\+?(?=(?:\D*\d){6})[0-9 .()-]{6,25}$/;
