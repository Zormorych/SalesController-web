import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideSpanishLocale } from '../../core/locale';
import { ConfirmDialog } from '../../shared/confirm-dialog';
import { FileDownloader } from '../../shared/file-downloader';
import { AddBatchLinesDialog } from './add-batch-lines-dialog';
import { BatchDetailPage } from './batch-detail-page';
import { BatchDetails, BatchLine, BatchStatus } from './batches.models';

describe('BatchDetailPage', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<BatchDetailPage>;
  let page: HTMLElement;
  const dialog = { open: vi.fn() };
  const downloader = { save: vi.fn() };

  const line: BatchLine = {
    lineId: 7,
    orderId: 5,
    orderNumber: 'SO-2026-000005',
    orderDate: '2026-10-05',
    customerName: 'Ana Pérez',
    productName: 'Camiseta Fan',
    kitName: 'Betis local',
    size: 'KIDS_16',
    sizeLabel: '16 (niño)',
    status: 'PENDING',
    customizations: [{ name: 'Nombre + número', customText: 'JOAQUÍN 17' }],
    totalSale: 17,
    totalCost: 7.7,
    shippingShare: 1.34,
    profit: 7.96,
  };
  const batch: BatchDetails = {
    id: 4,
    batchNumber: 'FB-2026-0004',
    status: 'OPEN',
    notes: 'Pedido de octubre',
    createdAt: '2026-10-18T10:15:00',
    sentAt: null,
    receivedAt: null,
    shippingCost: 4,
    lines: [line, { ...line, lineId: 8, shippingShare: 1.33, profit: 7.97 }],
    totals: { activeLines: 2, sale: 34, cost: 15.4, shipping: 2.67, profit: 15.93 },
    missingLines: [],
  };

  beforeEach(() => {
    dialog.open.mockReset();
    downloader.save.mockReset();
    TestBed.configureTestingModule({
      imports: [BatchDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideSpanishLocale(),
        provideRouter([]),
        { provide: MatDialog, useValue: dialog },
        { provide: FileDownloader, useValue: downloader },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function render(details: BatchDetails) {
    fixture = TestBed.createComponent(BatchDetailPage);
    fixture.componentRef.setInput('id', '4');
    TestBed.tick();
    http.expectOne('/api/purchasing/batches/4').flush(details);
    await fixture.whenStable();
    page = fixture.nativeElement as HTMLElement;
  }

  function button(testId: string) {
    return page.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);
  }

  function confirmDialogs(answer: boolean) {
    dialog.open.mockImplementation((component) => ({
      afterClosed: () => of(component === ConfirmDialog ? answer : undefined),
    }));
  }

  it('shows each shirt with its share of the shipping and profit, and the totals', async () => {
    await render(batch);

    expect(page.querySelector('h1')?.textContent).toContain('FB-2026-0004');
    expect(page.querySelector('.badge')?.textContent).toContain('Abierto');
    const first = Array.from(page.querySelectorAll('tr[mat-row]')[0].querySelectorAll('td'))
      .slice(0, 9)
      .map((cell) => cell.textContent!.replace(/\s+/g, ' ').trim());
    expect(first).toEqual([
      'SO-2026-000005',
      'Ana Pérez',
      'Camiseta Fan · Betis local · JOAQUÍN 17',
      '16 (niño)',
      'Por pedir',
      '17,00 €',
      '7,70 €',
      '1,34 €',
      '7,96 €',
    ]);
    expect(page.querySelector('tr[mat-row] a')?.getAttribute('href')).toBe('/pedidos/5');
    const totals = page.querySelector('[data-testid="totals"]')!.textContent!.replace(/\s+/g, ' ');
    expect(totals).toContain('2,67 €');
    expect(totals).toContain('15,93 €');
  });

  it.each<[BatchStatus, string[]]>([
    ['OPEN', ['excel', 'edit', 'add-lines', 'send', 'discard', 'remove-line']],
    ['SENT', ['excel', 'edit']],
    ['RECEIVED', ['excel', 'edit']],
    ['CANCELLED', []],
  ])('with the batch %s allows only %j', async (status, allowed) => {
    await render({ ...batch, status });

    const all = ['excel', 'edit', 'add-lines', 'send', 'discard', 'remove-line'];
    expect(all.filter((testId) => button(testId) !== null)).toEqual(allowed);
  });

  it('sends the batch to the factory after confirming', async () => {
    await render(batch);
    confirmDialogs(true);

    button('send')!.click();
    http
      .expectOne({ method: 'POST', url: '/api/purchasing/batches/4/send' })
      .flush({ ...batch, status: 'SENT', sentAt: '2026-10-20T12:00:00' });
    await fixture.whenStable();

    expect(page.querySelector('.badge')?.textContent).toContain('Enviado');
  });

  it('does not discard the batch if the confirmation is declined', async () => {
    await render(batch);
    confirmDialogs(false);

    button('discard')!.click();

    http.expectNone({ method: 'POST', url: '/api/purchasing/batches/4/cancel' });
  });

  it('downloads the Excel for the factory', async () => {
    await render(batch);
    const content = new Blob(['xlsx']);

    button('excel')!.click();
    http.expectOne('/api/purchasing/batches/4/excel').flush(content, {
      headers: { 'Content-Disposition': 'attachment; filename="FB-2026-0004.xlsx"' },
    });

    expect(downloader.save).toHaveBeenCalledWith('FB-2026-0004.xlsx', expect.any(Blob));
  });

  it('removes a shirt from the batch', async () => {
    await render(batch);

    button('remove-line')!.click();
    http
      .expectOne({ method: 'POST', url: '/api/purchasing/batches/4/lines/7/remove' })
      .flush({ ...batch, lines: [batch.lines[1]] });
    await fixture.whenStable();

    expect(page.querySelectorAll('tr[mat-row]')).toHaveLength(1);
  });

  it('adds pending shirts chosen in the dialog', async () => {
    await render(batch);
    dialog.open.mockImplementation((_component, config) => ({
      afterClosed: () => config.data.save([9]),
    }));

    button('add-lines')!.click();
    http.expectOne('/api/purchasing/pending-lines').flush([]);
    http.expectOne('/api/catalog/sizes').flush([]);
    const added = http.expectOne('/api/purchasing/batches/4/lines');
    expect(added.request.body).toEqual({ lineIds: [9] });
    added.flush(batch);
    await fixture.whenStable();

    expect(dialog.open.mock.calls[0][0]).toBe(AddBatchLinesDialog);
  });

  it('lists the shirts that did not arrive', async () => {
    await render({
      ...batch,
      status: 'RECEIVED',
      missingLines: [
        {
          lineId: 9,
          orderId: 6,
          orderNumber: 'SO-2026-000006',
          customerName: 'Luis Gómez',
          productName: 'Camiseta Fan',
          kitName: 'Real Madrid local',
          size: 'L',
          sizeLabel: 'L',
          status: 'PENDING',
          customizations: [],
        },
      ],
    });

    expect(page.querySelector('[data-testid="missing"]')?.textContent).toContain(
      'Camiseta Fan · Real Madrid local',
    );
  });
});
