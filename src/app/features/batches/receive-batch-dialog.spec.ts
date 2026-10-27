import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { BatchLine } from './batches.models';
import { ReceiveBatchDialog } from './receive-batch-dialog';

describe('ReceiveBatchDialog', () => {
  const dialogRef = { close: vi.fn() };
  const save = vi.fn();
  const line = (lineId: number, kitName: string): BatchLine => ({
    lineId,
    orderId: 5,
    orderNumber: 'SO-2026-000005',
    orderDate: '2026-10-05',
    customerName: 'Ana Pérez',
    productName: 'Camiseta Fan',
    kitName,
    size: 'M',
    sizeLabel: 'M',
    status: 'ORDERED',
    customizations: [],
    totalSale: 15,
    totalCost: 6.5,
    shippingShare: 1.33,
    profit: 7.17,
  });

  async function open() {
    dialogRef.close.mockReset();
    save.mockReset().mockReturnValue(of({ id: 4 }));
    TestBed.configureTestingModule({
      imports: [ReceiveBatchDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { lines: [line(7, 'Betis local'), line(8, 'Real Madrid local')], save },
        },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    const fixture = TestBed.createComponent(ReceiveBatchDialog);
    await fixture.whenStable();
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  function submitText(page: HTMLElement) {
    return page.querySelector('button[type="submit"]')!.textContent!.replace(/\s+/g, ' ').trim();
  }

  it('receives everything when no shirt is marked as missing', async () => {
    const { page } = await open();

    expect(submitText(page)).toBe('Confirmar: llegan 2 de 2');
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    expect(save).toHaveBeenCalledWith([]);
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 4 });
  });

  it('sends the shirts marked as missing', async () => {
    const { fixture, page } = await open();

    page.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[1].click();
    await fixture.whenStable();
    expect(submitText(page)).toBe('Confirmar: llegan 1 de 2');
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    expect(save).toHaveBeenCalledWith([8]);
  });

  it('stays open if the backend rejects it, for example because nothing arrived', async () => {
    const { page } = await open();
    save.mockReturnValue(throwError(() => new Error('409')));

    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
