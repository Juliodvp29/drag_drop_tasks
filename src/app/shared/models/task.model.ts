import { ApiResponse } from "./auth.model";

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface ApiTask {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  list_id: number;
  assigned_to?: number;
  created_by: number;
  due_date?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  list_id: number;
  assigned_to?: number;
  due_date?: string;
  estimated_hours?: number;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  actual_hours?: number;
  tags?: string[];
}

export interface TaskStatusRequest {
  status: TaskStatus;
}

export interface AssignTaskRequest {
  assigned_to: number | null;
}

export interface MoveTaskRequest {
  source_list_id: number;
  target_list_id: number;
  position: number;
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  list_id?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: number;
  created_by?: number;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
  overdue?: boolean;
}

export interface ApiTaskList {
  id: number;
  name: string;
  description?: string;
  color?: string;
  position: number;
  is_active: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  tasks?: ApiTask[];
}

export interface CreateListRequest {
  name: string;
  description?: string;
  color?: string;
  position?: number;
}

export interface UpdateListRequest {
  name?: string;
  description?: string;
  color?: string;
}

export interface ReorderListsRequest {
  lists: Array<{
    id: number;
    position: number;
  }>;
}

export interface ListQueryParams {
  include_inactive?: boolean;
  include_tasks?: boolean;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export type TaskResponse = ApiResponse<ApiTask>;
export type TasksResponse = ApiResponse<ApiTask[]>;
export type ListResponse = ApiResponse<ApiTaskList>;
export type ListsResponse = ApiResponse<{ lists: ApiTaskList[] }>;
export type CommentsResponse = ApiResponse<TaskComment[]>;
export type CommentResponse = ApiResponse<TaskComment>;