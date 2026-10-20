import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { provideSpanishLocale } from '../../core/locale';
import { today } from '../../shared/dates';
import { PaymentDialog } from './payment-dialog';

describe('PaymentDialog', () => {
  const dialogRef = { close: vi.fn() };
  const save = vi.fn();

  async function open(pending: number) {
    dialogRef.close.mockReset();
    save.mockReset().mockReturnValue(of({ orderId: 5 }));
    TestBed.configureTestingModule({
      imports: [PaymentDialog],
      providers: [
        provideSpanishLocale(),
        { provide: MAT_DIALOG_DATA, useValue: { pending, save } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    const fixture = TestBed.createComponent(PaymentDialog);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
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

  it('proposes paying everything pending today', async () => {
    const page = await open(17);

    expect(field(page, 'amount').value).toBe('17');
    expect(field(page, 'paymentDate').value).toBe(today());
    expect(page.textContent?.replace(/\s+/g, ' ')).toContain('Pendiente: 17,00 €');
  });

  it('registers a partial payment with its notes and closes', async () => {
    const page = await open(17);

    type(page, 'amount', '10');
    type(page, 'notes', ' Señal por Bizum ');
    submit(page);

    expect(save).toHaveBeenCalledWith({
      amount: 10,
      paymentDate: today(),
      notes: 'Señal por Bizum',
    });
    expect(dialogRef.close).toHaveBeenCalledWith({ orderId: 5 });
  });

  it('does not register a payment of zero', async () => {
    const page = await open(17);

    type(page, 'amount', '0');
    submit(page);

    expect(save).not.toHaveBeenCalled();
  });

  it('stays open when the backend rejects it, for example for paying more than pending', async () => {
    const page = await open(17);
    save.mockReturnValue(throwError(() => new Error('409')));

    type(page, 'amount', '20');
    submit(page);

    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
