import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-100 text-slate-900">
      <div class="mx-auto max-w-7xl px-4 py-6">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class AppComponent {}

