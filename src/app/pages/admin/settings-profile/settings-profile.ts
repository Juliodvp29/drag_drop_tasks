import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { LoaderService } from '../../../core/services/loader-service';
import { ToastService } from '../../../core/services/toast-service';
import { User } from '../../../shared/models/auth.model';
import { UpdateUserRequest, UserSettings } from '../../../shared/models/user-management.model';
import { UserManagementService } from '../service/user-management-service';

@Component({
  selector: 'app-settings-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings-profile.html',
  styleUrl: './settings-profile.scss'
})
export class SettingsProfile implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userManagementService = inject(UserManagementService);
  private toastService = inject(ToastService);
  private loaderService = inject(LoaderService);

  // Estado
  currentUser = signal<User | null>(null);
  userSettings = signal<UserSettings | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);

  // Formularios
  profileForm!: FormGroup;
  settingsForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
  }

  /**
   * Inicializar formularios
   */
  private initializeForms(): void {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      profile_picture: ['']
    });

    this.settingsForm = this.fb.group({
      theme: ['light'],
      language: ['es'],
      timezone: ['America/Bogota'],
      date_format: ['DD/MM/YYYY'],
      time_format: ['24h'],
      notifications: this.fb.group({
        email: [true],
        push: [false]
      }),
      dashboard_layout: this.fb.group({
        widgets: [[]]
      })
    });
  }

  /**
   * Cargar datos del usuario
   */
  private loadUserData(): void {
    this.isLoading.set(true);

    // Obtener usuario actual
    const user = this.authService.currentUser();
    if (user) {
      this.currentUser.set(user);
      this.profileForm.patchValue({
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture: user.profile_picture || ''
      });
    }

    // Cargar configuraciones del usuario
    if (user?.id) {
      this.userManagementService.getUserSettings(user.id).subscribe({
        next: (response) => {
          if (response.success && response.data.settings) {
            this.userSettings.set(response.data.settings);
            this.settingsForm.patchValue(response.data.settings);
          }
        },
        error: (error) => {
          console.error('Error loading user settings:', error);
          // No mostrar error si no hay configuraciones
        }
      });
    }

    this.isLoading.set(false);
  }

  /**
   * Toggle modo edición
   */
  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    if (!this.isEditing()) {
      // Resetear formulario si se cancela
      this.loadUserData();
    }
  }

  /**
   * Guardar cambios del perfil
   */
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    const user = this.currentUser();
    if (!user?.id) return;

    this.loaderService.show();
    const formData = this.profileForm.value;

    const updateData: UpdateUserRequest = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      profile_picture: formData.profile_picture || undefined
    };

    this.userManagementService.updateUser(user.id, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Perfil actualizado correctamente');
          this.authService.me().subscribe(); // Refrescar datos del usuario
          this.isEditing.set(false);
        } else {
          this.toastService.error('Error al actualizar el perfil');
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.toastService.error('Error al actualizar el perfil');
      },
      complete: () => {
        this.loaderService.hide();
      }
    });
  }

  /**
   * Guardar configuraciones
   */
  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.markFormGroupTouched(this.settingsForm);
      return;
    }

    const user = this.currentUser();
    if (!user?.id) return;

    this.loaderService.show();
    const settings: UserSettings = this.settingsForm.value;

    this.userManagementService.updateUserSettings(user.id, settings).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Configuraciones guardadas correctamente');
          this.userSettings.set(settings);
        } else {
          this.toastService.error('Error al guardar configuraciones');
        }
      },
      error: (error) => {
        console.error('Error updating settings:', error);
        this.toastService.error('Error al guardar configuraciones');
      },
      complete: () => {
        this.loaderService.hide();
      }
    });
  }

  /**
   * Marcar todos los campos del formulario como tocados
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtener mensaje de error de un campo
   */
  getErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) {
      return 'Este campo es requerido';
    }
    if (field.errors['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field.errors['email']) {
      return 'Email inválido';
    }

    return 'Campo inválido';
  }
}
