
import { ApiTask, TaskPriority, TaskStatus } from '@/app/shared/models/task.model';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.scss'
})
export class Card {

  @Input({ required: true }) task!: ApiTask;
  @Output() taskMoved = new EventEmitter<{ taskId: number, sourceListId: number, targetListId: number }>();
  @Output() taskDeleted = new EventEmitter<number>();
  @Output() taskCompleted = new EventEmitter<number>();

  isDragging = signal(false);

  get isCompleted(): boolean {
    return this.task.status === TaskStatus.COMPLETED || !!this.task.completed_at;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getPriorityBorderClass(): string {
    switch (this.task.priority) {
      case TaskPriority.LOW:
        return 'border-l-success';
      case TaskPriority.MEDIUM:
        return 'border-l-info';
      case TaskPriority.HIGH:
        return 'border-l-warning';
      case TaskPriority.URGENT:
        return 'border-l-error';
      default:
        return 'border-l-gray-300';
    }
  }

  getPriorityBadgeClass(): string {
    switch (this.task.priority) {
      case TaskPriority.LOW:
        return 'bg-success bg-opacity-20 text-green-700';
      case TaskPriority.MEDIUM:
        return 'bg-info bg-opacity-20 text-blue-700';
      case TaskPriority.HIGH:
        return 'bg-warning bg-opacity-20 text-yellow-700';
      case TaskPriority.URGENT:
        return 'bg-error bg-opacity-20 text-red-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  }

  getPriorityLabel(): string {
    switch (this.task.priority) {
      case TaskPriority.LOW:
        return 'Baja';
      case TaskPriority.MEDIUM:
        return 'Media';
      case TaskPriority.HIGH:
        return 'Alta';
      case TaskPriority.URGENT:
        return 'Urgente';
      default:
        return 'Normal';
    }
  }

  getPriorityIcon(): string {
    switch (this.task.priority) {
      case TaskPriority.LOW:
        return '🟢';
      case TaskPriority.MEDIUM:
        return '🟡';
      case TaskPriority.HIGH:
        return '🟠';
      case TaskPriority.URGENT:
        return '🔴';
      default:
        return '⚪';
    }
  }

  onDragStart(event: DragEvent): void {
    this.isDragging.set(true);

    const dragData = {
      taskId: this.task.id,
      sourceListId: this.task.list_id
    };

    event.dataTransfer?.setData('text/plain', JSON.stringify(dragData));

    const dragImage = document.getElementById('drag-image');

    if (dragImage && event.dataTransfer) {
      event.dataTransfer.setDragImage(dragImage, 12, 12);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragEnd(event: DragEvent): void {
    this.isDragging.set(false);
  }

  deleteTask(): void {
    this.taskDeleted.emit(this.task.id);
  }

  markAsCompleted(): void {
    this.taskCompleted.emit(this.task.id);
  }
}
