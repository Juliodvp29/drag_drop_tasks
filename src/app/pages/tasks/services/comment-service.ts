import { CommentResponse, CommentsResponse, CreateCommentRequest, UpdateCommentRequest } from '@/app/shared/models/task.model';
import { environment } from '@/environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/tasks`;

  /**
   * Obtener comentarios de una tarea
   */
  getComments(taskId: number): Observable<CommentsResponse> {
    return this.http.get<CommentsResponse>(`${this.API_URL}/${taskId}/comments`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Agregar un comentario a una tarea
   */
  createComment(taskId: number, data: CreateCommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${this.API_URL}/${taskId}/comments`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Editar un comentario
   */
  updateComment(
    taskId: number,
    commentId: number,
    data: UpdateCommentRequest
  ): Observable<CommentResponse> {
    return this.http.put<CommentResponse>(
      `${this.API_URL}/${taskId}/comments/${commentId}`,
      data
    ).pipe(catchError(this.handleError));
  }

  /**
   * Eliminar un comentario
   */
  deleteComment(taskId: number, commentId: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.API_URL}/${taskId}/comments/${commentId}`
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

    console.error('Error en CommentApiService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
