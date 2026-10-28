import { TestBed } from '@angular/core/testing';
import { LinkedText } from './linked-text';

describe('LinkedText', () => {
  async function render(text: string | null) {
    TestBed.configureTestingModule({ imports: [LinkedText] });
    const fixture = TestBed.createComponent(LinkedText);
    fixture.componentRef.setInput('text', text);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('turns web addresses into links that open in another tab', async () => {
    const page = await render('Ver https://fabricante.example/retro-123 antes de pedir');

    const link = page.querySelector('a')!;
    expect(page.textContent).toBe('Ver https://fabricante.example/retro-123 antes de pedir');
    expect(link.getAttribute('href')).toBe('https://fabricante.example/retro-123');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('leaves plain text and other schemes as text', async () => {
    const page = await render('Tallas grandes; javascript:alert(1) no es un enlace');

    expect(page.querySelector('a')).toBeNull();
    expect(page.textContent).toBe('Tallas grandes; javascript:alert(1) no es un enlace');
  });

  it('shows nothing without text', async () => {
    const page = await render(null);

    expect(page.textContent).toBe('');
  });
});
