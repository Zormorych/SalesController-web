import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CatalogItemDialog, CatalogItemDialogData } from './catalog-item-dialog';
import { CatalogItem } from './catalog.models';

describe('CatalogItemDialog', () => {
  const dialogRef = { close: vi.fn() };
  const save = vi.fn();
  const saved: CatalogItem = {
    id: 1,
    name: 'Camiseta Player',
    salePrice: 17,
    purchaseCost: 7.7,
    active: true,
  };

  async function open(data: Omit<CatalogItemDialogData, 'save'>) {
    dialogRef.close.mockReset();
    save.mockReset().mockReturnValue(of(saved));
    TestBed.configureTestingModule({
      imports: [CatalogItemDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { ...data, save } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    const fixture = TestBed.createComponent(CatalogItemDialog);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function type(page: HTMLElement, name: string, value: string) {
    const input = page.querySelector<HTMLInputElement>(`[formControlName="${name}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(page: HTMLElement) {
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
  }

  it('saves a product with its name, prices and description, and closes', async () => {
    const page = await open({ kind: 'products' });

    expect(page.querySelector('h2')?.textContent).toContain('Nuevo producto');
    type(page, 'name', '  Camiseta Player  ');
    type(page, 'salePrice', '17');
    type(page, 'purchaseCost', '7.70');
    type(page, 'description', '  https://fabricante.example/player-123  ');
    submit(page);

    expect(save).toHaveBeenCalledWith({
      name: 'Camiseta Player',
      salePrice: 17,
      purchaseCost: 7.7,
      description: 'https://fabricante.example/player-123',
    });
    expect(dialogRef.close).toHaveBeenCalledWith(saved);
  });

  it('edits an existing customization starting from its current values', async () => {
    const page = await open({
      kind: 'customizations',
      item: { id: 3, name: 'Parche', salePrice: 1, purchaseCost: 0.5, active: true },
    });

    expect(page.querySelector('h2')?.textContent).toContain('Editar personalización');
    type(page, 'salePrice', '1.50');
    submit(page);

    expect(save).toHaveBeenCalledWith({
      name: 'Parche',
      salePrice: 1.5,
      purchaseCost: 0.5,
      description: null,
    });
  });

  it('stays open when the backend rejects it', async () => {
    const page = await open({ kind: 'products' });
    save.mockReturnValue(throwError(() => new Error('409')));

    type(page, 'name', 'Camiseta Fan');
    type(page, 'salePrice', '15');
    type(page, 'purchaseCost', '6.5');
    submit(page);

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('does not save without a name or with a negative price', async () => {
    const page = await open({ kind: 'products' });

    type(page, 'name', ' ');
    type(page, 'salePrice', '-1');
    type(page, 'purchaseCost', '6.50');
    submit(page);

    expect(save).not.toHaveBeenCalled();
  });
});
