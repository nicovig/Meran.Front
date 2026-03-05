import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../core/data.service';

type ApplicationFormat = 'free' | 'oneShot' | 'subscription';

type BillingPeriod = 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'biennial';

interface ApplicationPlan {
  name: string;
  description: string;
  billingPeriod: BillingPeriod;
  price: number;
}

interface ApplicationItem {
  id: string;
  name: string;
  description: string;
  format: ApplicationFormat;
  oneShotPrice: number | null;
  plans: ApplicationPlan[];
  createdAt: Date;
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

  applications: ApplicationItem[] = [
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
      usersCount: 120,
    },
    {
      id: '5c8f6b9e-2c13-4e7a-b1de-1a9f4c2c8a12',
      name: 'Analytics',
      description: 'Dashboards et KPIs pour suivre l’usage.',
      format: 'free',
      oneShotPrice: null,
      plans: [],
      createdAt: new Date('2025-02-02'),
      usersCount: 80,
    },
  ];

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
    this.route.url.subscribe(() => {
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

    const value = this.form.value;
    const now = new Date();

    if (this.mode === 'edit' && this.editedId) {
      const updated = [...this.applications];
      const index = updated.findIndex((a) => a.id === this.editedId);
      if (index === -1) {
        return;
      }

      const current = updated[index];

      updated[index] = {
        ...current,
        name: value.name ?? current.name,
        description: value.description ?? current.description,
        format: format ?? current.format,
        oneShotPrice:
          format === 'oneShot'
            ? value.oneShotPrice ?? current.oneShotPrice
            : null,
        plans: format === 'subscription' ? (this.plansArray.value as ApplicationPlan[]) : [],
        usersCount: current.usersCount,
      };

      this.applications = updated;
      this.editedIndex = null;
      this.editedId = null;
      this.form.reset();
      this.plansArray.clear();
      this.showForm = false;
      void this.router.navigate(['applications']);
      return;
    }

    const id = `app-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    this.applications = [
      ...this.applications,
      {
        id,
        name: value.name ?? '',
        description: value.description ?? '',
        format: format ?? 'free',
        oneShotPrice: format === 'oneShot' ? value.oneShotPrice ?? null : null,
        plans: format === 'subscription' ? (this.plansArray.value as ApplicationPlan[]) : [],
        createdAt: now,
        usersCount: 0,
      },
    ];

    this.form.reset();
    this.plansArray.clear();
    this.showForm = false;
    void this.router.navigate(['applications']);
  }

  editApplication(index: number): void {
    const app = this.sortedApplications[index];
    this.router.navigate(['applications', app.id]);
  }

  deleteApplication(index: number): void {
    const app = this.sortedApplications[index];
    this.applications = this.applications.filter((a) => a.id !== app.id);

    if (this.mode === 'edit' && this.editedId === app.id) {
      this.editedIndex = null;
      this.editedId = null;
      this.form.reset();
      this.plansArray.clear();
      this.showForm = false;
      void this.router.navigate(['applications']);
    }
  }

  hasUsers(app: ApplicationItem): boolean {
    return this.data.getUsersSnapshot().some((u) => u.applicationId === app.id);
  }
}

