import { ConfirmationConfig, ConfirmationType } from '@/app/shared/models/confirmation.model';
import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  private showModalSignal = signal<boolean>(false);
  private configSignal = signal<ConfirmationConfig | null>(null);
  private resultSubject = new Subject<boolean>();

  public showModal = this.showModalSignal.asReadonly();
  public config = this.configSignal.asReadonly();


  confirmDelete(
    itemName: string,
    message?: string
  ): Observable<boolean> {
    return this.confirm({
      title: '¿Eliminar elemento?',
      message: message || `¿Estás seguro de que deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`,
      type: ConfirmationType.DANGER,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      icon: '🗑️'
    });
  }


  confirmWarning(
    title: string,
    message: string,
    confirmText: string = 'Continuar'
  ): Observable<boolean> {
    return this.confirm({
      title,
      message,
      type: ConfirmationType.WARNING,
      confirmText,
      cancelText: 'Cancelar',
      icon: '⚠️'
    });
  }


  confirmInfo(
    title: string,
    message: string,
    confirmText: string = 'Aceptar'
  ): Observable<boolean> {
    return this.confirm({
      title,
      message,
      type: ConfirmationType.INFO,
      confirmText,
      cancelText: 'Cancelar',
      icon: 'ℹ️'
    });
  }


  confirmSuccess(
    title: string,
    message: string,
    confirmText: string = 'Continuar'
  ): Observable<boolean> {
    return this.confirm({
      title,
      message,
      type: ConfirmationType.SUCCESS,
      confirmText,
      cancelText: 'Cancelar',
      icon: '✓'
    });
  }


  confirm(config: ConfirmationConfig): Observable<boolean> {
    const defaultConfig: ConfirmationConfig = {
      title: '¿Estás seguro?',
      message: '',
      type: ConfirmationType.INFO,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      icon: '❓'
    };

    this.configSignal.set({ ...defaultConfig, ...config });
    this.showModalSignal.set(true);

    this.resultSubject = new Subject<boolean>();
    return this.resultSubject.asObservable();
  }


  onConfirm(): void {
    this.resultSubject.next(true);
    this.resultSubject.complete();
    this.close();
  }


  onCancel(): void {
    this.resultSubject.next(false);
    this.resultSubject.complete();
    this.close();
  }


  private close(): void {
    this.showModalSignal.set(false);
    setTimeout(() => {
      this.configSignal.set(null);
    }, 300);
  }
}
