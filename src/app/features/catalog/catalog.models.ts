// Productos ("Camiseta Fan") y personalizaciones ("Nombre + número") comparten forma y operaciones
export type CatalogKind = 'products' | 'customizations';

export interface CatalogItem {
  id: number;
  name: string;
  salePrice: number;
  purchaseCost: number;
  active: boolean;
}

export interface CatalogItemRequest {
  name: string;
  salePrice: number;
  purchaseCost: number;
}

export const CATALOG_LABELS: Record<CatalogKind, { singular: string; newItem: string }> = {
  products: { singular: 'producto', newItem: 'Nuevo producto' },
  customizations: { singular: 'personalización', newItem: 'Nueva personalización' },
};
