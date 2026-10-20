import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideSpanishLocale } from '../../core/locale';
import { PendingLine } from './batches.models';
import { NewBatchPage } from './new-batch-page';
import { pendingLine } from './batches.testing';

describe('NewBatchPage', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<NewBatchPage>;
  let page: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NewBatchPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideSpanishLocale(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function render(lines: PendingLine[]) {
    fixture = TestBed.createComponent(NewBatchPage);
    TestBed.tick();
    http.expectOne('/api/purchasing/pending-lines').flush(lines);
    http.expectOne('/api/catalog/sizes').flush([{ code: 'KIDS_16', label: '16 (niño)' }]);
    await fixture.whenStable();
    page = fixture.nativeElement as HTMLElement;
  }

  function type(selector: string, value: string) {
    const field = page.querySelector<HTMLInputElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  function createButton() {
    return page.querySelector<HTMLButtonElement>('[data-testid="create"]')!;
  }

  it('starts with every pending shirt chosen and the usual 4,00 € of shipping', async () => {
    await render([pendingLine(7), pendingLine(8)]);

    expect(
      page.querySelector<HTMLInputElement>('input[formControlName="shippingCost"]')!.value,
    ).toBe('4');
    expect(createButton().textContent).toContain('Crear lote con 2 camisetas');
  });

  it('creates the batch with the chosen shirts and opens it', async () => {
    await render([pendingLine(7), pendingLine(8)]);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    page.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[2].click();
    await fixture.whenStable();
    type('input[formControlName="shippingCost"]', '4.5');
    type('input[formControlName="notes"]', 'Pedido de octubre');
    createButton().click();

    const created = http.expectOne({ method: 'POST', url: '/api/purchasing/batches' });
    expect(created.request.body).toEqual({
      lineIds: [7],
      shippingCost: 4.5,
      notes: 'Pedido de octubre',
    });
    created.flush({ id: 12 });
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/lotes', 12]);
  });

  it('cannot create a batch without shirts', async () => {
    await render([]);

    expect(page.textContent).toContain('No hay camisetas pendientes de pedir');
    expect(createButton().disabled).toBe(true);
  });
});
