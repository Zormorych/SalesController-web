import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { provideRouter } from '@angular/router';
import { provideSpanishLocale } from '../../core/locale';
import { Customer } from '../customers/customers.models';
import { OrderSummary } from './orders.models';
import { OrdersPage } from './orders-page';

describe('OrdersPage', () => {
  let http: HttpTestingController;
  const ana: Customer = { id: 3, name: 'Ana Pérez', phone: null, notes: null };
  const order: OrderSummary = {
    id: 5,
    orderNumber: 'SO-2026-000005',
    orderDate: '2026-10-05',
    status: 'OPEN',
    progress: 'IN_PROGRESS',
    customerId: 3,
    customerName: 'Ana Pérez',
    activeLines: 2,
    totalSale: 32,
    totalProfit: 17.8,
    lineCounts: { pending: 1, ordered: 1, received: 0, delivered: 0, cancelled: 0, stocked: 0 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrdersPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideSpanishLocale(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function render() {
    const fixture = TestBed.createComponent(OrdersPage);
    TestBed.tick();
    http.expectOne('/api/customers').flush([ana]);
    http.expectOne('/api/sales/orders').flush([order]);
    await fixture.whenStable();
    return fixture;
  }

  it('lists orders with their date, customer, totals and progress, linking to their detail', async () => {
    const fixture = await render();
    const page = fixture.nativeElement as HTMLElement;
    const cells = Array.from(page.querySelectorAll('tr[mat-row] td')).map((cell) =>
      cell.textContent!.replace(/\s+/g, ' ').trim(),
    );

    expect(cells).toEqual([
      'SO-2026-000005',
      '05/10/2026',
      'Ana Pérez',
      '2',
      '32,00 €',
      '17,80 €',
      'En curso',
    ]);
    expect(page.querySelector('tr[mat-row] a')?.getAttribute('href')).toBe('/pedidos/5');
  });

  it('says when an order has no customer', async () => {
    const fixture = TestBed.createComponent(OrdersPage);
    TestBed.tick();
    http.expectOne('/api/customers').flush([ana]);
    http.expectOne('/api/sales/orders').flush([{ ...order, customerId: null, customerName: null }]);
    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('tr[mat-row] td')[2].textContent,
    ).toContain('Sin cliente');
  });

  it('shows only the orders of the chosen customer', async () => {
    const fixture = await render();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const select = await loader.getHarness(MatSelectHarness);

    await select.open();
    // El harness espera a que la página quede estable, y eso no pasa hasta responder a la petición del filtro
    const choosing = select.clickOptions({ text: 'Ana Pérez' });
    await vi.waitFor(() => http.expectOne('/api/sales/orders?customerId=3').flush([order]));
    await choosing;
  });

  it('has a button to create a new order', async () => {
    const fixture = await render();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('a[data-testid="new"]')
        ?.getAttribute('href'),
    ).toBe('/pedidos/nuevo');
  });
});
