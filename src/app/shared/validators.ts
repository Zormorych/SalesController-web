import { AbstractControl, ValidationErrors } from '@angular/forms';

// Como @NotBlank del backend: un texto solo con espacios cuenta como vacío
export function notBlank(control: AbstractControl<string | null>): ValidationErrors | null {
  const value = control.value;
  return value !== null && value !== '' && value.trim() === '' ? { required: true } : null;
}
