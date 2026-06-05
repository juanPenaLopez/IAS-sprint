import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskStore } from '../../state/task.store';
import { SprintMetricsComponent } from '../../ui/sprint-metrics/sprint-metrics.component';
import { TaskFiltersComponent } from '../../ui/task-filters/task-filters.component';
import { TaskListComponent } from '../../ui/task-list/task-list.component';

@Component({
  selector: 'app-tasks-dashboard-page',
  imports: [RouterLink, TaskFiltersComponent, TaskListComponent, SprintMetricsComponent],
  template: `
    <header class="page-header card">
      <div>
        <h1 class="page-title">Dashboard de tareas</h1>
        <p class="page-subtitle">Revisa el avance del sprint y gestiona las tareas del equipo.</p>
      </div>
      <a routerLink="/tasks/new" class="btn btn--primary">+ Nueva tarea</a>
    </header>

    <section class="metrics-section card">
      @defer (on viewport) {
        <app-sprint-metrics [summary]="store.summary()" />
      } @placeholder {
        <p class="metrics-placeholder" role="status" aria-live="polite">Calculando métricas...</p>
      }
    </section>

    <section class="filters-section card">
      <h2 class="section-title">Filtros</h2>
      <app-task-filters />
    </section>

    <section class="list-section card">
      <h2 class="section-title">Tareas del sprint</h2>
      <app-task-list />
    </section>
  `,
  styles: `
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.25rem;
      padding: 1.5rem 1.5rem;
      margin-bottom: 1.25rem;
      border-left: 4px solid transparent;
      border-image: linear-gradient(180deg, var(--primary), var(--accent)) 1;
      position: relative;
      overflow: hidden;
    }

    .page-header::after {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(79, 70, 229, 0.08), transparent 70%);
      pointer-events: none;
    }

    .section-title {
      margin: 0 0 1rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text);
    }

    .metrics-section,
    .filters-section,
    .list-section {
      padding: 1.25rem 1.35rem;
      margin-bottom: 1.15rem;
    }

    .metrics-section {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(238, 242, 255, 0.6));
    }

    .metrics-placeholder {
      color: var(--text-muted);
      margin: 0;
      text-align: center;
      padding: 1rem;
      font-style: italic;
    }

    @media (max-width: 700px) {
      .page-header {
        flex-direction: column;
      }

      .page-header .btn {
        width: 100%;
      }
    }
  `,
})
export class TasksDashboardPage implements OnInit {
  readonly store = inject(TaskStore);

  ngOnInit(): void {
    if (this.store.tasks().length === 0) {
      void this.store.load();
    }
  }
}
