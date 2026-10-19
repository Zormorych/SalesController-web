import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, Provider } from '@angular/core';

// Fechas, números e importes en formato español: 1.234,50 €. Lo usan la app y los tests de componentes
export function provideSpanishLocale(): Provider[] {
  registerLocaleData(localeEs);
  return [
    { provide: LOCALE_ID, useValue: 'es-ES' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' },
  ];
}
