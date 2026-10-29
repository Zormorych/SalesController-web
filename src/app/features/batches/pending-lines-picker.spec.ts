import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { pendingLine } from './batches.testing';
import { PendingLinesPicker } from './pending-lines-picker';

describe('PendingLinesPicker', () => {
  let fixture: ComponentFixture<PendingLinesPicker>;
  let page: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [PendingLinesPicker] });
    fixture = TestBed.createComponent(PendingLinesPicker);
    fixture.componentRef.setInput('lines', [
      pendingLine(7),
      pendingLine(8, { orderNumber: 'SO-2026-000006', customerName: 'Luis Gómez', size: 'M' }),
    ]);
    fixture.componentRef.setInput('sizes', [
      { code: 'M', label: 'M' },
      { code: 'KIDS_16', label: '16 (niño)' },
    ]);
    fixture.componentRef.setInput('selected', []);
    await fixture.whenStable();
    page = fixture.nativeElement as HTMLElement;
  });

  async function toggle(index: number) {
    page.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[index].click();
    await fixture.whenStable();
  }

  it('shows each shirt with its order, customer, description and size label', () => {
    const cells = Array.from(page.querySelectorAll('tr[mat-row]')[0].querySelectorAll('td'))
      .slice(1)
      .map((cell) => cell.textContent!.replace(/\s+/g, ' ').trim());

    expect(cells).toEqual([
      'SO-2026-000005',
      'Ana Pérez',
      'Camiseta Fan · Betis local · JOAQUÍN 17',
      '16 (niño)',
    ]);
  });

  it('says when a shirt has no customer', async () => {
    fixture.componentRef.setInput('lines', [
      pendingLine(9, { customerId: null, customerName: null }),
    ]);
    await fixture.whenStable();

    expect(page.querySelector('tr[mat-row]')?.textContent).toContain('Sin cliente');
  });

  it('selects shirts one by one or all at once', async () => {
    await toggle(2);
    expect(fixture.componentInstance.selected()).toEqual([8]);

    await toggle(0);
    expect(fixture.componentInstance.selected()).toEqual([7, 8]);

    await toggle(0);
    expect(fixture.componentInstance.selected()).toEqual([]);
  });
});
