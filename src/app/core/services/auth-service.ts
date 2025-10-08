import { ApiResponse, LoginRequest, LoginResponse, RefreshTokenResponse, RegisterRequest, User } from '@/app/shared/models/auth.model';
import { environment } from '@/environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { StorageService } from './storage-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storageService = inject(StorageService);

  private readonly API_URL = environment.apiUrl;

  private currentUserSignal = signal<User | null>(this.loadUserFromStorage());
  private isAuthenticatedSignal = signal<boolean>(this.storageService.hasValidToken());

  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => this.isAuthenticatedSignal());
  userPermissions = computed(() => this.currentUserSignal()?.role?.permissions || []);
  userRole = computed(() => this.currentUserSignal()?.role);

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const storedUser = this.loadUserFromStorage();
    if (storedUser && this.storageService.hasValidToken()) {
      this.currentUserSignal.set(storedUser);
      this.isAuthenticatedSignal.set(true);
    }
  }

  private loadUserFromStorage(): User | null {
    try {
      return this.storageService.getUser();
    } catch {
      return null;
    }
  }

  /**
   * Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, {
      ...credentials,
      device_info: this.getDeviceInfo()
    }).pipe(
      tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Registrar nuevo usuario
   */
  register(data: RegisterRequest): Observable<ApiResponse<{ user: User }>> {
    return this.http.post<ApiResponse<{ user: User }>>(
      `${this.API_URL}/auth/register`,
      data
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Refrescar token de acceso
   */
  refreshAccessToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.storageService.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<RefreshTokenResponse>(
      `${this.API_URL}/auth/refresh`,
      { refresh_token: refreshToken }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.storageService.setTokens(
            response.data.access_token,
            response.data.refresh_token
          );
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/logout`, {}).pipe(
      tap(() => this.clearAuthData()),
      catchError((error) => {
        // Incluso si falla la petición, limpiamos los datos locales
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener información del usuario actual
   */
  me(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/auth/me`).pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSignal.set(response.data);
          this.storageService.setUser(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Verificar si el token es válido
   */
  verifyToken(): Observable<ApiResponse<{ valid: boolean; user: User }>> {
    return this.http.post<ApiResponse<{ valid: boolean; user: User }>>(
      `${this.API_URL}/auth/verify-token`,
      {}
    ).pipe(
      tap(response => {
        if (response.success && response.data.valid) {
          this.currentUserSignal.set(response.data.user);
          this.storageService.setUser(response.data.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Solicitar código de recuperación de contraseña
   */
  forgotPassword(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/auth/forgot-password`,
      { email }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Restablecer contraseña con código
   */
  resetPassword(email: string, code: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/auth/reset-password`,
      {
        email,
        code,
        new_password: newPassword
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    const permissions = this.userPermissions();
    return permissions.includes('*') || permissions.includes(permission);
  }

  /**
   * Verificar si el usuario tiene alguno de los permisos dados
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Verificar si el usuario tiene todos los permisos dados
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(roleName: string): boolean {
    const role = this.userRole();
    return role?.name === roleName;
  }

  /**
   * Obtener información del dispositivo
   */
  private getDeviceInfo(): string {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';

    if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
    } else if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari';
    } else if (userAgent.indexOf('Edge') > -1) {
      browserName = 'Edge';
    }

    const platform = navigator.platform || 'Unknown Platform';
    return `${browserName} on ${platform}`;
  }

  /**
   * Manejar autenticación exitosa
   */
  private handleAuthSuccess(data: {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }): void {
    this.storageService.setTokens(data.access_token, data.refresh_token);
    this.storageService.setUser(data.user);
    this.currentUserSignal.set(data.user);
    this.isAuthenticatedSignal.set(true);
  }

  /**
   * Limpiar datos de autenticación
   */
  private clearAuthData(): void {
    this.storageService.clearTokens();
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Manejar errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors) {
        errorMessage = error.error.errors.join(', ');
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Error en AuthService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
