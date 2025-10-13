import { ApiResponse, CreateRoleRequest, Permission, Role, UpdateRoleRequest } from '@/app/shared/models/auth.model';
import { environment } from '@/environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/roles`;

  getRoles(includeInactive: boolean = false): Observable<ApiResponse<{ roles: Role[] }>> {
    let params = new HttpParams();
    if (includeInactive) {
      params = params.set('include_inactive', 'true');
    }
    return this.http.get<ApiResponse<{ roles: Role[] }>>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }


  getRoleById(id: number): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }


  getPermissions(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.API_URL}/permissions`)
      .pipe(catchError(this.handleError));
  }


  createRole(roleData: CreateRoleRequest): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(this.API_URL, roleData)
      .pipe(catchError(this.handleError));
  }

  updateRole(id: number, roleData: UpdateRoleRequest): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${this.API_URL}/${id}`, roleData)
      .pipe(catchError(this.handleError));
  }


  toggleRoleStatus(id: number): Observable<ApiResponse<{ success: boolean; message: string }>> {
    return this.http.patch<ApiResponse<{ success: boolean; message: string }>>(`${this.API_URL}/${id}/status`, {})
      .pipe(catchError(this.handleError));
  }


  deleteRole(id: number): Observable<ApiResponse<{ success: boolean; message: string }>> {
    return this.http.delete<ApiResponse<{ success: boolean; message: string }>>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }


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
