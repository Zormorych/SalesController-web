import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideSpanishLocale } from '../../core/locale';
import { OrderLine } from '../orders/orders.models';
import { MoveToStockDialog } from './move-to-stock-dialog';

describe('MoveToStockDialog', () => {
  const dialogRef = { close: vi.fn() };
  const save = vi.fn();
  const line: OrderLine = {
    id: 7,
    productId: 1,
    productName: 'Camiseta Fan',
    kitName: 'Betis local',
    size: 'M',
    sizeLabel: 'M',
    unitSalePrice: 15,
    unitPurchaseCost: 6.5,
    status: 'RECEIVED',
    customizations: [],
    totalSale: 15,
    totalCost: 6.5,
    profit: 8.5,
  };

  async function open() {
    dialogRef.close.mockReset();
    save.mockReset().mockReturnValue(of({ id: 3 }));
    TestBed.configureTestingModule({
      imports: [MoveToStockDialog],
      providers: [
        provideSpanishLocale(),
        { provide: MAT_DIALOG_DATA, useValue: { line, save } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    const fixture = TestBed.createComponent(MoveToStockDialog);
    await fixture.whenStable();
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  function submit(page: HTMLElement) {
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
  }

  it('by default does not charge the customer', async () => {
    const { page } = await open();

    expect(page.querySelector('h2')?.textContent).toContain('Pasar a stock');
    expect(page.textContent).toContain('Camiseta Fan · Betis local (M)');
    submit(page);

    expect(save).toHaveBeenCalledWith({ customerPays: false, askingPrice: null });
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 3 });
  });

  it('can keep charging the customer and set an asking price', async () => {
    const { fixture, page } = await open();

    page.querySelector<HTMLInputElement>('[data-testid="customer-pays"] input')!.click();
    const asking = page.querySelector<HTMLInputElement>('[formControlName="askingPrice"]')!;
    asking.value = '18';
    asking.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    submit(page);

    expect(save).toHaveBeenCalledWith({ customerPays: true, askingPrice: 18 });
  });
});
