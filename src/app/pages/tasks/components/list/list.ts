import { ApiTask, ApiTaskList, TaskPriority } from '@/app/shared/models/task.model';
import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task-service';
import { Card } from "../card/card";

@Component({
  selector: 'app-list',
  imports: [CommonModule, FormsModule, Card],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class List {

  @Input({ required: true }) list!: ApiTaskList;
  @Output() taskMoved = new EventEmitter<{ taskId: number, sourceListId: number, targetListId: number }>();
  @Output() taskDetailOpened = new EventEmitter<ApiTask>();

  taskService = inject(TaskService);

  newTaskTitle = signal('');
  newTaskDescription = signal('');
  selectedTaskPriority = signal<TaskPriority>(TaskPriority.MEDIUM);
  showOptions = signal(false);
  showDescriptionInput = signal(false);

  priorityStats = computed(() => {
    const tasks = this.list.tasks || [];
    const activeTasks = tasks.filter(task => task.status !== 'completed' && !task.completed_at);

    return {
      urgent: activeTasks.filter(t => t.priority === TaskPriority.URGENT).length,
      high: activeTasks.filter(t => t.priority === TaskPriority.HIGH).length,
      medium: activeTasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
      low: activeTasks.filter(t => t.priority === TaskPriority.LOW).length,
      total: activeTasks.length,
      completed: tasks.filter(t => t.status === 'completed' || t.completed_at).length
    };
  });

  sortedTasks = computed(() => {
    const tasks = this.list.tasks || [];
    return [...tasks].sort((a, b) => {
      const aCompleted = a.status === 'completed' || !!a.completed_at;
      const bCompleted = b.status === 'completed' || !!b.completed_at;

      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;

      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  async createTask(): Promise<void> {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    const description = this.newTaskDescription().trim() || undefined;

    await this.taskService.createTask(
      title,
      this.list.id,
      this.selectedTaskPriority(),
      description
    );

    this.newTaskTitle.set('');
    this.newTaskDescription.set('');
    this.selectedTaskPriority.set(TaskPriority.MEDIUM);
    this.showDescriptionInput.set(false);
  }

  async deleteList(): Promise<void> {
    await this.taskService.deleteList(this.list.id);
  }

  toggleOptions(): void {
    this.showOptions.set(!this.showOptions());
  }

  toggleDescriptionInput(): void {
    this.showDescriptionInput.set(!this.showDescriptionInput());
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  }

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

  onTaskMoved(event: { taskId: number, sourceListId: number, targetListId: number }): void {
    this.taskMoved.emit(event);
  }

  async onTaskDeleted(taskId: number): Promise<void> {
    await this.taskService.deleteTask(taskId);
  }

  async onTaskCompleted(taskId: number): Promise<void> {
    await this.taskService.completeTask(taskId);
  }

  onTaskDetailOpened(task: ApiTask): void {
    this.taskDetailOpened.emit(task);
  }
}
