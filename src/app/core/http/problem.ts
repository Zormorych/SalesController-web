// Error que devuelve el backend (RFC 9457 ProblemDetail), con los textos en español
export interface Problem {
  title?: string;
  detail?: string;
  status?: number;
  // Solo en los 400 de validación: un mensaje por campo
  errors?: { field: string; message: string }[];
}

const UNREACHABLE = 'No se puede conectar con el backend. Inténtalo de nuevo.';

// Texto para el usuario: los mensajes de cada campo si los hay; si no, el detalle o el título
export function problemMessage(body: unknown): string {
  if (!body || typeof body !== 'object') {
    return UNREACHABLE;
  }
  const problem = body as Problem;
  if (problem.errors?.length) {
    return problem.errors.map((error) => error.message).join('. ');
  }
  return problem.detail ?? problem.title ?? UNREACHABLE;
}
