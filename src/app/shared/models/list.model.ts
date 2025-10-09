import { ApiTask } from "./task.model";

export interface TaskList {
  id: string;
  name: string;
  createdAt: Date;
  tasks: ApiTask[];
  color?: string;
}