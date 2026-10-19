import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer, CustomerRequest } from './customers.models';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);

  // La búsqueda encuentra por nombre o por teléfono
  list(search: string): Observable<Customer[]> {
    const text = search.trim();
    return this.http.get<Customer[]>('/api/customers', { params: text ? { search: text } : {} });
  }

  create(request: CustomerRequest): Observable<Customer> {
    return this.http.post<Customer>('/api/customers', request);
  }

  update(id: number, request: CustomerRequest): Observable<Customer> {
    return this.http.put<Customer>(`/api/customers/${id}`, request);
  }
}
