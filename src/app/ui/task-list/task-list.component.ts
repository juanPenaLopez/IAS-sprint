import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskStore } from '../../state/task.store';
import { TaskStatusBadgeComponent } from '../task-status-badge/task-status-badge.component';

@Component({
  selector: 'app-task-list',
  imports: [RouterLink, DatePipe, TaskStatusBadgeComponent],
  template: `
    @if (store.loading()) {
      <div class="state-panel" role="status" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        Cargando tareas del sprint...
      </div>
    } @else if (store.error()) {
      <div class="state-panel state-panel--error" role="alert" aria-live="assertive">
        {{ store.error() }}
      </div>
    } @else if (store.filteredTasks().length === 0) {
      <div class="state-panel" role="status" aria-live="polite">
        No hay tareas que coincidan con los filtros aplicados.
      </div>
    } @else {
      <div class="table-wrap">
        <table aria-label="Lista de tareas del sprint">
          <thead>
            <tr>
              <th scope="col">Título</th>
              <th scope="col">Responsable</th>
              <th scope="col">Prioridad</th>
              <th scope="col">Estado</th>
              <th scope="col">Fecha límite</th>
              <th scope="col"><span class="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            @for (task of store.filteredTasks(); track task.id) {
              <tr>
                <td>
                  <a [routerLink]="['/tasks', task.id]" class="task-link">{{ task.title }}</a>
                  <span class="task-id">{{ task.id }}</span>
                </td>
                <td>{{ task.assignee }}</td>
                <td>
                  <app-task-status-badge type="priority" [value]="task.priority" />
                </td>
                <td>
                  <app-task-status-badge type="status" [value]="task.status" />
                </td>
                <td>{{ task.dueDate | date: 'mediumDate' }}</td>
                <td class="actions-cell">
                  <a [routerLink]="['/tasks', task.id, 'edit']" class="btn btn--ghost btn--sm">
                    Editar
                  </a>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: `
    .table-wrap {
      overflow-x: auto;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: linear-gradient(180deg, #f8fafc, #f1f5f9);
    }

    th,
    td {
      padding: 0.9rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }

    th {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--text-muted);
      font-weight: 700;
    }

    tbody tr {
      transition: background var(--transition-fast);
    }

    tbody tr:hover {
      background: linear-gradient(90deg, rgba(79, 70, 229, 0.04), rgba(6, 182, 212, 0.03));
    }

    tbody tr:last-child td {
      border-bottom: 0;
    }

    .task-link {
      display: block;
      color: var(--primary);
      font-weight: 700;
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .task-link:hover {
      color: var(--primary-hover);
    }

    .task-id {
      display: inline-block;
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
      font-family: ui-monospace, monospace;
      background: var(--surface-muted);
      padding: 0.1rem 0.35rem;
      border-radius: 0.25rem;
    }

    .actions-cell {
      white-space: nowrap;
    }

    .spinner {
      display: inline-block;
      width: 1.1rem;
      height: 1.1rem;
      margin-right: 0.55rem;
      border: 2px solid #e2e8f0;
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      vertical-align: middle;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,
})
export class TaskListComponent {
  readonly store = inject(TaskStore);
}
