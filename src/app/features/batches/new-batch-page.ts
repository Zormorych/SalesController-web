import { Component, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../catalog/catalog.service';
import { DEFAULT_SHIPPING_COST } from './batches.models';
import { BatchesService } from './batches.service';
import { PendingLinesPicker } from './pending-lines-picker';

// Nuevo lote al fabricante: se eligen camisetas pendientes (de uno o varios pedidos) y el envío
@Component({
  selector: 'app-new-batch-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    PendingLinesPicker,
  ],
  template: `
    <h1>Nuevo lote</h1>

    @if (pendingLines.value(); as lines) {
      @if (lines.length) {
        <p>Elige las camisetas que vas a pedir al fabricante.</p>
        <app-pending-lines-picker
          [lines]="lines"
          [sizes]="sizes.value() ?? []"
          [(selected)]="selected"
        />
      } @else {
        <p class="empty">No hay camisetas pendientes de pedir.</p>
      }
    }

    <form [formGroup]="form" (ngSubmit)="create()" class="form">
      <mat-form-field>
        <mat-label>Envío</mat-label>
        <input matInput type="number" formControlName="shippingCost" min="0" step="0.01" />
        <span matTextSuffix>€</span>
        <mat-hint>Se reparte entre las camisetas del lote</mat-hint>
        <mat-error>Indica un envío de 0 o más</mat-error>
      </mat-form-field>
      <mat-form-field class="notes">
        <mat-label>Notas</mat-label>
        <input matInput formControlName="notes" maxlength="500" />
      </mat-form-field>
      <div class="buttons">
        <a mat-button routerLink="/lotes">Cancelar</a>
        <button
          mat-flat-button
          type="submit"
          data-testid="create"
          [disabled]="!selected().length || saving()"
        >
          Crear lote con {{ selected().length }}
          {{ selected().length === 1 ? 'camiseta' : 'camisetas' }}
        </button>
      </div>
    </form>
  `,
  styles: `
    .form {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 0 12px;
      margin-top: 16px;
    }
    .notes {
      flex: 1 1 260px;
    }
    .buttons {
      display: flex;
      gap: 8px;
      margin-left: auto;
      padding-top: 8px;
    }
    .empty {
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class NewBatchPage {
  private readonly service = inject(BatchesService);
  private readonly catalogService = inject(CatalogService);
  private readonly router = inject(Router);

  protected readonly pendingLines = rxResource({ stream: () => this.service.pendingLines() });
  protected readonly sizes = rxResource({ stream: () => this.catalogService.sizes() });
  protected readonly selected = signal<number[]>([]);
  protected readonly saving = signal(false);
  protected readonly form = new FormGroup({
    shippingCost: new FormControl<number | null>(DEFAULT_SHIPPING_COST, [
      Validators.required,
      Validators.min(0),
    ]),
    notes: new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) }),
  });

  constructor() {
    // Lo normal es pedir todo lo pendiente: se empieza con todas elegidas
    effect(() => this.selected.set((this.pendingLines.value() ?? []).map((line) => line.lineId)));
  }

  protected create(): void {
    if (this.form.invalid || !this.selected().length) {
      this.form.markAllAsTouched();
      return;
    }
    const { shippingCost, notes } = this.form.getRawValue();
    this.saving.set(true);
    this.service
      .create({
        lineIds: this.selected(),
        shippingCost: shippingCost!,
        notes: notes.trim() || null,
      })
      .subscribe({
        next: (batch) => this.router.navigate(['/lotes', batch.id]),
        error: () => this.saving.set(false),
      });
  }
}
