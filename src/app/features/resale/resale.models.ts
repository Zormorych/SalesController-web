// Modelos de la API de stock y reventa (/api/resale/items)

export type ResaleItemStatus = 'AVAILABLE' | 'SOLD';

// MANUAL: comprada para revender (Vinted...). ORDER_LINE: camiseta de un pedido que el cliente ya no quiso
export type ResaleItemOrigin = 'MANUAL' | 'ORDER_LINE';

export interface ResaleItem {
  id: number;
  name: string;
  size: string | null;
  notes: string | null;
  origin: ResaleItemOrigin;
  salesOrderLineId: number | null;
  purchaseCost: number;
  purchaseDate: string;
  askingPrice: number | null;
  status: ResaleItemStatus;
  salePrice: number | null;
  saleDate: string | null;
  // Solo si está vendida: precio de venta - coste
  profit: number | null;
}

// Sin purchaseDate se usa hoy; askingPrice (precio anunciado) es opcional
export interface ResaleItemRequest {
  name: string;
  size: string | null;
  notes: string | null;
  purchaseCost: number;
  purchaseDate: string | null;
  askingPrice: number | null;
}

export interface SellRequest {
  salePrice: number;
  saleDate: string | null;
}

// customerPays false (lo normal): no se le cobra al cliente y la prenda entra con su coste y su envío.
// true: el cliente la paga igualmente y la prenda entra a 0,00 €
export interface MoveToStockRequest {
  lineId: number;
  customerPays: boolean;
  askingPrice: number | null;
}
