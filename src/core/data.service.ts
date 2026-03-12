import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { ApplicationDto, ApplicationUserDto } from '../models/models';

export type ApplicationFormat = 'free' | 'oneShot' | 'subscription';

export type BillingPeriod = 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'biennial';

export interface ApplicationPlan {
  name: string;
  description: string;
  billingPeriod: BillingPeriod;
  price: number;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  format: ApplicationFormat;
  oneShotPrice: number | null;
  plans: ApplicationPlan[];
  createdAt: Date;
}

export type UserOrigin = 'admin' | 'self';

export interface User {
  id: string;
  applicationId: string;
  name: string;
  email: string;
  origin: UserOrigin;
  createdAt: Date;
  plan: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly applicationsSubject = new BehaviorSubject<Application[]>([]);

  private readonly usersSubject = new BehaviorSubject<User[]>([]);

  get applications$(): Observable<Application[]> {
    return this.applicationsSubject.asObservable();
  }

  get users$(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  getApplicationsSnapshot(): Application[] {
    return this.applicationsSubject.value;
  }

  getUsersSnapshot(): User[] {
    return this.usersSubject.value;
  }

  setFromDtos(apps: ApplicationDto[] | null | undefined): void {
    const list = apps ?? [];

    const applications: Application[] = list.map((app) => ({
      id: app.id,
      name: app.name ?? '',
      description: app.description ?? '',
      format: (app.format as ApplicationFormat) ?? 'free',
      oneShotPrice: app.oneShotPrice ?? null,
      plans:
        app.plans?.map((plan) => ({
          name: plan.name ?? '',
          description: plan.description ?? '',
          billingPeriod: (plan.billingPeriod as BillingPeriod) ?? 'monthly',
          price: plan.price,
        })) ?? [],
      createdAt: new Date(app.createdAt),
    }));

    const users: User[] = list.flatMap((app) =>
      (app.users ?? []).map((user: ApplicationUserDto) => ({
        id: user.id,
        applicationId: user.applicationId,
        name: user.name ?? '',
        email: user.email ?? '',
        origin: (user.origin as UserOrigin) ?? 'admin',
        createdAt: new Date(user.createdAt),
        plan: user.plan ?? null,
      })),
    );

    this.applicationsSubject.next(applications);
    this.usersSubject.next(users);
  }
}

