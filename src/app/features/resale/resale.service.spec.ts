import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ResaleService } from './resale.service';

describe('ResaleService', () => {
  let service: ResaleService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ResaleService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists every item or only those with a status', () => {
    service.list(null).subscribe();
    service.list('AVAILABLE').subscribe();

    http.expectOne('/api/resale/items');
    http.expectOne('/api/resale/items?status=AVAILABLE');
  });

  it('creates, edits, sells and unsells an item', () => {
    const item = {
      name: 'Chaqueta Nike vintage',
      size: 'L',
      notes: null,
      purchaseCost: 11.7,
      purchaseDate: '2026-10-02',
      askingPrice: 20,
    };

    service.create(item).subscribe();
    service.update(3, item).subscribe();
    service.sell(3, { salePrice: 17.7, saleDate: '2026-10-15' }).subscribe();
    service.unsell(3).subscribe();

    expect(http.expectOne({ method: 'POST', url: '/api/resale/items' }).request.body).toEqual(item);
    expect(http.expectOne({ method: 'PUT', url: '/api/resale/items/3' }).request.body).toEqual(
      item,
    );
    expect(http.expectOne('/api/resale/items/3/sell').request.body).toEqual({
      salePrice: 17.7,
      saleDate: '2026-10-15',
    });
    http.expectOne({ method: 'POST', url: '/api/resale/items/3/unsell' });
  });

  it('moves a received shirt of an order to stock', () => {
    const request = { lineId: 7, customerPays: false, askingPrice: 18 };

    service.moveFromOrderLine(request).subscribe();

    expect(http.expectOne('/api/resale/items/from-order-line').request.body).toEqual(request);
  });
});
