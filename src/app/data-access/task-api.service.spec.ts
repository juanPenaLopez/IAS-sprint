import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskApiService } from './task-api.service';
import { CreateTaskDto } from '../domain/task.dto';
import { SprintTask } from '../domain/sprint-task.model';

describe('TaskApiService', () => {
  let service: TaskApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        TaskApiService,
      ],
    });

    service = TestBed.inject(TaskApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request all tasks from the correct endpoint', () => {
    const mockResponse: SprintTask[] = [];
    service.getAll().subscribe((tasks) => {
      expect(tasks).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create a task with typed payload', () => {
    const dto: CreateTaskDto = {
      title: 'Nueva tarea de prueba',
      description: 'Descripción suficientemente larga para crear.',
      status: 'todo',
      priority: 'low',
      assignee: 'Tester',
      dueDate: '2026-12-31',
      tags: ['qa'],
    };

    service.create(dto).subscribe((task) => {
      expect(task.title).toBe(dto.title);
    });

    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({
      id: 'TASK-999',
      ...dto,
      createdAt: '2026-06-04T00:00:00.000Z',
      updatedAt: '2026-06-04T00:00:00.000Z',
    });
  });

  it('should propagate http errors', () => {
    let receivedError = false;

    service.getAll().subscribe({
      next: () => fail('should fail'),
      error: () => {
        receivedError = true;
      },
    });

    const req = httpMock.expectOne('/api/tasks');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(receivedError).toBeTrue();
  });
});
