export interface LoginRequest {
  email: string;
  password: string;
  device_info?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id?: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  is_active: boolean;
  role: Role;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  permissions: string[];
  is_system_role: boolean;
  is_active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

export interface CreateRoleRequest {
  name: string;
  display_name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  display_name?: string;
  description?: string;
  permissions?: string[];
  is_active?: boolean;
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  category: string;
}