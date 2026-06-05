import { SprintTask, TaskPriority, TaskStatus } from './sprint-task.model';

export interface CreateTaskDto {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  tags: string[];
}

export type UpdateTaskDto = CreateTaskDto;

export interface TaskFormValue {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  tagsInput: string;
}
