import { CalendarDay, CalendarEvent, CalendarEventResponse, CalendarEventsResponse, CalendarMonth, CreateEventRequest, EventRangeParams, EventsQueryParams, UpcomingEventsParams, UpdateEventRequest } from '@/app/shared/models/calendar.model';
import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/calendar`;

  private eventsSignal = signal<CalendarEvent[]>([]);
  private selectedDateSignal = signal<Date>(new Date());
  private currentMonthSignal = signal<{ month: number; year: number }>({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });
  private isLoadingSignal = signal<boolean>(false);

  events = computed(() => this.eventsSignal());
  selectedDate = computed(() => this.selectedDateSignal());
  currentMonth = computed(() => this.currentMonthSignal());
  isLoading = computed(() => this.isLoadingSignal());

  currentMonthEvents = computed(() => {
    const { month, year } = this.currentMonth();
    return this.eventsSignal().filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  });

  selectedDayEvents = computed(() => {
    const selected = this.selectedDate();
    return this.eventsSignal().filter(event => {
      const eventDate = new Date(event.event_date);
      return this.isSameDay(eventDate, selected);
    });
  });

  /**
   * Obtener todos los eventos con paginación y filtros
   */
  getEvents(params?: EventsQueryParams): Observable<CalendarEventsResponse> {
    this.isLoadingSignal.set(true);

    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof EventsQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<CalendarEventsResponse>(`${this.API_URL}/events`, { params: httpParams })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.eventsSignal.set(this.parseEvents(response.data));
          }
          this.isLoadingSignal.set(false);
        }),
        catchError(error => {
          this.isLoadingSignal.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtener eventos en un rango de fechas
   */
  getEventsByRange(params: EventRangeParams): Observable<CalendarEventsResponse> {
    this.isLoadingSignal.set(true);

    const httpParams = new HttpParams()
      .set('start_date', params.start_date)
      .set('end_date', params.end_date);

    return this.http.get<CalendarEventsResponse>(`${this.API_URL}/events/range`, { params: httpParams })
      .pipe(
        tap(response => {
          console.log('Response from API:', response);
          if (response.success && response.data) {
            // Verificar si data es un array o un objeto con eventos
            const eventsArray = Array.isArray(response.data) ? response.data :
              (response.data as any).events || [];
            this.eventsSignal.set(this.parseEvents(eventsArray));
          }
          this.isLoadingSignal.set(false);
        }),
        catchError(error => {
          this.isLoadingSignal.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtener próximos eventos
   */
  getUpcomingEvents(params?: UpcomingEventsParams): Observable<CalendarEventsResponse> {
    this.isLoadingSignal.set(true);

    let httpParams = new HttpParams();
    if (params?.days) {
      httpParams = httpParams.set('days', params.days.toString());
    }

    return this.http.get<CalendarEventsResponse>(`${this.API_URL}/events/upcoming`, { params: httpParams })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            // No sobrescribe todos los eventos, solo agrega/actualiza
            const newEvents = this.parseEvents(response.data);
            this.mergeEvents(newEvents);
          }
          this.isLoadingSignal.set(false);
        }),
        catchError(error => {
          this.isLoadingSignal.set(false);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtener días festivos de un año
   */
  getHolidays(year?: number): Observable<CalendarEventsResponse> {
    const httpParams = new HttpParams().set('year', (year || new Date().getFullYear()).toString());

    return this.http.get<CalendarEventsResponse>(`${this.API_URL}/holidays`, { params: httpParams })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const holidays = this.parseEvents(response.data);
            this.mergeEvents(holidays);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener un evento por ID
   */
  getEventById(id: number): Observable<CalendarEventResponse> {
    return this.http.get<CalendarEventResponse>(`${this.API_URL}/events/${id}`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            response.data = this.parseEvent(response.data);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Crear un nuevo evento
   */
  createEvent(event: CreateEventRequest): Observable<CalendarEventResponse> {
    return this.http.post<CalendarEventResponse>(`${this.API_URL}/events`, event)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const newEvent = this.parseEvent(response.data);
            this.eventsSignal.update(events => [...events, newEvent]);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar un evento
   */
  updateEvent(id: number, event: UpdateEventRequest): Observable<CalendarEventResponse> {
    return this.http.put<CalendarEventResponse>(`${this.API_URL}/events/${id}`, event)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const updatedEvent = this.parseEvent(response.data);
            this.eventsSignal.update(events =>
              events.map(e => e.id === id ? updatedEvent : e)
            );
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Activar/desactivar un evento
   */
  toggleEventStatus(id: number): Observable<CalendarEventResponse> {
    return this.http.patch<CalendarEventResponse>(`${this.API_URL}/events/${id}/status`, {})
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const updatedEvent = this.parseEvent(response.data);
            this.eventsSignal.update(events =>
              events.map(e => e.id === id ? updatedEvent : e)
            );
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar un evento
   */
  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/events/${id}`)
      .pipe(
        tap(() => {
          this.eventsSignal.update(events => events.filter(e => e.id !== id));
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Cargar eventos del mes actual
   */
  loadCurrentMonthEvents(): void {
    const { month, year } = this.currentMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    this.getEventsByRange({
      start_date: this.formatDate(startDate),
      end_date: this.formatDate(endDate)
    }).subscribe();
  }

  /**
   * Cambiar mes
   */
  changeMonth(direction: 'next' | 'prev'): void {
    this.currentMonthSignal.update(current => {
      let { month, year } = current;

      if (direction === 'next') {
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      } else {
        month--;
        if (month < 0) {
          month = 11;
          year--;
        }
      }

      return { month, year };
    });

    this.loadCurrentMonthEvents();
  }

  /**
   * Ir a mes específico
   */
  goToMonth(month: number, year: number): void {
    this.currentMonthSignal.set({ month, year });
    this.loadCurrentMonthEvents();
  }

  /**
   * Ir al mes actual
   */
  goToToday(): void {
    const today = new Date();
    this.currentMonthSignal.set({
      month: today.getMonth(),
      year: today.getFullYear()
    });
    this.selectedDateSignal.set(today);
    this.loadCurrentMonthEvents();
  }

  /**
   * Seleccionar fecha
   */
  selectDate(date: Date): void {
    this.selectedDateSignal.set(date);
  }

  /**
   * Generar estructura del calendario para un mes
   */
  generateCalendarMonth(): CalendarMonth {
    const { month, year } = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];

    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      currentWeek.push(this.createCalendarDay(date, false));
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      currentWeek.push(this.createCalendarDay(date, true));

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Días del próximo mes
    if (currentWeek.length > 0) {
      const remainingDays = 7 - currentWeek.length;
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month + 1, day);
        currentWeek.push(this.createCalendarDay(date, false));
      }
      weeks.push(currentWeek);
    }

    return { month, year, weeks };
  }

  /**
   * Crear objeto CalendarDay
   */
  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    const dayEvents = this.eventsSignal().filter(event => {
      const eventDate = new Date(event.event_date);
      return this.isSameDay(eventDate, date);
    });

    return {
      date,
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrentMonth,
      isToday: this.isSameDay(date, today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      events: dayEvents
    };
  }

  /**
   * Verificar si dos fechas son el mismo día
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }

  /**
   * Parsear eventos (convertir strings a Date)
   */
  private parseEvents(events: any[]): CalendarEvent[] {
    return events.map(event => this.parseEvent(event));
  }

  /**
   * Parsear un evento
   */
  private parseEvent(event: any): CalendarEvent {
    return {
      ...event,
      event_date: new Date(event.event_date),
      created_at: new Date(event.created_at),
      updated_at: new Date(event.updated_at),
      recurrence_rule: event.recurrence_rule ? {
        ...event.recurrence_rule,
        end_date: event.recurrence_rule.end_date ? new Date(event.recurrence_rule.end_date) : undefined
      } : undefined
    };
  }

  /**
   * Mezclar eventos nuevos con los existentes
   */
  private mergeEvents(newEvents: CalendarEvent[]): void {
    this.eventsSignal.update(currentEvents => {
      const merged = [...currentEvents];

      newEvents.forEach(newEvent => {
        const index = merged.findIndex(e => e.id === newEvent.id);
        if (index !== -1) {
          merged[index] = newEvent;
        } else {
          merged.push(newEvent);
        }
      });

      return merged;
    });
  }

  /**
   * Formatear fecha a YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Manejar errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en CalendarService:', error);
    return throwError(() => error);
  }
}
