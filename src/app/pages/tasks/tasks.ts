import { ColorPicker } from '@/app/shared/components/color-picker/color-picker';
import { ColorChangeEvent } from '@/app/shared/models/color-picker';
import { ApiTask } from '@/app/shared/models/task.model';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { List } from "./components/list/list";
import { TaskDetail } from "./components/task-detail/task-detail";
import { TaskService } from './services/task-service';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule, FormsModule, List, ColorPicker, TaskDetail],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss'
})
export class Tasks implements OnInit {

  taskService = inject(TaskService);

  newListName = signal('');
  newListDescription = signal('');
  selectedColor = signal<string>('');
  showDescriptionInput = signal(false);

  selectedTask = signal<ApiTask | null>(null);
  isDetailOpen = signal(false);

  ngOnInit(): void {
    // Las listas se cargan automáticamente en el constructor del servicio
  }

  async createNewList(): Promise<void> {
    const name = this.newListName().trim();
    if (!name) return;

    const description = this.newListDescription().trim() || undefined;
    const color = this.selectedColor() || undefined;

    await this.taskService.createList(name, color, description);

    // Limpiar formulario
    this.newListName.set('');
    this.newListDescription.set('');
    this.selectedColor.set('');
    this.showDescriptionInput.set(false);
  }

  async onTaskMoved(event: { taskId: number; sourceListId: number; targetListId: number }): Promise<void> {
    await this.taskService.moveTask(event.taskId, event.sourceListId, event.targetListId);
  }

  onColorChange(event: ColorChangeEvent): void {
    this.selectedColor.set(event.hex || '');
  }

  toggleDescriptionInput(): void {
    this.showDescriptionInput.set(!this.showDescriptionInput());
  }

  openTaskDetail(task: ApiTask): void {
    this.selectedTask.set(task);
    this.isDetailOpen.set(true);
  }

  closeTaskDetail(): void {
    this.isDetailOpen.set(false);
    this.selectedTask.set(null);
  }

}
