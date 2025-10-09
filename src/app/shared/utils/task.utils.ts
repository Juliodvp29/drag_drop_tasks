import { ApiTask, TaskPriority, TaskStatus } from "../models/task.model";

export class TaskUtils {

  /**
  * Convierte fecha ISO string a objeto Date
  */
  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Formatea fecha para mostrar
   */
  static formatDate(dateString: string, locale: string = 'es-ES'): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Formatea fecha relativa (hace 2 horas, ayer, etc.)
   */
  static formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'hace un momento';
    if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;

    return this.formatDate(dateString);
  }

  /**
   * Verifica si una tarea está vencida
   */
  static isTaskOverdue(task: ApiTask): boolean {
    if (!task.due_date || task.status === TaskStatus.COMPLETED) {
      return false;
    }
    return new Date(task.due_date) < new Date();
  }

  /**
   * Obtiene el color según la prioridad
   */
  static getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return '#10b981'; // green
      case TaskPriority.MEDIUM:
        return '#3b82f6'; // blue
      case TaskPriority.HIGH:
        return '#f59e0b'; // yellow
      case TaskPriority.URGENT:
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }

  /**
   * Obtiene el color según el estado
   */
  static getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return '#6b7280'; // gray
      case TaskStatus.IN_PROGRESS:
        return '#3b82f6'; // blue
      case TaskStatus.COMPLETED:
        return '#10b981'; // green
      case TaskStatus.CANCELLED:
        return '#ef4444'; // red
      default:
        return '#6b7280';
    }
  }

  /**
   * Obtiene el label traducido del estado
   */
  static getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING:
        return 'Pendiente';
      case TaskStatus.IN_PROGRESS:
        return 'En Progreso';
      case TaskStatus.COMPLETED:
        return 'Completada';
      case TaskStatus.CANCELLED:
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Ordena tareas por prioridad y fecha
   */
  static sortTasks(tasks: ApiTask[]): ApiTask[] {
    const priorityOrder = {
      [TaskPriority.URGENT]: 4,
      [TaskPriority.HIGH]: 3,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.LOW]: 1
    };

    return [...tasks].sort((a, b) => {
      // Completadas al final
      const aCompleted = a.status === TaskStatus.COMPLETED || !!a.completed_at;
      const bCompleted = b.status === TaskStatus.COMPLETED || !!b.completed_at;

      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;

      // Por prioridad
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Por fecha de vencimiento (las más próximas primero)
      if (a.due_date && b.due_date) {
        const dueDateDiff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        if (dueDateDiff !== 0) return dueDateDiff;
      }
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;

      // Por fecha de creación (más recientes primero)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }


  static sortTasksByPriority(tasks: ApiTask[]): ApiTask[] {
    const priorityOrder = {
      [TaskPriority.URGENT]: 4,
      [TaskPriority.HIGH]: 3,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.LOW]: 1
    };
    return [...tasks].sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Filtra tareas por estado
   */
  static filterTasksByStatus(tasks: ApiTask[], status: TaskStatus): ApiTask[] {
    return tasks.filter(task => task.status === status);
  }

  /**
   * Filtra tareas por prioridad
   */
  static filterTasksByPriority(tasks: ApiTask[], priority: TaskPriority): ApiTask[] {
    return tasks.filter(task => task.priority === priority);
  }

  /**
   * Filtra tareas vencidas
   */
  static filterOverdueTasks(tasks: ApiTask[]): ApiTask[] {
    return tasks.filter(task => this.isTaskOverdue(task));
  }

  /**
   * Busca tareas por término
   */
  static searchTasks(tasks: ApiTask[], searchTerm: string): ApiTask[] {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return tasks;

    return tasks.filter(task =>
      task.title.toLowerCase().includes(term) ||
      task.description?.toLowerCase().includes(term) ||
      task.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  }

  /**
   * Calcula estadísticas de tareas
   */
  static getTaskStats(tasks: ApiTask[]) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const cancelled = tasks.filter(t => t.status === TaskStatus.CANCELLED).length;
    const overdue = this.filterOverdueTasks(tasks).length;

    return {
      total,
      completed,
      pending,
      inProgress,
      cancelled,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      activeCount: pending + inProgress
    };
  }

  /**
   * Calcula estadísticas de prioridad
   */
  static getPriorityStats(tasks: ApiTask[]) {
    const activeTasks = tasks.filter(
      t => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED
    );

    return {
      urgent: activeTasks.filter(t => t.priority === TaskPriority.URGENT).length,
      high: activeTasks.filter(t => t.priority === TaskPriority.HIGH).length,
      medium: activeTasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
      low: activeTasks.filter(t => t.priority === TaskPriority.LOW).length,
      total: activeTasks.length
    };
  }

  /**
   * Valida una fecha de vencimiento
   */
  static isValidDueDate(dueDate: string): boolean {
    const date = new Date(dueDate);
    return !isNaN(date.getTime());
  }

  /**
   * Calcula tiempo restante hasta la fecha de vencimiento
   */
  static getTimeUntilDue(dueDate: string): string {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();

    if (diffMs < 0) return 'Vencida';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutos`;
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `${diffDays} día${diffDays > 1 ? 's' : ''}`;

    const weeks = Math.floor(diffDays / 7);
    return `${weeks} semana${weeks > 1 ? 's' : ''}`;
  }

  /**
   * Genera un color aleatorio para una lista
   */
  static getRandomColor(): string {
    const colors = [
      '#ef4444', // red
      '#f59e0b', // orange
      '#10b981', // green
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Convierte tags string a array
   */
  static parseTags(tagsInput: string): string[] {
    return tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  /**
   * Convierte array de tags a string
   */
  static stringifyTags(tags: string[]): string {
    return tags.join(', ');
  }
}
