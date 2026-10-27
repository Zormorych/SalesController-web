import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { today } from '../../shared/dates';
import { ResaleItem, SellRequest } from './resale.models';

export interface SellDialogData {
  item: ResaleItem;
  // Guarda en el backend; el diálogo solo se cierra si sale bien
  save: (request: SellRequest) => Observable<ResaleItem>;
}

// Vender una prenda: el precio final (tras el regateo) y la fecha. Enseña el beneficio mientras se escribe
@Component({
  selector: 'app-sell-dialog',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Vender {{ data.item.name }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="fields">
        <p>Te costó {{ data.item.purchaseCost | currency }}.</p>
        <mat-form-field>
          <mat-label>Precio de venta</mat-label>
          <input matInput type="number" formControlName="salePrice" min="0" step="0.01" />
          <span matTextSuffix>€</span>
          <mat-error>Indica un precio de 0 o más</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Fecha de venta</mat-label>
          <input matInput type="date" formControlName="saleDate" />
        </mat-form-field>
        @if (profit() !== null) {
          <p data-testid="profit">
            Beneficio: <strong>{{ profit() | currency }}</strong>
          </p>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="saving()">Vender</button>
      </mat-dialog-actions>
    </form>
  `,
})
export class SellDialog {
  protected readonly data = inject<SellDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SellDialog, ResaleItem>);

  protected readonly saving = signal(false);
  // Se propone el precio anunciado; si le han regateado, se cambia
  protected readonly form = new FormGroup({
    salePrice: new FormControl<number | null>(this.data.item.askingPrice, [
      Validators.required,
      Validators.min(0),
    ]),
    saleDate: new FormControl(today(), { nonNullable: true }),
  });

  private readonly salePrice = toSignal(this.form.controls.salePrice.valueChanges, {
    initialValue: this.form.controls.salePrice.value,
  });
  protected readonly profit = computed(() => {
    const price = this.salePrice();
    return price === null || price === undefined ? null : price - this.data.item.purchaseCost;
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { salePrice, saleDate } = this.form.getRawValue();
    this.saving.set(true);
    this.data.save({ salePrice: salePrice!, saleDate: saleDate || null }).subscribe({
      next: (item) => this.dialogRef.close(item),
      error: () => this.saving.set(false),
    });
  }
}
