import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { of } from 'rxjs';
import { OrderHeaderDialog } from './order-header-dialog';

describe('OrderHeaderDialog', () => {
  it('changes date and notes keeping the customer', async () => {
    const dialogRef = { close: vi.fn() };
    const save = vi.fn().mockReturnValue(of({ id: 5 }));
    TestBed.configureTestingModule({
      imports: [OrderHeaderDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            header: { customerId: 3, orderDate: '2026-10-05', notes: null },
            customers: [{ id: 3, name: 'Ana Pérez', phone: null, notes: null }],
            save,
          },
        },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    const fixture = TestBed.createComponent(OrderHeaderDialog);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    const date = page.querySelector<HTMLInputElement>('input[formControlName="orderDate"]')!;
    date.value = '2026-10-06';
    date.dispatchEvent(new Event('input'));
    const notes = page.querySelector<HTMLInputElement>('[formControlName="notes"]')!;
    notes.value = 'Recoge en mano';
    notes.dispatchEvent(new Event('input'));
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    expect(save).toHaveBeenCalledWith({
      customerId: 3,
      orderDate: '2026-10-06',
      notes: 'Recoge en mano',
    });
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 5 });
  });

  it('removes the customer when the order is for myself', async () => {
    const save = vi.fn().mockReturnValue(of({ id: 5 }));
    TestBed.configureTestingModule({
      imports: [OrderHeaderDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            header: { customerId: 3, orderDate: '2026-10-05', notes: null },
            customers: [{ id: 3, name: 'Ana Pérez', phone: null, notes: null }],
            save,
          },
        },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(OrderHeaderDialog);
    await fixture.whenStable();
    const select = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatSelectHarness);
    await select.open();
    await select.clickOptions({ text: /Sin cliente/ });
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button[type="submit"]')!
      .click();

    expect(save).toHaveBeenCalledWith({ customerId: null, orderDate: '2026-10-05', notes: null });
  });
});
