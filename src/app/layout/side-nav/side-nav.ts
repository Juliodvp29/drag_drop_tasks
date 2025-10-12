import { AuthService } from '@/app/core/services/auth-service';
import { ToastService } from '@/app/core/services/toast-service';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.scss'
})
export class SideNav implements OnInit {


  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isMobileOpen = signal(false);
  showUserMenu = signal(false);
  showAdminMenu = signal(false);
  isCollapsed = signal(false);

  public currentUser = this.authService.currentUser;
  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '?';
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  });

  ngOnInit(): void {
  }

  toggleMobile(): void {
    this.isMobileOpen.update(value => !value);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(value => !value);
  }

  toggleAdminMenu(): void {
    this.showAdminMenu.update(value => !value);
  }

  toggleCollapse(): void {
    this.isCollapsed.update(value => !value);
  }

  logout(): void {
    this.authService.logout().subscribe()
  }

  getMenuClasses(): string {
    const baseClasses = 'bg-white shadow-soft-md transition-all duration-300 ease-in-out border-r border-gray-100';
    const desktopClasses = `md:fixed md:left-0 md:top-0 md:h-full md:transform-none md:flex md:flex-col ${this.isCollapsed() ? 'md:w-16' : 'md:w-64'}`;
    const mobileClasses = `
      fixed top-0 left-0 right-0 transform
      ${this.isMobileOpen() ? 'translate-y-0 z-50' : '-translate-y-full z-40'}
      md:translate-y-0
    `;
    return `${baseClasses} ${desktopClasses} ${mobileClasses}`;
  }

  getHeaderClasses(): string {
    const baseClasses = 'p-6 px-7 border-b border-gray-100 flex items-center justify-between';
    const collapsedClasses = this.isCollapsed() ? 'justify-center' : '';
    return `${baseClasses} ${collapsedClasses}`;
  }
}