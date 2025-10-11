import { ApiResponse, Role } from './auth.model';
import { Theme } from '../../core/services/theme-service';

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  is_active: boolean;
  role_id: number;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface UserListItem extends UserProfile {
  tasks_count?: number;
  last_login?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number;
  profile_picture?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  role_id?: number;
  is_active?: boolean;
  profile_picture?: string;
}

export interface ChangePasswordRequest {
  verification_code: string;
  new_password: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  role_id?: number;
  is_active?: boolean;
  search?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
}

export interface DashboardLayout {
  widgets: string[];
}

export interface UserSettings {
  theme?: Theme;
  language?: string;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  notifications?: NotificationSettings;
  dashboard_layout?: DashboardLayout;
}

export interface UserSettingsResponse {
  user_id: number;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

export type UserResponse = ApiResponse<UserProfile>;
export type UsersResponse = ApiResponse<UserListItem[]>;
export type UserSettingsApiResponse = ApiResponse<UserSettingsResponse>;

export interface UserTableColumn {
  key: keyof UserListItem | string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'badge' | 'image' | 'date' | 'actions';
  width?: string;
}

export interface UserFilters {
  search: string;
  role_id: number | null;
  is_active: boolean | null;
}

export interface UserModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  user?: UserProfile;
}