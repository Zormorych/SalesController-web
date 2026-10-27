import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  MoveToStockRequest,
  ResaleItem,
  ResaleItemRequest,
  ResaleItemStatus,
  SellRequest,
} from './resale.models';

const BASE = '/api/resale/items';

@Injectable({ providedIn: 'root' })
export class ResaleService {
  private readonly http = inject(HttpClient);

  // Sin estado: todas, de la más reciente a la más antigua
  list(status: ResaleItemStatus | null): Observable<ResaleItem[]> {
    return this.http.get<ResaleItem[]>(BASE, { params: status ? { status } : {} });
  }

  create(request: ResaleItemRequest): Observable<ResaleItem> {
    return this.http.post<ResaleItem>(BASE, request);
  }

  // Se puede editar en cualquier estado para corregir errores; no cambia el estado ni la venta
  update(id: number, request: ResaleItemRequest): Observable<ResaleItem> {
    return this.http.put<ResaleItem>(`${BASE}/${id}`, request);
  }

  sell(id: number, request: SellRequest): Observable<ResaleItem> {
    return this.http.post<ResaleItem>(`${BASE}/${id}/sell`, request);
  }

  // Para corregir una venta apuntada por error: vuelve a estar disponible
  unsell(id: number): Observable<ResaleItem> {
    return this.http.post<ResaleItem>(`${BASE}/${id}/unsell`, null);
  }

  // Una camiseta recibida que el cliente ya no quiere
  moveFromOrderLine(request: MoveToStockRequest): Observable<ResaleItem> {
    return this.http.post<ResaleItem>(`${BASE}/from-order-line`, request);
  }
}
