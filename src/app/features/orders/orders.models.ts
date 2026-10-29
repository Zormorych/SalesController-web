// Modelos de la API de pedidos (/api/sales/orders). Fechas como texto ISO: "2026-10-19"

export type LineStatus =
  | 'PENDING'
  | 'ORDERED'
  | 'RECEIVED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'STOCKED_PAID'
  | 'STOCKED_REFUNDED';

export type OrderStatus = 'OPEN' | 'CANCELLED';

export type OrderProgress =
  'PENDING' | 'IN_PROGRESS' | 'READY_TO_DELIVER' | 'COMPLETED' | 'CANCELLED';

export interface LineCounts {
  pending: number;
  ordered: number;
  received: number;
  delivered: number;
  cancelled: number;
  stocked: number;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  progress: OrderProgress;
  // Nulos si el pedido es para uno mismo
  customerId: number | null;
  customerName: string | null;
  activeLines: number;
  totalSale: number;
  totalProfit: number;
  lineCounts: LineCounts;
}

export interface LineCustomization {
  id: number;
  customizationId: number;
  customizationName: string;
  customText: string | null;
  salePrice: number;
  purchaseCost: number;
}

export interface OrderLine {
  id: number;
  productId: number;
  productName: string;
  kitName: string;
  size: string;
  sizeLabel: string;
  unitSalePrice: number;
  unitPurchaseCost: number;
  status: LineStatus;
  customizations: LineCustomization[];
  totalSale: number;
  totalCost: number;
  profit: number;
}

export interface OrderDetails {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  progress: OrderProgress;
  notes: string | null;
  customer: { id: number; name: string; phone: string | null } | null;
  lines: OrderLine[];
  totals: { sale: number; cost: number; profit: number; activeLines: number };
  lineCounts: LineCounts;
}

// Peticiones. Los precios que se envían se usan tal cual (también 0); si faltan, el backend copia los del catálogo
export interface LineCustomizationRequest {
  customizationId: number;
  customText: string | null;
  salePrice: number | null;
  purchaseCost: number | null;
}

export interface OrderLineRequest {
  productId: number;
  kitName: string;
  size: string;
  unitSalePrice: number | null;
  unitPurchaseCost: number | null;
  customizations: LineCustomizationRequest[];
}

export interface CreateOrderRequest {
  // null: pedido para uno mismo
  customerId: number | null;
  orderDate: string | null;
  notes: string | null;
  lines: OrderLineRequest[];
}

export interface UpdateOrderRequest {
  customerId: number | null;
  orderDate: string;
  notes: string | null;
}
