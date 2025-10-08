import { Component, inject } from '@angular/core';
import { ToastType } from '../../models/toast.model';
import { ToastService } from '@/app/core/services/toast-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class Toast {
  private toastService = inject(ToastService);

  toasts = this.toastService.toasts;
  ToastType = ToastType;

  /**
   * Cerrar un toast específico
   */
  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  /**
   * Obtener el icono según el tipo de toast
   */
  getIcon(type: ToastType): string {
    switch (type) {
      case ToastType.SUCCESS:
        return '✓';
      case ToastType.ERROR:
        return '✕';
      case ToastType.WARNING:
        return '⚠';
      case ToastType.INFO:
        return 'ℹ';
      default:
        return 'ℹ';
    }
  }

  /**
   * Obtener las clases CSS según el tipo de toast
   */
  getToastClasses(type: ToastType): string {
    const baseClasses = 'toast-item';
    switch (type) {
      case ToastType.SUCCESS:
        return `${baseClasses} toast-success`;
      case ToastType.ERROR:
        return `${baseClasses} toast-error`;
      case ToastType.WARNING:
        return `${baseClasses} toast-warning`;
      case ToastType.INFO:
        return `${baseClasses} toast-info`;
      default:
        return baseClasses;
    }
  }
}
