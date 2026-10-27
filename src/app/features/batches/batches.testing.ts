import { PendingLine } from './batches.models';

// Datos de prueba para los tests de lotes
export function pendingLine(lineId: number, overrides: Partial<PendingLine> = {}): PendingLine {
  return {
    lineId,
    orderId: 5,
    orderNumber: 'SO-2026-000005',
    orderDate: '2026-10-05',
    customerId: 3,
    customerName: 'Ana Pérez',
    productId: 1,
    productName: 'Camiseta Fan',
    kitName: 'Betis local',
    size: 'KIDS_16',
    status: 'PENDING',
    customizations: [{ name: 'Nombre + número', customText: 'JOAQUÍN 17' }],
    totalSale: 17,
    totalCost: 7.7,
    ...overrides,
  };
}
