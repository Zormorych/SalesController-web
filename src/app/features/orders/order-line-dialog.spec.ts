import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideSpanishLocale } from '../../core/locale';
import { CatalogItem } from '../catalog/catalog.models';
import { OrderLineDialog, OrderLineDialogData } from './order-line-dialog';
import { OrderLine } from './orders.models';

describe('OrderLineDialog', () => {
  const dialogRef = { close: vi.fn() };
  const save = vi.fn();
  const fan: CatalogItem = {
    id: 1,
    name: 'Camiseta Fan',
    salePrice: 15,
    purchaseCost: 6.5,
    active: true,
  };
  const line: OrderLine = {
    id: 7,
    productId: 99,
    productName: 'Camiseta Retro',
    kitName: 'Betis 1995',
    size: 'L',
    sizeLabel: 'L',
    unitSalePrice: 20,
    unitPurchaseCost: 9,
    status: 'PENDING',
    customizations: [],
    totalSale: 20,
    totalCost: 9,
    profit: 11,
  };

  async function open(data: Omit<OrderLineDialogData, 'save'>) {
    dialogRef.close.mockReset();
    save.mockReset().mockReturnValue(of({ id: 5 }));
    TestBed.configureTestingModule({
      imports: [OrderLineDialog],
      providers: [
        provideSpanishLocale(),
        { provide: MAT_DIALOG_DATA, useValue: { ...data, save } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    const fixture = TestBed.createComponent(OrderLineDialog);
    await fixture.whenStable();
    return fixture;
  }

  const lookups = {
    products: [fan],
    customizations: [],
    sizes: [{ code: 'L', label: 'L' }],
  };

  it('edits a shirt whose product is no longer in the catalog, keeping it selectable', async () => {
    const fixture = await open({ ...lookups, line });
    const page = fixture.nativeElement as HTMLElement;
    const product = await TestbedHarnessEnvironment.loader(fixture).getHarness(
      MatSelectHarness.with({ selector: '[data-testid="product"]' }),
    );

    expect(page.querySelector('h2')?.textContent).toContain('Editar camiseta');
    expect(await product.getValueText()).toContain('Camiseta Retro');
    const kit = page.querySelector<HTMLInputElement>('input[formControlName="kitName"]')!;
    kit.value = 'Betis 1995 local';
    kit.dispatchEvent(new Event('input'));
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    expect(save).toHaveBeenCalledWith({
      productId: 99,
      kitName: 'Betis 1995 local',
      size: 'L',
      unitSalePrice: 20,
      unitPurchaseCost: 9,
      customizations: [],
    });
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 5 });
  });

  it('starts empty when adding a shirt and does not save it incomplete', async () => {
    const fixture = await open(lookups);
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('h2')?.textContent).toContain('Añadir camiseta');
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    expect(save).not.toHaveBeenCalled();
  });
});
