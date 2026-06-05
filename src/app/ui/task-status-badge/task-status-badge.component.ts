import { Component, input } from '@angular/core';
import { TaskPriority, TaskStatus } from '../../domain/sprint-task.model';

@Component({
  selector: 'app-task-status-badge',
  template: `
    <span class="badge" [class]="'badge--' + type() + '-' + value()" [attr.aria-label]="ariaLabel()">
      @switch (value()) {
        @case ('todo') { Pendiente }
        @case ('in-progress') { En progreso }
        @case ('blocked') { Bloqueada }
        @case ('done') { Finalizada }
        @case ('low') { Baja }
        @case ('medium') { Media }
        @case ('high') { Alta }
        @case ('critical') { Crítica }
        @default { {{ value() }} }
      }
    </span>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      border: 1px solid transparent;
      white-space: nowrap;
    }

    .badge::before {
      content: '';
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .badge--status-todo {
      background: #f1f5f9;
      color: #475569;
      border-color: #e2e8f0;
    }
    .badge--status-todo::before { background: #94a3b8; }

    .badge--status-in-progress {
      background: #eff6ff;
      color: #1d4ed8;
      border-color: #bfdbfe;
    }
    .badge--status-in-progress::before { background: #3b82f6; }

    .badge--status-blocked {
      background: #fef2f2;
      color: #b91c1c;
      border-color: #fecaca;
    }
    .badge--status-blocked::before { background: #ef4444; }

    .badge--status-done {
      background: #ecfdf5;
      color: #047857;
      border-color: #a7f3d0;
    }
    .badge--status-done::before { background: #10b981; }

    .badge--priority-low {
      background: #f8fafc;
      color: #64748b;
      border-color: #e2e8f0;
    }
    .badge--priority-low::before { background: #cbd5e1; }

    .badge--priority-medium {
      background: #fffbeb;
      color: #b45309;
      border-color: #fde68a;
    }
    .badge--priority-medium::before { background: #f59e0b; }

    .badge--priority-high {
      background: #fff7ed;
      color: #c2410c;
      border-color: #fed7aa;
    }
    .badge--priority-high::before { background: #f97316; }

    .badge--priority-critical {
      background: #fdf2f8;
      color: #9d174d;
      border-color: #fbcfe8;
    }
    .badge--priority-critical::before { background: #ec4899; }
  `,
})
export class TaskStatusBadgeComponent {
  readonly type = input.required<'status' | 'priority'>();
  readonly value = input.required<TaskStatus | TaskPriority>();

  ariaLabel(): string {
    const kind = this.type() === 'status' ? 'Estado' : 'Prioridad';
    return `${kind}: ${this.value().replace('-', ' ')}`;
  }
}
