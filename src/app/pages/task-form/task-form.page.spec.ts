import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { TaskFormPage } from './task-form.page';
import { TaskApiService } from '../../data-access/task-api.service';
import { SprintTask } from '../../domain/sprint-task.model';
import { TaskStore } from '../../state/task.store';

const mockTask: SprintTask = {
  id: 'TASK-1',
  title: 'Tarea existente para editar',
  description: 'Descripción suficientemente larga para el modo edición.',
  status: 'in-progress',
  priority: 'high',
  assignee: 'Carlos Dev',
  dueDate: '2026-12-01',
  tags: ['ui', 'dashboard'],
  createdAt: '2026-06-01T09:00:00.000Z',
  updatedAt: '2026-06-01T09:00:00.000Z',
};

function provideActivatedRoute(id: string | null, path: string) {
  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: {
        paramMap: { get: (key: string) => (key === 'id' ? id : null) },
        routeConfig: { path },
      },
    },
  };
}

async function createTaskFormFixture(options: {
  routeId: string | null;
  routePath: string;
  getById?: Observable<SprintTask>;
  update?: Observable<SprintTask>;
}): Promise<{ fixture: ComponentFixture<TaskFormPage>; api: jasmine.SpyObj<TaskApiService> }> {
  const api = jasmine.createSpyObj<TaskApiService>('TaskApiService', [
    'getAll',
    'getById',
    'create',
    'update',
  ]);

  if (options.getById) {
    api.getById.and.returnValue(options.getById);
  }

  if (options.update) {
    api.update.and.returnValue(options.update);
  }

  await TestBed.configureTestingModule({
    imports: [TaskFormPage],
    providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(),
      provideRouter([]),
      TaskStore,
      { provide: TaskApiService, useValue: api },
      provideActivatedRoute(options.routeId, options.routePath),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(TaskFormPage);
  fixture.detectChanges();
  await fixture.whenStable();

  if (options.routeId) {
    await waitForEditInit(fixture);
  }

  return { fixture, api };
}

async function waitForEditInit(fixture: ComponentFixture<TaskFormPage>): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt++) {
    fixture.detectChanges();
    await fixture.whenStable();

    const loaded = fixture.componentInstance.form.getRawValue().title.length > 0;
    const failed = fixture.componentInstance.loadError() !== null;

    if (loaded || failed) {
      fixture.detectChanges();
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

describe('TaskFormPage', () => {
  describe('create mode', () => {
    let fixture: ComponentFixture<TaskFormPage>;

    beforeEach(async () => {
      ({ fixture } = await createTaskFormFixture({
        routeId: null,
        routePath: 'tasks/new',
      }));
    });

    it('should associate labels with form controls', () => {
      const labels = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'tagsInput'];
      for (const id of labels) {
        const label = fixture.nativeElement.querySelector(`label[for="${id}"]`);
        const control = fixture.nativeElement.querySelector(`#${id}`);
        expect(label).withContext(`label for ${id}`).toBeTruthy();
        expect(control).withContext(`control ${id}`).toBeTruthy();
      }
    });

    it('should disable submit for invalid form', () => {
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(button.disabled).toBeTrue();
    });

    it('should open confirm dialog when form is valid', () => {
      fixture.componentInstance.form.patchValue({
        title: 'Tarea válida de prueba',
        description: 'Descripción suficientemente larga para validar el modal.',
        status: 'todo',
        priority: 'medium',
        assignee: 'Ana QA',
        dueDate: '2099-12-31',
        tagsInput: '',
      });
      fixture.detectChanges();

      const submitBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      submitBtn.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.showConfirm()).toBeTrue();
      expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
      expect(fixture.nativeElement.textContent).toContain('¿Crear esta tarea?');
    });
  });

  describe('edit mode', () => {
    let fixture: ComponentFixture<TaskFormPage>;

    beforeEach(async () => {
      ({ fixture } = await createTaskFormFixture({
        routeId: 'TASK-1',
        routePath: 'tasks/:id/edit',
        getById: of(mockTask),
      }));
    });

    it('should render edit mode heading and submit label', () => {
      expect(fixture.nativeElement.textContent).toContain('Editar tarea');
      expect(fixture.nativeElement.textContent).toContain('Actualiza los datos y confirma los cambios.');

      const submitBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitBtn.textContent).toContain('Revisar cambios');
    });

    it('should preload form with existing task data', () => {
      expect(fixture.componentInstance.isEdit()).toBeTrue();
      expect(fixture.componentInstance.form.getRawValue()).toEqual({
        title: mockTask.title,
        description: mockTask.description,
        status: mockTask.status,
        priority: mockTask.priority,
        assignee: mockTask.assignee,
        dueDate: mockTask.dueDate,
        tagsInput: 'ui, dashboard',
      });
    });

    it('should enable submit when preloaded task is valid', () => {
      const submitBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitBtn.disabled).toBeFalse();
    });

    it('should open edit confirm dialog when saving changes', () => {
      fixture.componentInstance.form.patchValue({
        title: 'Título actualizado válido',
      });
      fixture.detectChanges();

      const submitBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      submitBtn.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.showConfirm()).toBeTrue();
      expect(fixture.nativeElement.textContent).toContain('¿Guardar cambios?');
    });

    it('should update task on confirm save', async () => {
      const updatedTask: SprintTask = {
        ...mockTask,
        title: 'Título actualizado válido',
        updatedAt: '2026-06-05T12:00:00.000Z',
      };

      TestBed.resetTestingModule();
      const { fixture: editFixture, api } = await createTaskFormFixture({
        routeId: 'TASK-1',
        routePath: 'tasks/:id/edit',
        getById: of(mockTask),
        update: of(updatedTask),
      });

      editFixture.componentInstance.form.patchValue({
        title: 'Título actualizado válido',
      });
      editFixture.detectChanges();

      editFixture.componentInstance.requestSave();
      await editFixture.componentInstance.confirmSave();
      editFixture.detectChanges();

      expect(api.update).toHaveBeenCalledWith(
        'TASK-1',
        jasmine.objectContaining({ title: 'Título actualizado válido' }),
      );
      expect(editFixture.componentInstance.showSuccess()).toBeTrue();
      expect(editFixture.componentInstance.successMessage()).toContain('actualizada');
      expect(editFixture.componentInstance.savedTask()?.title).toBe('Título actualizado válido');
    });

    it('should show load error when task is not found', async () => {
      TestBed.resetTestingModule();
      ({ fixture } = await createTaskFormFixture({
        routeId: 'TASK-404',
        routePath: 'tasks/:id/edit',
        getById: throwError(() => new Error('not found')),
      }));

      expect(fixture.componentInstance.loadError()).toBe('No se encontró la tarea a editar.');
      expect(fixture.nativeElement.textContent).toContain('No se encontró la tarea a editar.');
      expect(fixture.componentInstance.form.disabled).toBeTrue();
    });
  });
});
