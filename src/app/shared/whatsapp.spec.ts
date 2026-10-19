import { whatsappUrl } from './whatsapp';

describe('whatsappUrl', () => {
  it('opens a chat with an international number', () => {
    expect(whatsappUrl('+34600123456')).toBe('https://wa.me/34600123456');
    expect(whatsappUrl('+44 7700 900123')).toBe('https://wa.me/447700900123');
  });

  it('assumes a Spanish number when it has 9 digits and no prefix', () => {
    expect(whatsappUrl('600 12 34 56')).toBe('https://wa.me/34600123456');
  });

  it('has no link without a phone', () => {
    expect(whatsappUrl(null)).toBeNull();
    expect(whatsappUrl('')).toBeNull();
  });
});
