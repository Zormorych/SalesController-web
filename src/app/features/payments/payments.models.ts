// Modelos de la API de cobros de un pedido (/api/sales/orders/{id}/payments)

export type PaymentStatus = 'REGISTERED' | 'VOIDED';

export interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  status: PaymentStatus;
  notes: string | null;
}

// pendingAmount negativo: se ha cobrado de más (por ejemplo, un pedido cancelado ya pagado) y hay que devolverlo
export interface PaymentSummary {
  orderId: number;
  orderNumber: string;
  orderCancelled: boolean;
  orderTotal: number;
  paidAmount: number;
  pendingAmount: number;
  payments: Payment[];
}

// Sin fecha, el cobro se fecha hoy
export interface RegisterPaymentRequest {
  amount: number;
  paymentDate: string | null;
  notes: string | null;
}
