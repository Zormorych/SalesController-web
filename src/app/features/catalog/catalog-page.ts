import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { CatalogList } from './catalog-list';

// Catálogo: lo que se vende (productos) y lo que se le puede añadir (personalizaciones), con precio y coste
@Component({
  selector: 'app-catalog-page',
  imports: [MatTabsModule, CatalogList],
  template: `
    <h1>Catálogo</h1>
    <mat-tab-group>
      <mat-tab label="Productos">
        <app-catalog-list kind="products" />
      </mat-tab>
      <mat-tab label="Personalizaciones">
        <ng-template matTabContent>
          <app-catalog-list kind="customizations" />
        </ng-template>
      </mat-tab>
    </mat-tab-group>
  `,
})
export class CatalogPage {}
