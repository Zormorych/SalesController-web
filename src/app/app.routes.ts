import { Routes } from '@angular/router';

// Cada página se carga solo cuando se visita (lazy loading)
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'SalesController',
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./features/catalog/catalog-page').then((m) => m.CatalogPage),
    title: 'Catálogo · SalesController',
  },
  {
    path: 'clientes',
    loadComponent: () => import('./features/customers/customers-page').then((m) => m.CustomersPage),
    title: 'Clientes · SalesController',
  },
  {
    path: 'pedidos',
    loadComponent: () => import('./features/orders/orders-page').then((m) => m.OrdersPage),
    title: 'Pedidos · SalesController',
  },
  {
    path: 'pedidos/nuevo',
    loadComponent: () => import('./features/orders/order-form-page').then((m) => m.OrderFormPage),
    title: 'Nuevo pedido · SalesController',
  },
  {
    path: 'pedidos/:id',
    loadComponent: () =>
      import('./features/orders/order-detail-page').then((m) => m.OrderDetailPage),
    title: 'Pedido · SalesController',
  },
  {
    path: 'lotes',
    loadComponent: () => import('./features/batches/batches-page').then((m) => m.BatchesPage),
    title: 'Lotes · SalesController',
  },
  {
    path: 'lotes/nuevo',
    loadComponent: () => import('./features/batches/new-batch-page').then((m) => m.NewBatchPage),
    title: 'Nuevo lote · SalesController',
  },
  {
    path: 'lotes/:id',
    loadComponent: () =>
      import('./features/batches/batch-detail-page').then((m) => m.BatchDetailPage),
    title: 'Lote · SalesController',
  },
  { path: '**', redirectTo: '' },
];
