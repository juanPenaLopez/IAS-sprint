import { FormControl, FormGroup } from '@angular/forms';
import { formValueToCreateDto } from '../domain/task.mapper';
import { dueDateNotPastValidator, taskTitleValidators } from './task-form.validators';

describe('Task form validators', () => {
  it('should invalidate short titles', () => {
    const control = new FormControl('abc', taskTitleValidators);
    expect(control.valid).toBeFalse();
    expect(control.errors?.['minlength']).toBeTruthy();
  });

  it('should reject past due dates', () => {
    const control = new FormControl('2000-01-01', [dueDateNotPastValidator()]);
    expect(control.errors?.['pastDate']).toBeTrue();
  });

  it('should map valid form values to create dto', () => {
    const form = new FormGroup({
      title: new FormControl('Título válido de prueba'),
      description: new FormControl('Descripción suficientemente larga para el mapper.'),
      status: new FormControl('todo'),
      priority: new FormControl('medium'),
      assignee: new FormControl('Ana QA'),
      dueDate: new FormControl('2099-12-31'),
      tagsInput: new FormControl('UI, Dashboard'),
    });

    const dto = formValueToCreateDto(form.getRawValue() as never);

    expect(dto.title).toBe('Título válido de prueba');
    expect(dto.tags).toEqual(['ui', 'dashboard']);
  });
});
