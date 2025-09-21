import { Task } from "@models/task.model";

export interface TaskList {
  id: string;
  name: string;
  createdAt: Date;
  tasks: Task[];
  color?: string;
}