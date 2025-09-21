import { StorageService } from '@/app/core/services/storage-service';
import { TaskList } from '@/app/shared/models/list.model';
import { Task, TaskPriority } from '@/app/shared/models/task.model';
import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly LISTS_KEY = 'task_lists';

  // Signal para almacenar las listas (inicializar vacío)
  private listsSignal = signal<TaskList[]>([]);

  // Computed signal para acceso público
  public lists = computed(() => this.listsSignal());

  constructor(private storageService: StorageService) {
    // Cargar las listas después de que se complete la inyección
    this.initializeLists();
  }

  private initializeLists(): void {
    const loadedLists = this.loadLists();
    this.listsSignal.set(loadedLists);
  }

  private loadLists(): TaskList[] {
    const stored = this.storageService.getItem(this.LISTS_KEY);
    if (!stored || !Array.isArray(stored)) {
      // Crear listas por defecto si no existen
      const defaultLists: TaskList[] = [
        {
          id: this.generateId(),
          name: 'Por Hacer',
          createdAt: new Date(),
          tasks: []
        },
        {
          id: this.generateId(),
          name: 'En Progreso',
          createdAt: new Date(),
          tasks: []
        },
        {
          id: this.generateId(),
          name: 'Completado',
          createdAt: new Date(),
          tasks: []
        }
      ];
      this.saveLists(defaultLists);
      return defaultLists;
    }

    // Convertir fechas de string a Date
    return stored.map((list: any) => ({
      ...list,
      createdAt: new Date(list.createdAt),
      tasks: list.tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        finishedAt: task.finishedAt ? new Date(task.finishedAt) : undefined
      }))
    }));
  }

  private saveLists(lists: TaskList[]): void {
    this.storageService.setItem(this.LISTS_KEY, lists);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Crear nueva lista
  createList(name: string, color?: string): void {
    const newList: TaskList = {
      id: this.generateId(),
      name,
      createdAt: new Date(),
      tasks: [],
      color
    };

    const currentLists = this.listsSignal();
    const updatedLists = [...currentLists, newList];
    this.listsSignal.set(updatedLists);
    this.saveLists(updatedLists);
  }

  // Crear nueva tarea
  createTask(description: string, listId: string, priority: TaskPriority = TaskPriority.MEDIUM): void {
    const newTask: Task = {
      id: this.generateId(),
      description,
      createdAt: new Date(),
      listId,
      priority
    };

    const currentLists = this.listsSignal();
    const updatedLists = currentLists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          tasks: [...list.tasks, newTask]
        };
      }
      return list;
    });

    this.listsSignal.set(updatedLists);
    this.saveLists(updatedLists);
  }

  // Mover tarea entre listas
  moveTask(taskId: string, sourceListId: string, targetListId: string): void {
    const currentLists = this.listsSignal();
    let taskToMove: Task | null = null;

    // Encontrar y remover la tarea de la lista origen
    const updatedLists = currentLists.map(list => {
      if (list.id === sourceListId) {
        const taskIndex = list.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          taskToMove = { ...list.tasks[taskIndex], listId: targetListId };
          return {
            ...list,
            tasks: list.tasks.filter(task => task.id !== taskId)
          };
        }
      }
      return list;
    });

    // Agregar la tarea a la lista destino
    if (taskToMove) {
      const finalLists = updatedLists.map(list => {
        if (list.id === targetListId) {
          return {
            ...list,
            tasks: [...list.tasks, taskToMove!]
          };
        }
        return list;
      });

      this.listsSignal.set(finalLists);
      this.saveLists(finalLists);
    }
  }

  // Completar tarea
  completeTask(taskId: string, listId: string): void {
    const currentLists = this.listsSignal();
    const updatedLists = currentLists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          tasks: list.tasks.map(task =>
            task.id === taskId
              ? { ...task, finishedAt: new Date() }
              : task
          )
        };
      }
      return list;
    });

    this.listsSignal.set(updatedLists);
    this.saveLists(updatedLists);
  }

  // Eliminar tarea
  deleteTask(taskId: string, listId: string): void {
    const currentLists = this.listsSignal();
    const updatedLists = currentLists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          tasks: list.tasks.filter(task => task.id !== taskId)
        };
      }
      return list;
    });

    this.listsSignal.set(updatedLists);
    this.saveLists(updatedLists);
  }

  // Eliminar lista
  deleteList(listId: string): void {
    const currentLists = this.listsSignal();
    const updatedLists = currentLists.filter(list => list.id !== listId);
    this.listsSignal.set(updatedLists);
    this.saveLists(updatedLists);
  }
}
