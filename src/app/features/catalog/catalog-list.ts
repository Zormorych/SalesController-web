import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, switchMap } from 'rxjs';
import { CatalogItemDialog, CatalogItemDialogData } from './catalog-item-dialog';
import { CATALOG_LABELS, CatalogItem, CatalogItemRequest, CatalogKind } from './catalog.models';
import { CatalogService } from './catalog.service';

// Tabla de productos o de personalizaciones, con alta, edición y activar/desactivar
@Component({
  selector: 'app-catalog-list',
  imports: [
    CurrencyPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './catalog-list.html',
  styleUrl: './catalog-list.scss',
})
export class CatalogList {
  private readonly service = inject(CatalogService);
  private readonly dialog = inject(MatDialog);

  readonly kind = input.required<CatalogKind>();

  protected readonly columns = ['name', 'salePrice', 'purchaseCost', 'profit', 'status', 'actions'];
  protected readonly includeInactive = signal(false);
  protected readonly items = rxResource({
    params: () => ({ kind: this.kind(), includeInactive: this.includeInactive() }),
    stream: ({ params }) => this.service.list(params.kind, params.includeInactive),
  });

  protected newLabel(): string {
    return CATALOG_LABELS[this.kind()].newItem;
  }

  protected create(): void {
    this.openDialog({ kind: this.kind() })
      .pipe(switchMap((request) => this.service.create(this.kind(), request)))
      .subscribe(() => this.items.reload());
  }

  protected edit(item: CatalogItem): void {
    this.openDialog({ kind: this.kind(), item })
      .pipe(switchMap((request) => this.service.update(this.kind(), item.id, request)))
      .subscribe(() => this.items.reload());
  }

  protected toggleActive(item: CatalogItem): void {
    this.service.setActive(this.kind(), item.id, !item.active).subscribe(() => this.items.reload());
  }

  // Solo sigue si se cerró con "Guardar"
  private openDialog(data: CatalogItemDialogData) {
    return this.dialog
      .open<CatalogItemDialog, CatalogItemDialogData, CatalogItemRequest>(CatalogItemDialog, {
        data,
        width: '420px',
      })
      .afterClosed()
      .pipe(filter((request): request is CatalogItemRequest => !!request));
  }
}
