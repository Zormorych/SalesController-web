import { ComponentType } from '@angular/cdk/portal';
import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, switchMap } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from '../../shared/confirm-dialog';
import { ResaleItemDialog, ResaleItemDialogData } from './resale-item-dialog';
import { ResaleItem, ResaleItemStatus } from './resale.models';
import { ResaleService } from './resale.service';
import { SellDialog, SellDialogData } from './sell-dialog';

interface StockFilter {
  status: ResaleItemStatus | null;
  label: string;
  testId: string;
}

// Stock y reventa: prendas para revender (compradas o de pedidos que el cliente no quiso), venta y beneficio
@Component({
  selector: 'app-stock-page',
  imports: [CurrencyPipe, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './stock-page.html',
  styleUrl: './stock-page.scss',
})
export class StockPage {
  private readonly service = inject(ResaleService);
  private readonly dialog = inject(MatDialog);

  protected readonly filters: StockFilter[] = [
    { status: 'AVAILABLE', label: 'Disponibles', testId: 'filter-AVAILABLE' },
    { status: 'SOLD', label: 'Vendidas', testId: 'filter-SOLD' },
    { status: null, label: 'Todas', testId: 'filter-ALL' },
  ];
  protected readonly status = signal<ResaleItemStatus | null>('AVAILABLE');
  protected readonly items = rxResource({
    params: () => ({ status: this.status() }),
    stream: ({ params }) => this.service.list(params.status),
  });
  protected readonly columns = [
    'name',
    'size',
    'origin',
    'purchaseCost',
    'askingPrice',
    'salePrice',
    'profit',
    'actions',
  ];

  protected create(): void {
    this.openDialog<ResaleItemDialog, ResaleItemDialogData>(ResaleItemDialog, {
      save: (request) => this.service.create(request),
    });
  }

  protected edit(item: ResaleItem): void {
    this.openDialog<ResaleItemDialog, ResaleItemDialogData>(ResaleItemDialog, {
      item,
      save: (request) => this.service.update(item.id, request),
    });
  }

  protected sell(item: ResaleItem): void {
    this.openDialog<SellDialog, SellDialogData>(SellDialog, {
      item,
      save: (request) => this.service.sell(item.id, request),
    });
  }

  protected unsell(item: ResaleItem): void {
    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        data: {
          title: '¿Deshacer la venta?',
          message: `${item.name} volverá a estar disponible y su venta dejará de contar en los informes.`,
          confirm: 'Deshacer venta',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmed) => confirmed === true),
        switchMap(() => this.service.unsell(item.id)),
      )
      .subscribe(() => this.items.reload());
  }

  // Los diálogos guardan ellos mismos; si se cerraron con algo guardado, se recarga la lista
  private openDialog<C, D>(component: ComponentType<C>, data: D): void {
    this.dialog
      .open<C, D, ResaleItem>(component, { data, width: '440px' })
      .afterClosed()
      .pipe(filter((saved) => !!saved))
      .subscribe(() => this.items.reload());
  }
}
