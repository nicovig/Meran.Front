import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type ApplicationFormat = 'free' | 'oneShot' | 'subscription';

type BillingPeriod = 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'biennial';

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
  private readonly applicationsSubject = new BehaviorSubject<Application[]>([
    {
      id: 'b97ae84a-4a54-4cfe-a4bb-2a9346164731',
      name: 'Meran Core',
      description: 'Console centrale pour gérer l’ensemble des SaaS.',
      format: 'subscription',
      oneShotPrice: null,
      plans: [
        {
          name: 'Standard',
          description: 'Accès complet à la console.',
          billingPeriod: 'monthly',
          price: 49,
        },
      ],
      createdAt: new Date('2025-01-10'),
    },
    {
      id: '5c8f6b9e-2c13-4e7a-b1de-1a9f4c2c8a12',
      name: 'Analytics',
      description: 'Dashboards et KPIs pour suivre l’usage.',
      format: 'free',
      oneShotPrice: null,
      plans: [],
      createdAt: new Date('2025-02-02'),
    },
  ]);

  private readonly usersSubject = new BehaviorSubject<User[]>([
    {
      id: 'f4b2c8e1-9a6d-4b1d-8c34-56a7e9f01234',
      applicationId: 'b97ae84a-4a54-4cfe-a4bb-2a9346164731',
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      origin: 'admin',
      createdAt: new Date('2025-03-15'),
      plan: 'Standard',
    },
    {
      id: '9c1a7e4b-2d8f-4c6a-9b0e-1f2a3b4c5d6e',
      applicationId: 'b97ae84a-4a54-4cfe-a4bb-2a9346164731',
      name: 'Marie Martin',
      email: 'marie.martin@example.com',
      origin: 'self',
      createdAt: new Date('2025-04-02'),
      plan: 'Standard',
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      applicationId: '5c8f6b9e-2c13-4e7a-b1de-1a9f4c2c8a12',
      name: 'Alice Durand',
      email: 'alice.durand@example.com',
      origin: 'admin',
      createdAt: new Date('2025-05-01'),
      plan: 'Free',
    },
    {
      id: '0f1e2d3c-4b5a-6978-90ab-cdef12345678',
      applicationId: '5c8f6b9e-2c13-4e7a-b1de-1a9f4c2c8a12',
      name: 'Bob Leroy',
      email: 'bob.leroy@example.com',
      origin: 'self',
      createdAt: new Date('2025-05-10'),
      plan: 'Plus',
    },
  ]);

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

  upsertApplication(app: Application): void {
    const apps = this.applicationsSubject.value;
    const index = apps.findIndex((a) => a.id === app.id);
    if (index === -1) {
      this.applicationsSubject.next([...apps, app]);
    } else {
      const updated = [...apps];
      updated[index] = app;
      this.applicationsSubject.next(updated);
    }
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): void {
    const id = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date();
    this.usersSubject.next([...this.usersSubject.value, { ...user, id, createdAt }]);
  }

  updateUser(user: User): void {
    const users = this.usersSubject.value;
    const index = users.findIndex((u) => u.id === user.id);
    if (index === -1) {
      return;
    }
    const updated = [...users];
    updated[index] = user;
    this.usersSubject.next(updated);
  }
}

