import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./pages/tasks-dashboard/tasks-dashboard.page').then((m) => m.TasksDashboardPage),
  },
  {
    path: 'tasks/new',
    loadComponent: () =>
      import('./pages/task-form/task-form.page').then((m) => m.TaskFormPage),
  },
  {
    path: 'tasks/:id/edit',
    loadComponent: () =>
      import('./pages/task-form/task-form.page').then((m) => m.TaskFormPage),
  },
  {
    path: 'tasks/:id',
    loadComponent: () =>
      import('./pages/task-detail/task-detail.page').then((m) => m.TaskDetailPage),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
