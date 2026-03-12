import { Component, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Observable, map, startWith, catchError, of, tap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { DataService } from '../../core/data.service';
import type { ApplicationDto } from '../../models/models';

export type DashboardVm =
  | { status: 'loading' }
  | { status: 'error'; message?: string }
  | {
      status: 'success';
      applicationsCount: number;
      activeUsers: number;
      mrr: number;
      monthlySeries: number[];
    };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'dashboard.component.html',
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly data = inject(DataService);

  readonly vm$: Observable<DashboardVm>;

  constructor() {
    const isBrowser = isPlatformBrowser(this.platformId);

    this.vm$ = isBrowser
      ? this.api.getApplications().pipe(
          tap((apps) => this.data.setFromDtos(apps)),
          map((apps) => ({ status: 'success' as const, ...this.buildVm(apps) })),
          startWith<DashboardVm>({ status: 'loading' }),
          catchError((error) =>
            of<DashboardVm>({
              status: 'error',
              message: this.extractErrorMessage(error),
            }),
          ),
        )
      : of<DashboardVm>({ status: 'loading' });
  }

  private buildVm(apps: ApplicationDto[] | null | undefined): {
    applicationsCount: number;
    activeUsers: number;
    mrr: number;
    monthlySeries: number[];
  } {
    const list = apps ?? [];

    const applicationsCount = list.length;
    const allUsers = list.flatMap((a) => a.users ?? []);
    const activeUsers = allUsers.length;

    const mrr = allUsers.reduce((sum, user) => {
      const app = list.find((a) => a.id === user.applicationId);
      if (!app || app.format !== 'subscription' || !user.plan) return sum;
      const plan = app.plans?.find((p) => p.name === user.plan);
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
  }

  private extractErrorMessage(error: unknown): string {
    if (!error) {
      return 'Une erreur inconnue est survenue.';
    }

    const anyError = error as any;

    return (
      anyError?.error?.message ??
      anyError?.message ??
      'Une erreur est survenue lors du chargement du dashboard.'
    );
  }
}

