import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { today } from '../../shared/dates';
import { PaymentSummary, RegisterPaymentRequest } from './payments.models';

export interface PaymentDialogData {
  // Lo que falta por cobrar: es el importe que se propone
  pending: number;
  // Guarda en el backend; el diálogo solo se cierra si sale bien
  save: (request: RegisterPaymentRequest) => Observable<PaymentSummary>;
}

// Registrar un cobro: el pago completo o una parte (por ejemplo, una señal)
@Component({
  selector: 'app-payment-dialog',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Registrar cobro</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="fields">
        <p>Pendiente: {{ data.pending | currency }}</p>
        <mat-form-field>
          <mat-label>Importe</mat-label>
          <input matInput type="number" formControlName="amount" min="0.01" step="0.01" />
          <span matTextSuffix>€</span>
          <mat-error>Indica un importe mayor que 0</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Fecha del cobro</mat-label>
          <input matInput type="date" formControlName="paymentDate" />
          <mat-error>Indica la fecha</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Notas</mat-label>
          <input matInput formControlName="notes" maxlength="500" placeholder="Bizum, efectivo…" />
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="saving()">Registrar</button>
      </mat-dialog-actions>
    </form>
  `,
})
export class PaymentDialog {
  protected readonly data = inject<PaymentDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PaymentDialog, PaymentSummary>);

  protected readonly saving = signal(false);
  protected readonly form = new FormGroup({
    amount: new FormControl<number | null>(this.data.pending, [
      Validators.required,
      Validators.min(0.01),
    ]),
    paymentDate: new FormControl(today(), { nonNullable: true, validators: Validators.required }),
    notes: new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) }),
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { amount, paymentDate, notes } = this.form.getRawValue();
    this.saving.set(true);
    this.data.save({ amount: amount!, paymentDate, notes: notes.trim() || null }).subscribe({
      next: (summary) => this.dialogRef.close(summary),
      error: () => this.saving.set(false),
    });
  }
}
