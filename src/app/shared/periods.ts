// Periodos de fechas para los informes, como texto "2026-10-01" (hora local)
export interface Period {
  from: string;
  to: string;
}

function iso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// El día 0 del mes siguiente es el último día de este mes
function month(year: number, monthIndex: number): Period {
  return { from: iso(new Date(year, monthIndex, 1)), to: iso(new Date(year, monthIndex + 1, 0)) };
}

export function thisMonth(today = new Date()): Period {
  return month(today.getFullYear(), today.getMonth());
}

export function lastMonth(today = new Date()): Period {
  return month(today.getFullYear(), today.getMonth() - 1);
}

export function thisYear(today = new Date()): Period {
  return { from: `${today.getFullYear()}-01-01`, to: `${today.getFullYear()}-12-31` };
}
