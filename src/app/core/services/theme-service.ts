import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly THEME_KEY = 'app-theme';

  // Signal para el tema actual
  currentTheme = signal<Theme>('auto');

  // Signal para el tema efectivo (resuelve 'auto' a 'light' o 'dark')
  effectiveTheme = signal<'light' | 'dark'>('light');

  constructor() {
    // Cargar tema desde localStorage al iniciar
    this.loadTheme();

    // Aplicar tema cuando cambie
    effect(() => {
      this.applyTheme(this.currentTheme());
    });

    // Escuchar cambios en las preferencias del sistema
    this.listenToSystemTheme();
  }

  /**
   * Cargar tema desde localStorage
   */
  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      this.currentTheme.set(savedTheme);
    } else {
      this.currentTheme.set('auto');
    }
  }

  /**
   * Establecer tema
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  /**
   * Aplicar tema al DOM
   */
  private applyTheme(theme: Theme): void {
    const effective = this.resolveTheme(theme);
    this.effectiveTheme.set(effective);

    // Remover clases anteriores
    document.documentElement.classList.remove('light', 'dark');

    // Agregar clase del tema efectivo
    document.documentElement.classList.add(effective);

    // Agregar atributo data-theme para CSS
    document.documentElement.setAttribute('data-theme', effective);
  }

  /**
   * Resolver tema automático
   */
  private resolveTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'auto') {
      return this.getSystemTheme();
    }
    return theme;
  }

  /**
   * Obtener tema del sistema
   */
  private getSystemTheme(): 'light' | 'dark' {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Escuchar cambios en el tema del sistema
   */
  private listenToSystemTheme(): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      mediaQuery.addEventListener('change', (e) => {
        // Solo reaccionar si está en modo auto
        if (this.currentTheme() === 'auto') {
          this.applyTheme('auto');
        }
      });
    }
  }

  /**
   * Obtener tema desde configuraciones del usuario
   */
  loadFromUserSettings(theme: Theme): void {
    if (theme && ['light', 'dark', 'auto'].includes(theme)) {
      this.setTheme(theme);
    }
  }
}
