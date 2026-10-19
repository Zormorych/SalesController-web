import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the application name in the toolbar and the current page below', async () => {
    const page = await render();

    expect(page.querySelector('mat-toolbar')?.textContent).toContain('SalesController');
    expect(page.querySelector('router-outlet')).toBeTruthy();
  });

  it('has a menu entry for each section', async () => {
    const page = await render();
    const links = Array.from(page.querySelectorAll('nav a'));

    expect(links.map((link) => link.querySelector('.label')?.textContent?.trim())).toEqual([
      'Inicio',
      'Catálogo',
      'Clientes',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/', '/catalogo', '/clientes']);
  });
});
