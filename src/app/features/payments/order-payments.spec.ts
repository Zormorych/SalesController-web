import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideSpanishLocale } from '../../core/locale';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { OrderPayments } from './order-payments';
import { PaymentDialog } from './payment-dialog';
import { PaymentSummary } from './payments.models';

describe('OrderPayments', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<OrderPayments>;
  let page: HTMLElement;
  const dialog = { open: vi.fn() };

  const summary: PaymentSummary = {
    orderId: 5,
    orderNumber: 'SO-2026-000005',
    orderCancelled: false,
    orderTotal: 32,
    paidAmount: 10,
    pendingAmount: 22,
    payments: [
      { id: 8, amount: 10, paymentDate: '2026-10-06', status: 'REGISTERED', notes: 'Bizum' },
      { id: 9, amount: 5, paymentDate: '2026-10-07', status: 'VOIDED', notes: null },
    ],
  };

  beforeEach(() => {
    dialog.open.mockReset();
    TestBed.configureTestingModule({
      imports: [OrderPayments],
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

  async function render(answer: PaymentSummary) {
    fixture = TestBed.createComponent(OrderPayments);
    fixture.componentRef.setInput('orderId', 5);
    fixture.componentRef.setInput('orderTotal', answer.orderTotal);
    TestBed.tick();
    http.expectOne('/api/sales/orders/5/payments').flush(answer);
    await fixture.whenStable();
    page = fixture.nativeElement as HTMLElement;
  }

  function text(testId: string) {
    return page
      .querySelector(`[data-testid="${testId}"]`)
      ?.textContent?.replace(/\s+/g, ' ')
      .trim();
  }

  function rows() {
    return Array.from(page.querySelectorAll('tr[mat-row]')).map((row) =>
      Array.from(row.querySelectorAll('td'))
        .slice(0, 4)
        .map((cell) => cell.textContent!.replace(/\s+/g, ' ').trim()),
    );
  }

  it('shows what has been paid and what is pending, and each payment', async () => {
    await render(summary);

    expect(text('paid')).toContain('10,00 €');
    expect(text('pending')).toBe('Pendiente: 22,00 €');
    expect(rows()).toEqual([
      ['06/10/2026', '10,00 €', 'Bizum', 'Cobrado'],
      ['07/10/2026', '5,00 €', '', 'Anulado'],
    ]);
    expect(page.querySelectorAll('[data-testid="void"]')).toHaveLength(1);
  });

  it('shows the money to give back when more was paid than the order costs', async () => {
    await render({ ...summary, orderCancelled: true, orderTotal: 0, pendingAmount: -10 });

    expect(text('pending')).toBe('A devolver: 10,00 €');
    expect(page.querySelector('[data-testid="register"]')).toBeNull();
  });

  it('registers a payment through the dialog, which starts from what is pending', async () => {
    await render(summary);
    const request = { amount: 22, paymentDate: '2026-10-20', notes: null };
    dialog.open.mockImplementation((_component, config) => ({
      afterClosed: () => config.data.save(request),
    }));

    page.querySelector<HTMLButtonElement>('[data-testid="register"]')!.click();
    const registered = http.expectOne({ method: 'POST', url: '/api/sales/orders/5/payments' });
    expect(registered.request.body).toEqual(request);
    registered.flush({ ...summary, paidAmount: 32, pendingAmount: 0 });
    await fixture.whenStable();

    expect(dialog.open.mock.calls[0][0]).toBe(PaymentDialog);
    expect(dialog.open.mock.calls[0][1].data.pending).toBe(22);
    expect(text('pending')).toBe('Pagado del todo');
    expect(page.querySelector('[data-testid="register"]')).toBeNull();
  });

  it('voids a payment only after confirming', async () => {
    await render(summary);
    dialog.open.mockImplementation((component) => ({
      afterClosed: () => of(component === ConfirmDialog),
    }));

    page.querySelector<HTMLButtonElement>('[data-testid="void"]')!.click();
    http.expectOne({ method: 'POST', url: '/api/sales/orders/5/payments/8/void' }).flush({
      ...summary,
      paidAmount: 0,
      pendingAmount: 32,
      payments: summary.payments.map((payment) => ({ ...payment, status: 'VOIDED' })),
    });
    await fixture.whenStable();

    expect(text('pending')).toBe('Pendiente: 32,00 €');
  });

  it('reloads when the order total changes', async () => {
    await render(summary);

    fixture.componentRef.setInput('orderTotal', 47);
    TestBed.tick();

    http.expectOne('/api/sales/orders/5/payments').flush({ ...summary, orderTotal: 47 });
  });
});
