import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TASK_PRIORITIES, TASK_STATUSES } from '../domain/sprint-task.model';

export function dueDateNotPastValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    if (!value) {
      return null;
    }

    const selected = new Date(value);
    const today = new Date();
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      return { pastDate: true };
    }

    return null;
  };
}

export const taskTitleValidators = [
  Validators.required,
  Validators.minLength(5),
  Validators.maxLength(80),
];

export const taskDescriptionValidators = [
  Validators.required,
  Validators.minLength(20),
  Validators.maxLength(500),
];

export const taskAssigneeValidators = [Validators.required, Validators.minLength(3)];

export const taskStatusValidators = [
  Validators.required,
  Validators.pattern(new RegExp(`^(${TASK_STATUSES.join('|')})$`)),
];

export const taskPriorityValidators = [
  Validators.required,
  Validators.pattern(new RegExp(`^(${TASK_PRIORITIES.join('|')})$`)),
];

export const taskDueDateValidators = [Validators.required, dueDateNotPastValidator()];

export function tagsInputValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value as string | null) ?? '';
    if (!value.trim()) {
      return null;
    }

    const invalidToken = value
      .split(',')
      .map((tag) => tag.trim())
      .some((tag) => tag.length > 0 && !/^[a-z0-9-]+$/.test(tag.toLowerCase()));

    return invalidToken ? { invalidTags: true } : null;
  };
}
