import { lastMonth, thisMonth, thisYear } from './periods';

describe('periods', () => {
  const today = new Date(2026, 0, 15); // 15 de enero de 2026

  it('gives the first and last day of this month, last month and this year', () => {
    expect(thisMonth(today)).toEqual({ from: '2026-01-01', to: '2026-01-31' });
    expect(lastMonth(today)).toEqual({ from: '2025-12-01', to: '2025-12-31' });
    expect(thisYear(today)).toEqual({ from: '2026-01-01', to: '2026-12-31' });
  });

  it('knows how long February is', () => {
    expect(thisMonth(new Date(2028, 1, 10))).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });
});
