import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { provideRouter, Router } from '@angular/router';
import { provideSpanishLocale } from '../../core/locale';
import { CatalogItem, Size } from '../catalog/catalog.models';
import { Customer } from '../customers/customers.models';
import { OrderFormPage } from './order-form-page';

describe('OrderFormPage', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<OrderFormPage>;
  let loader: HarnessLoader;
  let page: HTMLElement;
  const ana: Customer = { id: 3, name: 'Ana Pérez', phone: null, notes: null };
  const fan: CatalogItem = {
    id: 1,
    name: 'Camiseta Fan',
    salePrice: 15,
    purchaseCost: 6.5,
    description: 'Ver https://fabricante.example/fan-1',
    active: true,
  };
  const nameAndNumber: CatalogItem = {
    id: 2,
    name: 'Nombre + número',
    salePrice: 2,
    purchaseCost: 1.2,
    active: true,
  };
  const sizes: Size[] = [
    { code: 'M', label: 'M' },
    { code: 'KIDS_16', label: '16 (niño)' },
  ];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [OrderFormPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideSpanishLocale(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(OrderFormPage);
    TestBed.tick();
    http.expectOne('/api/customers').flush([ana]);
    http.expectOne('/api/catalog/products?includeInactive=false').flush([fan]);
    http.expectOne('/api/catalog/customizations?includeInactive=false').flush([nameAndNumber]);
    http.expectOne('/api/catalog/sizes').flush(sizes);
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
    page = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  async function choose(testId: string, option: string | RegExp) {
    const select = await loader.getHarness(
      MatSelectHarness.with({ selector: `[data-testid="${testId}"]` }),
    );
    await select.open();
    await select.clickOptions({ text: option });
  }

  function type(selector: string, value: string) {
    const field = page.querySelector<HTMLInputElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  async function click(testId: string) {
    page.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`)!.click();
    await fixture.whenStable();
  }

  function today(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  async function fillOneShirt() {
    await choose('customer', 'Ana Pérez');
    await choose('product', /Camiseta Fan/);
    type('input[formControlName="kitName"]', 'Selección Española blanca');
    await choose('size', 'M');
  }

  it('starts dated today with one shirt', () => {
    expect(page.querySelector<HTMLInputElement>('input[formControlName="orderDate"]')!.value).toBe(
      today(),
    );
    expect(page.querySelectorAll('[data-testid="line"]')).toHaveLength(1);
  });

  it('shows the description of the chosen product, with its link, for quick access', async () => {
    expect(page.querySelector('[data-testid="product-description"]')).toBeNull();

    await choose('product', /Camiseta Fan/);

    const description = page.querySelector('[data-testid="product-description"]')!;
    expect(description.textContent).toContain('Ver https://fabricante.example/fan-1');
    expect(description.querySelector('a')?.getAttribute('href')).toBe(
      'https://fabricante.example/fan-1',
    );
  });

  it('creates an order with catalog prices and a free customization, then opens it', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fillOneShirt();
    await click('add-customization');
    await choose('customization', /Nombre \+ número/);
    type('input[formControlName="customText"]', 'WILLIAMS JR 17');
    await click('free');

    await click('save');
    const created = http.expectOne({ method: 'POST', url: '/api/sales/orders' });
    expect(created.request.body).toEqual({
      customerId: 3,
      orderDate: today(),
      notes: null,
      lines: [
        {
          productId: 1,
          kitName: 'Selección Española blanca',
          size: 'M',
          unitSalePrice: 15,
          unitPurchaseCost: 6.5,
          customizations: [
            { customizationId: 2, customText: 'WILLIAMS JR 17', salePrice: 0, purchaseCost: 1.2 },
          ],
        },
      ],
    });
    created.flush({ id: 9 });
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/pedidos', 9]);
  });

  it('adds up the sale price of every shirt and customization', async () => {
    await fillOneShirt();
    await click('add-customization');
    await choose('customization', /Nombre \+ número/);
    await click('add-line');

    expect(page.querySelectorAll('[data-testid="line"]')).toHaveLength(2);
    expect(
      page.querySelector('[data-testid="total"]')?.textContent?.replace(/\s+/g, ' '),
    ).toContain('17,00 €');
  });

  it('does not send an order without customer or kit name', async () => {
    await click('save');

    http.expectNone({ method: 'POST', url: '/api/sales/orders' });
  });
});
