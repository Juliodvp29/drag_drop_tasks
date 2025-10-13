import { AssignTaskRequest, CreateTaskRequest, MoveTaskRequest, TaskQueryParams, TaskResponse, TasksResponse, TaskStatusRequest, UpdateTaskRequest } from '@/app/shared/models/task.model';
import { environment } from '@/environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/tasks`;

  /**
   * Obtener todas las tareas
   */
  getTasks(params?: TaskQueryParams): Observable<TasksResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<TasksResponse>(this.API_URL, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener una tarea por ID
   */
  getTaskById(id: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear una nueva tarea
   */
  createTask(data: CreateTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.API_URL, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualizar una tarea
   */
  updateTask(id: number, data: UpdateTaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.API_URL}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Cambiar el estado de una tarea
   */
  changeTaskStatus(id: number, status: TaskStatusRequest): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.API_URL}/${id}/status`, status)
      .pipe(catchError(this.handleError));
  }

  /**
   * Marcar tarea como completada
   */
  completeTask(id: number): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.API_URL}/${id}/complete`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Asignar/desasignar tarea a un usuario
   */
  assignTask(id: number, data: AssignTaskRequest): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.API_URL}/${id}/assign`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Mover tarea a otra lista
   */
  moveTask(id: number, data: MoveTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${this.API_URL}/${id}/move`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Eliminar una tarea
   */
  deleteTask(id: number): Observable<{ success: boolean; message: string }> {
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

    console.error('Error en TaskApiService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
