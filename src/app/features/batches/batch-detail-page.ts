import { CurrencyPipe, DatePipe } from '@angular/common';
import { ComponentType } from '@angular/cdk/portal';
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
import { FileDownloader } from '../../shared/file-downloader';
import { CatalogService } from '../catalog/catalog.service';
import { LINE_STATUS_LABELS } from '../orders/order-labels';
import { LineStatus } from '../orders/orders.models';
import { AddBatchLinesDialog, AddBatchLinesDialogData } from './add-batch-lines-dialog';
import { BATCH_STATUS_LABELS, shirtText } from './batch-labels';
import { BatchDetailsDialog, BatchDetailsDialogData } from './batch-details-dialog';
import { BatchDetails, BatchLine, BatchStatus } from './batches.models';
import { BatchesService } from './batches.service';

// Detalle de un lote: camisetas con su parte del envío y su beneficio, el Excel y las acciones según su estado
@Component({
  selector: 'app-batch-detail-page',
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
  templateUrl: './batch-detail-page.html',
  styleUrl: './batch-detail-page.scss',
})
export class BatchDetailPage {
  private readonly service = inject(BatchesService);
  private readonly catalogService = inject(CatalogService);
  private readonly dialog = inject(MatDialog);
  private readonly downloader = inject(FileDownloader);

  // Viene de la ruta /lotes/:id
  readonly id = input.required<string>();

  protected readonly columns = [
    'orderNumber',
    'customerName',
    'shirt',
    'size',
    'status',
    'totalSale',
    'totalCost',
    'shippingShare',
    'profit',
    'actions',
  ];
  protected readonly missingColumns = ['orderNumber', 'customerName', 'shirt', 'size', 'status'];
  protected readonly batch = rxResource({
    params: () => Number(this.id()),
    stream: ({ params }) => this.service.get(params),
  });
  // Abierto: se puede cambiar todo. Enviado o recibido: solo el envío, las notas y el Excel
  protected readonly open = computed(() => this.batch.value()?.status === 'OPEN');
  protected readonly active = computed(() => {
    const status = this.batch.value()?.status;
    return !!status && status !== 'CANCELLED';
  });

  protected readonly shirtText = shirtText;
  protected readonly statusLabel = (status: BatchStatus) => BATCH_STATUS_LABELS[status];
  protected readonly lineStatusLabel = (status: LineStatus) => LINE_STATUS_LABELS[status];

  protected downloadExcel(batch: BatchDetails): void {
    this.service.excel(batch.id).subscribe((file) => this.downloader.save(file.name, file.content));
  }

  protected editDetails(batch: BatchDetails): void {
    this.openDialog<BatchDetailsDialog, BatchDetailsDialogData>(BatchDetailsDialog, {
      shippingCost: batch.shippingCost,
      notes: batch.notes,
      save: (request) => this.service.update(batch.id, request),
    }).subscribe((updated) => this.batch.set(updated));
  }

  protected addLines(batch: BatchDetails): void {
    forkJoin({ lines: this.service.pendingLines(), sizes: this.catalogService.sizes() })
      .pipe(
        switchMap((lookups) =>
          this.openDialog<AddBatchLinesDialog, AddBatchLinesDialogData>(AddBatchLinesDialog, {
            ...lookups,
            save: (lineIds) => this.service.addLines(batch.id, lineIds),
          }),
        ),
      )
      .subscribe((updated) => this.batch.set(updated));
  }

  protected removeLine(batch: BatchDetails, line: BatchLine): void {
    this.service.removeLine(batch.id, line.lineId).subscribe((updated) => this.batch.set(updated));
  }

  protected send(batch: BatchDetails): void {
    this.confirm({
      title: `¿Enviar el lote ${batch.batchNumber} al fabricante?`,
      message:
        'Sus camisetas pasarán a "pedidas" y ya no se podrán editar ni cancelar en los pedidos.',
      confirm: 'Enviar',
    })
      .pipe(switchMap(() => this.service.send(batch.id)))
      .subscribe((updated) => this.batch.set(updated));
  }

  protected discard(batch: BatchDetails): void {
    this.confirm({
      title: `¿Descartar el lote ${batch.batchNumber}?`,
      message: 'Sus camisetas volverán a quedar pendientes de pedir. No se puede deshacer.',
      confirm: 'Descartar lote',
    })
      .pipe(switchMap(() => this.service.cancel(batch.id)))
      .subscribe((updated) => this.batch.set(updated));
  }

  // Los diálogos guardan ellos mismos y se cierran con el lote actualizado (o sin nada si se cancelan)
  private openDialog<C, D>(component: ComponentType<C>, data: D): Observable<BatchDetails> {
    return this.dialog
      .open<C, D, BatchDetails>(component, { data, width: '760px', maxWidth: '95vw' })
      .afterClosed()
      .pipe(filter((updated): updated is BatchDetails => !!updated));
  }

  private confirm(data: ConfirmDialogData): Observable<true> {
    return this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, { data })
      .afterClosed()
      .pipe(filter((confirmed): confirmed is true => confirmed === true));
  }
}
