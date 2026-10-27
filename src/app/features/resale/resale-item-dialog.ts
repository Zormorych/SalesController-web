import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { today } from '../../shared/dates';
import { notBlank } from '../../shared/validators';
import { ResaleItem, ResaleItemRequest } from './resale.models';

export interface ResaleItemDialogData {
  // Sin prenda: alta. Con prenda: edición
  item?: ResaleItem;
  // Guarda en el backend; el diálogo solo se cierra si sale bien
  save: (request: ResaleItemRequest) => Observable<ResaleItem>;
}

// Alta o edición de una prenda para revender (por ejemplo, comprada en Vinted)
@Component({
  selector: 'app-resale-item-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.item ? 'Editar prenda' : 'Nueva prenda' }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="fields">
        <mat-form-field>
          <mat-label>Prenda</mat-label>
          <input
            matInput
            formControlName="name"
            maxlength="160"
            placeholder="Chaqueta Nike vintage"
          />
          <mat-error>Escribe qué prenda es</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Talla</mat-label>
          <input matInput formControlName="size" maxlength="40" placeholder="L, 42, W32…" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Coste</mat-label>
          <input matInput type="number" formControlName="purchaseCost" min="0" step="0.01" />
          <span matTextSuffix>€</span>
          <mat-hint>Lo que te costó</mat-hint>
          <mat-error>Indica un coste de 0 o más</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Fecha de compra</mat-label>
          <input matInput type="date" formControlName="purchaseDate" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Precio anunciado</mat-label>
          <input matInput type="number" formControlName="askingPrice" min="0" step="0.01" />
          <span matTextSuffix>€</span>
          <mat-error>Indica un precio de 0 o más</mat-error>
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
export class ResaleItemDialog {
  protected readonly data = inject<ResaleItemDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ResaleItemDialog, ResaleItem>);
  private readonly item = this.data.item;

  protected readonly saving = signal(false);
  // Mismas reglas que el backend
  protected readonly form = new FormGroup({
    name: new FormControl(this.item?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, notBlank, Validators.maxLength(160)],
    }),
    size: new FormControl(this.item?.size ?? '', {
      nonNullable: true,
      validators: Validators.maxLength(40),
    }),
    purchaseCost: new FormControl<number | null>(this.item?.purchaseCost ?? null, [
      Validators.required,
      Validators.min(0),
    ]),
    purchaseDate: new FormControl(this.item?.purchaseDate ?? today(), { nonNullable: true }),
    askingPrice: new FormControl<number | null>(this.item?.askingPrice ?? null, Validators.min(0)),
    notes: new FormControl(this.item?.notes ?? '', {
      nonNullable: true,
      validators: Validators.maxLength(500),
    }),
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.data
      .save({
        name: value.name.trim(),
        size: value.size.trim() || null,
        notes: value.notes.trim() || null,
        purchaseCost: value.purchaseCost!,
        purchaseDate: value.purchaseDate || null,
        askingPrice: value.askingPrice,
      })
      .subscribe({
        next: (item) => this.dialogRef.close(item),
        error: () => this.saving.set(false),
      });
  }
}
