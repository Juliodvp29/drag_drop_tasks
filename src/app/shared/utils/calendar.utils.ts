import { CalendarEvent, EventType } from '@models/calendar.model';

export class CalendarUtils {
  /**
   * Obtener nombre del mes
   */
  static getMonthName(month: number, locale: string = 'es-ES'): string {
    const date = new Date(2000, month, 1);
    return date.toLocaleDateString(locale, { month: 'long' });
  }

  /**
   * Obtener nombres de los días de la semana
   */
  static getWeekDayNames(locale: string = 'es-ES', format: 'long' | 'short' = 'short'): string[] {
    const days: string[] = [];
    const baseDate = new Date(2000, 0, 2); // Domingo

    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      days.push(date.toLocaleDateString(locale, { weekday: format }));
    }

    return days;
  }

  /**
   * Formatear fecha
   */
  static formatDate(date: Date, format: 'short' | 'medium' | 'long' = 'medium', locale: string = 'es-ES'): string {
    switch (format) {
      case 'short':
        return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'medium':
        return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
      case 'long':
        return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
      default:
        return date.toLocaleDateString(locale);
    }
  }

  /**
   * Formatear hora
   */
  static formatTime(date: Date, locale: string = 'es-ES'): string {
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Formatear fecha y hora
   */
  static formatDateTime(date: Date, locale: string = 'es-ES'): string {
    return `${this.formatDate(date, 'medium', locale)} ${this.formatTime(date, locale)}`;
  }

  /**
   * Obtener color del tipo de evento
   */
  static getEventTypeColor(type: EventType): string {
    switch (type) {
      case EventType.MEETING:
        return 'bg-blue-500';
      case EventType.DEADLINE:
        return 'bg-red-500';
      case EventType.HOLIDAY:
        return 'bg-green-500';
      case EventType.REMINDER:
        return 'bg-yellow-500';
      case EventType.OTHER:
        return 'bg-gray-500';
      default:
        return 'bg-primary';
    }
  }

  /**
   * Obtener color del borde para tipo de evento
   */
  static getEventTypeBorderColor(type: EventType): string {
    switch (type) {
      case EventType.MEETING:
        return 'border-blue-500';
      case EventType.DEADLINE:
        return 'border-red-500';
      case EventType.HOLIDAY:
        return 'border-green-500';
      case EventType.REMINDER:
        return 'border-yellow-500';
      case EventType.OTHER:
        return 'border-gray-500';
      default:
        return 'border-primary';
    }
  }

  /**
   * Obtener color de texto para tipo de evento
   */
  static getEventTypeTextColor(type: EventType): string {
    switch (type) {
      case EventType.MEETING:
        return 'text-blue-700';
      case EventType.DEADLINE:
        return 'text-red-700';
      case EventType.HOLIDAY:
        return 'text-green-700';
      case EventType.REMINDER:
        return 'text-yellow-700';
      case EventType.OTHER:
        return 'text-gray-700';
      default:
        return 'text-primary-dark';
    }
  }

  /**
   * Obtener color de fondo para tipo de evento
   */
  static getEventTypeBgColor(type: EventType): string {
    switch (type) {
      case EventType.MEETING:
        return 'bg-blue-50';
      case EventType.DEADLINE:
        return 'bg-red-50';
      case EventType.HOLIDAY:
        return 'bg-green-50';
      case EventType.REMINDER:
        return 'bg-yellow-50';
      case EventType.OTHER:
        return 'bg-gray-50';
      default:
        return 'bg-primary-light';
    }
  }

  /**
   * Obtener icono para tipo de evento
   */
  static getEventTypeIcon(type: EventType): string {
    switch (type) {
      case EventType.MEETING:
        return '👥';
      case EventType.DEADLINE:
        return '⏰';
      case EventType.HOLIDAY:
        return '🎉';
      case EventType.REMINDER:
        return '🔔';
      case EventType.OTHER:
        return '📌';
      default:
        return '📅';
    }
  }

  /**
   * Obtener label para tipo de evento
   */
  static getEventTypeLabel(type: EventType): string {
    switch (type) {
      case EventType.MEETING:
        return 'Reunión';
      case EventType.DEADLINE:
        return 'Fecha límite';
      case EventType.HOLIDAY:
        return 'Festivo';
      case EventType.REMINDER:
        return 'Recordatorio';
      case EventType.OTHER:
        return 'Otro';
      default:
        return 'Evento';
    }
  }

  /**
   * Verificar si un evento es hoy
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  /**
   * Verificar si un evento es pasado
   */
  static isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  }

  /**
   * Verificar si un evento es futuro
   */
  static isFuture(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date > today;
  }

  /**
   * Obtener diferencia de días
   */
  static getDaysDifference(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  }

  /**
   * Agregar días a una fecha
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Agregar meses a una fecha
   */
  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Obtener el primer día del mes
   */
  static getFirstDayOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Obtener el último día del mes
   */
  static getLastDayOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  /**
   * Filtrar eventos por tipo
   */
  static filterEventsByType(events: CalendarEvent[], type: EventType): CalendarEvent[] {
    return events.filter(event => event.event_type === type);
  }

  /**
   * Ordenar eventos por fecha
   */
  static sortEventsByDate(events: CalendarEvent[], ascending: boolean = true): CalendarEvent[] {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.event_date).getTime();
      const dateB = new Date(b.event_date).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  /**
   * Agrupar eventos por día
   */
  static groupEventsByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
    const grouped = new Map<string, CalendarEvent[]>();

    events.forEach(event => {
      const dateKey = this.formatDate(new Date(event.event_date), 'short');
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, event]);
    });

    return grouped;
  }

  /**
   * Obtener texto de tiempo relativo
   */
  static getRelativeTimeText(date: Date): string {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Hoy';
    } else if (diffInDays === 1) {
      return 'Mañana';
    } else if (diffInDays === -1) {
      return 'Ayer';
    } else if (diffInDays > 1 && diffInDays <= 7) {
      return `En ${diffInDays} días`;
    } else if (diffInDays < -1 && diffInDays >= -7) {
      return `Hace ${Math.abs(diffInDays)} días`;
    } else if (diffInDays > 7) {
      return this.formatDate(date);
    } else {
      return this.formatDate(date);
    }
  }

  /**
   * Validar si una fecha está en un rango
   */
  static isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }
}