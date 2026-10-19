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
  { path: '**', redirectTo: '' },
];
