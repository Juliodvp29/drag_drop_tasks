import { ApiResponse, Role } from '@/app/shared/models/auth.model';
import { environment } from '@/environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/roles`;

  /**
   * Obtener todos los roles
   */
  getRoles(): Observable<ApiResponse<{ roles: Role[] }>> {
    return this.http.get<ApiResponse<{ roles: Role[] }>>(this.API_URL)
      .pipe(catchError(this.handleError));
  }


  /**
   * Obtener un rol por ID
   */
  getRoleById(id: number): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
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

    console.error('Error en RoleService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
