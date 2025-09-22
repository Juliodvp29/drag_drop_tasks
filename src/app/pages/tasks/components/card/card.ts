import { Task } from '@/app/shared/models/task.model';
import { TaskUtils } from '@/app/shared/utils/task.utils';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.scss'
})
export class Card {

  @Input({ required: true }) task!: Task;
  @Output() taskMoved = new EventEmitter<{ taskId: string, sourceListId: string, targetListId: string }>();
  @Output() taskDeleted = new EventEmitter<string>();
  @Output() taskCompleted = new EventEmitter<string>();

  isDragging = signal(false);

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getPriorityBorderClass(): string {
    return TaskUtils.getPriorityBorderClass(this.task.priority);
  }

  getPriorityBadgeClass(): string {
    return TaskUtils.getPriorityBadgeClass(this.task.priority);
  }

  getPriorityLabel(): string {
    return TaskUtils.getPriorityLabel(this.task.priority);
  }

  getPriorityIcon(): string {
    return TaskUtils.getPriorityIcon(this.task.priority);
  }

  onDragStart(event: DragEvent): void {
    this.isDragging.set(true);

    const dragData = {
      taskId: this.task.id,
      sourceListId: this.task.listId
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
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      this.taskDeleted.emit(this.task.id);
    }
  }

  markAsCompleted(): void {
    this.taskCompleted.emit(this.task.id);
  }
}
