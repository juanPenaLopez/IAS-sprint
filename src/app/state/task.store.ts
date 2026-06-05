import { inject, Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CreateTaskDto, UpdateTaskDto } from '../domain/task.dto';
import {
  SprintSummary,
  SprintTask,
  TaskPriorityFilter,
  TaskStatusFilter,
} from '../domain/sprint-task.model';
import { TaskApiService } from '../data-access/task-api.service';

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly api = inject(TaskApiService);

  readonly tasks = signal<SprintTask[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly status = signal<TaskStatusFilter>('all');
  readonly priority = signal<TaskPriorityFilter>('all');
  readonly selectedId = signal<string | null>(null);

  readonly filteredTasks = computed(() => {
    const query = this.search().trim().toLowerCase();

    return this.tasks().filter((task) => {
      const matchesStatus = this.status() === 'all' || task.status === this.status();
      const matchesPriority = this.priority() === 'all' || task.priority === this.priority();
      const haystack = [task.title, task.description, task.assignee, ...task.tags]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !query || haystack.includes(query);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  });

  readonly summary = computed((): SprintSummary => {
    const all = this.tasks();
    const total = all.length;
    const blocked = all.filter((task) => task.status === 'blocked').length;
    const done = all.filter((task) => task.status === 'done').length;
    const open = all.filter(
      (task) => task.status === 'todo' || task.status === 'in-progress'
    ).length;
    const progressPercent = total === 0 ? 0 : Math.round((done / total) * 100);

    return { total, open, blocked, done, progressPercent };
  });

  readonly selectedTask = computed(() => {
    const id = this.selectedId();
    if (!id) {
      return null;
    }
    return this.tasks().find((task) => task.id === id) ?? null;
  });

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const tasks = await firstValueFrom(this.api.getAll());
      this.tasks.set(tasks);
    } catch {
      this.error.set('No se pudieron cargar las tareas. Inténtalo de nuevo más tarde.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadById(id: string): Promise<SprintTask | null> {
    const cached = this.tasks().find((task) => task.id === id);
    if (cached) {
      this.select(id);
      return cached;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const task = await firstValueFrom(this.api.getById(id));
      this.upsertTask(task);
      this.select(id);
      return task;
    } catch {
      this.error.set('No se pudo cargar la tarea solicitada.');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async create(dto: CreateTaskDto): Promise<SprintTask | null> {
    this.saving.set(true);
    this.error.set(null);

    try {
      const created = await firstValueFrom(this.api.create(dto));
      this.tasks.set([...this.tasks(), created]);
      return created;
    } catch {
      this.error.set('No se pudo crear la tarea. Revisa los datos e inténtalo de nuevo.');
      return null;
    } finally {
      this.saving.set(false);
    }
  }

  async update(id: string, dto: UpdateTaskDto): Promise<SprintTask | null> {
    this.saving.set(true);
    this.error.set(null);

    try {
      const updated = await firstValueFrom(this.api.update(id, dto));
      this.tasks.set(this.tasks().map((task) => (task.id === id ? updated : task)));
      return updated;
    } catch {
      this.error.set('No se pudo actualizar la tarea. Revisa los datos e inténtalo de nuevo.');
      return null;
    } finally {
      this.saving.set(false);
    }
  }

  select(id: string | null): void {
    this.selectedId.set(id);
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  setStatus(value: TaskStatusFilter): void {
    this.status.set(value);
  }

  setPriority(value: TaskPriorityFilter): void {
    this.priority.set(value);
  }

  clearFilters(): void {
    this.search.set('');
    this.status.set('all');
    this.priority.set('all');
  }

  private upsertTask(task: SprintTask): void {
    const exists = this.tasks().some((item) => item.id === task.id);
    if (exists) {
      this.tasks.set(this.tasks().map((item) => (item.id === task.id ? task : item)));
      return;
    }
    this.tasks.set([...this.tasks(), task]);
  }
}
