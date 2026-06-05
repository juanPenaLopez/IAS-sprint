import {
  Component,
  ElementRef,
  HostListener,
  input,
  output,
  viewChild,
  effect,
} from '@angular/core';

export type DialogVariant = 'confirm' | 'success' | 'danger';

@Component({
  selector: 'app-dialog',
  template: `
    @if (open()) {
      <div
        class="dialog-backdrop"
        role="presentation"
        (click)="onBackdropClick()"
      >
        <section
          #dialogPanel
          class="dialog"
          [class.dialog--success]="variant() === 'success'"
          [class.dialog--danger]="variant() === 'danger'"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="description() ? descId : null"
          (click)="$event.stopPropagation()"
        >
          <header class="dialog__header">
            @if (icon()) {
              <span class="dialog__icon" aria-hidden="true">{{ icon() }}</span>
            }
            <h2 [id]="titleId" class="dialog__title">{{ title() }}</h2>
          </header>

          @if (description()) {
            <p [id]="descId" class="dialog__description">{{ description() }}</p>
          }

          <div class="dialog__body">
            <ng-content />
          </div>

          <footer class="dialog__actions">
            @if (showCancel()) {
              <button
                type="button"
                class="btn btn--ghost"
                (click)="cancelled.emit()"
              >
                {{ cancelLabel() }}
              </button>
            }
            <button
              #primaryAction
              type="button"
              class="btn"
              [class.btn--primary]="variant() !== 'danger'"
              [class.btn--danger]="variant() === 'danger'"
              [disabled]="confirmDisabled()"
              (click)="confirmed.emit()"
            >
              {{ confirmLabel() }}
            </button>
          </footer>
        </section>
      </div>
    }
  `,
  styles: `
    .dialog-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: grid;
      place-items: center;
      padding: 1rem;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px) saturate(120%);
      animation: fadeIn 0.2s ease;
    }

    .dialog {
      width: min(100%, 28rem);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      padding: 1.5rem;
      animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .dialog--success {
      border-color: #86efac;
      background: linear-gradient(180deg, #fff, #f0fdf4);
    }

    .dialog--danger {
      border-color: #fecaca;
      background: linear-gradient(180deg, #fff, #fef2f2);
    }

    .dialog__header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.6rem;
    }

    .dialog__icon {
      display: grid;
      place-items: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 999px;
      background: var(--primary-soft);
      font-size: 1.15rem;
      flex-shrink: 0;
    }

    .dialog--success .dialog__icon {
      background: #dcfce7;
    }

    .dialog--danger .dialog__icon {
      background: #fee2e2;
    }

    .dialog__title {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.02em;
    }

    .dialog__description {
      margin: 0 0 0.75rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .dialog__body:empty {
      display: none;
    }

    .dialog__body:not(:empty) {
      margin-bottom: 1rem;
    }

    .dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `,
})
export class AppDialogComponent {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly icon = input<string>('');
  readonly variant = input<DialogVariant>('confirm');
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly showCancel = input(true);
  readonly confirmDisabled = input(false);
  readonly closeOnBackdrop = input(true);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  readonly titleId = `dialog-title-${Math.random().toString(36).slice(2, 9)}`;
  readonly descId = `dialog-desc-${Math.random().toString(36).slice(2, 9)}`;

  private readonly primaryAction = viewChild<ElementRef<HTMLButtonElement>>('primaryAction');

  constructor() {
    effect(() => {
      if (this.open()) {
        queueMicrotask(() => this.primaryAction()?.nativeElement.focus());
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && this.showCancel()) {
      this.cancelled.emit();
    }
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop() && this.showCancel()) {
      this.cancelled.emit();
    }
  }
}
