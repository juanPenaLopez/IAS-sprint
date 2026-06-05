import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';
import { CreateTaskDto, UpdateTaskDto } from '../domain/task.dto';
import { createTaskFromDto, updateTaskFromDto } from '../domain/task.mapper';
import { SprintTask } from '../domain/sprint-task.model';
import { INITIAL_TASKS } from './tasks-mock.data';

let tasksDb: SprintTask[] = structuredClone(INITIAL_TASKS);
let nextId = 107;

function parseBody<T>(body: unknown): T {
  if (typeof body === 'string') {
    return JSON.parse(body) as T;
  }
  return body as T;
}

function handleMockRequest(req: HttpRequest<unknown>): HttpResponse<unknown> {
  if (req.headers.get('X-Mock-Error') === 'true') {
    throw new HttpErrorResponse({
      status: 500,
      statusText: 'Error simulado del servidor',
    });
  }

  const url = req.url;
  const method = req.method;
  const match = url.match(/\/api\/tasks(?:\/([^/?]+))?/);
  const taskId = match?.[1];

  if (method === 'GET' && !taskId) {
    return new HttpResponse({ status: 200, body: [...tasksDb] });
  }

  if (method === 'GET' && taskId) {
    const task = tasksDb.find((item) => item.id === taskId);
    if (!task) {
      throw new HttpErrorResponse({ status: 404, statusText: 'Tarea no encontrada' });
    }
    return new HttpResponse({ status: 200, body: task });
  }

  if (method === 'POST' && !taskId) {
    const dto = parseBody<CreateTaskDto>(req.body);
    const id = `TASK-${nextId++}`;
    const created = createTaskFromDto(dto, id);
    tasksDb = [...tasksDb, created];
    return new HttpResponse({ status: 201, body: created });
  }

  if (method === 'PUT' && taskId) {
    const dto = parseBody<UpdateTaskDto>(req.body);
    const existing = tasksDb.find((item) => item.id === taskId);
    if (!existing) {
      throw new HttpErrorResponse({ status: 404, statusText: 'Tarea no encontrada' });
    }
    const updated = updateTaskFromDto(existing, dto);
    tasksDb = tasksDb.map((item) => (item.id === taskId ? updated : item));
    return new HttpResponse({ status: 200, body: updated });
  }

  throw new HttpErrorResponse({ status: 405, statusText: 'Método no permitido' });
}

export function resetTasksMockDb(): void {
  tasksDb = structuredClone(INITIAL_TASKS);
  nextId = 107;
}

export const tasksMockInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  if (!req.url.includes('/api/tasks')) {
    return next(req);
  }

  const delayMs = Number(req.headers.get('X-Mock-Delay') ?? 250);

  try {
    const response = handleMockRequest(req);
    return of(response).pipe(delay(delayMs));
  } catch (error) {
    return throwError(() => error);
  }
};
