import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CatalogItemDialog, CatalogItemDialogData } from './catalog-item-dialog';

describe('CatalogItemDialog', () => {
  const dialogRef = { close: vi.fn() };

  async function open(data: CatalogItemDialogData) {
    dialogRef.close.mockReset();
    TestBed.configureTestingModule({
      imports: [CatalogItemDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    const fixture = TestBed.createComponent(CatalogItemDialog);
    await fixture.whenStable();
    return fixture;
  }

  function type(page: HTMLElement, name: string, value: string) {
    const input = page.querySelector<HTMLInputElement>(`input[formControlName="${name}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function save(page: HTMLElement) {
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
  }

  it('creates a product with its name and prices', async () => {
    const fixture = await open({ kind: 'products' });
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('h2')?.textContent).toContain('Nuevo producto');
    type(page, 'name', '  Camiseta Player  ');
    type(page, 'salePrice', '17');
    type(page, 'purchaseCost', '7.70');
    save(page);

    expect(dialogRef.close).toHaveBeenCalledWith({
      name: 'Camiseta Player',
      salePrice: 17,
      purchaseCost: 7.7,
    });
  });

  it('edits an existing customization starting from its current values', async () => {
    const fixture = await open({
      kind: 'customizations',
      item: { id: 3, name: 'Parche', salePrice: 1, purchaseCost: 0.5, active: true },
    });
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('h2')?.textContent).toContain('Editar personalización');
    type(page, 'salePrice', '1.50');
    save(page);

    expect(dialogRef.close).toHaveBeenCalledWith({
      name: 'Parche',
      salePrice: 1.5,
      purchaseCost: 0.5,
    });
  });

  it('does not save without a name or with a negative price', async () => {
    const fixture = await open({ kind: 'products' });
    const page = fixture.nativeElement as HTMLElement;

    type(page, 'name', ' ');
    type(page, 'salePrice', '-1');
    type(page, 'purchaseCost', '6.50');
    save(page);

    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
