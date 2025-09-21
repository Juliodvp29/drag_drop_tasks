import { TaskList } from '@/app/shared/models/list.model';
import { TaskPriority } from '@/app/shared/models/task.model';
import { SortTasksPipe } from '@/app/shared/pipes/sort-tasks-pipe';
import { TaskUtils } from '@/app/shared/utils/task.utils';
import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task-service';
import { Card } from "../card/card";

@Component({
  selector: 'app-list',
  imports: [CommonModule, FormsModule, Card, SortTasksPipe],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class List {

  @Input({ required: true }) list!: TaskList;
  @Output() taskMoved = new EventEmitter<{ taskId: string, sourceListId: string, targetListId: string }>();

  taskService = inject(TaskService);

  newTaskDescription = signal('');
  selectedTaskPriority = signal<TaskPriority>(TaskPriority.MEDIUM);
  showOptions = signal(false);

  // Computed para las estadísticas de prioridad
  priorityStats = computed(() => TaskUtils.getPriorityStats(this.list.tasks));

  createTask(): void {
    const description = this.newTaskDescription().trim();
    if (description) {
      this.taskService.createTask(description, this.list.id, this.selectedTaskPriority());
      this.newTaskDescription.set('');
      this.selectedTaskPriority.set(TaskPriority.MEDIUM);
    }
  }

  deleteList(): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la lista "${this.list.name}"?`)) {
      this.taskService.deleteList(this.list.id);
    }
  }

  toggleOptions(): void {
    this.showOptions.set(!this.showOptions());
  }

  getListBorderClass(): string {
    if (this.list.color) {
      return `border-t-${this.list.color}`;
    }
    return 'border-t-primary';
  }

  getPriorityCount(priority: TaskPriority): number {
    return TaskUtils.countTasksByPriority(this.list.tasks, priority);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  }

  // Drag and Drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const dragData = event.dataTransfer?.getData('text/plain');
    if (dragData) {
      try {
        const data = JSON.parse(dragData);
        if (data.taskId && data.sourceListId && data.sourceListId !== this.list.id) {
          this.taskMoved.emit({
            taskId: data.taskId,
            sourceListId: data.sourceListId,
            targetListId: this.list.id
          });
        }
      } catch (e) {
        console.error('Error parsing drag data:', e);
      }
    }
  }

  onTaskMoved(event: { taskId: string, sourceListId: string, targetListId: string }): void {
    this.taskMoved.emit(event);
  }

  onTaskDeleted(taskId: string): void {
    this.taskService.deleteTask(taskId, this.list.id);
  }

  onTaskCompleted(taskId: string): void {
    this.taskService.completeTask(taskId, this.list.id);
  }
}
