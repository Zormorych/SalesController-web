// Fecha de hoy en el formato que usan el backend y los <input type="date">: "2026-10-20" (hora local)
export function today(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
