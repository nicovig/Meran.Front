import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: 'layout.component.html',
})
export class LayoutComponent {
  private readonly router = inject(Router);
  private readonly data = inject(DataService);

  showUsersMenu = false;
  readonly applications$ = this.data.applications$;

  toggleUsersMenu(): void {
    this.showUsersMenu = !this.showUsersMenu;
  }

  onLogout(): void {
    this.router.navigate(['/login']);
  }
}

