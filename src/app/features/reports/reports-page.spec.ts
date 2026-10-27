import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideSpanishLocale } from '../../core/locale';
import { lastMonth, thisMonth } from '../../shared/periods';
import { PendingWork, SalesSummary } from './reports.models';
import { ReportsPage } from './reports-page';

describe('ReportsPage', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<ReportsPage>;
  let page: HTMLElement;

  const summary: SalesSummary = {
    from: '2026-10-01',
    to: '2026-10-31',
    orders: 2,
    shirts: 3,
    sale: 47,
    cost: 20.7,
    shipping: 4.5,
    profit: 21.8,
    collected: 45,
    resale: { items: 1, sale: 17.7, cost: 11.7, profit: 6 },
    totalProfit: 27.8,
  };
  const pending: PendingWork = {
    shirtsToOrder: 1,
    shirtsToReceive: 3,
    shirtsToDeliver: 0,
    ordersToCollect: 2,
    amountToCollect: 27,
    amountToRefund: 10,
    itemsInStock: 2,
    stockValue: 8,
  };

  function summaryUrl(period: { from: string; to: string }) {
    return `/api/reports/summary?from=${period.from}&to=${period.to}`;
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ReportsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideSpanishLocale(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ReportsPage);
    TestBed.tick();
    http.expectOne(summaryUrl(thisMonth())).flush(summary);
    http.expectOne('/api/reports/pending').flush(pending);
    http.expectOne('/api/reports/batches').flush([
      {
        batchId: 4,
        batchNumber: 'FB-2026-0004',
        status: 'SENT',
        sentAt: '2026-10-19T09:00:00',
        receivedAt: null,
        shirts: 3,
        sale: 47,
        cost: 20.7,
        shipping: 4.5,
        profit: 21.8,
      },
    ]);
    await fixture.whenStable();
    page = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  // Etiqueta, valor y detalle de una tarjeta, separados por un espacio
  function tile(testId: string) {
    return Array.from(page.querySelectorAll(`[data-testid="${testId}"] > span`))
      .map((part) => part.textContent!.replace(/\s+/g, ' ').trim())
      .join(' ');
  }

  it('starts with this month and leads with the total profit', () => {
    expect(page.querySelector<HTMLInputElement>('input[name="from"]')!.value).toBe(
      thisMonth().from,
    );
    expect(page.querySelector<HTMLInputElement>('input[name="to"]')!.value).toBe(thisMonth().to);
    expect(tile('total-profit')).toBe('Beneficio total 27,80 €');
  });

  it('shows the figures of the period', () => {
    expect(tile('orders')).toBe('Pedidos 2');
    expect(tile('shirts')).toBe('Camisetas 3');
    expect(tile('sale')).toBe('Venta 47,00 €');
    expect(tile('cost')).toBe('Coste 20,70 €');
    expect(tile('shipping')).toBe('Envío 4,50 €');
    expect(tile('profit')).toBe('Beneficio de pedidos 21,80 €');
    expect(tile('resale')).toBe('Beneficio de reventa 6,00 € 1 prenda vendida');
    expect(tile('collected')).toBe('Cobrado 45,00 €');
  });

  it('shows the pending work, linking to where it is done', () => {
    expect(tile('to-order')).toBe('Camisetas por pedir 1');
    expect(tile('to-receive')).toBe('Camisetas por recibir 3');
    expect(tile('to-deliver')).toBe('Camisetas por entregar 0');
    expect(tile('to-collect')).toBe('Por cobrar 27,00 € en 2 pedidos');
    expect(tile('to-refund')).toBe('Por devolver 10,00 €');
    expect(tile('stock')).toBe('En stock 8,00 € 2 prendas');
    expect(page.querySelector('[data-testid="to-order"]')?.getAttribute('href')).toBe(
      '/lotes/nuevo',
    );
  });

  it('lists the profit of each batch', () => {
    const cells = Array.from(page.querySelectorAll('tr[mat-row] td')).map((cell) =>
      cell.textContent!.replace(/\s+/g, ' ').trim(),
    );

    expect(cells).toEqual([
      'FB-2026-0004',
      'Enviado',
      '3',
      '47,00 €',
      '20,70 €',
      '4,50 €',
      '21,80 €',
    ]);
  });

  it('reloads the summary for last month with the shortcut', async () => {
    page.querySelector<HTMLButtonElement>('[data-testid="last-month"]')!.click();
    TestBed.tick();

    http.expectOne(summaryUrl(lastMonth())).flush({ ...summary, ...lastMonth() });
    await fixture.whenStable();
    expect(page.querySelector<HTMLInputElement>('input[name="from"]')!.value).toBe(
      lastMonth().from,
    );
  });

  it('does not ask for a period whose start is after its end', async () => {
    const from = page.querySelector<HTMLInputElement>('input[name="from"]')!;
    from.value = '2026-12-31';
    from.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    TestBed.tick();

    http.expectNone((request) => request.url === '/api/reports/summary');
    expect(page.textContent).toContain('La fecha de inicio es posterior a la de fin');
  });
});
