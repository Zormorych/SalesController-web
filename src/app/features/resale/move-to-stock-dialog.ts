import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { Observable } from 'rxjs';
import { OrderLine } from '../orders/orders.models';
import { MoveToStockRequest, ResaleItem } from './resale.models';

export interface MoveToStockDialogData {
  line: OrderLine;
  // Guarda en el backend; el diálogo solo se cierra si sale bien
  save: (choice: Omit<MoveToStockRequest, 'lineId'>) => Observable<ResaleItem>;
}

// Una camiseta recibida que el cliente ya no quiere pasa a stock para revenderla
@Component({
  selector: 'app-move-to-stock-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Pasar a stock</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="fields">
        <p>
          {{ data.line.productName }} · {{ data.line.kitName }} ({{ data.line.sizeLabel }}) sale del
          pedido y queda en stock para revenderla.
        </p>
        <mat-radio-group formControlName="customerPays" class="options">
          <mat-radio-button [value]="false" data-testid="customer-not-charged">
            No se le cobra al cliente
            <span class="explanation">
              Deja de contar en el pedido; si ya la había pagado, sale en "por devolver". En stock
              vale lo que te costó, con su parte del envío.
            </span>
          </mat-radio-button>
          <mat-radio-button [value]="true" data-testid="customer-pays">
            El cliente la paga igualmente
            <span class="explanation">
              Sigue contando como vendida en el pedido. En stock entra a 0,00 €: lo que saques al
              revenderla es beneficio.
            </span>
          </mat-radio-button>
        </mat-radio-group>
        <mat-form-field>
          <mat-label>Precio anunciado (opcional)</mat-label>
          <input matInput type="number" formControlName="askingPrice" min="0" step="0.01" />
          <span matTextSuffix>€</span>
          <mat-error>Indica un precio de 0 o más</mat-error>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="saving()">Pasar a stock</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    .explanation {
      display: block;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class MoveToStockDialog {
  protected readonly data = inject<MoveToStockDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<MoveToStockDialog, ResaleItem>);

  protected readonly saving = signal(false);
  // Por defecto no se le cobra al cliente (decisión del usuario)
  protected readonly form = new FormGroup({
    customerPays: new FormControl(false, { nonNullable: true }),
    askingPrice: new FormControl<number | null>(null, Validators.min(0)),
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.data.save(this.form.getRawValue()).subscribe({
      next: (item) => this.dialogRef.close(item),
      error: () => this.saving.set(false),
    });
  }
}
