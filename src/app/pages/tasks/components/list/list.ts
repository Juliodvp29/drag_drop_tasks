import { UserManagementService } from '@/app/pages/admin/service/user-management-service';
import { ApiTask, ApiTaskList, TaskPriority } from '@/app/shared/models/task.model';
import { UserListItem } from '@/app/shared/models/user-management.model';
import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@services/auth-service';
import { firstValueFrom } from 'rxjs';
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
  authService = inject(AuthService);
  userService = inject(UserManagementService);

  newTaskTitle = signal('');
  newTaskDescription = signal('');
  selectedTaskPriority = signal<TaskPriority>(TaskPriority.MEDIUM);
  selectedAssignedUser = signal<number | null>(null);
  showOptions = signal(false);
  showDescriptionInput = signal(false);
  showAssignmentInput = signal(false);
  availableUsers = signal<UserListItem[]>([]);
  loadingUsers = signal(false);
  userSearchQuery = signal('');
  showUserDropdown = false;
  filteredUsers = signal<UserListItem[]>([]);

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
    const assignedTo = this.selectedAssignedUser();

    await this.taskService.createTask(
      title,
      this.list.id,
      this.selectedTaskPriority(),
      description,
      assignedTo || undefined
    );

    this.newTaskTitle.set('');
    this.newTaskDescription.set('');
    this.selectedTaskPriority.set(TaskPriority.MEDIUM);
    this.selectedAssignedUser.set(null);
    this.showDescriptionInput.set(false);
    this.showAssignmentInput.set(false);
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

  toggleAssignmentInput(): void {
    this.showAssignmentInput.set(!this.showAssignmentInput());
    if (this.showAssignmentInput() && this.availableUsers().length === 0) {
      this.loadUsers();
    }
  }

  async loadUsers(): Promise<void> {
    if (!this.authService.hasPermission('users.view')) return;

    try {
      this.loadingUsers.set(true);
      const response = await firstValueFrom(
        this.userService.getUsers({ is_active: true, limit: 100 })
      );
      if (response.success) {
        this.availableUsers.set(response.data);
        this.filteredUsers.set(response.data);
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
    } finally {
      this.loadingUsers.set(false);
    }
  }

  canAssignTasks(): boolean {
    return this.authService.hasRole('admin') || this.authService.hasRole('super_admin');
  }

  filterUsers(): void {
    const query = this.userSearchQuery().toLowerCase().trim();
    if (!query) {
      this.filteredUsers.set(this.availableUsers());
    } else {
      const filtered = this.availableUsers().filter(user =>
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
      this.filteredUsers.set(filtered);
    }
  }

  selectUser(userId: number): void {
    this.selectedAssignedUser.set(userId);
    this.showUserDropdown = false;
    this.userSearchQuery.set('');
  }

  clearUserSelection(): void {
    this.selectedAssignedUser.set(null);
    this.userSearchQuery.set('');
  }

  hideDropdown(): void {
    // Delay hiding to allow click events on dropdown items
    setTimeout(() => {
      this.showUserDropdown = false;
    }, 150);
  }

  getSelectedUserName(): string {
    const userId = this.selectedAssignedUser();
    if (!userId) return '';

    const user = this.availableUsers().find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name} (${user.email})` : '';
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
