import { AuthService } from '@/app/core/services/auth-service';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  timeRemaining = signal(600);
  private countdownInterval: any;

  constructor() {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: ['', [
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

  ngOnInit(): void {
    const email = this.route.snapshot.queryParams['email'];
    if (email) {
      this.resetForm.patchValue({ email });
      this.resetForm.get('email')?.disable();
    }

    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.timeRemaining.update((time: number) => {
        if (time <= 0) {
          clearInterval(this.countdownInterval);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
  }

  getTimeFormatted(): string {
    const minutes = Math.floor(this.timeRemaining() / 60);
    const seconds = this.timeRemaining() % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.markFormGroupTouched(this.resetForm);
      return;
    }

    if (this.timeRemaining() <= 0) {
      this.errorMessage.set('El código ha expirado. Solicita uno nuevo.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const email = this.resetForm.get('email')?.value || this.resetForm.getRawValue().email;
    const code = this.resetForm.value.code;
    const newPassword = this.resetForm.value.newPassword;

    this.authService.resetPassword(email, code, newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('¡Contraseña restablecida exitosamente! Redirigiendo al login...');

        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
        }

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error: { message: any; }) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.message || 'Error al restablecer la contraseña. Verifica el código e intenta nuevamente.'
        );
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword.update((value: any) => !value);
    } else {
      this.showConfirmPassword.update((value: any) => !value);
    }
  }

  requestNewCode(): void {
    const email = this.resetForm.get('email')?.value || this.resetForm.getRawValue().email;
    this.router.navigate(['/auth/forgot-password'], {
      queryParams: { email }
    });
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
    const password = control.get('newPassword');
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
    const control = this.resetForm.get(fieldName);

    if (!control?.touched || !control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es requerido';
    }

    if (control.errors['email']) {
      return 'Email inválido';
    }

    if (control.errors['pattern']) {
      return 'El código debe tener 6 dígitos';
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

    if (fieldName === 'confirmPassword' && this.resetForm.errors?.['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }

  getPasswordStrength(): { strength: number; label: string; color: string } {
    const password = this.resetForm.get('newPassword')?.value || '';
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

  onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 6) {
      value = value.slice(0, 6);
    }

    this.resetForm.patchValue({ code: value });
  }
}
