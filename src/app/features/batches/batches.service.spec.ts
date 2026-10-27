import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BatchesService } from './batches.service';

describe('BatchesService', () => {
  let service: BatchesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BatchesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reads the shirts pending to order, the batches and one batch', () => {
    service.pendingLines().subscribe();
    service.list().subscribe();
    service.get(4).subscribe();

    http.expectOne('/api/purchasing/pending-lines');
    http.expectOne('/api/purchasing/batches');
    http.expectOne('/api/purchasing/batches/4');
  });

  it('creates a batch and changes its shipping, shirts and status', () => {
    const create = { lineIds: [7, 8], shippingCost: 4, notes: null };

    service.create(create).subscribe();
    service.update(4, { shippingCost: 4.5, notes: 'Factura 123' }).subscribe();
    service.addLines(4, [9]).subscribe();
    service.removeLine(4, 9).subscribe();
    service.send(4).subscribe();
    service.cancel(4).subscribe();

    expect(http.expectOne({ method: 'POST', url: '/api/purchasing/batches' }).request.body).toEqual(
      create,
    );
    expect(
      http.expectOne({ method: 'PUT', url: '/api/purchasing/batches/4' }).request.body,
    ).toEqual({
      shippingCost: 4.5,
      notes: 'Factura 123',
    });
    expect(http.expectOne('/api/purchasing/batches/4/lines').request.body).toEqual({
      lineIds: [9],
    });
    http.expectOne({ method: 'POST', url: '/api/purchasing/batches/4/lines/9/remove' });
    http.expectOne({ method: 'POST', url: '/api/purchasing/batches/4/send' });
    http.expectOne({ method: 'POST', url: '/api/purchasing/batches/4/cancel' });
  });

  it('receives a batch saying which shirts did not arrive, and a late arrival', () => {
    service.receive(4, [8]).subscribe();
    service.markArrived(4, 8).subscribe();

    expect(http.expectOne('/api/purchasing/batches/4/receive').request.body).toEqual({
      missingLineIds: [8],
    });
    http.expectOne({ method: 'POST', url: '/api/purchasing/batches/4/missing-lines/8/arrived' });
  });

  it('downloads the Excel with the file name the backend gives', () => {
    let file: { name: string; content: Blob } | undefined;

    service.excel(4).subscribe((result) => (file = result));
    const request = http.expectOne('/api/purchasing/batches/4/excel');
    request.flush(new Blob(['xlsx']), {
      headers: { 'Content-Disposition': 'attachment; filename="FB-2026-0004.xlsx"' },
    });

    expect(request.request.responseType).toBe('blob');
    expect(file?.name).toBe('FB-2026-0004.xlsx');
  });
});
