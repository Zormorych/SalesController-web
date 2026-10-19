import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SILENT_ERRORS } from '../http/error.interceptor';

// Respuesta de GET /api/health del backend
export interface BackendHealth {
  status: string;
  application: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);

  // Silenciosa: la página de inicio ya muestra si el backend no responde
  check(): Observable<BackendHealth> {
    return this.http.get<BackendHealth>('/api/health', {
      context: new HttpContext().set(SILENT_ERRORS, true),
    });
  }
}
