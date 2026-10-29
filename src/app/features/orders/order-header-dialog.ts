import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import { Customer } from '../customers/customers.models';
import { OrderDetails, UpdateOrderRequest } from './orders.models';

export interface OrderHeaderDialogData {
  header: UpdateOrderRequest;
  customers: Customer[];
  // Guarda en el backend; el diálogo solo se cierra si sale bien
  save: (request: UpdateOrderRequest) => Observable<OrderDetails>;
}

// Cambia el cliente, la fecha o las notas de un pedido
@Component({
  selector: 'app-order-header-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Editar pedido</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="fields">
        <mat-form-field floatLabel="always">
          <mat-label>Cliente</mat-label>
          <mat-select formControlName="customerId" placeholder="Sin cliente (para mí)">
            <mat-option [value]="null">Sin cliente (para mí)</mat-option>
            @for (customer of data.customers; track customer.id) {
              <mat-option [value]="customer.id">{{ customer.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Fecha del pedido</mat-label>
          <input matInput type="date" formControlName="orderDate" />
          <mat-error>Indica la fecha</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Notas</mat-label>
          <input matInput formControlName="notes" maxlength="500" />
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="saving()">Guardar</button>
      </mat-dialog-actions>
    </form>
  `,
})
export class OrderHeaderDialog {
  protected readonly data = inject<OrderHeaderDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<OrderHeaderDialog, OrderDetails>);

  protected readonly saving = signal(false);
  protected readonly form = new FormGroup({
    // Vacío: el pedido es para uno mismo
    customerId: new FormControl<number | null>(this.data.header.customerId),
    orderDate: new FormControl(this.data.header.orderDate, {
      nonNullable: true,
      validators: Validators.required,
    }),
    notes: new FormControl(this.data.header.notes ?? '', {
      nonNullable: true,
      validators: Validators.maxLength(500),
    }),
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { customerId, orderDate, notes } = this.form.getRawValue();
    this.saving.set(true);
    this.data.save({ customerId, orderDate, notes: notes.trim() || null }).subscribe({
      next: (order) => this.dialogRef.close(order),
      error: () => this.saving.set(false),
    });
  }
}
