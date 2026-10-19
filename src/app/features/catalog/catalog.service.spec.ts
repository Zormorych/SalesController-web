import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists products, with or without the inactive ones', () => {
    service.list('products', false).subscribe();
    service.list('customizations', true).subscribe();

    expect(http.expectOne('/api/catalog/products?includeInactive=false').request.method).toBe(
      'GET',
    );
    expect(http.expectOne('/api/catalog/customizations?includeInactive=true').request.method).toBe(
      'GET',
    );
  });

  it('creates and updates an item with its prices', () => {
    const request = { name: 'Camiseta Player', salePrice: 17, purchaseCost: 7.7 };

    service.create('products', request).subscribe();
    service.update('products', 4, request).subscribe();

    const created = http.expectOne('/api/catalog/products');
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual(request);
    const updated = http.expectOne('/api/catalog/products/4');
    expect(updated.request.method).toBe('PUT');
    expect(updated.request.body).toEqual(request);
  });

  it('activates and deactivates an item', () => {
    service.setActive('customizations', 2, false).subscribe();
    service.setActive('customizations', 2, true).subscribe();

    expect(http.expectOne('/api/catalog/customizations/2/deactivate').request.method).toBe('POST');
    expect(http.expectOne('/api/catalog/customizations/2/activate').request.method).toBe('POST');
  });
});
