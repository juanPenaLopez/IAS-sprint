import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { routes } from './app.routes';
import { tasksMockInterceptor, resetTasksMockDb } from './data-access/tasks.interceptor';

describe('App routing', () => {
  let router: Router;

  beforeEach(() => {
    resetTasksMockDb();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([tasksMockInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should redirect root to tasks dashboard', async () => {
    await router.navigateByUrl('/');
    expect(router.url).toBe('/tasks');
  });

  it('should navigate to task detail with id param', async () => {
    await router.navigateByUrl('/tasks/TASK-101');
    expect(router.url).toBe('/tasks/TASK-101');
  });

  it('should navigate to not found page for unknown routes', async () => {
    await router.navigateByUrl('/ruta-desconocida');
    expect(router.url).toBe('/ruta-desconocida');
  });
});
