import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { Customer } from './customers.models';
import { CustomersPage } from './customers-page';

describe('CustomersPage', () => {
  let http: HttpTestingController;
  const dialog = { open: vi.fn() };
  const ana: Customer = { id: 1, name: 'Ana Pérez', phone: '+34600123456', notes: 'Talla M' };
  const luis: Customer = { id: 2, name: 'Luis Gómez', phone: null, notes: null };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    dialog.open.mockReset();
    TestBed.configureTestingModule({
      imports: [CustomersPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialog, useValue: dialog },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  async function render(customers: Customer[]) {
    const fixture = TestBed.createComponent(CustomersPage);
    TestBed.tick();
    http.expectOne('/api/customers').flush(customers);
    await fixture.whenStable();
    return fixture;
  }

  function names(page: HTMLElement) {
    return Array.from(page.querySelectorAll('tr[mat-row] td:first-child')).map((cell) =>
      cell.textContent!.trim(),
    );
  }

  it('lists customers with a WhatsApp link when they have a phone', async () => {
    const fixture = await render([ana, luis]);
    const page = fixture.nativeElement as HTMLElement;

    expect(names(page)).toEqual(['Ana Pérez', 'Luis Gómez']);
    const links = page.querySelectorAll<HTMLAnchorElement>('a[data-testid="whatsapp"]');
    expect(links).toHaveLength(1);
    expect(links[0].href).toBe('https://wa.me/34600123456');
    expect(links[0].textContent).toContain('+34600123456');
  });

  it('searches by name or phone after the user stops typing', async () => {
    const fixture = await render([ana, luis]);
    const page = fixture.nativeElement as HTMLElement;
    const search = page.querySelector<HTMLInputElement>('input[data-testid="search"]')!;

    search.value = 'ana';
    search.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(400);
    TestBed.tick();
    http.expectOne('/api/customers?search=ana').flush([ana]);
    await fixture.whenStable();

    expect(names(page)).toEqual(['Ana Pérez']);
  });

  it('creates a customer with the dialog data and reloads the list', async () => {
    const fixture = await render([]);
    const request = { name: 'Ana Pérez', phone: null, notes: null };
    // Como el diálogo real: guarda con la función que recibe y se cierra con lo guardado
    dialog.open.mockImplementation((_component, config) => ({
      afterClosed: () => config.data.save(request),
    }));

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="new"]')!
      .click();
    const created = http.expectOne((req) => req.method === 'POST' && req.url === '/api/customers');
    expect(created.request.body).toEqual(request);
    created.flush(ana);
    TestBed.tick();
    http.expectOne('/api/customers').flush([ana]);
    await fixture.whenStable();

    expect(names(fixture.nativeElement)).toEqual(['Ana Pérez']);
  });

  it('edits a customer from its row', async () => {
    const fixture = await render([ana]);
    const request = { name: 'Ana Pérez', phone: '+34600123456', notes: 'Talla L' };
    // Como el diálogo real: guarda con la función que recibe y se cierra con lo guardado
    dialog.open.mockImplementation((_component, config) => ({
      afterClosed: () => config.data.save(request),
    }));

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="edit"]')!
      .click();
    const updated = http.expectOne('/api/customers/1');
    expect(updated.request.method).toBe('PUT');
    updated.flush({ ...ana, notes: 'Talla L' });
    TestBed.tick();
    http.expectOne('/api/customers').flush([{ ...ana, notes: 'Talla L' }]);
    await fixture.whenStable();
  });
});
