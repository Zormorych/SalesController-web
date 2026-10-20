import { Component, computed, input, model } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { Size } from '../catalog/catalog.models';
import { shirtText } from './batch-labels';
import { PendingLine } from './batches.models';

// Tabla de camisetas pendientes de pedir con casillas para elegir cuáles van al lote
@Component({
  selector: 'app-pending-lines-picker',
  imports: [MatTableModule, MatCheckboxModule],
  template: `
    <div class="table-wrapper">
      <table mat-table [dataSource]="lines()">
        <ng-container matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef>
            <mat-checkbox
              aria-label="Elegir todas"
              [checked]="allSelected()"
              [indeterminate]="selected().length > 0 && !allSelected()"
              (change)="toggleAll()"
            />
          </th>
          <td mat-cell *matCellDef="let line">
            <mat-checkbox
              [attr.aria-label]="'Elegir ' + text(line)"
              [checked]="selected().includes(line.lineId)"
              (change)="toggle(line.lineId)"
            />
          </td>
        </ng-container>
        <ng-container matColumnDef="orderNumber">
          <th mat-header-cell *matHeaderCellDef>Pedido</th>
          <td mat-cell *matCellDef="let line">{{ line.orderNumber }}</td>
        </ng-container>
        <ng-container matColumnDef="customerName">
          <th mat-header-cell *matHeaderCellDef>Cliente</th>
          <td mat-cell *matCellDef="let line">{{ line.customerName }}</td>
        </ng-container>
        <ng-container matColumnDef="shirt">
          <th mat-header-cell *matHeaderCellDef>Camiseta</th>
          <td mat-cell *matCellDef="let line">{{ text(line) }}</td>
        </ng-container>
        <ng-container matColumnDef="size">
          <th mat-header-cell *matHeaderCellDef>Talla</th>
          <td mat-cell *matCellDef="let line">{{ sizeLabel(line.size) }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
    </div>
  `,
  styles: `
    .table-wrapper {
      overflow-x: auto;
    }
  `,
})
export class PendingLinesPicker {
  readonly lines = input.required<PendingLine[]>();
  readonly sizes = input.required<Size[]>();
  // Ids de las camisetas elegidas, en el orden de la tabla
  readonly selected = model<number[]>([]);

  protected readonly columns = ['select', 'orderNumber', 'customerName', 'shirt', 'size'];
  protected readonly text = shirtText;
  protected readonly allSelected = computed(
    () => this.lines().length > 0 && this.selected().length === this.lines().length,
  );
  private readonly sizeLabels = computed(
    () => new Map(this.sizes().map((size) => [size.code, size.label])),
  );

  protected sizeLabel(code: string): string {
    return this.sizeLabels().get(code) ?? code;
  }

  protected toggle(lineId: number): void {
    const chosen = new Set(this.selected());
    if (chosen.has(lineId)) {
      chosen.delete(lineId);
    } else {
      chosen.add(lineId);
    }
    this.selected.set(
      this.lines()
        .map((line) => line.lineId)
        .filter((id) => chosen.has(id)),
    );
  }

  protected toggleAll(): void {
    this.selected.set(this.allSelected() ? [] : this.lines().map((line) => line.lineId));
  }
}
