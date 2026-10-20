import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { BatchDetails, UpdateBatchRequest } from './batches.models';

export interface BatchDetailsDialogData extends UpdateBatchRequest {
  // Guarda en el backend; el diálogo solo se cierra si sale bien
  save: (request: UpdateBatchRequest) => Observable<BatchDetails>;
}

// Cambiar el envío y las notas de un lote (también ya enviado: la factura real puede llegar después)
@Component({
  selector: 'app-batch-details-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Envío y notas del lote</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="fields">
        <mat-form-field>
          <mat-label>Envío</mat-label>
          <input matInput type="number" formControlName="shippingCost" min="0" step="0.01" />
          <span matTextSuffix>€</span>
          <mat-error>Indica un envío de 0 o más</mat-error>
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
export class BatchDetailsDialog {
  private readonly data = inject<BatchDetailsDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<BatchDetailsDialog, BatchDetails>);

  protected readonly saving = signal(false);
  protected readonly form = new FormGroup({
    shippingCost: new FormControl<number | null>(this.data.shippingCost, [
      Validators.required,
      Validators.min(0),
    ]),
    notes: new FormControl(this.data.notes ?? '', {
      nonNullable: true,
      validators: Validators.maxLength(500),
    }),
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { shippingCost, notes } = this.form.getRawValue();
    this.saving.set(true);
    this.data.save({ shippingCost: shippingCost!, notes: notes.trim() || null }).subscribe({
      next: (batch) => this.dialogRef.close(batch),
      error: () => this.saving.set(false),
    });
  }
}
