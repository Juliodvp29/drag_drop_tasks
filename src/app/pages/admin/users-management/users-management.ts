import { AuthService } from '@/app/core/services/auth-service';
import { ConfirmationService } from '@/app/core/services/confirmation-service';
import { ToastService } from '@/app/core/services/toast-service';
import { UserFormModal } from "@/app/shared/components/user-form-modal/user-form-modal";
import { HasPermissionDirective } from '@/app/shared/directives/has-permission.directive';
import { Role } from '@/app/shared/models/auth.model';
import { UserFilters, UserListItem, UserModalState, UserQueryParams } from '@/app/shared/models/user-management.model';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RoleService } from '../service/role-service';
import { UserManagementService } from '../service/user-management-service';

@Component({
  selector: 'app-users-management',
  imports: [CommonModule, FormsModule, UserFormModal, HasPermissionDirective],
  templateUrl: './users-management.html',
  styleUrl: './users-management.scss'
})
export class UsersManagement {

  private userService = inject(UserManagementService);
  private roleService = inject(RoleService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);

  users = signal<UserListItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  currentPage = signal(1);
  pageSize = signal(6);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  filters = signal<UserFilters>({
    search: '',
    role_id: null,
    is_active: null
  });

  sortBy = signal('id');
  sortOrder = signal<'ASC' | 'DESC'>('DESC');

  modalState = signal<UserModalState>({
    isOpen: false,
    mode: 'create'
  });

  availableRoles = signal<Role[]>([]);

  currentUser = this.authService.currentUser;

  Math = Math;

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }


  async loadUsers(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const params: UserQueryParams = {
        page: this.currentPage(),
        limit: this.pageSize(),
        sort_by: this.sortBy(),
        sort_order: this.sortOrder()
      };

      const currentFilters = this.filters();
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.role_id) params.role_id = currentFilters.role_id;
      if (currentFilters.is_active !== null) params.is_active = currentFilters.is_active;

      const response = await firstValueFrom(this.userService.getUsers(params));

      if (response.success) {
        this.users.set(response.data);

        if (response.meta) {
          this.totalItems.set(response.meta.total);
          this.currentPage.set(response.meta.page);
        }
      }
    } catch (error: any) {
      this.error.set(error.message);
      this.toastService.error('Error al cargar usuarios');
      console.error('Error loading users:', error);
    } finally {
      this.loading.set(false);
    }
  }


  async loadRoles(): Promise<void> {
    try {
      const response = await firstValueFrom(this.roleService.getRoles());
      if (response.success) {
        this.availableRoles.set(response.data.roles);
      }
    } catch (error: any) {
      console.error('Error loading roles:', error);
      const user = this.currentUser();
      if (user?.role) {
        this.availableRoles.set([user.role]);
      }
    }
  }


  applyFilters(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }


  clearFilters(): void {
    this.filters.set({
      search: '',
      role_id: null,
      is_active: null
    });
    this.currentPage.set(1);
    this.loadUsers();
  }


  changeSort(field: string): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('ASC');
    }
    this.loadUsers();
  }


  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadUsers();
  }


  openCreateModal(): void {
    this.modalState.set({
      isOpen: true,
      mode: 'create'
    });
  }


  openEditModal(user: UserListItem): void {
    this.modalState.set({
      isOpen: true,
      mode: 'edit',
      user: user
    });
  }


  closeModal(): void {
    this.modalState.set({
      isOpen: false,
      mode: 'create'
    });
  }


  async onSaveUser(userData: any): Promise<void> {
    const mode = this.modalState().mode;

    try {
      this.loading.set(true);

      if (mode === 'create') {
        await firstValueFrom(this.userService.createUser(userData));
        this.toastService.success('Usuario creado exitosamente');
      } else if (mode === 'edit' && this.modalState().user) {
        await firstValueFrom(
          this.userService.updateUser(this.modalState().user!.id, userData)
        );
        this.toastService.success('Usuario actualizado exitosamente');
      }

      this.closeModal();
      this.loadUsers();
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al guardar usuario');
      console.error('Error saving user:', error);
    } finally {
      this.loading.set(false);
    }
  }


  async toggleUserStatus(user: UserListItem): Promise<void> {
    const action = user.is_active ? 'desactivar' : 'activar';
    const confirmed = await firstValueFrom(
      this.confirmationService.confirmWarning(
        `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
        `¿Estás seguro de que deseas ${action} a ${user.first_name} ${user.last_name}?`
      )
    );

    if (!confirmed) return;

    try {
      this.loading.set(true);
      await firstValueFrom(this.userService.toggleUserStatus(user.id));
      this.toastService.success(`Usuario ${action === 'activar' ? 'activado' : 'desactivado'} exitosamente`);
      this.loadUsers();
    } catch (error: any) {
      this.toastService.error(error.message || `Error al ${action} usuario`);
      console.error('Error toggling user status:', error);
    } finally {
      this.loading.set(false);
    }
  }


  async deleteUser(user: UserListItem): Promise<void> {
    const confirmed = await firstValueFrom(
      this.confirmationService.confirmDelete(
        `${user.first_name} ${user.last_name}`,
        '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.'
      )
    );

    if (!confirmed) return;

    try {
      this.loading.set(true);
      await firstValueFrom(this.userService.deleteUser(user.id));
      this.toastService.success('Usuario eliminado exitosamente');
      this.loadUsers();
    } catch (error: any) {
      this.toastService.error(error.message || 'Error al eliminar usuario');
      console.error('Error deleting user:', error);
    } finally {
      this.loading.set(false);
    }
  }


  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getPageRange(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift(-1);
    }
    if (current + delta < total - 1) {
      range.push(-1);
    }

    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }

    return range;
  }

  min(a: number, b: number): number {
    return a < b ? a : b;
  }
}
