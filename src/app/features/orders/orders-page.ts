import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { CustomersService } from '../customers/customers.service';
import { PROGRESS_LABELS } from './order-labels';
import { OrderProgress } from './orders.models';
import { OrdersService } from './orders.service';

// Pedidos de clientes, del más reciente al más antiguo, con filtro por cliente
@Component({
  selector: 'app-orders-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.scss',
})
export class OrdersPage {
  private readonly ordersService = inject(OrdersService);
  private readonly customersService = inject(CustomersService);

  protected readonly columns = [
    'orderNumber',
    'orderDate',
    'customerName',
    'activeLines',
    'totalSale',
    'totalProfit',
    'progress',
  ];
  protected readonly progressLabel = (progress: OrderProgress) => PROGRESS_LABELS[progress];
  protected readonly customerId = signal<number | null>(null);
  protected readonly customers = rxResource({ stream: () => this.customersService.list('') });
  protected readonly orders = rxResource({
    params: () => this.customerId(),
    stream: ({ params }) => this.ordersService.list(params),
  });
}
