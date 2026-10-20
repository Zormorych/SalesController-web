import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

interface Section {
  path: string;
  label: string;
  icon: string;
}

// Estructura común: barra superior, menú lateral con los apartados y la página actual.
// En pantallas estrechas (móvil) el menú se oculta y se abre con el botón de la barra.
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly sections: Section[] = [
    { path: '/', label: 'Inicio', icon: 'home' },
    { path: '/catalogo', label: 'Catálogo', icon: 'checkroom' },
    { path: '/clientes', label: 'Clientes', icon: 'group' },
    { path: '/pedidos', label: 'Pedidos', icon: 'receipt_long' },
  ];

  protected readonly narrow = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 800px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );
}
