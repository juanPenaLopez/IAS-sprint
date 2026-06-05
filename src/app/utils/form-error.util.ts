import { AbstractControl } from '@angular/forms';

export function shouldShowError(control: AbstractControl, submitted: boolean): boolean {
  return (control.touched || control.dirty || submitted) && control.invalid;
}

export function getControlErrorMessage(controlName: string, control: AbstractControl): string {
  const errors = control.errors;
  if (!errors) {
    return '';
  }

  switch (controlName) {
    case 'title':
      if (errors['required']) return 'El título es obligatorio.';
      if (errors['minlength']) return 'El título debe tener al menos 5 caracteres.';
      if (errors['maxlength']) return 'El título no puede superar 80 caracteres.';
      break;
    case 'description':
      if (errors['required']) return 'La descripción es obligatoria.';
      if (errors['minlength']) return 'La descripción debe tener al menos 20 caracteres.';
      if (errors['maxlength']) return 'La descripción no puede superar 500 caracteres.';
      break;
    case 'status':
      if (errors['required'] || errors['pattern']) return 'Selecciona un estado válido.';
      break;
    case 'priority':
      if (errors['required'] || errors['pattern']) return 'Selecciona una prioridad válida.';
      break;
    case 'assignee':
      if (errors['required']) return 'El responsable es obligatorio.';
      if (errors['minlength']) return 'El responsable debe tener al menos 3 caracteres.';
      break;
    case 'dueDate':
      if (errors['required']) return 'La fecha límite es obligatoria.';
      if (errors['pastDate']) return 'La fecha no puede ser anterior a hoy.';
      break;
    case 'tagsInput':
      if (errors['invalidTags']) return 'Usa etiquetas separadas por coma (letras, números o guiones).';
      break;
  }

  return 'Valor inválido.';
}
