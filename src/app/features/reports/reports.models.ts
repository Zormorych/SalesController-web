import { BatchStatus } from '../batches/batches.models';

// Modelos de la API de informes (/api/reports)

// Resumen de un periodo. Pedidos por fecha de pedido; cobrado y reventa por fecha de cobro o de venta.
// profit = venta - coste - envío de los pedidos; totalProfit = profit + beneficio de la reventa
export interface SalesSummary {
  from: string;
  to: string;
  orders: number;
  shirts: number;
  sale: number;
  cost: number;
  shipping: number;
  profit: number;
  collected: number;
  resale: { items: number; sale: number; cost: number; profit: number };
  totalProfit: number;
}

export interface PendingWork {
  shirtsToOrder: number;
  shirtsToReceive: number;
  shirtsToDeliver: number;
  ordersToCollect: number;
  amountToCollect: number;
  amountToRefund: number;
  itemsInStock: number;
  stockValue: number;
}

export interface BatchTotals {
  batchId: number;
  batchNumber: string;
  status: BatchStatus;
  sentAt: string | null;
  receivedAt: string | null;
  shirts: number;
  sale: number;
  cost: number;
  shipping: number;
  profit: number;
}
