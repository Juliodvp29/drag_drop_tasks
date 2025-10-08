import { AuthService } from '@/app/core/services/auth-service';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor() {
    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        this.passwordValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { confirmPassword, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set('Cuenta creada exitosamente. Redirigiendo al login...');

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Error al registrar usuario');
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword.update(value => !value);
    } else {
      this.showConfirmPassword.update(value => !value);
    }
  }

  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

    return !passwordValid ? { passwordStrength: true } : null;
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.registerForm.get(fieldName);

    if (!control?.touched || !control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es requerido';
    }

    if (control.errors['email']) {
      return 'Email inválido';
    }

    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }

    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }

    if (control.errors['passwordStrength']) {
      return 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales';
    }

    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }

  getPasswordStrength(): { strength: number; label: string; color: string } {
    const password = this.registerForm.get('password')?.value || '';
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    const labels = ['Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];
    const colors = ['bg-error', 'bg-warning', 'bg-info', 'bg-success', 'bg-success'];

    return {
      strength: (strength / 5) * 100,
      label: labels[strength - 1] || 'Muy débil',
      color: colors[strength - 1] || 'bg-error'
    };
  }
}
