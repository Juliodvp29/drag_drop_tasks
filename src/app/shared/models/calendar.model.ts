export enum EventType {
  MEETING = 'meeting',
  DEADLINE = 'deadline',
  HOLIDAY = 'holiday',
  REMINDER = 'reminder',
  OTHER = 'other'
}

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  end_date?: Date;
  count?: number;
  by_weekday?: number[];
  by_month_day?: number[];
  by_month?: number[];
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  event_date: Date;
  event_type: EventType;
  color?: string;
  is_all_day: boolean;
  is_recurring: boolean;
  recurrence_rule?: RecurrenceRule;
  is_global: boolean;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  event_date: Date | string;
  event_type: EventType;
  color?: string;
  is_all_day?: boolean;
  is_recurring?: boolean;
  recurrence_rule?: RecurrenceRule;
  is_global?: boolean;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  event_date?: Date | string;
  event_type?: EventType;
  color?: string;
  is_all_day?: boolean;
  is_recurring?: boolean;
  recurrence_rule?: RecurrenceRule;
  is_global?: boolean;
}

export interface EventsQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  event_type?: EventType;
  is_global?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface EventRangeParams {
  start_date: string;
  end_date: string;
}

export interface UpcomingEventsParams {
  days?: number;
}

export interface CalendarEventResponse {
  success: boolean;
  message: string;
  data: CalendarEvent;
}

export interface CalendarEventsResponse {
  success: boolean;
  message?: string;
  data: CalendarEvent[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CalendarDay {
  date: Date;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
}

export interface CalendarMonth {
  month: number;
  year: number;
  weeks: CalendarDay[][];
}