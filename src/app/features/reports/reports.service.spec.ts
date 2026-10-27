import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  it('asks for the summary of a period, the pending work and the batch figures', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(ReportsService);
    const http = TestBed.inject(HttpTestingController);

    service.summary('2026-10-01', '2026-10-31').subscribe();
    service.pending().subscribe();
    service.batches().subscribe();

    http.expectOne('/api/reports/summary?from=2026-10-01&to=2026-10-31');
    http.expectOne('/api/reports/pending');
    http.expectOne('/api/reports/batches');
    http.verify();
  });
});
