import { ConfirmationService } from '@/app/core/services/confirmation-service';
import { ToastService } from '@/app/core/services/toast-service';
import { ApiTask, ApiTaskList, TaskComment, TaskPriority, TaskStatus } from '@/app/shared/models/task.model';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommentService } from './comment-service';
import { ListService } from './list-service';
import { TaskApiService } from './task-api-service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private listApiService = inject(ListService);
  private taskApiService = inject(TaskApiService);
  private commentService = inject(CommentService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  private listsSignal = signal<ApiTaskList[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  public lists = computed(() => this.listsSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());

  constructor() {
    this.loadLists();
  }


  async loadLists(): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const response = await firstValueFrom(
        this.listApiService.getLists({ include_tasks: true })
      );

      if (response.success) {
        this.listsSignal.set(response.data.lists);
      }
    } catch (error: any) {
      this.errorSignal.set(error.message);
      this.toastService.error('Error al cargar las listas');
      console.error('Error loading lists:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }


  async createList(name: string, color?: string, description?: string): Promise<void> {
    try {
      this.loadingSignal.set(true);

      const response = await firstValueFrom(
        this.listApiService.createList({
          name,
          color,
          description,
          position: this.lists().length
        })
      );

      if (response.success) {
        await this.loadLists();
        this.toastService.success('Lista creada exitosamente');
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al crear la lista');
      console.error('Error creating list:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }


  async updateList(
    listId: number,
    name?: string,
    color?: string,
    description?: string
  ): Promise<void> {
    try {
      this.loadingSignal.set(true);

      const response = await firstValueFrom(
        this.listApiService.updateList(listId, { name, color, description })
      );

      if (response.success) {
        await this.loadLists();
        this.toastService.success('Lista actualizada exitosamente');
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al actualizar la lista');
      console.error('Error updating list:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }


  async deleteList(listId: number): Promise<void> {
    const list = this.lists().find(l => l.id === listId);
    if (!list) return;

    const confirmed = await firstValueFrom(
      this.confirmationService.confirmDelete(
        list.name,
        '¿Estás seguro de que deseas eliminar esta lista? Esta acción no se puede deshacer.'
      )
    );

    if (!confirmed) return;

    try {
      this.loadingSignal.set(true);

      const response = await firstValueFrom(
        this.listApiService.deleteList(listId)
      );

      if (response.success) {
        await this.loadLists();
        this.toastService.success('Lista eliminada exitosamente');
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al eliminar la lista');
      console.error('Error deleting list:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }


  async createTask(
    title: string,
    listId: number,
    priority: TaskPriority = TaskPriority.MEDIUM,
    description?: string
  ): Promise<void> {
    try {
      this.loadingSignal.set(true);

      const response = await firstValueFrom(
        this.taskApiService.createTask({
          title,
          description,
          priority,
          list_id: listId
        })
      );

      if (response.success) {
        await this.loadLists();
        this.toastService.success('Tarea creada exitosamente');
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al crear la tarea');
      console.error('Error creating task:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }


  async updateTask(
    taskId: number,
    updates: {
      title?: string;
      description?: string;
      priority?: TaskPriority;
      status?: TaskStatus;
    }
  ): Promise<void> {
    try {
      this.loadingSignal.set(true);

      const response = await firstValueFrom(
        this.taskApiService.updateTask(taskId, updates)
      );

      if (response.success) {
        await this.loadLists();
        this.toastService.success('Tarea actualizada exitosamente');
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al actualizar la tarea');
      console.error('Error updating task:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }


  async completeTask(taskId: number): Promise<void> {
    try {
      this.loadingSignal.set(true);

      const response = await firstValueFrom(
        this.taskApiService.completeTask(taskId)
      );

      if (response.success) {
        await this.loadLists();
        this.toastService.success('Tarea completada');
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al completar la tarea');
      console.error('Error completing task:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }


  async deleteTask(taskId: number): Promise<void> {
    const confirmed = await firstValueFrom(
      this.confirmationService.confirmDelete(
        'esta tarea',
        '¿Estás seguro de que deseas eliminar esta tarea?'
      )
    );

    if (!confirmed) return;

    try {
      this.loadingSignal.set(true);

      const response = await firstValueFrom(
        this.taskApiService.deleteTask(taskId)
      );

      if (response.success) {
        await this.loadLists();
        this.toastService.success('Tarea eliminada exitosamente');
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al eliminar la tarea');
      console.error('Error deleting task:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }


  async moveTask(taskId: number, sourceListId: number, targetListId: number): Promise<void> {
    try {
      this.loadingSignal.set(true);

      const response = await firstValueFrom(
        this.taskApiService.moveTask(taskId, {
          source_list_id: sourceListId,
          target_list_id: targetListId,
          position: 0
        })
      );

      if (response.success) {
        await this.loadLists();
        this.toastService.success('Tarea movida exitosamente');
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al mover la tarea');
      console.error('Error moving task:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }


  async reorderLists(lists: Array<{ id: number; position: number }>): Promise<void> {
    try {
      this.loadingSignal.set(true);

      const response = await firstValueFrom(
        this.listApiService.reorderLists({ lists })
      );

      if (response.success) {
        await this.loadLists();
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al reordenar las listas');
      console.error('Error reordering lists:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  getTaskById(taskId: number): ApiTask | undefined {
    for (const list of this.lists()) {
      const task = list.tasks?.find(t => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  }

  getListById(listId: number): ApiTaskList | undefined {
    return this.lists().find(l => l.id === listId);
  }

  async getComments(taskId: number): Promise<TaskComment[]> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const response = await firstValueFrom(
        this.commentService.getComments(taskId)
      );

      if (response.success) {
        console.log('API response data:', response.data);
        const data = response.data as any;
        return Array.isArray(data) ? data : (data.comments || []);
      }
      return [];
    } catch (error: any) {
      this.errorSignal.set(error.message);
      this.toastService.error('Error al cargar comentarios');
      console.error('Error loading comments:', error);
      return [];
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async createComment(taskId: number, content: string): Promise<void> {
    try {
      this.loadingSignal.set(true);

      const response = await firstValueFrom(
        this.commentService.createComment(taskId, { content })
      );

      if (response.success) {
        this.toastService.success('Comentario agregado exitosamente');
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al agregar comentario');
      console.error('Error creating comment:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateComment(taskId: number, commentId: number, content: string): Promise<void> {
    try {
      this.loadingSignal.set(true);

      const response = await firstValueFrom(
        this.commentService.updateComment(taskId, commentId, { content })
      );

      if (response.success) {
        this.toastService.success('Comentario actualizado exitosamente');
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al actualizar comentario');
      console.error('Error updating comment:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteComment(taskId: number, commentId: number): Promise<void> {
    const confirmed = await firstValueFrom(
      this.confirmationService.confirmDelete(
        'este comentario',
        '¿Estás seguro de que deseas eliminar este comentario?'
      )
    );

    if (!confirmed) return;

    try {
      this.loadingSignal.set(true);

      const response = await firstValueFrom(
        this.commentService.deleteComment(taskId, commentId)
      );

      if (response.success) {
        this.toastService.success('Comentario eliminado exitosamente');
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al eliminar comentario');
      console.error('Error deleting comment:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
