import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateOrderRequest,
  OrderDetails,
  OrderLineRequest,
  OrderSummary,
  UpdateOrderRequest,
} from './orders.models';

const BASE = '/api/sales/orders';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);

  list(customerId: number | null): Observable<OrderSummary[]> {
    return this.http.get<OrderSummary[]>(BASE, {
      params: customerId === null ? {} : { customerId },
    });
  }

  get(id: number): Observable<OrderDetails> {
    return this.http.get<OrderDetails>(`${BASE}/${id}`);
  }

  create(request: CreateOrderRequest): Observable<OrderDetails> {
    return this.http.post<OrderDetails>(BASE, request);
  }

  // Cliente, fecha y notas
  update(id: number, request: UpdateOrderRequest): Observable<OrderDetails> {
    return this.http.put<OrderDetails>(`${BASE}/${id}`, request);
  }

  // Solo se puede si el pedido no tiene camisetas ya pedidas al fabricante
  cancel(id: number): Observable<OrderDetails> {
    return this.http.post<OrderDetails>(`${BASE}/${id}/cancel`, null);
  }

  // Entregar al cliente una camiseta ya recibida, o todas las recibidas de golpe
  deliverLine(id: number, lineId: number): Observable<OrderDetails> {
    return this.http.post<OrderDetails>(`${BASE}/${id}/lines/${lineId}/deliver`, null);
  }

  deliverAll(id: number): Observable<OrderDetails> {
    return this.http.post<OrderDetails>(`${BASE}/${id}/deliver`, null);
  }

  addLine(id: number, line: OrderLineRequest): Observable<OrderDetails> {
    return this.http.post<OrderDetails>(`${BASE}/${id}/lines`, line);
  }

  // Editar y cancelar solo se puede con la camiseta aún por pedir
  updateLine(id: number, lineId: number, line: OrderLineRequest): Observable<OrderDetails> {
    return this.http.put<OrderDetails>(`${BASE}/${id}/lines/${lineId}`, line);
  }

  cancelLine(id: number, lineId: number): Observable<OrderDetails> {
    return this.http.post<OrderDetails>(`${BASE}/${id}/lines/${lineId}/cancel`, null);
  }
}
