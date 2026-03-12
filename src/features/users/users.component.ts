import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Application, DataService, User } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { AddApplicationUserRequestDto } from '../../models/models';

interface UserItem extends User {
  active: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: 'users.component.html',
})
export class UsersComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(DataService);
  private readonly api = inject(ApiService);

  showForm = false;

  applications: Application[] = [];

  usersByApplication: Record<string, UserItem[]> = {};

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    plan: [''],
  });

  search = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.refreshFromStore();

    this.route.paramMap.subscribe(() => {
      this.refreshFromStore();
    });
  }

  get currentApplicationId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  get currentApplication(): Application | null {
    const id = this.currentApplicationId;
    if (!id) {
      return null;
    }
    return this.data.getApplicationsSnapshot().find((app) => app.id === id) ?? null;
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
    const body: AddApplicationUserRequestDto = {
      name: value.name ?? null,
      email: value.email ?? null,
      plan: value.plan && this.availablePlans.length > 0 ? value.plan : null,
    };

    this.api.addApplicationUser(this.currentApplicationId, body).subscribe({
      next: () => this.afterMutation(),
    });
  }

  toggleActive(user: UserItem): void {
    const appId = this.currentApplicationId;
    if (!appId) {
      return;
    }
    const list = this.usersByApplication[appId] ?? [];
    this.usersByApplication[appId] = list.map((u) =>
      u.id === user.id ? { ...u, active: !u.active } : u,
    );
  }

  private refreshFromStore(): void {
    const apps = this.data.getApplicationsSnapshot();
    const users = this.data.getUsersSnapshot();

    this.applications = apps;

    const grouped: Record<string, UserItem[]> = {};

    users.forEach((user) => {
      const list = grouped[user.applicationId] ?? [];
      list.push({ ...user, active: true });
      grouped[user.applicationId] = list;
    });

    this.usersByApplication = grouped;
  }

  private afterMutation(): void {
    this.api.getApplications().subscribe({
      next: (apps) => {
        this.data.setFromDtos(apps);
        this.refreshFromStore();
        this.showForm = false;
        this.form.reset();
      },
    });
  }
}

