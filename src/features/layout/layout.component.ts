import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: 'layout.component.html',
})
export class LayoutComponent {
  private readonly router = inject(Router);

  onLogout(): void {
    this.router.navigate(['/login']);
  }
}

