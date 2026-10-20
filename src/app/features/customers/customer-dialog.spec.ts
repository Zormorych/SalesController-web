import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { CustomerDialog } from './customer-dialog';
import { Customer } from './customers.models';

describe('CustomerDialog', () => {
  const dialogRef = { close: vi.fn() };
  const save = vi.fn();
  const ana: Customer = { id: 4, name: 'Ana Pérez', phone: '+34600123456', notes: null };

  async function open(customer?: Customer) {
    dialogRef.close.mockReset();
    save.mockReset().mockReturnValue(of(ana));
    TestBed.configureTestingModule({
      imports: [CustomerDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { customer, save } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    const fixture = TestBed.createComponent(CustomerDialog);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function type(page: HTMLElement, name: string, value: string) {
    const field = page.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[formControlName="${name}"]`,
    )!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  function submit(page: HTMLElement) {
    page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
  }

  it('saves a customer with only a name, leaving phone and notes empty, and closes', async () => {
    const page = await open();

    expect(page.querySelector('h2')?.textContent).toContain('Nuevo cliente');
    type(page, 'name', ' Ana Pérez ');
    submit(page);

    expect(save).toHaveBeenCalledWith({ name: 'Ana Pérez', phone: null, notes: null });
    expect(dialogRef.close).toHaveBeenCalledWith(ana);
  });

  it('edits a customer starting from their current data', async () => {
    const page = await open(ana);

    expect(page.querySelector('h2')?.textContent).toContain('Editar cliente');
    type(page, 'notes', 'Siempre talla M');
    submit(page);

    expect(save).toHaveBeenCalledWith({
      name: 'Ana Pérez',
      phone: '+34600123456',
      notes: 'Siempre talla M',
    });
  });

  it('stays open, keeping what was typed, when the backend rejects it', async () => {
    const page = await open();
    save.mockReturnValue(throwError(() => new Error('409')));

    type(page, 'name', 'Ana Pérez');
    submit(page);

    expect(save).toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(page.querySelector<HTMLInputElement>('[formControlName="name"]')!.value).toBe(
      'Ana Pérez',
    );
  });

  it('does not save a phone that is not a phone number', async () => {
    const page = await open();

    type(page, 'name', 'Ana Pérez');
    type(page, 'phone', 'abc123');
    submit(page);

    expect(save).not.toHaveBeenCalled();
  });
});
