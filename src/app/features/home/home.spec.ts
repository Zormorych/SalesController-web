import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Home } from './home';

describe('Home', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function render(answer: (request: ReturnType<HttpTestingController['expectOne']>) => void) {
    const fixture = TestBed.createComponent(Home);
    // Lanza la petición sin esperar a que termine: whenStable() esperaría a la respuesta, que aún no hay
    TestBed.tick();
    answer(http.expectOne('/api/health'));
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows that the backend is connected when it answers UP', async () => {
    const page = await render((request) =>
      request.flush({ status: 'UP', application: 'sales-manager-backend', timestamp: '' }),
    );

    expect(page.querySelector('[data-testid="backend-status"]')?.textContent).toContain(
      'Backend conectado',
    );
  });

  it('shows that the backend is not reachable when the request fails', async () => {
    const page = await render((request) =>
      request.flush('', { status: 504, statusText: 'Gateway Timeout' }),
    );

    expect(page.querySelector('[data-testid="backend-status"]')?.textContent).toContain(
      'No se puede conectar con el backend',
    );
  });
});
