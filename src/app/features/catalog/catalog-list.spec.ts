import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideSpanishLocale } from '../../core/locale';
import { CatalogItem } from './catalog.models';
import { CatalogList } from './catalog-list';

describe('CatalogList', () => {
  let http: HttpTestingController;
  const dialog = { open: vi.fn() };
  const fan: CatalogItem = {
    id: 1,
    name: 'Camiseta Fan',
    salePrice: 15,
    purchaseCost: 6.5,
    active: true,
  };
  const kids: CatalogItem = {
    id: 2,
    name: 'Camiseta Kids',
    salePrice: 12,
    purchaseCost: 5,
    active: false,
  };

  beforeEach(() => {
    dialog.open.mockReset();
    TestBed.configureTestingModule({
      imports: [CatalogList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideSpanishLocale(),
        { provide: MatDialog, useValue: dialog },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function render(items: CatalogItem[]) {
    const fixture = TestBed.createComponent(CatalogList);
    fixture.componentRef.setInput('kind', 'products');
    TestBed.tick();
    http.expectOne('/api/catalog/products?includeInactive=false').flush(items);
    await fixture.whenStable();
    return fixture;
  }

  function rows(page: HTMLElement) {
    return Array.from(page.querySelectorAll('tr[mat-row]')).map((row) =>
      Array.from(row.querySelectorAll('td'))
        .slice(0, 5)
        .map((cell) => cell.textContent!.replace(/\s+/g, ' ').trim()),
    );
  }

  it('shows each item with its prices and profit in euros', async () => {
    const fixture = await render([fan]);

    expect(rows(fixture.nativeElement)).toEqual([
      ['Camiseta Fan', '15,00 €', '6,50 €', '8,50 €', 'Activo'],
    ]);
  });

  it('shows the description under the name, with its address as a link', async () => {
    const fixture = await render([{ ...fan, description: 'https://fabricante.example/fan-1' }]);
    const cell = (fixture.nativeElement as HTMLElement).querySelector('tr[mat-row] td')!;

    expect(cell.querySelector('a')?.getAttribute('href')).toBe('https://fabricante.example/fan-1');
  });

  it('asks for the inactive ones too when the switch is turned on', async () => {
    const fixture = await render([fan]);
    const page = fixture.nativeElement as HTMLElement;

    page.querySelector<HTMLButtonElement>('mat-slide-toggle button')!.click();
    TestBed.tick();
    http.expectOne('/api/catalog/products?includeInactive=true').flush([fan, kids]);
    await fixture.whenStable();

    expect(rows(page).map((row) => row[4])).toEqual(['Activo', 'Inactivo']);
  });

  it('creates an item with the dialog data and reloads the list', async () => {
    const fixture = await render([]);
    const page = fixture.nativeElement as HTMLElement;
    const request = {
      name: 'Camiseta Fan',
      salePrice: 15,
      purchaseCost: 6.5,
      description: null,
    };
    // Como el diálogo real: guarda con la función que recibe y se cierra con lo guardado
    dialog.open.mockImplementation((_component, config) => ({
      afterClosed: () => config.data.save(request),
    }));

    page.querySelector<HTMLButtonElement>('[data-testid="new"]')!.click();
    const created = http.expectOne('/api/catalog/products');
    expect(created.request.body).toEqual(request);
    created.flush(fan);
    TestBed.tick();
    http.expectOne('/api/catalog/products?includeInactive=false').flush([fan]);
    await fixture.whenStable();

    expect(rows(page)).toHaveLength(1);
  });

  it('does nothing when the dialog is closed without saving', async () => {
    const fixture = await render([fan]);
    dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="new"]')!
      .click();

    http.expectNone('/api/catalog/products');
  });

  it('deactivates an item and reloads the list', async () => {
    const fixture = await render([fan]);
    const page = fixture.nativeElement as HTMLElement;

    page.querySelector<HTMLButtonElement>('[data-testid="toggle-active"]')!.click();
    http.expectOne('/api/catalog/products/1/deactivate').flush({ ...fan, active: false });
    TestBed.tick();
    http.expectOne('/api/catalog/products?includeInactive=false').flush([]);
    await fixture.whenStable();

    expect(rows(page)).toEqual([]);
  });
});
