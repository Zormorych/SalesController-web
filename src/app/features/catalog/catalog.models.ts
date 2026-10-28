// Productos ("Camiseta Fan") y personalizaciones ("Nombre + número") comparten forma y operaciones
export type CatalogKind = 'products' | 'customizations';

export interface CatalogItem {
  id: number;
  name: string;
  salePrice: number;
  purchaseCost: number;
  // Texto libre: por ejemplo, la URL del producto en la web del fabricante
  description?: string | null;
  active: boolean;
}

export interface CatalogItemRequest {
  name: string;
  salePrice: number;
  purchaseCost: number;
  description: string | null;
}

export const CATALOG_LABELS: Record<CatalogKind, { singular: string; newItem: string }> = {
  products: { singular: 'producto', newItem: 'Nuevo producto' },
  customizations: { singular: 'personalización', newItem: 'Nueva personalización' },
};

// Talla: code es lo que se envía al backend ("KIDS_16") y label lo que se muestra ("16 (niño)")
export interface Size {
  code: string;
  label: string;
}
