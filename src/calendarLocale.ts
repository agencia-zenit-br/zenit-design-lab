/** Independent regional presentation settings for the reusable Gregorian date/time component.
 *  Future Hebrew/Hijri engines must provide their own civil-calendar arithmetic. */
export type CalendarLanguage = 'es-ES' | 'pt-BR' | 'en-US' | 'he-IL' | 'ar-SA';
export type CalendarSystem = 'gregory' | 'hebrew' | 'islamic';
export type HourCycle = 'h12' | 'h23';
export type WeekStart = 1 | 6 | 7; // Monday, Saturday, Sunday (ISO day numbers)
export type WeekStartPreference = 'auto' | 'monday' | 'saturday' | 'sunday';
export type DirectionPreference = 'auto' | 'ltr' | 'rtl';
export type WeekdayHeader = { isoDay: number; short: string; full: string };
export type RegionalSettings = {
  locale: CalendarLanguage;
  calendarSystem: CalendarSystem;
  weekStart: WeekStartPreference;
  hourCycle: HourCycle;
  timeZone: string;
  direction: DirectionPreference;
};

export const defaultRegionalSettings: RegionalSettings = {
  locale: 'es-ES',
  calendarSystem: 'gregory',
  weekStart: 'auto',
  hourCycle: 'h23',
  timeZone: 'America/Sao_Paulo',
  direction: 'auto',
};

export const localeOptions: readonly { value: CalendarLanguage; label: string }[] = [
  { value:'es-ES', label:'Español' },
  { value:'pt-BR', label:'Português (Brasil)' },
  { value:'en-US', label:'English (US)' },
  { value:'he-IL', label:'עברית' },
  { value:'ar-SA', label:'العربية' },
];

/** Compact initials intentionally repeat where language orthography requires it.
 * Spanish Tuesday and Wednesday MUST both use M, never X for Wednesday. */
const compactLabels: Record<string, readonly string[]> = {
  es: ['L','M','M','J','V','S','D'],
  pt: ['S','T','Q','Q','S','S','D'],
  en: ['M','T','W','T','F','S','S'],
};

export function defaultWeekStart(locale: string): WeekStart {
  try {
    const regionalLocale = new Intl.Locale(locale) as Intl.Locale & { weekInfo?: { firstDay?: number } };
    const day = regionalLocale.weekInfo?.firstDay;
    if (day === 1 || day === 6 || day === 7) return day;
  } catch { /* The runtime may not support weekInfo; use safe fallback. */ }
  return /^(en-US|pt-BR|he-IL|ar-SA|ar-EG)/i.test(locale) ? 7 : 1;
}

export function resolveWeekStart(settings: Pick<RegionalSettings,'locale'|'weekStart'>): WeekStart {
  if (settings.weekStart === 'monday') return 1;
  if (settings.weekStart === 'saturday') return 6;
  if (settings.weekStart === 'sunday') return 7;
  return defaultWeekStart(settings.locale);
}

export function resolveDirection(settings: Pick<RegionalSettings,'locale'|'direction'>): 'ltr'|'rtl' {
  if (settings.direction !== 'auto') return settings.direction;
  return /^(he|ar)(-|$)/i.test(settings.locale) ? 'rtl' : 'ltr';
}

export function calendarWeekdays(locale: string, weekStart: WeekStart = defaultWeekStart(locale)): WeekdayHeader[] {
  const code = locale.split('-')[0].toLowerCase();
  const names = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC', calendar: 'gregory' });
  const narrow = new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC', calendar: 'gregory' });
  return Array.from({ length: 7 }, (_, index) => {
    const isoDay = (weekStart - 1 + index) % 7 + 1;
    const date = new Date(Date.UTC(2024, 0, isoDay)); // Monday, 1 January 2024
    return {
      isoDay,
      short: compactLabels[code]?.[isoDay - 1] ?? narrow.format(date),
      full: names.format(date),
    };
  });
}

/** Preserves locale-specific lowercase month and connector (e.g. "noviembre de 2026").
 * No text-transform:capitalize is applied to the whole string. */
export function calendarMonthLabel(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long', year: 'numeric', timeZone: 'UTC', calendar: 'gregory'
  }).format(new Date(Date.UTC(year, month, 1)));
}

export function formatCivilDate(value: string, locale: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, y, m, d] = match;
  return new Intl.DateTimeFormat(locale,{dateStyle:'long',timeZone:'UTC',calendar:'gregory'})
    .format(new Date(Date.UTC(Number(y),Number(m)-1,Number(d))));
}

export function formatHour(hour24: number, minute: number, settings: Pick<RegionalSettings,'locale'|'hourCycle'>): string {
  const instant = new Date(Date.UTC(2026,9,17,hour24,minute));
  return new Intl.DateTimeFormat(settings.locale,{
    hour:'numeric',minute:'2-digit',hourCycle:settings.hourCycle,timeZone:'UTC'
  }).format(instant);
}

/** Only format *real instants* across timezones. Civil dates themselves remain timezone-free. */
export function formatInstantInZone(instantISO: string, settings: RegionalSettings): string {
  return new Intl.DateTimeFormat(settings.locale,{
    dateStyle:'medium',timeStyle:'short',hourCycle:settings.hourCycle,timeZone:settings.timeZone,
    calendar:'gregory'
  }).format(new Date(instantISO));
}

const allowed = {
  locale:new Set<CalendarLanguage>(localeOptions.map(item=>item.value)),
  calendarSystem:new Set<CalendarSystem>(['gregory','hebrew','islamic']),
  weekStart:new Set<WeekStartPreference>(['auto','monday','saturday','sunday']),
  hourCycle:new Set<HourCycle>(['h12','h23']),
  direction:new Set<DirectionPreference>(['auto','ltr','rtl']),
};

/** Validate every deserialized value; localStorage is not an authorization or account setting. */
export function validRegionalSettings(value: unknown): RegionalSettings {
  if (!value || typeof value !== 'object') return {...defaultRegionalSettings};
  const input=value as Partial<Record<keyof RegionalSettings,unknown>>;
  const output={...defaultRegionalSettings};
  for (const field of ['locale','calendarSystem','weekStart','hourCycle','direction'] as const) {
    const item = input[field];
    if(typeof item==='string' && (allowed[field] as Set<string>).has(item))
      (output as unknown as Record<string,string>)[field]=item;
  }
  if (typeof input.timeZone === 'string' && input.timeZone.length < 120) {
    try { new Intl.DateTimeFormat('en-US',{timeZone:input.timeZone}); output.timeZone=input.timeZone; }
    catch { /* Invalid time-zone identifiers never enter active preferences. */ }
  }
  return output;
}
