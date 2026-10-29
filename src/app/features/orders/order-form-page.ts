import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { today } from '../../shared/dates';
import { CatalogService } from '../catalog/catalog.service';
import { CustomersService } from '../customers/customers.service';
import { OrderLineFields } from './order-line-fields';
import { LineForm, lineForm, lineSale, toLineRequest } from './order-line-form';
import { OrdersService } from './orders.service';

// Alta de un pedido: cliente, fecha, notas y una o varias camisetas, cada una con sus personalizaciones
@Component({
  selector: 'app-order-form-page',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    OrderLineFields,
  ],
  templateUrl: './order-form-page.html',
  styleUrl: './order-form-page.scss',
})
export class OrderFormPage {
  private readonly ordersService = inject(OrdersService);
  private readonly catalogService = inject(CatalogService);
  private readonly customersService = inject(CustomersService);
  private readonly router = inject(Router);

  protected readonly customers = rxResource({ stream: () => this.customersService.list('') });
  protected readonly products = rxResource({
    stream: () => this.catalogService.list('products', false),
  });
  protected readonly customizations = rxResource({
    stream: () => this.catalogService.list('customizations', false),
  });
  protected readonly sizes = rxResource({ stream: () => this.catalogService.sizes() });

  protected readonly form = new FormGroup({
    // Vacío: el pedido es para uno mismo
    customerId: new FormControl<number | null>(null),
    orderDate: new FormControl(today(), { nonNullable: true, validators: Validators.required }),
    notes: new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) }),
    lines: new FormArray<LineForm>([lineForm()]),
  });
  protected readonly saving = signal(false);

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: null });
  // Lo que pagará el cliente según lo escrito; se recalcula con cada cambio
  protected readonly total = computed(() => {
    this.formValue();
    return this.form.controls.lines.controls.reduce((sum, line) => sum + lineSale(line), 0);
  });

  protected addLine(): void {
    this.form.controls.lines.push(lineForm());
  }

  protected removeLine(index: number): void {
    this.form.controls.lines.removeAt(index);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { customerId, orderDate, notes } = this.form.getRawValue();
    this.saving.set(true);
    this.ordersService
      .create({
        customerId,
        orderDate,
        notes: notes.trim() || null,
        lines: this.form.controls.lines.controls.map(toLineRequest),
      })
      .subscribe({
        next: (order) => this.router.navigate(['/pedidos', order.id]),
        error: () => this.saving.set(false),
      });
  }
}
