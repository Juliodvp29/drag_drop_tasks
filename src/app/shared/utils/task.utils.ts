import { Task, TaskPriority } from "../models/task.model";

export class TaskUtils {
  // Orden de prioridad (mayor número = mayor prioridad)
  private static readonly PRIORITY_ORDER = {
    [TaskPriority.URGENT]: 4,
    [TaskPriority.HIGH]: 3,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.LOW]: 1
  };

  /**
   * Ordena las tareas por prioridad (urgente primero) y luego por fecha de creación
   */
  static sortTasksByPriority(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      // Si una está completada y la otra no, la no completada va primero
      if (a.finishedAt && !b.finishedAt) return 1;
      if (!a.finishedAt && b.finishedAt) return -1;

      // Si ambas tienen el mismo estado de completación, ordenar por prioridad
      const priorityDiff = this.PRIORITY_ORDER[b.priority] - this.PRIORITY_ORDER[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Si tienen la misma prioridad, ordenar por fecha de creación (más reciente primero)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * Obtiene el color del borde según la prioridad
   */
  static getPriorityBorderClass(priority: TaskPriority): string {
    switch (priority) {
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

  /**
   * Obtiene la clase CSS para el badge de prioridad
   */
  static getPriorityBadgeClass(priority: TaskPriority): string {
    switch (priority) {
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

  /**
   * Obtiene el emoji según la prioridad
   */
  static getPriorityIcon(priority: TaskPriority): string {
    switch (priority) {
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

  /**
   * Obtiene el label de la prioridad
   */
  static getPriorityLabel(priority: TaskPriority): string {
    switch (priority) {
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

  /**
   * Filtra tareas por prioridad
   */
  static filterTasksByPriority(tasks: Task[], priority: TaskPriority): Task[] {
    return tasks.filter(task => task.priority === priority);
  }

  /**
   * Cuenta tareas por prioridad
   */
  static countTasksByPriority(tasks: Task[], priority: TaskPriority): number {
    return tasks.filter(task => task.priority === priority && !task.finishedAt).length;
  }

  /**
   * Obtiene estadísticas de prioridades
   */
  static getPriorityStats(tasks: Task[]) {
    const activeTasks = tasks.filter(task => !task.finishedAt);

    return {
      urgent: this.countTasksByPriority(tasks, TaskPriority.URGENT),
      high: this.countTasksByPriority(tasks, TaskPriority.HIGH),
      medium: this.countTasksByPriority(tasks, TaskPriority.MEDIUM),
      low: this.countTasksByPriority(tasks, TaskPriority.LOW),
      total: activeTasks.length,
      completed: tasks.filter(task => task.finishedAt).length
    };
  }
}
