/** Shared weekday names and labels: locale and week origin are independent settings.
 *  ISO: 1 = Monday ... 7 = Sunday. Calendar system/timezone are configured separately. */
export type WeekStart = 1 | 7;
export type CalendarLanguage = 'es-ES' | 'pt-BR' | 'en-US' | 'he-IL' | 'ar-SA';
export type WeekdayHeader = { isoDay: number; short: string; full: string };

const compactLabels: Record<string, readonly string[]> = {
  es: ['L','M','M','J','V','S','D'],
  pt: ['S','T','Q','Q','S','S','D'],
  en: ['M','T','W','T','F','S','S'],
};

export function defaultWeekStart(locale: string): WeekStart {
  // A product setting may override this; use locale-aware defaults for the demo.
  return /^(en-US|pt-BR|he-IL|ar-SA|ar-EG)/i.test(locale) ? 7 : 1;
}

export function calendarWeekdays(locale: string, weekStart: WeekStart = defaultWeekStart(locale)): WeekdayHeader[] {
  const code = locale.split('-')[0].toLowerCase();
  const names = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  const narrow = new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' });
  return Array.from({ length: 7 }, (_, index) => {
    const isoDay = (weekStart - 1 + index) % 7 + 1;
    const date = new Date(Date.UTC(2024, 0, isoDay)); // 2024-01-01 was Monday
    return {
      isoDay,
      short: compactLabels[code]?.[isoDay - 1] ?? narrow.format(date),
      full: names.format(date),
    };
  });
}

export function calendarMonthLabel(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month, 1)));
}
