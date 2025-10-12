import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly THEME_KEY = 'app-theme';

  currentTheme = signal<Theme>('auto');

  effectiveTheme = signal<'light' | 'dark'>('light');

  constructor() {
    this.loadTheme();

    effect(() => {
      this.applyTheme(this.currentTheme());
    });

    this.listenToSystemTheme();
  }


  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      this.currentTheme.set(savedTheme);
    } else {
      this.currentTheme.set('auto');
    }
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }


  private applyTheme(theme: Theme): void {
    const effective = this.resolveTheme(theme);
    this.effectiveTheme.set(effective);

    document.documentElement.classList.remove('light', 'dark');

    document.documentElement.classList.add(effective);

    document.documentElement.setAttribute('data-theme', effective);
  }

  private resolveTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'auto') {
      return this.getSystemTheme();
    }
    return theme;
  }


  private getSystemTheme(): 'light' | 'dark' {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }


  private listenToSystemTheme(): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      mediaQuery.addEventListener('change', (e) => {
        if (this.currentTheme() === 'auto') {
          this.applyTheme('auto');
        }
      });
    }
  }

  loadFromUserSettings(theme: Theme): void {
    if (theme && ['light', 'dark', 'auto'].includes(theme)) {
      this.setTheme(theme);
    }
  }
}
