import { CreateListRequest, ListQueryParams, ListResponse, ListsResponse, ReorderListsRequest, UpdateListRequest } from '@/app/shared/models/task.model';
import { environment } from '@/environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/lists`;

  /**
   * Obtener todas las listas del usuario
   */
  getLists(params?: ListQueryParams): Observable<ListsResponse> {
    let httpParams = new HttpParams();

    if (params?.include_inactive !== undefined) {
      httpParams = httpParams.set('include_inactive', params.include_inactive.toString());
    }
    if (params?.include_tasks !== undefined) {
      httpParams = httpParams.set('include_tasks', params.include_tasks.toString());
    }

    return this.http.get<ListsResponse>(this.API_URL, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener una lista por ID
   */
  getListById(id: number): Observable<ListResponse> {
    return this.http.get<ListResponse>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener una lista con todas sus tareas
   */
  getListWithTasks(id: number): Observable<ListResponse> {
    return this.http.get<ListResponse>(`${this.API_URL}/${id}/tasks`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear una nueva lista
   */
  createList(data: CreateListRequest): Observable<ListResponse> {
    return this.http.post<ListResponse>(this.API_URL, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar una lista
   */
  updateList(id: number, data: UpdateListRequest): Observable<ListResponse> {
    return this.http.put<ListResponse>(`${this.API_URL}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Activar/desactivar lista
   */
  toggleListStatus(id: number): Observable<ListResponse> {
    return this.http.patch<ListResponse>(`${this.API_URL}/${id}/status`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Reordenar listas
   */
  reorderLists(data: ReorderListsRequest): Observable<ListsResponse> {
    return this.http.post<ListsResponse>(`${this.API_URL}/reorder`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar una lista
   */
  deleteList(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`)
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

    console.error('Error en ListApiService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
