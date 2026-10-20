import { LineStatus, OrderProgress } from './orders.models';

export const LINE_STATUS_LABELS: Record<LineStatus, string> = {
  PENDING: 'Por pedir',
  ORDERED: 'Pedida',
  RECEIVED: 'Recibida',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
  STOCKED_PAID: 'En stock (pagada)',
  STOCKED_REFUNDED: 'En stock (sin cobrar)',
};

export const PROGRESS_LABELS: Record<OrderProgress, string> = {
  PENDING: 'Por pedir',
  IN_PROGRESS: 'En curso',
  READY_TO_DELIVER: 'Listo para entregar',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};
