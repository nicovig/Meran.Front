import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {}

