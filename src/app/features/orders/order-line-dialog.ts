import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CatalogItem, Size } from '../catalog/catalog.models';
import { OrderLineFields } from './order-line-fields';
import { lineForm, toLineRequest } from './order-line-form';
import { OrderDetails, OrderLine, OrderLineRequest } from './orders.models';

export interface OrderLineDialogData {
  // Sin línea: añadir una camiseta. Con línea: editarla (solo si aún está por pedir)
  line?: OrderLine;
  products: CatalogItem[];
  customizations: CatalogItem[];
  sizes: Size[];
  // Guarda en el backend; el diálogo solo se cierra si sale bien
  save: (request: OrderLineRequest) => Observable<OrderDetails>;
}

// Añadir o editar una camiseta de un pedido ya creado
@Component({
  selector: 'app-order-line-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, OrderLineFields],
  template: `
    <h2 mat-dialog-title>{{ data.line ? 'Editar camiseta' : 'Añadir camiseta' }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <app-order-line-fields
          [form]="form"
          [products]="products"
          [customizations]="customizations"
          [sizes]="data.sizes"
        />
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="saving()">Guardar</button>
      </mat-dialog-actions>
    </form>
  `,
})
export class OrderLineDialog {
  protected readonly data = inject<OrderLineDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<OrderLineDialog, OrderDetails>);

  protected readonly form = lineForm(this.data.line);
  protected readonly saving = signal(false);

  // Una camiseta puede llevar un producto o una personalización que ya no se ofrecen (desactivados):
  // se añaden a las opciones para que se puedan seguir viendo y guardando tal cual
  protected readonly products = withMissing(
    this.data.products,
    this.data.line
      ? [
          catalogItemOf(
            this.data.line.productId,
            this.data.line.productName,
            this.data.line.unitSalePrice,
            this.data.line.unitPurchaseCost,
          ),
        ]
      : [],
  );
  protected readonly customizations = withMissing(
    this.data.customizations,
    (this.data.line?.customizations ?? []).map((customization) =>
      catalogItemOf(
        customization.customizationId,
        customization.customizationName,
        customization.salePrice,
        customization.purchaseCost,
      ),
    ),
  );

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.data.save(toLineRequest(this.form)).subscribe({
      next: (order) => this.dialogRef.close(order),
      error: () => this.saving.set(false),
    });
  }
}

function catalogItemOf(
  id: number,
  name: string,
  salePrice: number,
  purchaseCost: number,
): CatalogItem {
  return {
    id,
    name: `${name} (ya no está en el catálogo)`,
    salePrice,
    purchaseCost,
    active: false,
  };
}

function withMissing(items: CatalogItem[], used: CatalogItem[]): CatalogItem[] {
  const missing = used.filter((item) => !items.some((existing) => existing.id === item.id));
  return [...items, ...missing];
}
