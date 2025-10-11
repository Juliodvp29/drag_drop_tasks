import { UserListItem, UserProfile } from '../models/user-management.model';

/**
 * Utilidades para trabajar con usuarios
 */
export class UserUtils {

  /**
   * Obtiene el nombre completo del usuario
   */
  static getFullName(user: UserProfile | UserListItem): string {
    return `${user.first_name} ${user.last_name}`.trim();
  }

  /**
   * Obtiene las iniciales del usuario
   */
  static getInitials(user: UserProfile | UserListItem): string {
    const firstInitial = user.first_name.charAt(0).toUpperCase();
    const lastInitial = user.last_name.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  }

  /**
   * Valida si un email es válido
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida si una contraseña cumple los requisitos
   */
  static isValidPassword(password: string): boolean {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Obtiene los requisitos de contraseña no cumplidos
   */
  static getPasswordErrors(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una minúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }

    return errors;
  }

  /**
   * Genera un color de fondo basado en el nombre
   */
  static getAvatarColor(name: string): string {
    const colors = [
      '#ef4444', // red
      '#f59e0b', // orange
      '#10b981', // green
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
    ];

    const charCode = name.charCodeAt(0);
    const index = charCode % colors.length;
    return colors[index];
  }
}