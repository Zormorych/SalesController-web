import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { shirtText } from './batch-labels';
import { BatchDetails, BatchLine } from './batches.models';

export interface ReceiveBatchDialogData {
  lines: BatchLine[];
  // Guarda en el backend con las que no han llegado; el diálogo solo se cierra si sale bien
  save: (missingLineIds: number[]) => Observable<BatchDetails>;
}

// Recepción del lote: se marcan las camisetas que NO han llegado (el fabricante a veces no avisa)
@Component({
  selector: 'app-receive-batch-dialog',
  imports: [MatDialogModule, MatButtonModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>Recibir lote</h2>
    <form (submit)="$event.preventDefault(); save()">
      <mat-dialog-content>
        <p>
          Marca las camisetas que <strong>no</strong> han llegado. Si ha llegado todo, no marques
          ninguna.
        </p>
        <ul>
          @for (line of data.lines; track line.lineId) {
            <li>
              <mat-checkbox [checked]="missing().has(line.lineId)" (change)="toggle(line.lineId)">
                {{ line.customerName ?? 'Sin cliente' }} · {{ text(line) }} · {{ line.sizeLabel }}
              </mat-checkbox>
            </li>
          }
        </ul>
        @if (missing().size) {
          <p class="hint">
            Las que no han llegado volverán a quedar pendientes de pedir y no pagarán envío de este
            lote.
          </p>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="saving()">
          Confirmar: llegan {{ arriving() }} de {{ data.lines.length }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .hint {
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class ReceiveBatchDialog {
  protected readonly data = inject<ReceiveBatchDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ReceiveBatchDialog, BatchDetails>);

  protected readonly text = shirtText;
  protected readonly missing = signal(new Set<number>());
  protected readonly arriving = computed(() => this.data.lines.length - this.missing().size);
  protected readonly saving = signal(false);

  protected toggle(lineId: number): void {
    const missing = new Set(this.missing());
    if (missing.has(lineId)) {
      missing.delete(lineId);
    } else {
      missing.add(lineId);
    }
    this.missing.set(missing);
  }

  protected save(): void {
    this.saving.set(true);
    const missingLineIds = this.data.lines
      .map((line) => line.lineId)
      .filter((lineId) => this.missing().has(lineId));
    this.data.save(missingLineIds).subscribe({
      next: (batch) => this.dialogRef.close(batch),
      error: () => this.saving.set(false),
    });
  }
}
