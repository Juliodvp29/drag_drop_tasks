import { ConfirmationService } from '@/app/core/services/confirmation-service';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { ConfirmationType } from '../../models/confirmation.model';

@Component({
  selector: 'app-confirmation',
  imports: [CommonModule],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.scss'
})
export class Confirmation {

  private confirmationService = inject(ConfirmationService);

  showModal = this.confirmationService.showModal;
  config = this.confirmationService.config;
  ConfirmationType = ConfirmationType;


  onConfirm(): void {
    this.confirmationService.onConfirm();
  }


  onCancel(): void {
    this.confirmationService.onCancel();
  }


  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showModal()) {
      this.onCancel();
    }
  }


  getModalClasses(): string {
    const type = this.config()?.type;
    const baseClasses = 'confirmation-modal';

    switch (type) {
      case ConfirmationType.DANGER:
        return `${baseClasses} modal-danger`;
      case ConfirmationType.WARNING:
        return `${baseClasses} modal-warning`;
      case ConfirmationType.SUCCESS:
        return `${baseClasses} modal-success`;
      case ConfirmationType.INFO:
      default:
        return `${baseClasses} modal-info`;
    }
  }


  getConfirmButtonClass(): string {
    const customClass = this.config()?.confirmButtonClass;
    if (customClass) return customClass;

    const type = this.config()?.type;
    switch (type) {
      case ConfirmationType.DANGER:
        return 'btn-danger';
      case ConfirmationType.WARNING:
        return 'btn-warning';
      case ConfirmationType.SUCCESS:
        return 'btn-success';
      case ConfirmationType.INFO:
      default:
        return 'btn-primary';
    }
  }
}
