import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { notBlank } from '../../shared/validators';
import {
  LineCustomization,
  LineCustomizationRequest,
  OrderLine,
  OrderLineRequest,
} from './orders.models';

// Formularios de una camiseta y de sus personalizaciones. Los usan el alta de pedido y la edición de líneas.
// Precios y costes se rellenan con los del catálogo al elegir y se pueden cambiar (descuento, amigo → 0 €)

export type CustomizationForm = FormGroup<{
  customizationId: FormControl<number | null>;
  customText: FormControl<string>;
  salePrice: FormControl<number | null>;
  purchaseCost: FormControl<number | null>;
}>;

export type LineForm = FormGroup<{
  productId: FormControl<number | null>;
  kitName: FormControl<string>;
  size: FormControl<string | null>;
  unitSalePrice: FormControl<number | null>;
  unitPurchaseCost: FormControl<number | null>;
  customizations: FormArray<CustomizationForm>;
}>;

const price = (value: number | null) =>
  new FormControl<number | null>(value, [Validators.required, Validators.min(0)]);

// Mismas reglas que el backend
export function customizationForm(customization?: LineCustomization): CustomizationForm {
  return new FormGroup({
    customizationId: new FormControl<number | null>(
      customization?.customizationId ?? null,
      Validators.required,
    ),
    customText: new FormControl(customization?.customText ?? '', {
      nonNullable: true,
      validators: Validators.maxLength(120),
    }),
    salePrice: price(customization?.salePrice ?? null),
    purchaseCost: price(customization?.purchaseCost ?? null),
  });
}

export function lineForm(line?: OrderLine): LineForm {
  return new FormGroup({
    productId: new FormControl<number | null>(line?.productId ?? null, Validators.required),
    kitName: new FormControl(line?.kitName ?? '', {
      nonNullable: true,
      validators: [Validators.required, notBlank, Validators.maxLength(160)],
    }),
    size: new FormControl<string | null>(line?.size ?? null, Validators.required),
    unitSalePrice: price(line?.unitSalePrice ?? null),
    unitPurchaseCost: price(line?.unitPurchaseCost ?? null),
    customizations: new FormArray((line?.customizations ?? []).map(customizationForm)),
  });
}

// Solo se llama con el formulario válido: los campos obligatorios no son nulos
export function toLineRequest(form: LineForm): OrderLineRequest {
  const line = form.getRawValue();
  return {
    productId: line.productId!,
    kitName: line.kitName.trim(),
    size: line.size!,
    unitSalePrice: line.unitSalePrice,
    unitPurchaseCost: line.unitPurchaseCost,
    customizations: line.customizations.map((customization): LineCustomizationRequest => ({
      customizationId: customization.customizationId!,
      customText: customization.customText.trim() || null,
      salePrice: customization.salePrice,
      purchaseCost: customization.purchaseCost,
    })),
  };
}

// Precio de venta de la camiseta con sus personalizaciones, según lo escrito en el formulario
export function lineSale(form: LineForm): number {
  const line = form.getRawValue();
  return line.customizations.reduce(
    (sum, customization) => sum + (customization.salePrice ?? 0),
    line.unitSalePrice ?? 0,
  );
}
