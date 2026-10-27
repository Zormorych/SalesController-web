import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideSpanishLocale } from '../../core/locale';
import { BatchSummary } from './batches.models';
import { BatchesPage } from './batches-page';

describe('BatchesPage', () => {
  const sent: BatchSummary = {
    id: 4,
    batchNumber: 'FB-2026-0004',
    status: 'SENT',
    createdAt: '2026-10-18T10:15:00',
    sentAt: '2026-10-19T09:00:00',
    receivedAt: null,
    lineCount: 12,
    missingCount: 0,
    shippingCost: 4,
  };

  it('lists the batches with their status, dates, shirts and shipping, linking to each one', async () => {
    TestBed.configureTestingModule({
      imports: [BatchesPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideSpanishLocale(),
        provideRouter([]),
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(BatchesPage);
    TestBed.tick();
    http.expectOne('/api/purchasing/batches').flush([sent]);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    const cells = Array.from(page.querySelectorAll('tr[mat-row] td')).map((cell) =>
      cell.textContent!.replace(/\s+/g, ' ').trim(),
    );
    expect(cells).toEqual(['FB-2026-0004', 'Enviado', '18/10/2026', '19/10/2026', '12', '4,00 €']);
    expect(page.querySelector('tr[mat-row] a')?.getAttribute('href')).toBe('/lotes/4');
    expect(page.querySelector('a[data-testid="new"]')?.getAttribute('href')).toBe('/lotes/nuevo');
    http.verify();
  });
});
