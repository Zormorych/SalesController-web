import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, switchMap } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from '../../shared/confirm-dialog';
import { PaymentDialog, PaymentDialogData } from './payment-dialog';
import { Payment, PaymentSummary } from './payments.models';
import { PaymentsService } from './payments.service';

// Cobros de un pedido: lo cobrado, lo pendiente (o lo que hay que devolver), registrar y anular
@Component({
  selector: 'app-order-payments',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './order-payments.html',
  styleUrl: './order-payments.scss',
})
export class OrderPayments {
  private readonly service = inject(PaymentsService);
  private readonly dialog = inject(MatDialog);

  readonly orderId = input.required<number>();
  // Si cambia el total del pedido (se añade o cancela una camiseta), cambia lo pendiente: se recarga
  readonly orderTotal = input.required<number>();

  protected readonly columns = ['paymentDate', 'amount', 'notes', 'status', 'actions'];
  protected readonly summary = rxResource({
    params: () => ({ orderId: this.orderId(), orderTotal: this.orderTotal() }),
    stream: ({ params }) => this.service.summary(params.orderId),
  });

  protected readonly pendingText = computed(() => {
    const pending = this.summary.value()?.pendingAmount ?? 0;
    if (pending > 0) {
      return { label: 'Pendiente', amount: pending };
    }
    return pending < 0 ? { label: 'A devolver', amount: -pending } : null;
  });

  protected readonly canRegister = computed(() => {
    const summary = this.summary.value();
    return !!summary && !summary.orderCancelled && summary.pendingAmount > 0;
  });

  protected register(summary: PaymentSummary): void {
    this.dialog
      .open<PaymentDialog, PaymentDialogData, PaymentSummary>(PaymentDialog, {
        data: {
          pending: summary.pendingAmount,
          save: (request) => this.service.register(summary.orderId, request),
        },
        width: '400px',
      })
      .afterClosed()
      .pipe(filter((updated): updated is PaymentSummary => !!updated))
      .subscribe((updated) => this.summary.set(updated));
  }

  protected voidPayment(summary: PaymentSummary, payment: Payment): void {
    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        data: {
          title: '¿Anular este cobro?',
          message: 'Seguirá en la lista como anulado y dejará de contar como cobrado.',
          confirm: 'Anular cobro',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmed) => confirmed === true),
        switchMap(() => this.service.voidPayment(summary.orderId, payment.id)),
      )
      .subscribe((updated) => this.summary.set(updated));
  }
}
