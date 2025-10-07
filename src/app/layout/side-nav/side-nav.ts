import { AuthService } from '@/app/core/services/auth-service';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.scss'
})
export class SideNav {

  private authService = inject(AuthService);
  private router = inject(Router);

  isMobileOpen = signal(false);
  showUserMenu = signal(false);

  currentUser = this.authService.currentUser;
  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '?';
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  });

  toggleMobile(): void {
    this.isMobileOpen.update(value => !value);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(value => !value);
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Error al cerrar sesión:', error);
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }

  getMenuClasses(): string {
    const baseClasses = 'bg-white shadow-soft-md transition-transform duration-300 ease-in-out border-r border-gray-100';
    const desktopClasses = 'md:fixed md:left-0 md:top-0 md:h-full md:w-64 md:transform-none md:flex md:flex-col';
    const mobileClasses = `
      fixed top-0 left-0 right-0 transform
      ${this.isMobileOpen() ? 'translate-y-0 z-50' : '-translate-y-full z-40'}
      md:translate-y-0
    `;
    return `${baseClasses} ${desktopClasses} ${mobileClasses}`;
  }
}