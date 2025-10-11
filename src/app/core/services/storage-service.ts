import { environment } from '@/environments/environment';
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private tokenSignal = signal<string | null>(this.getItem(environment.tokenKey));
  private refreshTokenSignal = signal<string | null>(this.getItem(environment.refreshTokenKey));

  get token() {
    return this.tokenSignal();
  }

  get refreshToken() {
    return this.refreshTokenSignal();
  }

  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));

      if (key === environment.tokenKey) {
        this.tokenSignal.set(value);
      } else if (key === environment.refreshTokenKey) {
        this.refreshTokenSignal.set(value);
      }
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  getItem(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error getting item from localStorage', e);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);

      if (key === environment.tokenKey) {
        this.tokenSignal.set(null);
      } else if (key === environment.refreshTokenKey) {
        this.refreshTokenSignal.set(null);
      }
    } catch (e) {
      console.error('Error removing item from localStorage', e);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
      this.tokenSignal.set(null);
      this.refreshTokenSignal.set(null);
    } catch (e) {
      console.error('Error clearing localStorage', e);
    }
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.setItem(environment.tokenKey, accessToken);
    this.setItem(environment.refreshTokenKey, refreshToken);
  }

  clearTokens(): void {
    this.removeItem(environment.tokenKey);
    this.removeItem(environment.refreshTokenKey);
    this.removeItem(environment.userKey);
  }

  getAccessToken(): string | null {
    return this.getItem(environment.tokenKey);
  }

  getRefreshToken(): string | null {
    return this.getItem(environment.refreshTokenKey);
  }

  setUser(user: any): void {
    this.setItem(environment.userKey, user);
  }

  getUser(): any {
    return this.getItem(environment.userKey);
  }

  setUserSettings(settings: any): void {
    this.setItem('user_settings', settings);
  }

  getUserSettings(): any {
    return this.getItem('user_settings');
  }

  clearUserSettings(): void {
    this.removeItem('user_settings');
  }

  hasValidToken(): boolean {
    return !!this.getAccessToken();
  }
}