import { Component, input } from '@angular/core';
import { SprintSummary } from '../../domain/sprint-task.model';

@Component({
  selector: 'app-sprint-metrics',
  template: `
    <section class="metrics" aria-label="Métricas del sprint">
      <article class="metric metric--total">
        <span class="metric__icon" aria-hidden="true"></span>
        <p class="metric__label">Total</p>
        <p class="metric__value">{{ summary().total }}</p>
      </article>
      <article class="metric metric--open">
        <span class="metric__icon" aria-hidden="true"></span>
        <p class="metric__label">Abiertas</p>
        <p class="metric__value">{{ summary().open }}</p>
      </article>
      <article class="metric metric--blocked">
        <span class="metric__icon" aria-hidden="true"></span>
        <p class="metric__label">Bloqueadas</p>
        <p class="metric__value">{{ summary().blocked }}</p>
      </article>
      <article class="metric metric--done">
        <span class="metric__icon" aria-hidden="true"></span>
        <p class="metric__label">Finalizadas</p>
        <p class="metric__value">{{ summary().done }}</p>
      </article>
      <article class="metric metric--highlight">
        <p class="metric__label">Avance del sprint</p>
        <div class="metric__progress-ring" aria-hidden="true">
          <svg viewBox="0 0 36 36">
            <circle class="metric__ring-bg" cx="18" cy="18" r="15.5" />
            <circle
              class="metric__ring-fill"
              cx="18"
              cy="18"
              r="15.5"
              [style.stroke-dasharray]="ringDash()"
            />
          </svg>
          <span class="metric__ring-value">{{ summary().progressPercent }}%</span>
        </div>
        <div class="metric__bar" role="progressbar" [attr.aria-valuenow]="summary().progressPercent" aria-valuemin="0" aria-valuemax="100">
          <span [style.width.%]="summary().progressPercent"></span>
        </div>
      </article>
    </section>
  `,
  styles: `
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.9rem;
    }

    .metric {
      position: relative;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1rem 1.1rem;
      overflow: hidden;
      transition:
        transform var(--transition-smooth),
        box-shadow var(--transition-smooth);
    }

    .metric:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .metric::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }

    .metric--total::before { background: linear-gradient(90deg, #6366f1, #818cf8); }
    .metric--open::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    .metric--blocked::before { background: linear-gradient(90deg, #ef4444, #f87171); }
    .metric--done::before { background: linear-gradient(90deg, #10b981, #34d399); }

    .metric__icon {
      display: block;
      width: 2rem;
      height: 2rem;
      border-radius: 0.5rem;
      margin-bottom: 0.65rem;
      opacity: 0.9;
    }

    .metric--total .metric__icon { background: linear-gradient(135deg, #e0e7ff, #c7d2fe); }
    .metric--open .metric__icon { background: linear-gradient(135deg, #dbeafe, #93c5fd); }
    .metric--blocked .metric__icon { background: linear-gradient(135deg, #fee2e2, #fca5a5); }
    .metric--done .metric__icon { background: linear-gradient(135deg, #d1fae5, #6ee7b7); }

    .metric__label {
      margin: 0;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      font-weight: 700;
    }

    .metric__value {
      margin: 0.35rem 0 0;
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1;
      letter-spacing: -0.03em;
    }

    .metric--open .metric__value { color: #2563eb; }
    .metric--blocked .metric__value { color: #dc2626; }
    .metric--done .metric__value { color: #059669; }

    .metric--highlight {
      border-color: rgba(79, 70, 229, 0.25);
      background: linear-gradient(145deg, #eef2ff, #fff);
      grid-column: span 1;
    }

    .metric--highlight::before {
      background: linear-gradient(90deg, var(--primary), var(--accent));
    }

    .metric__progress-ring {
      position: relative;
      width: 4.5rem;
      height: 4.5rem;
      margin: 0.5rem 0 0.65rem;
    }

    .metric__progress-ring svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .metric__ring-bg {
      fill: none;
      stroke: #e0e7ff;
      stroke-width: 3;
    }

    .metric__ring-fill {
      fill: none;
      stroke: var(--primary);
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dasharray 0.6s ease;
    }

    .metric__ring-value {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--primary);
    }

    .metric__bar {
      height: 0.4rem;
      background: rgba(79, 70, 229, 0.12);
      border-radius: 999px;
      overflow: hidden;
    }

    .metric__bar span {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      border-radius: inherit;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (min-width: 768px) {
      .metric--highlight {
        grid-column: span 2;
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-rows: auto auto auto;
        align-items: center;
        column-gap: 1.25rem;
      }

      .metric--highlight .metric__label {
        grid-column: 1;
        grid-row: 1;
      }

      .metric--highlight .metric__progress-ring {
        grid-column: 2;
        grid-row: 1 / 3;
        margin: 0;
      }

      .metric--highlight .metric__bar {
        grid-column: 1;
        grid-row: 2;
        margin-top: 0;
      }
    }
  `,
})
export class SprintMetricsComponent {
  readonly summary = input.required<SprintSummary>();

  ringDash(): string {
    const percent = this.summary().progressPercent;
    const circumference = 2 * Math.PI * 15.5;
    const filled = (percent / 100) * circumference;
    return `${filled} ${circumference}`;
  }
}
