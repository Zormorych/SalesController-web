import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrderLineRequest } from './orders.models';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let http: HttpTestingController;
  const line: OrderLineRequest = {
    productId: 1,
    kitName: 'Selección Española blanca',
    size: 'M',
    unitSalePrice: 15,
    unitPurchaseCost: 6.5,
    customizations: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrdersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists every order or only those of a customer', () => {
    service.list(null).subscribe();
    service.list(3).subscribe();

    expect(http.expectOne('/api/sales/orders').request.method).toBe('GET');
    expect(http.expectOne('/api/sales/orders?customerId=3').request.method).toBe('GET');
  });

  it('gets, creates and updates the header of an order', () => {
    const order = { customerId: 3, orderDate: '2026-10-19', notes: null };

    service.get(5).subscribe();
    service.create({ ...order, lines: [line] }).subscribe();
    service.update(5, order).subscribe();

    http.expectOne({ method: 'GET', url: '/api/sales/orders/5' });
    const created = http.expectOne((req) => req.method === 'POST');
    expect(created.request.url).toBe('/api/sales/orders');
    expect(created.request.body).toEqual({ ...order, lines: [line] });
    const updated = http.expectOne((req) => req.method === 'PUT');
    expect(updated.request.url).toBe('/api/sales/orders/5');
    expect(updated.request.body).toEqual(order);
  });

  it('delivers one received shirt or all of them', () => {
    service.deliverLine(5, 9).subscribe();
    service.deliverAll(5).subscribe();

    http.expectOne({ method: 'POST', url: '/api/sales/orders/5/lines/9/deliver' });
    http.expectOne({ method: 'POST', url: '/api/sales/orders/5/deliver' });
  });

  it('adds, edits and cancels lines, and cancels the whole order', () => {
    service.addLine(5, line).subscribe();
    service.updateLine(5, 9, line).subscribe();
    service.cancelLine(5, 9).subscribe();
    service.cancel(5).subscribe();

    expect(http.expectOne('/api/sales/orders/5/lines').request.body).toEqual(line);
    const updated = http.expectOne('/api/sales/orders/5/lines/9');
    expect(updated.request.method).toBe('PUT');
    expect(http.expectOne('/api/sales/orders/5/lines/9/cancel').request.method).toBe('POST');
    expect(http.expectOne('/api/sales/orders/5/cancel').request.method).toBe('POST');
  });
});
