import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { TaskFormPage } from './task-form.page';
import { TaskStore } from '../../state/task.store';

describe('TaskFormPage accessibility', () => {
  let fixture: ComponentFixture<TaskFormPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormPage],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter([]),
        TaskStore,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => null },
              routeConfig: { path: 'tasks/new' },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormPage);
    fixture.detectChanges();
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
  });
});
