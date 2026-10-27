import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideSpanishLocale } from '../../core/locale';
import { today } from '../../shared/dates';
import { ResaleItemDialog } from './resale-item-dialog';
import { ResaleItem } from './resale.models';
import { SellDialog } from './sell-dialog';

describe('resale dialogs', () => {
  const dialogRef = { close: vi.fn() };
  const save = vi.fn();
  const jacket: ResaleItem = {
    id: 3,
    name: 'Chaqueta Nike vintage',
    size: 'L',
    notes: null,
    origin: 'MANUAL',
    salesOrderLineId: null,
    purchaseCost: 11.7,
    purchaseDate: '2026-10-02',
    askingPrice: 20,
    status: 'AVAILABLE',
    salePrice: null,
    saleDate: null,
    profit: null,
  };

  async function open<T>(component: Type<T>, data: object) {
    dialogRef.close.mockReset();
    save.mockReset().mockReturnValue(of(jacket));
    TestBed.configureTestingModule({
      imports: [component],
      providers: [
        provideSpanishLocale(),
        { provide: MAT_DIALOG_DATA, useValue: { ...data, save } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  function field(page: HTMLElement, name: string) {
    return page.querySelector<HTMLInputElement>(`[formControlName="${name}"]`)!;
  }

  function type(page: HTMLElement, name: string, value: string) {
    field(page, name).value = value;
    field(page, name).dispatchEvent(new Event('input'));
  }

  function submit(page: HTMLElement) {
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
  }

  it('adds an item bought to resell, bought today unless said otherwise', async () => {
    const { page } = await open(ResaleItemDialog, {});

    expect(page.querySelector('h2')?.textContent).toContain('Nueva prenda');
    expect(field(page, 'purchaseDate').value).toBe(today());
    type(page, 'name', ' Chaqueta Nike vintage ');
    type(page, 'size', 'L');
    type(page, 'purchaseCost', '11.70');
    type(page, 'askingPrice', '20');
    submit(page);

    expect(save).toHaveBeenCalledWith({
      name: 'Chaqueta Nike vintage',
      size: 'L',
      notes: null,
      purchaseCost: 11.7,
      purchaseDate: today(),
      askingPrice: 20,
    });
    expect(dialogRef.close).toHaveBeenCalledWith(jacket);
  });

  it('does not save an item without name or cost', async () => {
    const { page } = await open(ResaleItemDialog, {});

    submit(page);

    expect(save).not.toHaveBeenCalled();
  });

  it('edits an item keeping what it had', async () => {
    const { page } = await open(ResaleItemDialog, { item: jacket });

    expect(page.querySelector('h2')?.textContent).toContain('Editar prenda');
    type(page, 'askingPrice', '18');
    submit(page);

    expect(save).toHaveBeenCalledWith({
      name: 'Chaqueta Nike vintage',
      size: 'L',
      notes: null,
      purchaseCost: 11.7,
      purchaseDate: '2026-10-02',
      askingPrice: 18,
    });
  });

  it('sells an item proposing its asking price and showing the profit as you type', async () => {
    const { fixture, page } = await open(SellDialog, { item: jacket });

    expect(field(page, 'salePrice').value).toBe('20');
    type(page, 'salePrice', '17.70');
    await fixture.whenStable();
    expect(
      page.querySelector('[data-testid="profit"]')?.textContent?.replace(/\s+/g, ' '),
    ).toContain('6,00 €');
    submit(page);

    expect(save).toHaveBeenCalledWith({ salePrice: 17.7, saleDate: today() });
  });
});
