import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentSummary, RegisterPaymentRequest } from './payments.models';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly http = inject(HttpClient);

  summary(orderId: number): Observable<PaymentSummary> {
    return this.http.get<PaymentSummary>(this.base(orderId));
  }

  // El backend rechaza (409) un cobro mayor que lo pendiente o en un pedido cancelado
  register(orderId: number, request: RegisterPaymentRequest): Observable<PaymentSummary> {
    return this.http.post<PaymentSummary>(this.base(orderId), request);
  }

  // Anular no borra: el cobro queda en la lista y deja de contar
  voidPayment(orderId: number, paymentId: number): Observable<PaymentSummary> {
    return this.http.post<PaymentSummary>(`${this.base(orderId)}/${paymentId}/void`, null);
  }

  private base(orderId: number): string {
    return `/api/sales/orders/${orderId}/payments`;
  }
}
