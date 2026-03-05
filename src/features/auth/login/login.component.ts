import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="w-full max-w-md mx-auto px-4">
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl shadow-slate-950/40 p-8 backdrop-blur">
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-semibold tracking-tight text-white">Connexion</h1>
          <p class="mt-1 text-sm text-slate-400">
            Accède à la console de gestion de tes SaaS.
          </p>
        </div>

        <form class="space-y-5" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 shadow-inner shadow-slate-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              placeholder="you@example.com"
              autocomplete="email"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-slate-200">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 shadow-inner shadow-slate-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="form.invalid"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    console.log('login submit', value);
  }
}

