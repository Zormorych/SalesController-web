import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogItem, CatalogItemRequest, CatalogKind } from './catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  list(kind: CatalogKind, includeInactive: boolean): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(`/api/catalog/${kind}`, { params: { includeInactive } });
  }

  create(kind: CatalogKind, request: CatalogItemRequest): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(`/api/catalog/${kind}`, request);
  }

  update(kind: CatalogKind, id: number, request: CatalogItemRequest): Observable<CatalogItem> {
    return this.http.put<CatalogItem>(`/api/catalog/${kind}/${id}`, request);
  }

  // Desactivar no borra: el producto deja de ofrecerse en los pedidos nuevos
  setActive(kind: CatalogKind, id: number, active: boolean): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(
      `/api/catalog/${kind}/${id}/${active ? 'activate' : 'deactivate'}`,
      null,
    );
  }
}
