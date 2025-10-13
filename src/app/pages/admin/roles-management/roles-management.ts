import { ConfirmationService } from '@/app/core/services/confirmation-service';
import { ToastService } from '@/app/core/services/toast-service';
import { CreateRoleRequest, Permission, Role, UpdateRoleRequest } from '@/app/shared/models/auth.model';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RoleService } from '../service/role-service';

@Component({
  selector: 'app-roles-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-management.html',
  styleUrl: './roles-management.scss'
})
export class RolesManagement implements OnInit {

  private roleService = inject(RoleService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  roles = signal<Role[]>([]);
  permissions = signal<Permission[]>([]);
  loading = signal(false);
  showInactive = signal(false);
  showCreateModal = signal(false);
  editingRole = signal<Role | null>(null);

  newRole = signal<CreateRoleRequest>({
    name: '',
    display_name: '',
    description: '',
    permissions: []
  });

  editRole = signal<UpdateRoleRequest>({
    display_name: '',
    description: '',
    permissions: []
  });

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  async loadRoles() {
    try {
      this.loading.set(true);
      const response = await firstValueFrom(
        this.roleService.getRoles(this.showInactive())
      );

      if (response.success) {
        this.roles.set(response.data.roles);
      }
    } catch (error: any) {
      this.toastService.error('Error al cargar roles');
      console.error('Error loading roles:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadPermissions() {
    try {
      const response = await firstValueFrom(this.roleService.getPermissions());
      if (response.success) {
        this.permissions.set(response.data);
      }
    } catch (error: any) {
      console.error('Error loading permissions:', error);
    }
  }

  toggleShowInactive() {
    this.showInactive.set(!this.showInactive());
    this.loadRoles();
  }

  openCreateModal() {
    this.newRole.set({
      name: '',
      display_name: '',
      description: '',
      permissions: []
    });
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  openEditModal(role: Role) {
    this.editingRole.set(role);
    this.editRole.set({
      display_name: role.display_name,
      description: role.description || '',
      permissions: [...role.permissions]
    });
  }

  closeEditModal() {
    this.editingRole.set(null);
  }

  togglePermission(formData: CreateRoleRequest | UpdateRoleRequest, permission: string) {
    if (!formData.permissions) formData.permissions = [];
    const index = formData.permissions.indexOf(permission);
    if (index > -1) {
      formData.permissions.splice(index, 1);
    } else {
      formData.permissions.push(permission);
    }
  }

  hasPermission(formData: CreateRoleRequest | UpdateRoleRequest, permission: string): boolean {
    return formData.permissions?.includes(permission) || false;
  }

  async createRole() {
    if (!this.newRole().name.trim() || !this.newRole().display_name.trim()) {
      this.toastService.error('Nombre y nombre para mostrar son requeridos');
      return;
    }

    try {
      this.loading.set(true);
      const response = await firstValueFrom(
        this.roleService.createRole(this.newRole())
      );

      if (response.success) {
        this.toastService.success('Rol creado exitosamente');
        this.closeCreateModal();
        this.loadRoles();
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al crear rol');
      console.error('Error creating role:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async updateRole() {
    if (!this.editingRole()) return;

    try {
      this.loading.set(true);
      const response = await firstValueFrom(
        this.roleService.updateRole(this.editingRole()!.id, this.editRole())
      );

      if (response.success) {
        this.toastService.success('Rol actualizado exitosamente');
        this.closeEditModal();
        this.loadRoles();
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al actualizar rol');
      console.error('Error updating role:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async toggleRoleStatus(role: Role) {
    const action = role.is_active ? 'desactivar' : 'activar';
    const confirmed = await firstValueFrom(
      this.confirmationService.confirmWarning(
        `¿${action.charAt(0).toUpperCase() + action.slice(1)} rol?`,
        `¿Estás seguro de que deseas ${action} el rol "${role.display_name}"? Esta acción puede afectar a los usuarios asignados a este rol.`
      )
    );

    if (!confirmed) return;

    try {
      this.loading.set(true);
      const response = await firstValueFrom(
        this.roleService.toggleRoleStatus(role.id)
      );

      if (response.success) {
        this.toastService.success(`Rol ${action}do exitosamente`);
        this.loadRoles();
      }
    } catch (error: any) {
      this.toastService.error(error.message || `Error al ${action} rol`);
      console.error('Error toggling role status:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteRole(role: Role) {
    if (role.is_system_role) {
      this.toastService.error('No se puede eliminar un rol del sistema');
      return;
    }

    const confirmed = await firstValueFrom(
      this.confirmationService.confirmDelete(
        role.display_name,
        '¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer y puede afectar a los usuarios asignados.'
      )
    );

    if (!confirmed) return;

    try {
      this.loading.set(true);
      const response = await firstValueFrom(
        this.roleService.deleteRole(role.id)
      );

      if (response.success) {
        this.toastService.success('Rol eliminado exitosamente');
        this.loadRoles();
      }
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al eliminar rol');
      console.error('Error deleting role:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getPermissionsByCategory(): Array<{ category: string; permissions: Permission[] }> {
    const categories: { [key: string]: Permission[] } = {};
    this.permissions().forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });

    return Object.keys(categories).map(category => ({
      category,
      permissions: categories[category]
    }));
  }
}
