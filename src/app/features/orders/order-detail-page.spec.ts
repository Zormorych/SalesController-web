import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideSpanishLocale } from '../../core/locale';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { OrderDetailPage } from './order-detail-page';
import { OrderLineDialog } from './order-line-dialog';
import { OrderDetails, OrderLine, OrderLineRequest } from './orders.models';

describe('OrderDetailPage', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<OrderDetailPage>;
  let page: HTMLElement;
  const dialog = { open: vi.fn() };

  const pending: OrderLine = {
    id: 7,
    productId: 1,
    productName: 'Camiseta Fan',
    kitName: 'Selección Española blanca',
    size: 'M',
    sizeLabel: 'M',
    unitSalePrice: 15,
    unitPurchaseCost: 6.5,
    status: 'PENDING',
    customizations: [
      {
        id: 1,
        customizationId: 2,
        customizationName: 'Nombre + número',
        customText: 'WILLIAMS JR 17',
        salePrice: 2,
        purchaseCost: 1.2,
      },
    ],
    totalSale: 17,
    totalCost: 7.7,
    profit: 9.3,
  };
  const ordered: OrderLine = {
    ...pending,
    id: 8,
    kitName: 'Betis local',
    size: 'L',
    sizeLabel: 'L',
    status: 'ORDERED',
    customizations: [],
    totalSale: 15,
    totalCost: 6.5,
    profit: 8.5,
  };
  const order: OrderDetails = {
    id: 5,
    orderNumber: 'SO-2026-000005',
    orderDate: '2026-10-05',
    status: 'OPEN',
    progress: 'IN_PROGRESS',
    notes: 'Recoge en mano',
    customer: { id: 3, name: 'Ana Pérez', phone: '+34600123456' },
    lines: [pending, ordered],
    totals: { sale: 32, cost: 14.2, profit: 17.8, activeLines: 2 },
    lineCounts: { pending: 1, ordered: 1, received: 0, delivered: 0, cancelled: 0, stocked: 0 },
  };

  beforeEach(() => {
    dialog.open.mockReset();
    TestBed.configureTestingModule({
      imports: [OrderDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideSpanishLocale(),
        provideRouter([]),
        { provide: MatDialog, useValue: dialog },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function render(details: OrderDetails) {
    fixture = TestBed.createComponent(OrderDetailPage);
    fixture.componentRef.setInput('id', '5');
    TestBed.tick();
    http.expectOne('/api/sales/orders/5').flush(details);
    // La sección de cobros pide su resumen en cuanto se pinta el pedido
    await vi.waitFor(() => {
      TestBed.tick();
      http.expectOne('/api/sales/orders/5/payments').flush({
        orderId: 5,
        orderNumber: details.orderNumber,
        orderCancelled: details.status === 'CANCELLED',
        orderTotal: details.totals.sale,
        paidAmount: 0,
        pendingAmount: details.totals.sale,
        payments: [],
      });
    });
    await fixture.whenStable();
    page = fixture.nativeElement as HTMLElement;
  }

  function rows(): string[][] {
    return Array.from(page.querySelectorAll('tr[mat-row]')).map((row) =>
      Array.from(row.querySelectorAll('td'))
        .slice(0, 7)
        .map((cell) => cell.textContent!.replace(/\s+/g, ' ').trim()),
    );
  }

  function button(testId: string, within: ParentNode = page) {
    return within.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);
  }

  // Responde "sí" o "no" a las confirmaciones; los diálogos de edición guardan con la petición dada
  function answerDialogs(confirm: boolean, request?: unknown) {
    dialog.open.mockImplementation((component, config) => ({
      afterClosed: () => (component === ConfirmDialog ? of(confirm) : config.data.save(request)),
    }));
  }

  it('shows the order with its customer, shirts and totals', async () => {
    await render(order);

    expect(page.querySelector('h1')?.textContent).toContain('SO-2026-000005');
    expect(
      page
        .querySelector('app-order-payments [data-testid="pending"]')
        ?.textContent?.replace(/\s+/g, ' '),
    ).toContain('32,00 €');
    expect(page.querySelector('.badge')?.textContent).toContain('En curso');
    expect(page.querySelector<HTMLAnchorElement>('a[data-testid="whatsapp"]')?.href).toBe(
      'https://wa.me/34600123456',
    );
    expect(page.textContent).toContain('Recoge en mano');
    expect(rows()).toEqual([
      [
        'Camiseta Fan · Selección Española blanca',
        'M',
        'Nombre + número: WILLIAMS JR 17',
        'Por pedir',
        '17,00 €',
        '7,70 €',
        '9,30 €',
      ],
      ['Camiseta Fan · Betis local', 'L', '', 'Pedida', '15,00 €', '6,50 €', '8,50 €'],
    ]);
    const totals = page.querySelector('[data-testid="totals"]')!.textContent!.replace(/\s+/g, ' ');
    expect(totals).toContain('32,00 €');
    expect(totals).toContain('17,80 €');
    expect(totals).toContain('2 camisetas');
  });

  it('lets edit or cancel only the shirts not yet ordered', async () => {
    await render(order);
    const [first, second] = Array.from(page.querySelectorAll('tr[mat-row]'));

    expect(button('edit-line', first)).toBeTruthy();
    expect(button('cancel-line', first)).toBeTruthy();
    expect(button('edit-line', second)).toBeNull();
    expect(button('cancel-line', second)).toBeNull();
  });

  it('cancels a shirt after confirming and shows the updated order', async () => {
    await render(order);
    answerDialogs(true);

    button('cancel-line')!.click();
    http
      .expectOne({ method: 'POST', url: '/api/sales/orders/5/lines/7/cancel' })
      .flush({ ...order, lines: [{ ...pending, status: 'CANCELLED' }, ordered] });
    await fixture.whenStable();

    expect(rows()[0][3]).toBe('Cancelada');
  });

  it('adds a shirt with the catalog loaded for the dialog', async () => {
    await render(order);
    const request: OrderLineRequest = {
      productId: 1,
      kitName: 'Real Madrid local',
      size: 'S',
      unitSalePrice: 15,
      unitPurchaseCost: 6.5,
      customizations: [],
    };
    answerDialogs(true, request);

    button('add-line')!.click();
    http.expectOne('/api/catalog/products?includeInactive=false').flush([]);
    http.expectOne('/api/catalog/customizations?includeInactive=false').flush([]);
    http.expectOne('/api/catalog/sizes').flush([]);
    const added = http.expectOne({ method: 'POST', url: '/api/sales/orders/5/lines' });
    expect(added.request.body).toEqual(request);
    added.flush({
      ...order,
      lines: [pending, ordered, { ...ordered, id: 9, kitName: 'Real Madrid local' }],
    });
    await fixture.whenStable();

    expect(dialog.open.mock.calls[0][0]).toBe(OrderLineDialog);
    expect(rows()).toHaveLength(3);
  });

  it('cancels the whole order only after confirming', async () => {
    await render(order);
    answerDialogs(false);
    button('cancel-order')!.click();
    http.expectNone({ method: 'POST', url: '/api/sales/orders/5/cancel' });

    answerDialogs(true);
    button('cancel-order')!.click();
    http
      .expectOne({ method: 'POST', url: '/api/sales/orders/5/cancel' })
      .flush({ ...order, status: 'CANCELLED', progress: 'CANCELLED' });
    await fixture.whenStable();

    expect(page.querySelector('.badge')?.textContent).toContain('Cancelado');
  });

  it('has no actions on a cancelled order', async () => {
    await render({
      ...order,
      status: 'CANCELLED',
      progress: 'CANCELLED',
      lines: [{ ...pending, status: 'CANCELLED' }],
    });

    for (const testId of [
      'add-line',
      'edit-header',
      'cancel-order',
      'edit-line',
      'cancel-line',
      'deliver-line',
      'deliver-all',
    ]) {
      expect(button(testId)).toBeNull();
    }
  });

  it('delivers a received shirt, and all the received ones after confirming', async () => {
    const received: OrderLine = { ...ordered, id: 8, status: 'RECEIVED' };
    const withReceived: OrderDetails = {
      ...order,
      progress: 'IN_PROGRESS',
      lines: [pending, received, { ...received, id: 10 }],
      lineCounts: { ...order.lineCounts, ordered: 0, received: 2 },
    };
    await render(withReceived);
    const rowsWithDeliver = Array.from(page.querySelectorAll('tr[mat-row]')).map(
      (row) => button('deliver-line', row) !== null,
    );
    expect(rowsWithDeliver).toEqual([false, true, true]);

    button('deliver-line')!.click();
    http.expectOne({ method: 'POST', url: '/api/sales/orders/5/lines/8/deliver' }).flush({
      ...withReceived,
      lines: [pending, { ...received, status: 'DELIVERED' }, { ...received, id: 10 }],
      lineCounts: { ...withReceived.lineCounts, received: 1, delivered: 1 },
    });
    await fixture.whenStable();
    expect(rows()[1][3]).toBe('Entregada');

    answerDialogs(true);
    button('deliver-all')!.click();
    http.expectOne({ method: 'POST', url: '/api/sales/orders/5/deliver' }).flush({
      ...withReceived,
      lines: [
        pending,
        { ...received, status: 'DELIVERED' },
        { ...received, id: 10, status: 'DELIVERED' },
      ],
      lineCounts: { ...withReceived.lineCounts, received: 0, delivered: 2 },
    });
    await fixture.whenStable();

    expect(rows().map((row) => row[3])).toEqual(['Por pedir', 'Entregada', 'Entregada']);
    expect(button('deliver-all')).toBeNull();
  });
});
