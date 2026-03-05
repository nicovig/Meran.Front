import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../core/data.service';

interface ApplicationSummary {
  id: string;
  name: string;
  description: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  origin: 'admin' | 'self';
  createdAt: Date;
  plan: string | null;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: 'users.component.html',
})
export class UsersComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(DataService);

  showForm = false;

  applications: ApplicationSummary[] = [
    {
      id: 'b97ae84a-4a54-4cfe-a4bb-2a9346164731',
      name: 'Meran Core',
      description: 'Console centrale pour gérer l’ensemble des SaaS.',
    },
    {
      id: '5c8f6b9e-2c13-4e7a-b1de-1a9f4c2c8a12',
      name: 'Analytics',
      description: 'Dashboards et KPIs pour suivre l’usage.',
    },
  ];

  usersByApplication: Record<string, UserItem[]> = {
    'b97ae84a-4a54-4cfe-a4bb-2a9346164731': [
      {
        id: 'f4b2c8e1-9a6d-4b1d-8c34-56a7e9f01234',
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        origin: 'admin',
        createdAt: new Date('2025-03-15'),
        plan: 'Standard',
      },
      {
        id: '9c1a7e4b-2d8f-4c6a-9b0e-1f2a3b4c5d6e',
        name: 'Marie Martin',
        email: 'marie.martin@example.com',
        origin: 'self',
        createdAt: new Date('2025-04-02'),
        plan: 'Standard',
      },
    ],
    '5c8f6b9e-2c13-4e7a-b1de-1a9f4c2c8a12': [
      {
        id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        name: 'Alice Durand',
        email: 'alice.durand@example.com',
        origin: 'admin',
        createdAt: new Date('2025-05-01'),
        plan: 'Free',
      },
      {
        id: '0f1e2d3c-4b5a-6978-90ab-cdef12345678',
        name: 'Bob Leroy',
        email: 'bob.leroy@example.com',
        origin: 'self',
        createdAt: new Date('2025-05-10'),
        plan: 'Plus',
      },
    ],
  };

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    plan: ['', [Validators.required]],
  });

  search = new FormControl('', { nonNullable: true });

  get currentApplicationId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  get currentApplication(): ApplicationSummary | null {
    const id = this.currentApplicationId;
    if (!id) {
      return null;
    }
    return this.applications.find((app) => app.id === id) ?? null;
  }

  get currentUsers(): UserItem[] {
    const id = this.currentApplicationId;
    if (!id) {
      return [];
    }
    return this.usersByApplication[id] ?? [];
  }

  get filteredUsers(): UserItem[] {
    const term = this.search.value.trim().toLowerCase();
    const users = this.currentUsers;
    if (!term) {
      return users;
    }
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
    );
  }

  get availablePlans(): string[] {
    const id = this.currentApplicationId;
    if (!id) {
      return [];
    }
    const apps = this.data.getApplicationsSnapshot();
    const app = apps.find((a) => a.id === id);
    if (!app || !app.plans.length) {
      return [];
    }
    return app.plans.map((p) => p.name);
  }

  toggleForm(): void {
    if (!this.currentApplicationId) {
      return;
    }
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.form.reset({
        name: '',
        email: '',
        plan: this.availablePlans[0] ?? '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.currentApplicationId) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const current = this.usersByApplication[this.currentApplicationId] ?? [];

    const id = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    this.usersByApplication[this.currentApplicationId] = [
      ...current,
      {
        id,
        name: value.name ?? '',
        email: value.email ?? '',
        origin: 'admin',
        createdAt: new Date(),
        plan: value.plan ?? null,
      },
    ];

    this.showForm = false;
    this.form.reset();
  }
}

