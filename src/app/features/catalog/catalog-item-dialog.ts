import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { notBlank } from '../../shared/validators';
import { CATALOG_LABELS, CatalogItem, CatalogItemRequest, CatalogKind } from './catalog.models';

export interface CatalogItemDialogData {
  kind: CatalogKind;
  // Sin item: alta. Con item: edición
  item?: CatalogItem;
  // Guarda en el backend. El diálogo solo se cierra si sale bien: si falla, lo escrito se conserva
  save: (request: CatalogItemRequest) => Observable<CatalogItem>;
}

// Alta o edición de un producto o una personalización. Se cierra con lo guardado
@Component({
  selector: 'app-catalog-item-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './catalog-item-dialog.html',
})
export class CatalogItemDialog {
  private readonly data = inject<CatalogItemDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CatalogItemDialog, CatalogItem>);
  private readonly labels = CATALOG_LABELS[this.data.kind];

  protected readonly title = this.data.item
    ? `Editar ${this.labels.singular}`
    : this.labels.newItem;
  protected readonly saving = signal(false);

  // Mismas reglas que el backend: nombre obligatorio de hasta 120 caracteres y precios no negativos
  protected readonly form = inject(FormBuilder).group({
    name: [this.data.item?.name ?? '', [Validators.required, notBlank, Validators.maxLength(120)]],
    salePrice: [this.data.item?.salePrice ?? null, [Validators.required, Validators.min(0)]],
    purchaseCost: [this.data.item?.purchaseCost ?? null, [Validators.required, Validators.min(0)]],
    description: [this.data.item?.description ?? '', Validators.maxLength(1000)],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Los validadores garantizan que no hay nulos
    const { name, salePrice, purchaseCost, description } = this.form.getRawValue();
    this.saving.set(true);
    this.data
      .save({
        name: name!.trim(),
        salePrice: salePrice!,
        purchaseCost: purchaseCost!,
        description: description?.trim() || null,
      })
      .subscribe({
        next: (item) => this.dialogRef.close(item),
        error: () => this.saving.set(false),
      });
  }
}
