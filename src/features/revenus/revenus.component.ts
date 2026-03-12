import { Component, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { ApiService } from '../../core/api.service';
import type {
  PaymentsOverviewDto,
  PaymentEventDto,
  ScheduledPaymentDto,
} from '../../models/models';

type RevenusStatus =
  | { status: 'loading' }
  | { status: 'error'; message?: string }
  | {
      status: 'success';
      totalPastAmount: number;
      currency: string | null;
      upcomingCount: number;
      nextPayment: ScheduledPaymentDto | null;
      pastPayments: PaymentEventDto[];
      upcomingPayments: ScheduledPaymentDto[];
    };

@Component({
  selector: 'app-revenus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'revenus.component.html',
})
export class RevenusComponent {
  private readonly api = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly vm$: Observable<RevenusStatus>;

  constructor() {
    const isBrowser = isPlatformBrowser(this.platformId);

    this.vm$ = isBrowser
      ? this.api.getPaymentsOverview().pipe(
          map((overview) => this.buildVm(overview)),
          startWith<RevenusStatus>({ status: 'loading' }),
          catchError((error) =>
            of<RevenusStatus>({
              status: 'error',
              message: this.extractErrorMessage(error),
            }),
          ),
        )
      : of<RevenusStatus>({ status: 'loading' });
  }

  private buildVm(overview: PaymentsOverviewDto | null | undefined): RevenusStatus {
    const past = overview?.pastPayments ?? [];
    const upcoming = overview?.upcomingPayments ?? [];

    const totalPastAmount = past.reduce((sum, p) => sum + p.amount, 0);
    const currency = past[0]?.currency ?? upcoming[0]?.currency ?? null;

    const sortedUpcoming = [...upcoming].sort(
      (a, b) => new Date(a.nextPaymentDueAt).getTime() - new Date(b.nextPaymentDueAt).getTime(),
    );

    const nextPayment = sortedUpcoming[0] ?? null;

    return {
      status: 'success',
      totalPastAmount,
      currency,
      upcomingCount: upcoming.length,
      nextPayment,
      pastPayments: past,
      upcomingPayments: upcoming,
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
      'Une erreur est survenue lors du chargement des revenus.'
    );
  }
}


