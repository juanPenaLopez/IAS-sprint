import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SprintTask } from '../domain/sprint-task.model';
import { TaskApiService } from '../data-access/task-api.service';
import { TaskStore } from './task.store';

const mockTasks: SprintTask[] = [
  {
    id: 'TASK-1',
    title: 'Tarea de prueba uno',
    description: 'Descripción suficientemente larga para pruebas.',
    status: 'todo',
    priority: 'low',
    assignee: 'Ana Test',
    dueDate: '2026-12-01',
    tags: ['test'],
    createdAt: '2026-06-01T09:00:00.000Z',
    updatedAt: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'TASK-2',
    title: 'Tarea bloqueada',
    description: 'Otra descripción suficientemente larga para validar.',
    status: 'blocked',
    priority: 'high',
    assignee: 'Carlos Test',
    dueDate: '2026-12-05',
    tags: [],
    createdAt: '2026-06-02T09:00:00.000Z',
    updatedAt: '2026-06-02T09:00:00.000Z',
  },
  {
    id: 'TASK-3',
    title: 'Tarea finalizada',
    description: 'Descripción de tarea completada para métricas.',
    status: 'done',
    priority: 'medium',
    assignee: 'Laura Test',
    dueDate: '2026-12-10',
    tags: [],
    createdAt: '2026-06-03T09:00:00.000Z',
    updatedAt: '2026-06-03T09:00:00.000Z',
  },
];

describe('TaskStore', () => {
  let store: TaskStore;
  let api: jasmine.SpyObj<TaskApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<TaskApiService>('TaskApiService', [
      'getAll',
      'getById',
      'create',
      'update',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        TaskStore,
        { provide: TaskApiService, useValue: api },
      ],
    });

    store = TestBed.inject(TaskStore);
  });

  it('should load tasks successfully', async () => {
    api.getAll.and.returnValue(of(mockTasks));

    await store.load();

    expect(store.tasks()).toEqual(mockTasks);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should set error when load fails', async () => {
    api.getAll.and.returnValue(throwError(() => new Error('network')));

    await store.load();

    expect(store.tasks()).toEqual([]);
    expect(store.error()).toContain('No se pudieron cargar');
  });

  it('should filter tasks by search, status and priority', async () => {
    api.getAll.and.returnValue(of(mockTasks));
    await store.load();

    store.setSearch('bloqueada');
    store.setStatus('blocked');
    store.setPriority('high');

    expect(store.filteredTasks().length).toBe(1);
    expect(store.filteredTasks()[0].id).toBe('TASK-2');
    expect(store.tasks().length).toBe(3);
  });

  it('should calculate summary metrics', async () => {
    api.getAll.and.returnValue(of(mockTasks));
    await store.load();

    expect(store.summary()).toEqual({
      total: 3,
      open: 1,
      blocked: 1,
      done: 1,
      progressPercent: 33,
    });
  });
});
