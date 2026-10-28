import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LinkedText } from '../../shared/linked-text';
import { CatalogItem, Size } from '../catalog/catalog.models';
import { customizationForm, LineForm } from './order-line-form';

// Campos de una camiseta: producto, equipación, talla, precio, coste y sus personalizaciones
@Component({
  selector: 'app-order-line-fields',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    LinkedText,
  ],
  templateUrl: './order-line-fields.html',
  styleUrl: './order-line-fields.scss',
})
export class OrderLineFields {
  readonly form = input.required<LineForm>();
  readonly products = input.required<CatalogItem[]>();
  readonly customizations = input.required<CatalogItem[]>();
  readonly sizes = input.required<Size[]>();

  // Descripción del producto elegido (por ejemplo, su URL en la web del fabricante) para tenerla a mano
  protected productDescription(productId: number | null): string | null {
    return this.products().find((item) => item.id === productId)?.description ?? null;
  }

  // Al elegir el producto se copian su precio y su coste del catálogo (se pueden cambiar después)
  protected productChosen(productId: number): void {
    const product = this.products().find((item) => item.id === productId);
    if (product) {
      this.form().patchValue({
        unitSalePrice: product.salePrice,
        unitPurchaseCost: product.purchaseCost,
      });
    }
  }

  protected addCustomization(): void {
    this.form().controls.customizations.push(customizationForm());
  }

  protected removeCustomization(index: number): void {
    this.form().controls.customizations.removeAt(index);
  }

  protected customizationChosen(index: number, customizationId: number): void {
    const customization = this.customizations().find((item) => item.id === customizationId);
    if (customization) {
      this.form().controls.customizations.at(index).patchValue({
        salePrice: customization.salePrice,
        purchaseCost: customization.purchaseCost,
      });
    }
  }

  // Personalización sin cobrar (por ejemplo, a un amigo): sigue apuntada y con su coste
  protected free(index: number): void {
    this.form().controls.customizations.at(index).patchValue({ salePrice: 0 });
  }
}
