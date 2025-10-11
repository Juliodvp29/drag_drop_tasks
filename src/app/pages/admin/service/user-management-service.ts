import { ApiResponse } from '@/app/shared/models/auth.model';
import { ChangePasswordRequest, CreateUserRequest, UpdateUserRequest, UserQueryParams, UserResponse, UserSettings, UserSettingsApiResponse, UsersResponse } from '@/app/shared/models/user-management.model';
import { environment } from '@/environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/users`;

  /**
   * Obtener todos los usuarios con filtros y paginación
   */
  getUsers(params?: UserQueryParams): Observable<UsersResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<UsersResponse>(this.API_URL, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener un usuario por ID
   */
  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear un nuevo usuario
   */
  createUser(data: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.API_URL, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar un usuario
   */
  updateUser(id: number, data: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API_URL}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Activar/desactivar usuario
   */
  toggleUserStatus(id: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.API_URL}/${id}/status`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Desactivar usuario (soft delete)
   */
  deleteUser(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar usuario permanentemente
   */
  deleteUserPermanently(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}/permanent`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Solicitar código de verificación para cambio de contraseña
   */
  requestPasswordCode(userId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_URL}/${userId}/password/request-code`,
      {}
    ).pipe(catchError(this.handleError));
  }

  /**
   * Cambiar contraseña con código de verificación
   */
  changePassword(userId: number, data: ChangePasswordRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.API_URL}/${userId}/password`,
      data
    ).pipe(catchError(this.handleError));
  }

  /**
   * Obtener configuraciones del usuario
   */
  getUserSettings(userId: number): Observable<UserSettingsApiResponse> {
    return this.http.get<UserSettingsApiResponse>(`${this.API_URL}/${userId}/settings`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar configuraciones del usuario
   */
  updateUserSettings(userId: number, settings: UserSettings): Observable<UserSettingsApiResponse> {
    return this.http.put<UserSettingsApiResponse>(
      `${this.API_URL}/${userId}/settings`,
      settings
    ).pipe(catchError(this.handleError));
  }

  /**
   * Manejo de errores
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors) {
        errorMessage = error.error.errors.join(', ');
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Error en UserManagementService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
