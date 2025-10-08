import { Toast, ToastConfig, ToastType } from '@/app/shared/models/toast.model';
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  public toasts = this.toastsSignal.asReadonly();

  private defaultDuration = 5000;


  success(message: string, title?: string, duration?: number): void {
    this.show({
      type: ToastType.SUCCESS,
      title: title || 'Éxito',
      message,
      duration: duration || this.defaultDuration
    });
  }


  error(message: string, title?: string, duration?: number): void {
    this.show({
      type: ToastType.ERROR,
      title: title || 'Error',
      message,
      duration: duration || this.defaultDuration
    });
  }


  warning(message: string, title?: string, duration?: number): void {
    this.show({
      type: ToastType.WARNING,
      title: title || 'Advertencia',
      message,
      duration: duration || this.defaultDuration
    });
  }


  info(message: string, title?: string, duration?: number): void {
    this.show({
      type: ToastType.INFO,
      title: title || 'Información',
      message,
      duration: duration || this.defaultDuration
    });
  }


  show(config: ToastConfig): void {
    const toast: Toast = {
      id: this.generateId(),
      type: config.type,
      title: config.title,
      message: config.message,
      duration: config.duration || this.defaultDuration,
      dismissible: config.dismissible !== false
    };

    this.toastsSignal.update(toasts => [...toasts, toast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, toast.duration);
    }
  }


  dismiss(id: string): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }


  dismissAll(): void {
    this.toastsSignal.set([]);
  }


  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
