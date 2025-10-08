export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

export interface ToastConfig {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}