export enum ConfirmationType {
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
  SUCCESS = 'success'
}

export interface ConfirmationConfig {
  title: string;
  message: string;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
}

export interface ConfirmationResult {
  confirmed: boolean;
  data?: any;
}