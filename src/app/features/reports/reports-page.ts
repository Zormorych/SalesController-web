import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { lastMonth, Period, thisMonth, thisYear } from '../../shared/periods';
import { BATCH_STATUS_LABELS } from '../batches/batch-labels';
import { BatchStatus } from '../batches/batches.models';
import { ReportsService } from './reports.service';

// Informes: cómo va un periodo (venta, coste, envío, beneficio, cobrado), lo pendiente y el beneficio por lote
@Component({
  selector: 'app-reports-page',
  imports: [
    CurrencyPipe,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
  ],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.scss',
})
export class ReportsPage {
  private readonly service = inject(ReportsService);

  protected readonly period = signal<Period>(thisMonth());
  protected readonly validPeriod = computed(() => this.period().from <= this.period().to);
  protected readonly summary = rxResource({
    // Sin periodo válido no se pide nada: el backend daría un 400
    params: () => (this.validPeriod() ? this.period() : undefined),
    stream: ({ params }) => this.service.summary(params.from, params.to),
  });
  protected readonly pending = rxResource({ stream: () => this.service.pending() });
  protected readonly batches = rxResource({ stream: () => this.service.batches() });

  protected readonly batchColumns = [
    'batchNumber',
    'status',
    'shirts',
    'sale',
    'cost',
    'shipping',
    'profit',
  ];
  protected readonly statusLabel = (status: BatchStatus) => BATCH_STATUS_LABELS[status];
  protected readonly shortcuts = [
    { testId: 'this-month', label: 'Este mes', period: thisMonth },
    { testId: 'last-month', label: 'Mes anterior', period: lastMonth },
    { testId: 'this-year', label: 'Este año', period: thisYear },
  ];

  protected setFrom(from: string): void {
    this.period.update((period) => ({ ...period, from }));
  }

  protected setTo(to: string): void {
    this.period.update((period) => ({ ...period, to }));
  }

  protected plural(count: number, singular: string, plural: string): string {
    return `${count} ${count === 1 ? singular : plural}`;
  }
}
