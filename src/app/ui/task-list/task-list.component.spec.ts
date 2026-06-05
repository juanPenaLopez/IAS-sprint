import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TaskListComponent } from './task-list.component';
import { TaskStore } from '../../state/task.store';

describe('TaskListComponent', () => {
  let fixture: ComponentFixture<TaskListComponent>;
  let store: TaskStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter([]),
        TaskStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    store = TestBed.inject(TaskStore);
    fixture.detectChanges();
  });

  it('should render loading state', () => {
    store.loading.set(true);
    fixture.detectChanges();

    const status = fixture.nativeElement.querySelector('[role="status"]');
    expect(status?.textContent).toContain('Cargando');
  });

  it('should render empty state when there are no filtered tasks', () => {
    store.loading.set(false);
    store.error.set(null);
    store.tasks.set([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No hay tareas');
  });

  it('should render table rows in success state', () => {
    store.loading.set(false);
    store.tasks.set([
      {
        id: 'TASK-1',
        title: 'Tarea visible en tabla',
        description: 'Descripción suficientemente larga para pruebas de UI.',
        status: 'todo',
        priority: 'low',
        assignee: 'Ana QA',
        dueDate: '2026-12-01',
        tags: [],
        createdAt: '2026-06-01T09:00:00.000Z',
        updatedAt: '2026-06-01T09:00:00.000Z',
      },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('table tbody tr')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Tarea visible en tabla');
  });
});
