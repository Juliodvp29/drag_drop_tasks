import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { LoaderService } from '../../../core/services/loader-service';
import { StorageService } from '../../../core/services/storage-service';
import { ThemeService } from '../../../core/services/theme-service';
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
  private storageService = inject(StorageService);
  private themeService = inject(ThemeService);
  private toastService = inject(ToastService);
  private loaderService = inject(LoaderService);

  currentUser = signal<User | null>(null);
  userSettings = signal<UserSettings | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);
  showVerificationModal = signal(false);
  resendDisabled = signal(false);
  countdown = signal(0);

  profileForm!: FormGroup;
  settingsForm!: FormGroup;
  verificationForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();

    this.settingsForm.get('theme')?.valueChanges.subscribe(value => {
      if (value) {
        this.themeService.setTheme(value);
      }
    });
  }


  private initializeForms(): void {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      profile_picture: ['']
    });

    this.settingsForm = this.fb.group({
      theme: ['auto'],
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

    this.verificationForm = this.fb.group({
      verification_code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }


  private loadUserData(): void {
    this.isLoading.set(true);

    const user = this.authService.currentUser();
    if (user) {
      this.currentUser.set(user);
      this.profileForm.patchValue({
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture: user.profile_picture || ''
      });
    }

    const storedSettings = this.storageService.getUserSettings();
    if (storedSettings) {
      this.userSettings.set(storedSettings);
      this.settingsForm.patchValue(storedSettings);
      if (storedSettings.theme) {
        this.themeService.loadFromUserSettings(storedSettings.theme);
      }
    }

    if (user?.id) {
      this.userManagementService.getUserSettings(user.id).subscribe({
        next: (response) => {
          if (response.success && response.data.settings) {
            this.userSettings.set(response.data.settings);
            this.settingsForm.patchValue(response.data.settings);
            this.storageService.setUserSettings(response.data.settings);
            if (response.data.settings.theme) {
              this.themeService.loadFromUserSettings(response.data.settings.theme);
            }
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading user settings:', error);
          this.isLoading.set(false);
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }


  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    if (!this.isEditing()) {
      this.loadUserData();
    }
  }


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
          this.authService.me().subscribe({
            next: (meResponse) => {
              if (meResponse.success && meResponse.data.user) {
                this.currentUser.set(meResponse.data.user);
                this.profileForm.patchValue({
                  first_name: meResponse.data.user.first_name,
                  last_name: meResponse.data.user.last_name,
                  profile_picture: meResponse.data.user.profile_picture || ''
                });
              }
            },
            error: (error) => {
              console.error('Error refreshing user data after update:', error);
            }
          });
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
          this.storageService.setUserSettings(settings);
          if (settings.theme) {
            this.themeService.setTheme(settings.theme);
          }
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


  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }


  hasError(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }


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
    if (field.errors['pattern']) {
      return 'El código debe tener 6 dígitos';
    }

    return 'Campo inválido';
  }


  sendVerificationCode(): void {
    const user = this.currentUser();
    if (!user?.id) return;

    this.loaderService.show();
    this.userManagementService.sendVerificationCode(user.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Código de verificación enviado a tu email');
          this.showVerificationModal.set(true);
          this.startCountdown();
        } else {
          this.toastService.error('Error al enviar el código de verificación');
        }
      },
      error: (error) => {
        console.error('Error sending verification code:', error);
        this.toastService.error('Error al enviar el código de verificación');
      },
      complete: () => {
        this.loaderService.hide();
      }
    });
  }


  verifyEmail(): void {
    if (this.verificationForm.invalid) {
      this.markFormGroupTouched(this.verificationForm);
      return;
    }

    const user = this.currentUser();
    if (!user?.id) return;

    this.loaderService.show();
    const code = this.verificationForm.value.verification_code;

    this.userManagementService.verifyEmail(user.id, code).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Email verificado correctamente');
          this.showVerificationModal.set(false);
          this.verificationForm.reset();
          this.authService.me().subscribe({
            next: (meResponse) => {
              if (meResponse.success && meResponse.data.user) {
                this.currentUser.set(meResponse.data.user);
              }
            },
            error: (error) => {
              console.error('Error refreshing user data after verification:', error);
            }
          });
        } else {
          this.toastService.error('Código de verificación inválido');
        }
      },
      error: (error) => {
        console.error('Error verifying email:', error);
        this.toastService.error('Error al verificar el email');
      },
      complete: () => {
        this.loaderService.hide();
      }
    });
  }


  resendVerificationCode(): void {
    if (this.resendDisabled()) return;
    this.sendVerificationCode();
  }


  closeVerificationModal(): void {
    this.showVerificationModal.set(false);
    this.verificationForm.reset();
  }


  private startCountdown(): void {
    this.resendDisabled.set(true);
    this.countdown.set(60);

    const interval = setInterval(() => {
      this.countdown.update(value => value - 1);
      if (this.countdown() <= 0) {
        clearInterval(interval);
        this.resendDisabled.set(false);
      }
    }, 1000);
  }
}
