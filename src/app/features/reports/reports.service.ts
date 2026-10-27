import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BatchTotals, PendingWork, SalesSummary } from './reports.models';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);

  // Las dos fechas incluidas. El backend rechaza (400) un periodo que empieza después de terminar
  summary(from: string, to: string): Observable<SalesSummary> {
    return this.http.get<SalesSummary>('/api/reports/summary', { params: { from, to } });
  }

  // Lo que queda por hacer ahora mismo (no depende del periodo)
  pending(): Observable<PendingWork> {
    return this.http.get<PendingWork>('/api/reports/pending');
  }

  // Lotes no descartados, del más reciente al más antiguo
  batches(): Observable<BatchTotals[]> {
    return this.http.get<BatchTotals[]>('/api/reports/batches');
  }
}
