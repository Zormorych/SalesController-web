import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { notBlank } from '../../shared/validators';
import { Customer, CustomerRequest, PHONE_PATTERN } from './customers.models';

export interface CustomerDialogData {
  // Sin cliente: alta. Con cliente: edición
  customer?: Customer;
  // Guarda en el backend. El diálogo solo se cierra si sale bien: si falla (por ejemplo, un teléfono
  // que ya tiene otro cliente), lo escrito se conserva
  save: (request: CustomerRequest) => Observable<Customer>;
}

// Alta o edición de un cliente. Teléfono y notas son opcionales
@Component({
  selector: 'app-customer-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './customer-dialog.html',
})
export class CustomerDialog {
  private readonly data = inject<CustomerDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CustomerDialog, Customer>);
  private readonly customer = this.data.customer;

  protected readonly title = this.customer ? 'Editar cliente' : 'Nuevo cliente';
  protected readonly saving = signal(false);

  // Mismas reglas que el backend
  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: [this.customer?.name ?? '', [Validators.required, notBlank, Validators.maxLength(120)]],
    phone: [this.customer?.phone ?? '', Validators.pattern(PHONE_PATTERN)],
    notes: [this.customer?.notes ?? '', Validators.maxLength(500)],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, phone, notes } = this.form.getRawValue();
    this.saving.set(true);
    this.data
      .save({ name: name.trim(), phone: phone.trim() || null, notes: notes.trim() || null })
      .subscribe({
        next: (customer) => this.dialogRef.close(customer),
        error: () => this.saving.set(false),
      });
  }
}
