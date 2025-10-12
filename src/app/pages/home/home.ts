import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../tasks/services/task-service';
import { StorageService } from '@/app/core/services/storage-service';
import { TaskPriority, TaskStatus } from '@/app/shared/models/task.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {
  private taskService = inject(TaskService);
  private storageService = inject(StorageService);

  // Señales para el tiempo
  currentTime = signal(new Date());
  currentTimeString = signal('');
  currentDateString = signal('');
  greeting = signal('');

  // Intervalo para actualizar el reloj
  private timeInterval?: number;

  // Configuración del usuario
  userSettings = computed(() => this.storageService.getUserSettings() || {});
  timezone = computed(() => this.userSettings().timezone || 'America/Bogota');
  timeFormat = computed(() => this.userSettings().time_format || '24h');

  // Estadísticas de tareas
  totalTasks = computed(() => {
    const lists = this.taskService.lists();
    return lists.reduce((total, list) => total + (list.tasks?.length || 0), 0);
  });

  completedTasks = computed(() => {
    const lists = this.taskService.lists();
    return lists.reduce((total, list) => {
      return total + (list.tasks?.filter(task => task.status === TaskStatus.COMPLETED).length || 0);
    }, 0);
  });

  pendingTasks = computed(() => this.totalTasks() - this.completedTasks());

  urgentTasks = computed(() => {
    const lists = this.taskService.lists();
    return lists.reduce((total, list) => {
      return total + (list.tasks?.filter(task => task.priority === TaskPriority.URGENT).length || 0);
    }, 0);
  });

  highPriorityTasks = computed(() => {
    const lists = this.taskService.lists();
    return lists.reduce((total, list) => {
      return total + (list.tasks?.filter(task => task.priority === TaskPriority.HIGH).length || 0);
    }, 0);
  });

  mediumPriorityTasks = computed(() => {
    const lists = this.taskService.lists();
    return lists.reduce((total, list) => {
      return total + (list.tasks?.filter(task => task.priority === TaskPriority.MEDIUM).length || 0);
    }, 0);
  });

  lowPriorityTasks = computed(() => {
    const lists = this.taskService.lists();
    return lists.reduce((total, list) => {
      return total + (list.tasks?.filter(task => task.priority === TaskPriority.LOW).length || 0);
    }, 0);
  });

  // Estadísticas de listas
  totalLists = computed(() => this.taskService.lists().length);

  // Usuario actual
  currentUser = computed(() => this.storageService.getUser());

  // Progreso general
  completionPercentage = computed(() => {
    const total = this.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.completedTasks() / total) * 100);
  });

  ngOnInit() {
    this.updateTime();
    this.timeInterval = window.setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private updateTime() {
    const now = new Date();

    // Actualizar saludo basado en la hora
    const hour = now.getHours();
    if (hour < 12) {
      this.greeting.set('Buenos días');
    } else if (hour < 18) {
      this.greeting.set('Buenas tardes');
    } else {
      this.greeting.set('Buenas noches');
    }

    // Formatear fecha
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: this.timezone()
    };
    this.currentDateString.set(now.toLocaleDateString('es-ES', options));

    // Formatear hora
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: this.timeFormat() === '12h',
      timeZone: this.timezone()
    };
    this.currentTimeString.set(now.toLocaleTimeString('es-ES', timeOptions));
  }

  // Métodos para gráficas
  getPriorityChartData() {
    return [
      { label: 'Urgente', value: this.urgentTasks(), color: '#dc2626', percentage: this.getPriorityPercentage(TaskPriority.URGENT) },
      { label: 'Alta', value: this.highPriorityTasks(), color: '#ea580c', percentage: this.getPriorityPercentage(TaskPriority.HIGH) },
      { label: 'Media', value: this.mediumPriorityTasks(), color: '#ca8a04', percentage: this.getPriorityPercentage(TaskPriority.MEDIUM) },
      { label: 'Baja', value: this.lowPriorityTasks(), color: '#16a34a', percentage: this.getPriorityPercentage(TaskPriority.LOW) }
    ];
  }

  private getPriorityPercentage(priority: TaskPriority): number {
    const total = this.totalTasks();
    if (total === 0) return 0;

    let count = 0;
    switch (priority) {
      case TaskPriority.URGENT:
        count = this.urgentTasks();
        break;
      case TaskPriority.HIGH:
        count = this.highPriorityTasks();
        break;
      case TaskPriority.MEDIUM:
        count = this.mediumPriorityTasks();
        break;
      case TaskPriority.LOW:
        count = this.lowPriorityTasks();
        break;
    }

    return Math.round((count / total) * 100);
  }

  getCompletionChartData() {
    const completed = this.completedTasks();
    const pending = this.pendingTasks();
    const total = this.totalTasks();

    return [
      { label: 'Completadas', value: completed, color: '#16a34a', percentage: total > 0 ? Math.round((completed / total) * 100) : 0 },
      { label: 'Pendientes', value: pending, color: '#ea580c', percentage: total > 0 ? Math.round((pending / total) * 100) : 0 }
    ];
  }

  downloadTasksReport() {
    const lists = this.taskService.lists();
    const exportData: any[] = [];

    // Agregar encabezado
    exportData.push({
      'Lista': 'REPORTE DE TAREAS',
      'Tarea': '',
      'Estado': '',
      'Prioridad': '',
      'Fecha Creación': '',
      'Fecha Vencimiento': '',
      'Descripción': ''
    });

    exportData.push({}); // Línea vacía

    lists.forEach(list => {
      // Agregar nombre de la lista
      exportData.push({
        'Lista': list.name,
        'Tarea': '',
        'Estado': '',
        'Prioridad': '',
        'Fecha Creación': '',
        'Fecha Vencimiento': '',
        'Descripción': ''
      });

      // Agregar tareas de la lista
      if (list.tasks && list.tasks.length > 0) {
        list.tasks.forEach(task => {
          exportData.push({
            'Lista': '',
            'Tarea': task.title,
            'Estado': this.getStatusText(task.status),
            'Prioridad': this.getPriorityText(task.priority),
            'Fecha Creación': task.created_at ? new Date(task.created_at).toLocaleDateString('es-ES') : '',
            'Fecha Vencimiento': task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : '',
            'Descripción': task.description || ''
          });
        });
      } else {
        exportData.push({
          'Lista': '',
          'Tarea': 'No hay tareas en esta lista',
          'Estado': '',
          'Prioridad': '',
          'Fecha Creación': '',
          'Fecha Vencimiento': '',
          'Descripción': ''
        });
      }

      exportData.push({}); // Línea vacía entre listas
    });

    // Agregar estadísticas al final
    exportData.push({
      'Lista': 'ESTADÍSTICAS',
      'Tarea': '',
      'Estado': '',
      'Prioridad': '',
      'Fecha Creación': '',
      'Fecha Vencimiento': '',
      'Descripción': ''
    });

    exportData.push({
      'Lista': 'Total de tareas',
      'Tarea': this.totalTasks(),
      'Estado': '',
      'Prioridad': '',
      'Fecha Creación': '',
      'Fecha Vencimiento': '',
      'Descripción': ''
    });

    exportData.push({
      'Lista': 'Tareas completadas',
      'Tarea': this.completedTasks(),
      'Estado': '',
      'Prioridad': '',
      'Fecha Creación': '',
      'Fecha Vencimiento': '',
      'Descripción': ''
    });

    exportData.push({
      'Lista': 'Tareas pendientes',
      'Tarea': this.pendingTasks(),
      'Estado': '',
      'Prioridad': '',
      'Fecha Creación': '',
      'Fecha Vencimiento': '',
      'Descripción': ''
    });

    exportData.push({
      'Lista': 'Tareas urgentes',
      'Tarea': this.urgentTasks(),
      'Estado': '',
      'Prioridad': '',
      'Fecha Creación': '',
      'Fecha Vencimiento': '',
      'Descripción': ''
    });

    // Crear el libro de Excel
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tareas');

    // Generar nombre del archivo con fecha
    const date = new Date().toISOString().split('T')[0];
    const filename = `reporte_tareas_${date}.xlsx`;

    // Descargar el archivo
    XLSX.writeFile(wb, filename);
  }

  private getStatusText(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING: return 'Pendiente';
      case TaskStatus.IN_PROGRESS: return 'En Progreso';
      case TaskStatus.COMPLETED: return 'Completada';
      default: return 'Desconocido';
    }
  }

  private getPriorityText(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW: return 'Baja';
      case TaskPriority.MEDIUM: return 'Media';
      case TaskPriority.HIGH: return 'Alta';
      case TaskPriority.URGENT: return 'Urgente';
      default: return 'Desconocida';
    }
  }
}
