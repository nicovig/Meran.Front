import { Routes } from '@angular/router';
import { LayoutComponent } from '../features/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('../features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'applications',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('../features/applications/applications.component').then(
                (m) => m.ApplicationsComponent,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('../features/applications/applications.component').then(
                (m) => m.ApplicationsComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('../features/applications/applications.component').then(
                (m) => m.ApplicationsComponent,
              ),
          },
        ],
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'revenus',
        loadComponent: () =>
          import('../features/revenus/revenus.component').then((m) => m.RevenusComponent),
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('../features/users/users.component').then((m) => m.UsersComponent),
          },
          {
            path: 'applications/:id',
            loadComponent: () =>
              import('../features/users/users.component').then((m) => m.UsersComponent),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

