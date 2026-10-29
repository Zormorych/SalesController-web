import { LineStatus } from '../orders/orders.models';

// Modelos de la API de lotes al fabricante (/api/purchasing). Fechas y horas como texto ISO

export type BatchStatus = 'OPEN' | 'SENT' | 'RECEIVED' | 'CANCELLED';

export interface ShirtCustomization {
  name: string;
  customText: string | null;
}

// Camiseta pendiente de pedir (aún no está en ningún lote)
export interface PendingLine {
  lineId: number;
  orderId: number;
  orderNumber: string;
  orderDate: string;
  // Nulos si el pedido es para uno mismo
  customerId: number | null;
  customerName: string | null;
  productId: number;
  productName: string;
  kitName: string;
  size: string;
  status: LineStatus;
  customizations: ShirtCustomization[];
  totalSale: number;
  totalCost: number;
}

export interface BatchSummary {
  id: number;
  batchNumber: string;
  status: BatchStatus;
  createdAt: string;
  sentAt: string | null;
  receivedAt: string | null;
  lineCount: number;
  missingCount: number;
  shippingCost: number;
}

export interface BatchLine {
  lineId: number;
  orderId: number;
  orderNumber: string;
  orderDate: string;
  customerName: string | null;
  productName: string;
  kitName: string;
  size: string;
  sizeLabel: string;
  status: LineStatus;
  customizations: ShirtCustomization[];
  totalSale: number;
  totalCost: number;
  shippingShare: number;
  profit: number;
}

// Camiseta que se pidió en el lote pero no llegó
export interface MissingLine {
  lineId: number;
  orderId: number;
  orderNumber: string;
  customerName: string | null;
  productName: string;
  kitName: string;
  size: string;
  sizeLabel: string;
  status: LineStatus;
  customizations: ShirtCustomization[];
}

export interface BatchDetails {
  id: number;
  batchNumber: string;
  status: BatchStatus;
  notes: string | null;
  createdAt: string;
  sentAt: string | null;
  receivedAt: string | null;
  shippingCost: number;
  lines: BatchLine[];
  totals: { activeLines: number; sale: number; cost: number; shipping: number; profit: number };
  missingLines: MissingLine[];
}

export interface CreateBatchRequest {
  lineIds: number[];
  shippingCost: number;
  notes: string | null;
}

export interface UpdateBatchRequest {
  shippingCost: number;
  notes: string | null;
}

// Lo que cobra normalmente el fabricante por el envío de un lote; se puede cambiar en cada lote
export const DEFAULT_SHIPPING_COST = 4;
