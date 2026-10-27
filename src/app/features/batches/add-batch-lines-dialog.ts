import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Size } from '../catalog/catalog.models';
import { BatchDetails, PendingLine } from './batches.models';
import { PendingLinesPicker } from './pending-lines-picker';

export interface AddBatchLinesDialogData {
  lines: PendingLine[];
  sizes: Size[];
  // Guarda en el backend; el diálogo solo se cierra si sale bien
  save: (lineIds: number[]) => Observable<BatchDetails>;
}

// Añadir a un lote abierto camisetas que han quedado pendientes de pedir
@Component({
  selector: 'app-add-batch-lines-dialog',
  imports: [MatDialogModule, MatButtonModule, PendingLinesPicker],
  template: `
    <h2 mat-dialog-title>Añadir camisetas</h2>
    <form (submit)="$event.preventDefault(); save()">
      <mat-dialog-content>
        @if (data.lines.length) {
          <app-pending-lines-picker
            [lines]="data.lines"
            [sizes]="data.sizes"
            [(selected)]="selected"
          />
        } @else {
          <p>No hay camisetas pendientes de pedir.</p>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="!selected().length || saving()">
          Añadir {{ selected().length }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
})
export class AddBatchLinesDialog {
  protected readonly data = inject<AddBatchLinesDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AddBatchLinesDialog, BatchDetails>);

  protected readonly selected = signal<number[]>([]);
  protected readonly saving = signal(false);

  protected save(): void {
    if (!this.selected().length) {
      return;
    }
    this.saving.set(true);
    this.data.save(this.selected()).subscribe({
      next: (batch) => this.dialogRef.close(batch),
      error: () => this.saving.set(false),
    });
  }
}
