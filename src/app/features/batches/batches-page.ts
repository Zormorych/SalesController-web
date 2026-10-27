import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { BATCH_STATUS_LABELS } from './batch-labels';
import { BatchStatus } from './batches.models';
import { BatchesService } from './batches.service';

// Lotes al fabricante, del más reciente al más antiguo
@Component({
  selector: 'app-batches-page',
  imports: [CurrencyPipe, DatePipe, RouterLink, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <h1>Lotes al fabricante</h1>

    <div class="toolbar">
      <a mat-flat-button data-testid="new" routerLink="/lotes/nuevo">
        <mat-icon>add</mat-icon>
        Nuevo lote
      </a>
    </div>

    <div class="table-wrapper">
      <table mat-table [dataSource]="batches.value() ?? []">
        <ng-container matColumnDef="batchNumber">
          <th mat-header-cell *matHeaderCellDef>Lote</th>
          <td mat-cell *matCellDef="let batch">
            <a [routerLink]="['/lotes', batch.id]">{{ batch.batchNumber }}</a>
          </td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let batch">
            <span class="badge" [attr.data-status]="batch.status">{{
              statusLabel(batch.status)
            }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="createdAt">
          <th mat-header-cell *matHeaderCellDef>Creado</th>
          <td mat-cell *matCellDef="let batch">{{ batch.createdAt | date: 'dd/MM/yyyy' }}</td>
        </ng-container>
        <ng-container matColumnDef="sentAt">
          <th mat-header-cell *matHeaderCellDef>Enviado</th>
          <td mat-cell *matCellDef="let batch">{{ batch.sentAt | date: 'dd/MM/yyyy' }}</td>
        </ng-container>
        <ng-container matColumnDef="lineCount">
          <th mat-header-cell *matHeaderCellDef class="number">Camisetas</th>
          <td mat-cell *matCellDef="let batch" class="number">{{ batch.lineCount }}</td>
        </ng-container>
        <ng-container matColumnDef="shippingCost">
          <th mat-header-cell *matHeaderCellDef class="number">Envío</th>
          <td mat-cell *matCellDef="let batch" class="number">
            {{ batch.shippingCost | currency }}
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
        <tr class="mat-row" *matNoDataRow>
          <td class="empty" [attr.colspan]="columns.length">
            @if (batches.isLoading()) {
              Cargando…
            } @else {
              Todavía no hay lotes.
            }
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: `
    .toolbar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }
    .table-wrapper {
      overflow-x: auto;
    }
    .number {
      text-align: right;
      white-space: nowrap;
    }
    .empty {
      padding: 24px;
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class BatchesPage {
  private readonly service = inject(BatchesService);

  protected readonly columns = [
    'batchNumber',
    'status',
    'createdAt',
    'sentAt',
    'lineCount',
    'shippingCost',
  ];
  protected readonly batches = rxResource({ stream: () => this.service.list() });
  protected readonly statusLabel = (status: BatchStatus) => BATCH_STATUS_LABELS[status];
}
