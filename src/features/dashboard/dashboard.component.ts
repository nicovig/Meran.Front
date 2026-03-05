import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, combineLatest } from 'rxjs';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'dashboard.component.html',
})
export class DashboardComponent {
  private readonly data = inject(DataService);

  readonly vm$ = combineLatest([this.data.applications$, this.data.users$]).pipe(
    map(([apps, users]) => {
      const applicationsCount = apps.length;
      const activeUsers = users.length;

      const mrr = users.reduce((sum, user) => {
        const app = apps.find((a) => a.id === user.applicationId);
        if (!app || app.format !== 'subscription' || !user.plan) {
          return sum;
        }
        const plan = app.plans.find((p) => p.name === user.plan);
        return sum + (plan?.price ?? 0);
      }, 0);

      const monthlySeries = [5, 6, 7, 8, 9, 10].map((factor) =>
        Math.round((mrr || 1) * (0.6 + factor * 0.05)),
      );

      return {
        applicationsCount,
        activeUsers,
        mrr,
        monthlySeries,
      };
    }),
  );
}

