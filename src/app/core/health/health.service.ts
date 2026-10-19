import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Respuesta de GET /api/health del backend
export interface BackendHealth {
  status: string;
  application: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);

  check(): Observable<BackendHealth> {
    return this.http.get<BackendHealth>('/api/health');
  }
}
