import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { problemMessage } from './problem';

// Para las peticiones que muestran su propio error (por ejemplo, la comprobación del backend en Inicio)
export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);

// Muestra en un aviso el error del backend en español y lo deja pasar para que quien llama pueda reaccionar
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const snackBar = inject(MatSnackBar);
  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && !request.context.get(SILENT_ERRORS)) {
        snackBar.open(problemMessage(error.error), 'Cerrar', { duration: 8000 });
      }
      return throwError(() => error);
    }),
  );
};
