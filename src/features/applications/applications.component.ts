import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import {
  Application,
  ApplicationFormat,
  ApplicationPlan,
  BillingPeriod,
  DataService,
} from '../../core/data.service';
import type { CreateApplicationRequestDto, UpdateApplicationRequestDto } from '../../models/models';

interface ApplicationItem extends Application {
  usersCount: number;
}

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'applications.component.html',
})
export class ApplicationsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(DataService);
  private readonly api = inject(ApiService);

  showForm = false;

  readonly billingPeriodOptions: { value: BillingPeriod; label: string }[] = [
    { value: 'monthly', label: 'Mensuel' },
    { value: 'quarterly', label: 'Trimestriel' },
    { value: 'semiannual', label: 'Semestriel' },
    { value: 'annual', label: 'Annuel' },
    { value: 'biennial', label: 'Bi-annuel' },
  ];

  private readonly plansArray = new FormArray<any>([]);

  form = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    format: ['free' as ApplicationFormat, [Validators.required]],
    oneShotPrice: [null as number | null],
    plans: this.plansArray,
  });

  applications: ApplicationItem[] = [];

  sortField: 'name' | 'createdAt' | 'usersCount' = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  editedIndex: number | null = null;
  editedId: string | null = null;

  mode: 'list' | 'create' | 'edit' = 'list';

  get plansControls() {
    return this.plansArray.controls;
  }

  get sortedApplications(): ApplicationItem[] {
    const apps = [...this.applications];
    return apps.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      if (this.sortField === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (this.sortField === 'createdAt') {
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
      } else {
        aValue = a.usersCount;
        bValue = b.usersCount;
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  ngOnInit(): void {
    this.refreshApplications();

    this.route.url.subscribe(() => {
      this.refreshApplications();
      const id = this.route.snapshot.paramMap.get('id');

      if (id) {
        this.mode = 'edit';
        this.editedId = id;
        this.enterEditMode(id);
        return;
      }

      if (this.route.snapshot.routeConfig?.path === 'new') {
        this.mode = 'create';
        this.editedId = null;
        this.resetFormForCreate();
        return;
      }

      this.mode = 'list';
      this.editedId = null;
      this.form.reset();
      this.plansArray.clear();
      this.showForm = false;
    });

    this.refreshApplications();

    this.form.get('format')?.valueChanges.subscribe((format) => {
      if (format !== 'subscription') {
        this.plansArray.clear();
      }

      if (format === 'subscription' && this.plansArray.length === 0) {
        this.addPlan();
      }

      if (format !== 'oneShot') {
        this.form.patchValue(
          {
            oneShotPrice: null,
          },
          { emitEvent: false },
        );
      }
    });
  }

  private refreshApplications(): void {
    const apps = this.data.getApplicationsSnapshot();
    const users = this.data.getUsersSnapshot();

    this.applications = apps.map((app: Application) => ({
      ...app,
      usersCount: users.filter((u) => u.applicationId === app.id).length,
    }));
  }

  private resetFormForCreate(): void {
    this.editedIndex = null;
    this.form.reset({
      name: '',
      description: '',
      format: 'free',
      oneShotPrice: null,
    });
    this.plansArray.clear();
    this.showForm = true;
  }

  private enterEditMode(id: string): void {
    const appIndex = this.applications.findIndex((a) => a.id === id);
    if (appIndex === -1) {
      this.mode = 'list';
      this.showForm = false;
      return;
    }

    const app = this.applications[appIndex];
    this.editedIndex = appIndex;

    this.form.patchValue({
      name: app.name,
      description: app.description,
      format: app.format,
      oneShotPrice: app.oneShotPrice,
    });

    this.plansArray.clear();

    if (app.format === 'subscription') {
      app.plans.forEach((plan) => {
        const group = this.fb.group({
          name: [plan.name, [Validators.required]],
          description: [plan.description],
          billingPeriod: [plan.billingPeriod, [Validators.required]],
          price: [plan.price, [Validators.required, Validators.min(0)]],
        });
        this.plansArray.push(group);
      });
    }

    this.showForm = true;
  }

  changeSort(field: 'name' | 'createdAt' | 'usersCount'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    this.sortField = field;
    this.sortDirection = 'asc';
  }

  toggleCreate(): void {
    if (this.mode === 'list') {
      this.router.navigate(['applications', 'new']);
      return;
    }

    this.router.navigate(['applications']);
  }

  addPlan(): void {
    const group = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      billingPeriod: ['monthly' as BillingPeriod, [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
    });
    this.plansArray.push(group);
  }

  removePlan(index: number): void {
    this.plansArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const format = this.form.value.format as ApplicationFormat | null;

    if (format === 'oneShot' && (!this.form.value.oneShotPrice || this.form.value.oneShotPrice <= 0)) {
      return;
    }

    if (format === 'subscription' && this.plansArray.length === 0) {
      return;
    }

    if (this.mode === 'edit' && this.editedId) {
      const value = this.form.value;
      const body: UpdateApplicationRequestDto = {
        name: value.name ?? undefined,
        description: value.description ?? undefined,
        format: format ?? undefined,
        oneShotPrice: format === 'oneShot' ? value.oneShotPrice ?? null : null,
        plans:
          format === 'subscription'
            ? (this.plansArray.value as ApplicationPlan[])
            : [],
      };

      this.api.updateApplication(this.editedId, body).subscribe({
        next: () => this.afterMutation(),
      });
      return;
    }

    const value = this.form.value;
    const body: CreateApplicationRequestDto = {
      name: value.name ?? '',
      description: value.description ?? '',
      format: format ?? 'free',
      oneShotPrice: format === 'oneShot' ? value.oneShotPrice ?? null : null,
      plans:
        format === 'subscription'
          ? (this.plansArray.value as ApplicationPlan[])
          : [],
    };

    this.api.createApplication(body).subscribe({
      next: () => this.afterMutation(),
    });
  }

  editApplication(index: number): void {
    const app = this.sortedApplications[index];
    this.router.navigate(['applications', app.id]);
  }

  deleteApplication(index: number): void {
    const app = this.sortedApplications[index];
    this.api.deleteApplication(app.id).subscribe({
      next: () => this.afterMutation(),
    });
  }

  hasUsers(app: ApplicationItem): boolean {
    return this.data.getUsersSnapshot().some((u) => u.applicationId === app.id);
  }

  private afterMutation(): void {
    this.api.getApplications().subscribe({
      next: (apps) => {
        this.data.setFromDtos(apps);
        this.refreshApplications();
        this.editedIndex = null;
        this.editedId = null;
        this.form.reset();
        this.plansArray.clear();
        this.showForm = false;
        void this.router.navigate(['applications']);
      },
    });
  }
}

