import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskFormValue } from '../../domain/task.dto';
import { formValueToCreateDto, formValueToUpdateDto, taskToFormValue } from '../../domain/task.mapper';
import { SprintTask, TASK_PRIORITIES, TASK_STATUSES } from '../../domain/sprint-task.model';
import { TaskStore } from '../../state/task.store';
import {
  tagsInputValidator,
  taskAssigneeValidators,
  taskDescriptionValidators,
  taskDueDateValidators,
  taskPriorityValidators,
  taskStatusValidators,
  taskTitleValidators,
} from '../../validators/task-form.validators';
import { getControlErrorMessage, shouldShowError } from '../../utils/form-error.util';
import { AppDialogComponent } from '../../ui/app-dialog/app-dialog.component';

@Component({
  selector: 'app-task-form-page',
  imports: [ReactiveFormsModule, RouterLink, AppDialogComponent],
  template: `
    <a routerLink="/tasks" class="back-link" (click)="onCancelNavigate($event)">
      ← Volver al dashboard
    </a>

    <header class="page-header">
      <div>
        <h1 class="page-title">{{ isEdit() ? 'Editar tarea' : 'Nueva tarea' }}</h1>
        <p class="page-subtitle">
          {{ isEdit() ? 'Actualiza los datos y confirma los cambios.' : 'Completa el formulario y confirma la creación.' }}
        </p>
      </div>
    </header>

    @if (loadError()) {
      <p class="banner banner--error" role="alert" aria-live="assertive">{{ loadError() }}</p>
    }

    <form
      class="card form-card"
      [formGroup]="form"
      (ngSubmit)="requestSave()"
      novalidate
      [attr.aria-busy]="store.saving()"
    >
      <div class="field">
        <label for="title">Título</label>
        <input id="title" type="text" formControlName="title" [attr.aria-invalid]="show('title')" />
        @if (show('title')) {
          <small class="error" role="alert">{{ message('title') }}</small>
        }
      </div>

      <div class="field">
        <label for="description">Descripción</label>
        <textarea id="description" rows="4" formControlName="description" [attr.aria-invalid]="show('description')"></textarea>
        @if (show('description')) {
          <small class="error" role="alert">{{ message('description') }}</small>
        }
      </div>

      <div class="grid">
        <div class="field">
          <label for="status">Estado</label>
          <select id="status" formControlName="status" [attr.aria-invalid]="show('status')">
            @for (status of statuses; track status) {
              <option [value]="status">{{ statusLabel(status) }}</option>
            }
          </select>
          @if (show('status')) {
            <small class="error" role="alert">{{ message('status') }}</small>
          }
        </div>

        <div class="field">
          <label for="priority">Prioridad</label>
          <select id="priority" formControlName="priority" [attr.aria-invalid]="show('priority')">
            @for (priority of priorities; track priority) {
              <option [value]="priority">{{ priorityLabel(priority) }}</option>
            }
          </select>
          @if (show('priority')) {
            <small class="error" role="alert">{{ message('priority') }}</small>
          }
        </div>
      </div>

      <div class="grid">
        <div class="field">
          <label for="assignee">Responsable</label>
          <input id="assignee" type="text" formControlName="assignee" [attr.aria-invalid]="show('assignee')" />
          @if (show('assignee')) {
            <small class="error" role="alert">{{ message('assignee') }}</small>
          }
        </div>

        <div class="field">
          <label for="dueDate">Fecha límite</label>
          <input id="dueDate" type="date" formControlName="dueDate" [attr.aria-invalid]="show('dueDate')" />
          @if (show('dueDate')) {
            <small class="error" role="alert">{{ message('dueDate') }}</small>
          }
        </div>
      </div>

      <div class="field">
        <label for="tagsInput">Etiquetas (opcional)</label>
        <input
          id="tagsInput"
          type="text"
          formControlName="tagsInput"
          placeholder="ui, dashboard, api"
          [attr.aria-invalid]="show('tagsInput')"
        />
        @if (show('tagsInput')) {
          <small class="error" role="alert">{{ message('tagsInput') }}</small>
        }
      </div>

      @if (store.error()) {
        <p class="banner banner--error" role="alert" aria-live="assertive">{{ store.error() }}</p>
      }

      <div class="actions">
        <button type="button" class="btn btn--ghost" (click)="onCancelNavigate($event)">
          Cancelar
        </button>
        <button type="submit" class="btn btn--primary" [disabled]="form.invalid || store.saving()">
          {{ isEdit() ? 'Revisar cambios' : 'Revisar y crear' }}
        </button>
      </div>
    </form>

    <app-dialog
      [open]="showConfirm()"
      [title]="isEdit() ? '¿Guardar cambios?' : '¿Crear esta tarea?'"
      [description]="
        isEdit()
          ? 'Confirma que deseas actualizar la tarea con los datos mostrados.'
          : 'Confirma que deseas registrar la nueva tarea en el sprint.'
      "
      icon="📋"
      variant="confirm"
      confirmLabel="Sí, guardar"
      cancelLabel="Volver al formulario"
      [confirmDisabled]="store.saving()"
      (confirmed)="confirmSave()"
      (cancelled)="closeConfirm()"
    >
      <ul class="preview-list">
        <li><span>Título</span><strong>{{ pendingPreview()?.title }}</strong></li>
        <li><span>Responsable</span><strong>{{ pendingPreview()?.assignee }}</strong></li>
        <li><span>Estado</span><strong>{{ statusLabel(pendingPreview()?.status ?? 'todo') }}</strong></li>
        <li><span>Prioridad</span><strong>{{ priorityLabel(pendingPreview()?.priority ?? 'medium') }}</strong></li>
        <li><span>Fecha límite</span><strong>{{ pendingPreview()?.dueDate }}</strong></li>
      </ul>
    </app-dialog>

    <app-dialog
      [open]="showSuccess()"
      title="¡Tarea guardada!"
      [description]="successMessage()"
      icon="✓"
      variant="success"
      confirmLabel="Ver detalle"
      cancelLabel="Ir al dashboard"
      (confirmed)="goToSavedTask()"
      (cancelled)="goToDashboard()"
    />

    <app-dialog
      [open]="showDiscard()"
      title="¿Descartar cambios?"
      description="Tienes cambios sin guardar. Si sales ahora, se perderán."
      icon="⚠"
      variant="danger"
      confirmLabel="Salir sin guardar"
      cancelLabel="Seguir editando"
      (confirmed)="discardAndLeave()"
      (cancelled)="showDiscard.set(false)"
    />
  `,
  styles: `
    .page-header {
      margin-bottom: 1.25rem;
    }

    .form-card {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      padding: 1.5rem;
      max-width: 720px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.15rem;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      padding-top: 0.5rem;
      margin-top: 0.25rem;
      border-top: 1px solid var(--border);
    }

    @media (max-width: 700px) {
      .grid {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column-reverse;
      }

      .actions .btn {
        width: 100%;
      }
    }
  `,
})
export class TaskFormPage implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(TaskStore);

  readonly statuses = TASK_STATUSES;
  readonly priorities = TASK_PRIORITIES;
  readonly isEdit = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly showConfirm = signal(false);
  readonly showSuccess = signal(false);
  readonly showDiscard = signal(false);
  readonly pendingPreview = signal<TaskFormValue | null>(null);
  readonly savedTask = signal<SprintTask | null>(null);

  private submitted = false;
  private taskId: string | null = null;
  private leaveAfterDiscard = '/tasks';

  constructor() {
    effect(() => {
      if (this.store.saving()) {
        this.form.disable({ emitEvent: false });
        return;
      }
      if (!this.loadError()) {
        this.form.enable({ emitEvent: false });
      }
    });
  }

  readonly form = this.fb.group({
    title: this.fb.control('', { validators: taskTitleValidators }),
    description: this.fb.control('', { validators: taskDescriptionValidators }),
    status: this.fb.control('todo' as TaskFormValue['status'], { validators: taskStatusValidators }),
    priority: this.fb.control('medium' as TaskFormValue['priority'], {
      validators: taskPriorityValidators,
    }),
    assignee: this.fb.control('', { validators: taskAssigneeValidators }),
    dueDate: this.fb.control('', { validators: taskDueDateValidators }),
    tagsInput: this.fb.control('', { validators: [tagsInputValidator()] }),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const isEditRoute = this.route.snapshot.routeConfig?.path?.includes('edit') ?? false;

    if (id && isEditRoute) {
      this.isEdit.set(true);
      this.taskId = id;
      void this.loadTask(id);
      return;
    }

    if (id && !isEditRoute) {
      void this.router.navigate(['/tasks', id, 'edit']);
    }
  }

  successMessage(): string {
    const task = this.savedTask();
    if (!task) {
      return 'La operación se completó correctamente.';
    }
    return `La tarea "${task.title}" fue ${this.isEdit() ? 'actualizada' : 'creada'} con éxito.`;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      todo: 'Pendiente',
      'in-progress': 'En progreso',
      blocked: 'Bloqueada',
      done: 'Finalizada',
    };
    return labels[status] ?? status;
  }

  priorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica',
    };
    return labels[priority] ?? priority;
  }

  show(controlName: keyof TaskFormValue): boolean {
    const control = this.form.controls[controlName];
    return shouldShowError(control, this.submitted);
  }

  message(controlName: keyof TaskFormValue): string {
    return getControlErrorMessage(controlName, this.form.controls[controlName]);
  }

  requestSave(): void {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid || this.store.saving()) {
      return;
    }

    this.pendingPreview.set(this.form.getRawValue());
    this.showConfirm.set(true);
  }

  closeConfirm(): void {
    this.showConfirm.set(false);
    this.pendingPreview.set(null);
  }

  async confirmSave(): Promise<void> {
    const value = this.pendingPreview();
    if (!value) {
      return;
    }

    let result: SprintTask | null = null;

    if (this.isEdit() && this.taskId) {
      result = await this.store.update(this.taskId, formValueToUpdateDto(value));
    } else {
      result = await this.store.create(formValueToCreateDto(value));
    }

    this.showConfirm.set(false);
    this.pendingPreview.set(null);

    if (result) {
      this.savedTask.set(result);
      this.showSuccess.set(true);
    }
  }

  goToSavedTask(): void {
    const task = this.savedTask();
    this.showSuccess.set(false);
    if (task) {
      void this.router.navigate(['/tasks', task.id]);
    }
  }

  goToDashboard(): void {
    this.showSuccess.set(false);
    void this.router.navigate(['/tasks']);
  }

  onCancelNavigate(event: Event): void {
    if (this.showSuccess()) {
      return;
    }

    const isButton = (event.target as HTMLElement).closest('button') !== null;

    if (this.form.dirty) {
      event.preventDefault();
      this.leaveAfterDiscard = '/tasks';
      this.showDiscard.set(true);
      return;
    }

    if (isButton) {
      event.preventDefault();
      void this.router.navigate(['/tasks']);
    }
  }

  discardAndLeave(): void {
    this.showDiscard.set(false);
    void this.router.navigateByUrl(this.leaveAfterDiscard);
  }

  private async loadTask(id: string): Promise<void> {
    const task = await this.store.loadById(id);
    if (!task) {
      this.loadError.set('No se encontró la tarea a editar.');
      this.form.disable();
      return;
    }
    this.form.patchValue(taskToFormValue(task));
    this.form.markAsPristine();
  }
}
