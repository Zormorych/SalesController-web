import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PaymentsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets what an order has paid and what is pending', () => {
    service.summary(5).subscribe();

    expect(http.expectOne('/api/sales/orders/5/payments').request.method).toBe('GET');
  });

  it('registers a payment and voids another', () => {
    const request = { amount: 10, paymentDate: '2026-10-20', notes: 'Bizum' };

    service.register(5, request).subscribe();
    service.voidPayment(5, 8).subscribe();

    const registered = http.expectOne({ method: 'POST', url: '/api/sales/orders/5/payments' });
    expect(registered.request.body).toEqual(request);
    expect(http.expectOne('/api/sales/orders/5/payments/8/void').request.method).toBe('POST');
  });
});
