import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Utilizamos un signal para almacenar y emitir cambios de la clave 'token'
  private tokenSignal = signal<string | null>(this.getItem('token'));

  // Getter público para acceder al valor del signal
  get token() {
    return this.tokenSignal();
  }

  constructor() {
    // Si necesitas inicializar algo al cargar el servicio, hazlo aquí.
  }

  // Método para guardar un ítem en el localStorage
  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Actualizamos el signal si la clave es 'token'
      if (key === 'token') {
        this.tokenSignal.set(value);
      }
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  // Método para obtener un ítem del localStorage
  getItem(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error getting item from localStorage', e);
      return null;
    }
  }

  // Método para eliminar un ítem del localStorage
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      // Actualizamos el signal si la clave es 'token'
      if (key === 'token') {
        this.tokenSignal.set(null);
      }
    } catch (e) {
      console.error('Error removing item from localStorage', e);
    }
  }

  // Método para limpiar todo el localStorage
  clear(): void {
    try {
      localStorage.clear();
      // Limpiamos el signal
      this.tokenSignal.set(null);
    } catch (e) {
      console.error('Error clearing localStorage', e);
    }
  }
}