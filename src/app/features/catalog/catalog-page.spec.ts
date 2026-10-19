import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideSpanishLocale } from '../../core/locale';
import { CatalogPage } from './catalog-page';

describe('CatalogPage', () => {
  it('has a tab for products, shown first, and another for customizations', async () => {
    TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideSpanishLocale()],
    });
    const fixture = TestBed.createComponent(CatalogPage);
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/catalog/products?includeInactive=false').flush([]);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('h1')?.textContent).toContain('Catálogo');
    expect(
      Array.from(page.querySelectorAll('[role="tab"]')).map((tab) => tab.textContent?.trim()),
    ).toEqual(['Productos', 'Personalizaciones']);
    http.verify();
  });
});
