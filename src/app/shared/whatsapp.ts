// Enlace que abre el chat de WhatsApp con ese teléfono. wa.me necesita el número internacional sin "+":
// si no lleva prefijo y tiene 9 cifras se da por español (34)
export function whatsappUrl(phone: string | null): string | null {
  if (!phone) {
    return null;
  }
  const digits = phone.replace(/\D/g, '');
  const international =
    !phone.trim().startsWith('+') && digits.length === 9 ? `34${digits}` : digits;
  return `https://wa.me/${international}`;
}
