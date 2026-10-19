import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HealthService } from '../../core/health/health.service';

// Página de inicio. De momento solo comprueba que el backend responde
@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly healthService = inject(HealthService);

  protected readonly backend = rxResource({ stream: () => this.healthService.check() });
}
