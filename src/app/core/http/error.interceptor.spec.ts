import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { errorInterceptor, SILENT_ERRORS } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  const snackBar = { open: vi.fn() };

  beforeEach(() => {
    snackBar.open.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  function failWith(body: string | object, status: number, context?: HttpContext) {
    let failed = false;
    http.get('/api/things', { context }).subscribe({ error: () => (failed = true) });
    backend.expectOne('/api/things').flush(body, { status, statusText: 'Error' });
    return failed;
  }

  it('shows the Spanish detail of a business rule error and still lets the caller see the error', () => {
    const failed = failWith(
      { title: 'Operación no permitida', detail: 'El pedido SO-2026-000001 está cancelado' },
      409,
    );

    expect(failed).toBe(true);
    expect(snackBar.open).toHaveBeenCalledWith(
      'El pedido SO-2026-000001 está cancelado',
      'Cerrar',
      expect.anything(),
    );
  });

  it('lists the field messages of a validation error', () => {
    failWith(
      {
        title: 'Datos no válidos',
        detail: 'Hay campos con valores no válidos.',
        errors: [
          { field: 'name', message: 'El nombre es obligatorio' },
          { field: 'salePrice', message: 'El precio no puede ser negativo' },
        ],
      },
      400,
    );

    expect(snackBar.open).toHaveBeenCalledWith(
      'El nombre es obligatorio. El precio no puede ser negativo',
      'Cerrar',
      expect.anything(),
    );
  });

  it('explains that the backend is unreachable when there is no Spanish detail', () => {
    failWith('', 504);

    expect(snackBar.open).toHaveBeenCalledWith(
      'No se puede conectar con el backend. Inténtalo de nuevo.',
      'Cerrar',
      expect.anything(),
    );
  });

  it('reads the Spanish detail when the error comes as a file, as in the Excel download', async () => {
    http.get('/api/file', { responseType: 'blob' }).subscribe({ error: () => undefined });
    backend.expectOne('/api/file').flush(
      new Blob([JSON.stringify({ detail: 'El lote FB-2026-0001 está cancelado' })], {
        type: 'application/problem+json',
      }),
      { status: 409, statusText: 'Conflict' },
    );

    await vi.waitFor(() =>
      expect(snackBar.open).toHaveBeenCalledWith(
        'El lote FB-2026-0001 está cancelado',
        'Cerrar',
        expect.anything(),
      ),
    );
  });

  it('stays silent for requests that handle their own errors', () => {
    failWith('', 504, new HttpContext().set(SILENT_ERRORS, true));

    expect(snackBar.open).not.toHaveBeenCalled();
  });
});
