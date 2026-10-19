import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { notBlank } from '../../shared/validators';
import { CATALOG_LABELS, CatalogItem, CatalogItemRequest, CatalogKind } from './catalog.models';

export interface CatalogItemDialogData {
  kind: CatalogKind;
  // Sin item: alta. Con item: edición
  item?: CatalogItem;
}

// Alta o edición de un producto o una personalización. Devuelve la petición al cerrar con "Guardar"
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
  private readonly dialogRef = inject(MatDialogRef<CatalogItemDialog, CatalogItemRequest>);
  private readonly labels = CATALOG_LABELS[this.data.kind];

  protected readonly title = this.data.item
    ? `Editar ${this.labels.singular}`
    : this.labels.newItem;

  // Mismas reglas que el backend: nombre obligatorio de hasta 120 caracteres y precios no negativos
  protected readonly form = inject(FormBuilder).group({
    name: [this.data.item?.name ?? '', [Validators.required, notBlank, Validators.maxLength(120)]],
    salePrice: [this.data.item?.salePrice ?? null, [Validators.required, Validators.min(0)]],
    purchaseCost: [this.data.item?.purchaseCost ?? null, [Validators.required, Validators.min(0)]],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Los validadores garantizan que no hay nulos
    const { name, salePrice, purchaseCost } = this.form.getRawValue();
    this.dialogRef.close({
      name: name!.trim(),
      salePrice: salePrice!,
      purchaseCost: purchaseCost!,
    });
  }
}
