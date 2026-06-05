export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface SprintTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'blocked', 'done'];

export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

export type TaskStatusFilter = TaskStatus | 'all';

export type TaskPriorityFilter = TaskPriority | 'all';

export interface SprintSummary {
  total: number;
  open: number;
  blocked: number;
  done: number;
  progressPercent: number;
}
