import { LINE_STATUS_LABELS, PROGRESS_LABELS } from './order-labels';

describe('order labels', () => {
  it('names every shirt status in Spanish', () => {
    expect(LINE_STATUS_LABELS).toEqual({
      PENDING: 'Por pedir',
      ORDERED: 'Pedida',
      RECEIVED: 'Recibida',
      DELIVERED: 'Entregada',
      CANCELLED: 'Cancelada',
      STOCKED_PAID: 'En stock (pagada)',
      STOCKED_REFUNDED: 'En stock (sin cobrar)',
    });
  });

  it('names every order progress in Spanish', () => {
    expect(PROGRESS_LABELS).toEqual({
      PENDING: 'Por pedir',
      IN_PROGRESS: 'En curso',
      READY_TO_DELIVER: 'Listo para entregar',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
    });
  });
});
