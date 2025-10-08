import { ConfirmationService } from '@/app/core/services/confirmation-service';
import { ToastService } from '@/app/core/services/toast-service';
import { CalendarDay, CalendarEvent, EventType } from '@/app/shared/models/calendar.model';
import { CalendarUtils } from '@/app/shared/utils/calendar.utils';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarService } from './services/calendar-service';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class Calendar implements OnInit {

  calendarService = inject(CalendarService);
  confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  viewMode = signal<'month' | 'week' | 'day'>('month');
  showEventModal = signal(false);
  selectedEvent = signal<CalendarEvent | null>(null);
  showCreateModal = signal(false);

  calendarMonth = computed(() => this.calendarService.generateCalendarMonth());
  currentMonth = this.calendarService.currentMonth;
  selectedDate = this.calendarService.selectedDate;
  events = this.calendarService.events;
  selectedDayEvents = this.calendarService.selectedDayEvents;
  isLoading = this.calendarService.isLoading;

  utils = CalendarUtils;
  EventType = EventType;

  newEvent = signal({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    event_type: EventType.OTHER,
    color: '',
    is_all_day: false
  });

  showFilters = signal(false);
  filters = signal({
    eventTypes: [] as EventType[],
    showGlobal: true,
    showPersonal: true
  });

  constructor() {
    console.log('Calendar component initialized: ', this.getWeekDayNames());
  }

  ngOnInit(): void {
    this.calendarService.loadCurrentMonthEvents();
  }

  previousMonth(): void {
    this.calendarService.changeMonth('prev');
  }

  nextMonth(): void {
    this.calendarService.changeMonth('next');
  }

  goToToday(): void {
    this.calendarService.goToToday();
  }

  onDayClick(day: CalendarDay): void {
    this.calendarService.selectDate(day.date);
  }

  isDaySelected(day: CalendarDay): boolean {
    const selected = this.selectedDate();
    return day.date.getDate() === selected.getDate() &&
      day.date.getMonth() === selected.getMonth() &&
      day.date.getFullYear() === selected.getFullYear();
  }

  onEventClick(event: CalendarEvent, $event: Event): void {
    $event.stopPropagation();
    this.selectedEvent.set(event);
    this.showEventModal.set(true);
  }

  closeEventModal(): void {
    this.showEventModal.set(false);
    this.selectedEvent.set(null);
  }

  openCreateModal(date?: Date): void {
    if (date) {
      const dateStr = this.formatDateForInput(date);
      this.newEvent.update(e => ({ ...e, event_date: dateStr, event_time: '09:00' }));
    }
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.resetNewEvent();
  }

  createEvent(): void {
    const eventData = this.newEvent();

    this.calendarService.createEvent({
      title: eventData.title,
      description: eventData.description,
      event_date: new Date(`${eventData.event_date}T${eventData.event_time || '00:00'}`),
      event_type: eventData.event_type,
      color: eventData.color,
      is_all_day: eventData.is_all_day
    }).subscribe({
      next: () => {
        this.closeCreateModal();
        this.calendarService.loadCurrentMonthEvents();

        this.toastService.success('El evento ha sido creado exitosamente');
      },
      error: (error) => {
        console.error('Error creating event:', error);

        this.toastService.error('No se pudo crear el evento. Intenta nuevamente.');
      }
    });
  }

  deleteEvent(id: number, eventName: string): void {
    this.confirmationService.confirmDelete(eventName)
      .subscribe(confirmed => {
        if (confirmed) {
          this.calendarService.deleteEvent(id).subscribe({
            next: () => {
              this.closeEventModal();
              this.toastService.success('Evento eliminado exitosamente');
            },
            error: () => {
              this.toastService.error('Error al eliminar el evento');
            }
          });
        }
      });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getMonthYearText(): string {
    const { month, year } = this.currentMonth();
    return `${CalendarUtils.getMonthName(month)} ${year}`;
  }

  getWeekDayNames(): string[] {
    return CalendarUtils.getWeekDayNames('es-ES', 'short');
  }

  getEventsByDay(day: CalendarDay): CalendarEvent[] {
    return day.events.filter(event => {
      const filters = this.filters();

      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.event_type)) {
        return false;
      }

      if (!filters.showGlobal && event.is_global) return false;
      if (!filters.showPersonal && !event.is_global) return false;

      return true;
    });
  }

  toggleEventTypeFilter(type: EventType): void {
    this.filters.update(f => {
      const types = f.eventTypes.includes(type)
        ? f.eventTypes.filter(t => t !== type)
        : [...f.eventTypes, type];
      return { ...f, eventTypes: types };
    });
  }

  private resetNewEvent(): void {
    this.newEvent.set({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      event_type: EventType.OTHER,
      color: '',
      is_all_day: false
    });
  }

  getTotalEventsCount(): number {
    return this.calendarService.currentMonthEvents().length;
  }

  getUpcomingEventsCount(): number {
    const today = new Date();
    return this.calendarService.currentMonthEvents().filter(event =>
      new Date(event.event_date) >= today
    ).length;
  }

  getSelectedEventFormattedDateTime(): string {
    const event = this.selectedEvent();
    return event ? this.utils.formatDateTime(new Date(event.event_date)) : '';
  }

  getGlobalEventsCount(): number {
    return this.events().filter(e => e && e.is_global).length;
  }
}
