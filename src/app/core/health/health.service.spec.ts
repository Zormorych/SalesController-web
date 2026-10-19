import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SILENT_ERRORS } from '../http/error.interceptor';
import { BackendHealth, HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(HealthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks the backend for its health', () => {
    const response: BackendHealth = {
      status: 'UP',
      application: 'sales-manager-backend',
      timestamp: '2026-10-19T08:00:00Z',
    };
    let received: BackendHealth | undefined;

    service.check().subscribe((health) => (received = health));
    const request = http.expectOne('/api/health');
    request.flush(response);

    expect(request.request.method).toBe('GET');
    // La página de inicio muestra su propio aviso si el backend no responde
    expect(request.request.context.get(SILENT_ERRORS)).toBe(true);
    expect(received).toEqual(response);
  });
});
