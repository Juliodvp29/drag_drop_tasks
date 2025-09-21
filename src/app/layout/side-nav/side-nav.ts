import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  standalone: true, // Si es un componente standalone
  imports: [RouterLink],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.scss'
})
export class SideNav {
  // 1. Usar signal para el estado del menú
  isMobileOpen = signal(false);

  // 2. Modificar el método para usar el signal
  toggleMobile(): void {
    this.isMobileOpen.update(value => !value);
  }

  // 3. El método para clases CSS puede permanecer o ser un computed signal
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