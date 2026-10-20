import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AddBatchLinesDialog } from './add-batch-lines-dialog';
import { BatchDetailsDialog } from './batch-details-dialog';
import { pendingLine } from './batches.testing';

describe('batch dialogs', () => {
  const dialogRef = { close: vi.fn() };
  const save = vi.fn();

  function setUp(component: unknown, data: object) {
    dialogRef.close.mockReset();
    save.mockReset().mockReturnValue(of({ id: 4 }));
    TestBed.configureTestingModule({
      imports: [component as never],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { ...data, save } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
  }

  it('changes the shipping cost and notes of a batch', async () => {
    setUp(BatchDetailsDialog, { shippingCost: 4, notes: null });
    const fixture = TestBed.createComponent(BatchDetailsDialog);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    const shipping = page.querySelector<HTMLInputElement>('[formControlName="shippingCost"]')!;
    expect(shipping.value).toBe('4');
    shipping.value = '5.20';
    shipping.dispatchEvent(new Event('input'));
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    expect(save).toHaveBeenCalledWith({ shippingCost: 5.2, notes: null });
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 4 });
  });

  it('adds the chosen pending shirts, none chosen at first', async () => {
    setUp(AddBatchLinesDialog, { lines: [pendingLine(9), pendingLine(10)], sizes: [] });
    const fixture = TestBed.createComponent(AddBatchLinesDialog);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const submit = page.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    expect(submit.disabled).toBe(true);
    page.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[2].click();
    await fixture.whenStable();
    submit.click();

    expect(save).toHaveBeenCalledWith([10]);
  });
});
