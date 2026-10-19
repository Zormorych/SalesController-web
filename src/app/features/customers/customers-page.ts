import { Component, inject, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { whatsappUrl } from '../../shared/whatsapp';
import { CustomerDialog, CustomerDialogData } from './customer-dialog';
import { Customer } from './customers.models';
import { CustomersService } from './customers.service';

// Clientes: búsqueda por nombre o teléfono, alta y edición. El teléfono abre el chat de WhatsApp
@Component({
  selector: 'app-customers-page',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './customers-page.html',
  styleUrl: './customers-page.scss',
})
export class CustomersPage {
  private readonly service = inject(CustomersService);
  private readonly dialog = inject(MatDialog);

  protected readonly columns = ['name', 'phone', 'notes', 'actions'];
  protected readonly search = signal('');
  // Espera a que se deje de escribir para no lanzar una búsqueda por cada tecla
  private readonly searchTerm = toSignal(
    toObservable(this.search).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  protected readonly customers = rxResource({
    params: () => this.searchTerm(),
    stream: ({ params }) => this.service.list(params),
  });
  protected readonly whatsappUrl = whatsappUrl;

  protected create(): void {
    this.openDialog({ save: (request) => this.service.create(request) });
  }

  protected edit(customer: Customer): void {
    this.openDialog({ customer, save: (request) => this.service.update(customer.id, request) });
  }

  // El diálogo guarda él mismo; si se cerró con algo guardado, se recarga la tabla
  private openDialog(data: CustomerDialogData): void {
    this.dialog
      .open<CustomerDialog, CustomerDialogData, Customer>(CustomerDialog, {
        data,
        width: '440px',
      })
      .afterClosed()
      .pipe(filter((saved) => !!saved))
      .subscribe(() => this.customers.reload());
  }
}
