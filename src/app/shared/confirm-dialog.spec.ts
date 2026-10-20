import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('asks the question and closes with true when confirmed', async () => {
    const dialogRef = { close: vi.fn() };
    TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: '¿Cancelar el pedido?',
            message: 'No se puede deshacer.',
            confirm: 'Cancelar pedido',
          },
        },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });
    const fixture = TestBed.createComponent(ConfirmDialog);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('h2')?.textContent).toContain('¿Cancelar el pedido?');
    expect(page.textContent).toContain('No se puede deshacer.');
    page.querySelector<HTMLButtonElement>('[data-testid="confirm"]')!.click();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
