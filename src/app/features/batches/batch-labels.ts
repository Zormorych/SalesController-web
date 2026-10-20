import { BatchStatus, ShirtCustomization } from './batches.models';

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  OPEN: 'Abierto',
  SENT: 'Enviado',
  RECEIVED: 'Recibido',
  CANCELLED: 'Descartado',
};

// "Camiseta Fan · Betis local · JOAQUÍN 17, Parche": producto, equipación y personalizaciones
export function shirtText(shirt: {
  productName: string;
  kitName: string;
  customizations: ShirtCustomization[];
}): string {
  const customizations = shirt.customizations
    .map((customization) => customization.customText || customization.name)
    .join(', ');
  return [shirt.productName, shirt.kitName, customizations].filter(Boolean).join(' · ');
}
