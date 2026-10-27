import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideSpanishLocale } from '../../core/locale';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { ResaleItem } from './resale.models';
import { SellDialog } from './sell-dialog';
import { StockPage } from './stock-page';

describe('StockPage', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<StockPage>;
  let page: HTMLElement;
  const dialog = { open: vi.fn() };

  const jacket: ResaleItem = {
    id: 3,
    name: 'Chaqueta Nike vintage',
    size: 'L',
    notes: null,
    origin: 'MANUAL',
    salesOrderLineId: null,
    purchaseCost: 11.7,
    purchaseDate: '2026-10-02',
    askingPrice: 20,
    status: 'AVAILABLE',
    salePrice: null,
    saleDate: null,
    profit: null,
  };
  const shirt: ResaleItem = {
    ...jacket,
    id: 4,
    name: 'Camiseta Fan · Betis local',
    size: 'M',
    origin: 'ORDER_LINE',
    salesOrderLineId: 7,
    purchaseCost: 8,
    askingPrice: null,
    status: 'SOLD',
    salePrice: 15,
    saleDate: '2026-10-20',
    profit: 7,
  };

  beforeEach(() => {
    dialog.open.mockReset();
    TestBed.configureTestingModule({
      imports: [StockPage],
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

  async function render(items: ResaleItem[]) {
    fixture = TestBed.createComponent(StockPage);
    TestBed.tick();
    http.expectOne('/api/resale/items?status=AVAILABLE').flush(items);
    await fixture.whenStable();
    page = fixture.nativeElement as HTMLElement;
  }

  function rows() {
    return Array.from(page.querySelectorAll('tr[mat-row]')).map((row) =>
      Array.from(row.querySelectorAll('td'))
        .slice(0, 7)
        .map((cell) => cell.textContent!.replace(/\s+/g, ' ').trim()),
    );
  }

  function button(testId: string, within: ParentNode = page) {
    return within.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);
  }

  it('starts with the items available, showing cost, asking price and where they came from', async () => {
    await render([jacket]);

    expect(rows()).toEqual([
      ['Chaqueta Nike vintage', 'L', 'Comprada', '11,70 €', '20,00 €', '', ''],
    ]);
    expect(button('sell')).toBeTruthy();
    expect(button('unsell')).toBeNull();
  });

  it('shows the sold ones with their sale price and profit, and lets undo a sale after confirming', async () => {
    await render([jacket]);
    page.querySelector<HTMLButtonElement>('[data-testid="filter-SOLD"]')!.click();
    TestBed.tick();
    http.expectOne('/api/resale/items?status=SOLD').flush([shirt]);
    await fixture.whenStable();

    expect(rows()).toEqual([
      ['Camiseta Fan · Betis local', 'M', 'De un pedido', '8,00 €', '', '15,00 €', '7,00 €'],
    ]);

    dialog.open.mockImplementation((component) => ({
      afterClosed: () => of(component === ConfirmDialog),
    }));
    button('unsell')!.click();
    http.expectOne({ method: 'POST', url: '/api/resale/items/4/unsell' }).flush({});
    TestBed.tick();
    http.expectOne('/api/resale/items?status=SOLD').flush([]);
    await fixture.whenStable();

    expect(rows()).toEqual([]);
  });

  it('sells an item with the dialog and reloads the list', async () => {
    await render([jacket]);
    dialog.open.mockImplementation((_component, config) => ({
      afterClosed: () => config.data.save({ salePrice: 17.7, saleDate: '2026-10-27' }),
    }));

    button('sell')!.click();
    const sold = http.expectOne('/api/resale/items/3/sell');
    expect(sold.request.body).toEqual({ salePrice: 17.7, saleDate: '2026-10-27' });
    sold.flush({ ...jacket, status: 'SOLD' });
    TestBed.tick();
    http.expectOne('/api/resale/items?status=AVAILABLE').flush([]);
    await fixture.whenStable();

    expect(dialog.open.mock.calls[0][0]).toBe(SellDialog);
  });

  it('adds a new item with the dialog', async () => {
    await render([]);
    const request = {
      name: 'Sudadera Adidas',
      size: null,
      notes: null,
      purchaseCost: 8,
      purchaseDate: null,
      askingPrice: null,
    };
    dialog.open.mockImplementation((_component, config) => ({
      afterClosed: () => config.data.save(request),
    }));

    button('new')!.click();
    const created = http.expectOne({ method: 'POST', url: '/api/resale/items' });
    expect(created.request.body).toEqual(request);
    created.flush(jacket);
    TestBed.tick();
    http.expectOne('/api/resale/items?status=AVAILABLE').flush([jacket]);
    await fixture.whenStable();

    expect(rows()).toHaveLength(1);
  });
});
