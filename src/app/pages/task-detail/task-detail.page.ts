import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SprintTask } from '../../domain/sprint-task.model';
import { TaskStore } from '../../state/task.store';
import { TaskStatusBadgeComponent } from '../../ui/task-status-badge/task-status-badge.component';

@Component({
  selector: 'app-task-detail-page',
  imports: [RouterLink, DatePipe, TaskStatusBadgeComponent],
  template: `
    <a routerLink="/tasks" class="back-link">← Volver al dashboard</a>

    @if (loading()) {
      <div class="state-panel card" role="status" aria-live="polite">Cargando detalle de la tarea...</div>
    } @else if (notFound()) {
      <div class="state-panel state-panel--error card" role="alert">
        La tarea solicitada no existe.
      </div>
    } @else if (task(); as current) {
      <header class="detail-header card">
        <div>
          <p class="task-code">{{ current.id }}</p>
          <h1 class="page-title">{{ current.title }}</h1>
        </div>
        <a [routerLink]="['/tasks', current.id, 'edit']" class="btn btn--primary">Editar tarea</a>
      </header>

      <dl class="detail-grid">
        <div class="detail-item card">
          <dt>Responsable</dt>
          <dd>{{ current.assignee }}</dd>
        </div>
        <div class="detail-item card">
          <dt>Estado</dt>
          <dd><app-task-status-badge type="status" [value]="current.status" /></dd>
        </div>
        <div class="detail-item card">
          <dt>Prioridad</dt>
          <dd><app-task-status-badge type="priority" [value]="current.priority" /></dd>
        </div>
        <div class="detail-item card">
          <dt>Fecha límite</dt>
          <dd>{{ current.dueDate | date: 'fullDate' }}</dd>
        </div>
        <div class="detail-item card">
          <dt>Creada</dt>
          <dd>{{ current.createdAt | date: 'medium' }}</dd>
        </div>
        <div class="detail-item card">
          <dt>Actualizada</dt>
          <dd>{{ current.updatedAt | date: 'medium' }}</dd>
        </div>
      </dl>

      <section class="card detail-section">
        <h2>Descripción</h2>
        <p>{{ current.description }}</p>
      </section>

      <section class="card detail-section">
        <h2>Etiquetas</h2>
        @if (current.tags.length === 0) {
          <p class="muted">Sin etiquetas</p>
        } @else {
          <ul class="tags">
            @for (tag of current.tags; track tag) {
              <li>{{ tag }}</li>
            }
          </ul>
        }
      </section>
    }
  `,
  styles: `
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.25rem;
      padding: 1.4rem 1.5rem;
      margin-bottom: 1.15rem;
      border-left: 4px solid transparent;
      border-image: linear-gradient(180deg, var(--primary), var(--accent)) 1;
    }

    .task-code {
      margin: 0 0 0.35rem;
      font-size: 0.75rem;
      color: var(--primary);
      font-weight: 700;
      letter-spacing: 0.06em;
      font-family: ui-monospace, monospace;
      background: var(--primary-soft);
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 0.35rem;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.9rem;
      margin: 0 0 1.15rem;
    }

    .detail-item {
      padding: 1rem 1.1rem;
      transition: transform var(--transition-smooth), box-shadow var(--transition-smooth);
    }

    .detail-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    dt {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      font-weight: 700;
    }

    dd {
      margin: 0.45rem 0 0;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .detail-section {
      padding: 1.15rem 1.35rem;
      margin-bottom: 0.9rem;
    }

    .detail-section h2 {
      margin: 0 0 0.65rem;
      font-size: 0.95rem;
      font-weight: 700;
    }

    .detail-section p {
      margin: 0;
      color: #334155;
      line-height: 1.65;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .tags li {
      background: linear-gradient(135deg, #eef2ff, #e0e7ff);
      color: var(--primary);
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 600;
      border: 1px solid rgba(79, 70, 229, 0.2);
    }

    .muted {
      color: var(--text-muted);
      margin: 0;
      font-style: italic;
    }

    .card {
      margin-bottom: 0;
    }

    @media (max-width: 700px) {
      .detail-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .detail-header .btn {
        width: 100%;
      }
    }
  `,
})
export class TaskDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(TaskStore);

  readonly task = signal<SprintTask | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    void this.loadTask(id);
  }

  private async loadTask(id: string): Promise<void> {
    this.loading.set(true);
    const result = await this.store.loadById(id);
    this.task.set(result);
    this.notFound.set(!result);
    this.loading.set(false);
  }
}
