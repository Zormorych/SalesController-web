import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, from, Observable, of, throwError } from 'rxjs';
import { problemMessage } from './problem';

// Para las peticiones que muestran su propio error (por ejemplo, la comprobación del backend en Inicio)
export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);

// Muestra en un aviso el error del backend en español y lo deja pasar para que quien llama pueda reaccionar
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const snackBar = inject(MatSnackBar);
  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && !request.context.get(SILENT_ERRORS)) {
        errorBody(error.error).subscribe((body) =>
          snackBar.open(problemMessage(body), 'Cerrar', { duration: 8000 }),
        );
      }
      return throwError(() => error);
    }),
  );
};

// En las descargas (el Excel) el error llega como fichero: hay que leerlo para sacar el JSON
function errorBody(body: unknown): Observable<unknown> {
  if (!(body instanceof Blob)) {
    return of(body);
  }
  return from(
    body.text().then((text) => {
      try {
        return JSON.parse(text) as unknown;
      } catch {
        return null;
      }
    }),
  );
}
