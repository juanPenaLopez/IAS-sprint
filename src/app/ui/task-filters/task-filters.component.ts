import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../domain/sprint-task.model';
import { TaskStore } from '../../state/task.store';

@Component({
  selector: 'app-task-filters',
  imports: [FormsModule],
  template: `
    <div class="filters" aria-label="Filtros de tareas">
      <div class="field">
        <label for="search">Buscar</label>
        <input
          id="search"
          type="search"
          [ngModel]="store.search()"
          (ngModelChange)="store.setSearch($event)"
          placeholder="Título, responsable, etiquetas..."
        />
      </div>

      <div class="field">
        <label for="status">Estado</label>
        <select
          id="status"
          [ngModel]="store.status()"
          (ngModelChange)="store.setStatus($event)"
        >
          <option value="all">Todos</option>
          @for (status of statuses; track status) {
            <option [value]="status">{{ status }}</option>
          }
        </select>
      </div>

      <div class="field">
        <label for="priority">Prioridad</label>
        <select
          id="priority"
          [ngModel]="store.priority()"
          (ngModelChange)="store.setPriority($event)"
        >
          <option value="all">Todas</option>
          @for (priority of priorities; track priority) {
            <option [value]="priority">{{ priority }}</option>
          }
        </select>
      </div>

      <button type="button" class="btn btn--ghost filter-reset" (click)="store.clearFilters()">
        Limpiar
      </button>
    </div>
  `,
  styles: `
    .filters {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 1rem;
      align-items: end;
    }

    .filter-reset {
      height: fit-content;
      align-self: end;
      color: var(--text-muted);
    }

    .filter-reset:hover {
      color: var(--danger);
      border-color: #fecaca;
      background: #fef2f2;
    }

    @media (max-width: 900px) {
      .filters {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class TaskFiltersComponent {
  readonly store = inject(TaskStore);
  readonly statuses = TASK_STATUSES;
  readonly priorities = TASK_PRIORITIES;
}
