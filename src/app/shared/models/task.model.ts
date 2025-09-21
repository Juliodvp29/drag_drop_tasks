export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Task {
  id: string;
  description: string;
  createdAt: Date;
  finishedAt?: Date;
  listId: string;
  priority: TaskPriority;
}