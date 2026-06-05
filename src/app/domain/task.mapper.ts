import { CreateTaskDto, TaskFormValue, UpdateTaskDto } from './task.dto';
import { SprintTask } from './sprint-task.model';

export function normalizeTags(input: string): string[] {
  if (!input.trim()) {
    return [];
  }

  const tags = input
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);

  return [...new Set(tags)];
}

export function formValueToCreateDto(value: TaskFormValue): CreateTaskDto {
  return {
    title: value.title.trim(),
    description: value.description.trim(),
    status: value.status,
    priority: value.priority,
    assignee: value.assignee.trim(),
    dueDate: value.dueDate,
    tags: normalizeTags(value.tagsInput),
  };
}

export function formValueToUpdateDto(value: TaskFormValue): UpdateTaskDto {
  return formValueToCreateDto(value);
}

export function taskToFormValue(task: SprintTask): TaskFormValue {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
    dueDate: task.dueDate,
    tagsInput: task.tags.join(', '),
  };
}

export function createTaskFromDto(dto: CreateTaskDto, id: string): SprintTask {
  const now = new Date().toISOString();
  return {
    id,
    ...dto,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateTaskFromDto(existing: SprintTask, dto: UpdateTaskDto): SprintTask {
  return {
    ...existing,
    ...dto,
    updatedAt: new Date().toISOString(),
  };
}
