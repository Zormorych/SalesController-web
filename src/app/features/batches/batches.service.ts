import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  BatchDetails,
  BatchSummary,
  CreateBatchRequest,
  PendingLine,
  UpdateBatchRequest,
} from './batches.models';

const BASE = '/api/purchasing';

@Injectable({ providedIn: 'root' })
export class BatchesService {
  private readonly http = inject(HttpClient);

  // Camisetas por pedir que aún no están en ningún lote
  pendingLines(): Observable<PendingLine[]> {
    return this.http.get<PendingLine[]>(`${BASE}/pending-lines`);
  }

  list(): Observable<BatchSummary[]> {
    return this.http.get<BatchSummary[]>(`${BASE}/batches`);
  }

  get(id: number): Observable<BatchDetails> {
    return this.http.get<BatchDetails>(`${BASE}/batches/${id}`);
  }

  create(request: CreateBatchRequest): Observable<BatchDetails> {
    return this.http.post<BatchDetails>(`${BASE}/batches`, request);
  }

  // El envío se puede corregir también con el lote ya enviado (la factura real llega después)
  update(id: number, request: UpdateBatchRequest): Observable<BatchDetails> {
    return this.http.put<BatchDetails>(`${BASE}/batches/${id}`, request);
  }

  // Añadir y quitar camisetas, enviar y descartar solo se puede con el lote abierto
  addLines(id: number, lineIds: number[]): Observable<BatchDetails> {
    return this.http.post<BatchDetails>(`${BASE}/batches/${id}/lines`, { lineIds });
  }

  removeLine(id: number, lineId: number): Observable<BatchDetails> {
    return this.http.post<BatchDetails>(`${BASE}/batches/${id}/lines/${lineId}/remove`, null);
  }

  // Sus camisetas pasan a "pedidas" y ya no se pueden editar en el pedido
  send(id: number): Observable<BatchDetails> {
    return this.http.post<BatchDetails>(`${BASE}/batches/${id}/send`, null);
  }

  // Descartar deja libres sus camisetas para pedirlas en otro lote
  cancel(id: number): Observable<BatchDetails> {
    return this.http.post<BatchDetails>(`${BASE}/batches/${id}/cancel`, null);
  }

  // Llega el pedido del fabricante. Las que no llegan vuelven a quedar pendientes de pedir y salen del lote;
  // si no llega ninguna, el backend lo rechaza
  receive(id: number, missingLineIds: number[]): Observable<BatchDetails> {
    return this.http.post<BatchDetails>(`${BASE}/batches/${id}/receive`, { missingLineIds });
  }

  // Una que no llegó la manda después el fabricante: vuelve al lote como recibida y comparte el envío
  markArrived(id: number, lineId: number): Observable<BatchDetails> {
    return this.http.post<BatchDetails>(
      `${BASE}/batches/${id}/missing-lines/${lineId}/arrived`,
      null,
    );
  }

  // El Excel para el fabricante, con el nombre de fichero que da el backend ("FB-2026-0004.xlsx")
  excel(id: number): Observable<{ name: string; content: Blob }> {
    return this.http
      .get(`${BASE}/batches/${id}/excel`, { observe: 'response', responseType: 'blob' })
      .pipe(
        map((response: HttpResponse<Blob>) => ({
          name: fileName(response.headers.get('Content-Disposition')) ?? `lote-${id}.xlsx`,
          content: response.body!,
        })),
      );
  }
}

function fileName(contentDisposition: string | null): string | null {
  return contentDisposition?.match(/filename="?([^";]+)"?/)?.[1] ?? null;
}
