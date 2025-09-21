import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { List } from "./components/list/list";
import { TaskService } from './services/task-service';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule, FormsModule, List],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss'
})
export class Tasks implements OnInit {

  taskService = inject(TaskService);

  newListName = signal('');
  selectedColor = signal<string>('');

  ngOnInit(): void {

  }

  createNewList(): void {
    const name = this.newListName().trim();
    if (name) {
      this.taskService.createList(name, this.selectedColor() || undefined);
      this.newListName.set('');
      this.selectedColor.set('');
    }
  }

  onTaskMoved(event: { taskId: string; sourceListId: string; targetListId: string }): void {
    this.taskService.moveTask(event.taskId, event.sourceListId, event.targetListId);
  }
}
