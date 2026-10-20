import { BATCH_STATUS_LABELS, shirtText } from './batch-labels';

describe('batch labels', () => {
  it('names every batch status in Spanish', () => {
    expect(BATCH_STATUS_LABELS).toEqual({
      OPEN: 'Abierto',
      SENT: 'Enviado',
      RECEIVED: 'Recibido',
      CANCELLED: 'Descartado',
    });
  });

  it('describes a shirt with its customizations', () => {
    expect(
      shirtText({
        productName: 'Camiseta Fan',
        kitName: 'Betis local',
        customizations: [
          { name: 'Nombre + número', customText: 'JOAQUÍN 17' },
          { name: 'Parche', customText: null },
        ],
      }),
    ).toBe('Camiseta Fan · Betis local · JOAQUÍN 17, Parche');
  });
});
