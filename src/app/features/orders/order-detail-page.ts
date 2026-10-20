import { ComponentType } from '@angular/cdk/portal';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { filter, forkJoin, Observable, switchMap } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from '../../shared/confirm-dialog';
import { whatsappUrl } from '../../shared/whatsapp';
import { CatalogService } from '../catalog/catalog.service';
import { CustomersService } from '../customers/customers.service';
import { LINE_STATUS_LABELS, PROGRESS_LABELS } from './order-labels';
import { OrderHeaderDialog, OrderHeaderDialogData } from './order-header-dialog';
import { OrderLineDialog, OrderLineDialogData } from './order-line-dialog';
import { LineStatus, OrderDetails, OrderLine, OrderProgress } from './orders.models';
import { OrdersService } from './orders.service';

// Detalle de un pedido: cliente, camisetas con su estado y sus importes, totales y acciones
@Component({
  selector: 'app-order-detail-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './order-detail-page.html',
  styleUrl: './order-detail-page.scss',
})
export class OrderDetailPage {
  private readonly ordersService = inject(OrdersService);
  private readonly catalogService = inject(CatalogService);
  private readonly customersService = inject(CustomersService);
  private readonly dialog = inject(MatDialog);

  // Viene de la ruta /pedidos/:id
  readonly id = input.required<string>();

  protected readonly columns = [
    'product',
    'size',
    'customizations',
    'status',
    'totalSale',
    'totalCost',
    'profit',
    'actions',
  ];
  protected readonly order = rxResource({
    params: () => Number(this.id()),
    stream: ({ params }) => this.ordersService.get(params),
  });
  // Un pedido cancelado ya no se puede tocar
  protected readonly editable = computed(() => this.order.value()?.status === 'OPEN');

  protected readonly whatsappUrl = whatsappUrl;
  protected readonly statusLabel = (status: LineStatus) => LINE_STATUS_LABELS[status];
  protected readonly progressLabel = (progress: OrderProgress) => PROGRESS_LABELS[progress];

  protected customizationsText(line: OrderLine): string {
    return line.customizations
      .map((c) => (c.customText ? `${c.customizationName}: ${c.customText}` : c.customizationName))
      .join(', ');
  }

  protected editHeader(order: OrderDetails): void {
    this.customersService
      .list('')
      .pipe(
        switchMap((customers) =>
          this.openDialog<OrderHeaderDialog, OrderHeaderDialogData>(OrderHeaderDialog, {
            header: {
              customerId: order.customer?.id ?? 0,
              orderDate: order.orderDate,
              notes: order.notes,
            },
            customers,
            save: (request) => this.ordersService.update(order.id, request),
          }),
        ),
      )
      .subscribe((updated) => this.order.set(updated));
  }

  protected addLine(order: OrderDetails): void {
    this.openLineDialog(undefined, (request) => this.ordersService.addLine(order.id, request));
  }

  protected editLine(order: OrderDetails, line: OrderLine): void {
    this.openLineDialog(line, (request) =>
      this.ordersService.updateLine(order.id, line.id, request),
    );
  }

  protected cancelLine(order: OrderDetails, line: OrderLine): void {
    this.confirm({
      title: '¿Cancelar esta camiseta?',
      message: `${line.productName} · ${line.kitName} (${line.sizeLabel}) dejará de contar en el pedido.`,
      confirm: 'Cancelar camiseta',
    })
      .pipe(switchMap(() => this.ordersService.cancelLine(order.id, line.id)))
      .subscribe((updated) => this.order.set(updated));
  }

  protected cancelOrder(order: OrderDetails): void {
    this.confirm({
      title: `¿Cancelar el pedido ${order.orderNumber}?`,
      message: 'Se cancelarán todas sus camisetas. No se puede deshacer.',
      confirm: 'Cancelar pedido',
    })
      .pipe(switchMap(() => this.ordersService.cancel(order.id)))
      .subscribe((updated) => this.order.set(updated));
  }

  // El diálogo de camiseta necesita el catálogo y las tallas: se cargan al abrirlo
  private openLineDialog(line: OrderLine | undefined, save: OrderLineDialogData['save']): void {
    forkJoin({
      products: this.catalogService.list('products', false),
      customizations: this.catalogService.list('customizations', false),
      sizes: this.catalogService.sizes(),
    })
      .pipe(
        switchMap((lookups) =>
          this.openDialog<OrderLineDialog, OrderLineDialogData>(OrderLineDialog, {
            ...lookups,
            line,
            save,
          }),
        ),
      )
      .subscribe((updated) => this.order.set(updated));
  }

  // Los diálogos guardan ellos mismos y se cierran con el pedido actualizado (o sin nada si se cancelan)
  private openDialog<C, D>(component: ComponentType<C>, data: D): Observable<OrderDetails> {
    return this.dialog
      .open<C, D, OrderDetails>(component, { data, width: '760px', maxWidth: '95vw' })
      .afterClosed()
      .pipe(filter((updated): updated is OrderDetails => !!updated));
  }

  private confirm(data: ConfirmDialogData): Observable<true> {
    return this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, { data })
      .afterClosed()
      .pipe(filter((confirmed): confirmed is true => confirmed === true));
  }
}
