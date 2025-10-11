import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Role } from '../../models/auth.model';
import { CreateUserRequest, UpdateUserRequest, UserProfile } from '../../models/user-management.model';

@Component({
  selector: 'app-user-form-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form-modal.html',
  styleUrl: './user-form-modal.scss'
})
export class UserFormModal {

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() user?: UserProfile;
  @Input() availableRoles: Role[] = [];

  @Output() save = new EventEmitter<CreateUserRequest | UpdateUserRequest>();
  @Output() cancel = new EventEmitter<void>();

  // Formulario
  formData = signal({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role_id: 0,
    profile_picture: ''
  });

  // Validación
  errors = signal<Record<string, string>>({});
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  ngOnInit(): void {
    if (this.mode === 'edit' && this.user) {
      this.formData.set({
        email: this.user.email,
        password: '',
        confirmPassword: '',
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        role_id: this.user.role_id,
        profile_picture: this.user.profile_picture || ''
      });
    } else if (this.availableRoles.length > 0) {
      // Preseleccionar el primer rol disponible
      this.formData.update(data => ({
        ...data,
        role_id: this.availableRoles[0].id
      }));
    }
  }

  /**
   * Validar formulario
   */
  validateForm(): boolean {
    const newErrors: Record<string, string> = {};
    const data = this.formData();

    // Email
    if (!data.email) {
      newErrors['email'] = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors['email'] = 'El email no es válido';
    }

    // Contraseña (solo en modo crear)
    if (this.mode === 'create') {
      if (!data.password) {
        newErrors['password'] = 'La contraseña es requerida';
      } else if (data.password.length < 8) {
        newErrors['password'] = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        newErrors['password'] = 'La contraseña debe contener mayúsculas, minúsculas y números';
      }

      if (data.password !== data.confirmPassword) {
        newErrors['confirmPassword'] = 'Las contraseñas no coinciden';
      }
    }

    // Nombre
    if (!data.first_name) {
      newErrors['first_name'] = 'El nombre es requerido';
    }

    // Apellido
    if (!data.last_name) {
      newErrors['last_name'] = 'El apellido es requerido';
    }

    // Rol
    if (!data.role_id) {
      newErrors['role_id'] = 'El rol es requerido';
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Guardar usuario
   */
  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    const data = this.formData();

    if (this.mode === 'create') {
      const createData: CreateUserRequest = {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role_id: data.role_id,
        profile_picture: data.profile_picture || undefined
      };
      this.save.emit(createData);
    } else {
      const updateData: UpdateUserRequest = {
        first_name: data.first_name,
        last_name: data.last_name,
        role_id: data.role_id,
        profile_picture: data.profile_picture || undefined
      };
      this.save.emit(updateData);
    }
  }

  /**
   * Cancelar
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Toggle mostrar contraseña
   */
  toggleShowPassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  /**
   * Actualizar campo del formulario
   */
  updateField(field: string, value: any): void {
    this.formData.update(data => ({
      ...data,
      [field]: value
    }));

    // Limpiar error del campo al escribir
    if (this.errors()[field]) {
      this.errors.update(errors => {
        const newErrors = { ...errors };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

}
