import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CustomersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists every customer, or only those matching a name or phone', () => {
    service.list('').subscribe();
    service.list('  ana ').subscribe();

    expect(http.expectOne('/api/customers').request.method).toBe('GET');
    expect(http.expectOne('/api/customers?search=ana').request.method).toBe('GET');
  });

  it('creates and updates a customer', () => {
    const request = { name: 'Ana Pérez', phone: '+34 600 123 456', notes: 'Talla M' };

    service.create(request).subscribe();
    service.update(7, request).subscribe();

    const created = http.expectOne('/api/customers');
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual(request);
    const updated = http.expectOne('/api/customers/7');
    expect(updated.request.method).toBe('PUT');
    expect(updated.request.body).toEqual(request);
  });
});
