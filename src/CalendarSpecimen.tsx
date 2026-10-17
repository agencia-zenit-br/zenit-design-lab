import { useState } from 'react';
import { Icon } from './Icon';
import { ZenitSelect, type ZenitOption } from './ZenitSelect';
import { calendarMonthLabel, calendarWeekdays, defaultWeekStart, type CalendarLanguage } from './calendarLocale';

const localeOptions: readonly ZenitOption<CalendarLanguage>[] = [
  {value:'es-ES',label:'Español'},
  {value:'pt-BR',label:'Português (BR)'},
  {value:'en-US',label:'English (US)'},
  {value:'he-IL',label:'עברית'},
  {value:'ar-SA',label:'العربية'},
];

/** Compact 03.15 calendar specimen, not a production date/time scheduling engine. */
export function CalendarSpecimen() {
  const [locale, setLocale] = useState<CalendarLanguage>('es-ES');
  const [monthKey, setMonthKey] = useState(2026 * 12 + 9);
  const [selected, setSelected] = useState<string | null>('2026-10-17');
  const year = Math.floor(monthKey / 12);
  const month = monthKey % 12;
  const weekdays = calendarWeekdays(locale);
  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const start = defaultWeekStart(locale) % 7;
  const offset = (firstDay - start + 7) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const formatLong = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone:'UTC' });
  const rtl = /^(he|ar)/.test(locale);
  return <div className="calendar-specimen" dir={rtl ? 'rtl' : 'ltr'}>
    <div className="calendar-specimen__toolbar">
      <ZenitSelect<CalendarLanguage> label="Idioma del calendario" value={locale} options={localeOptions} onChange={setLocale}/>
      <div className="calendar-specimen__month-control">
        <button type="button" className="icon-button" aria-label="Mes anterior" onClick={() => setMonthKey(value => value - 1)}>
          <Icon name="chevron-left" size={17}/>
        </button>
        <strong className="calendar-specimen__month">{calendarMonthLabel(year, month, locale)}</strong>
        <button type="button" className="icon-button" aria-label="Mes siguiente" onClick={() => setMonthKey(value => value + 1)}>
          <Icon name="chevron-right" size={17}/>
        </button>
      </div>
    </div>
    <div className="zenit-calendar" role="group" aria-label={calendarMonthLabel(year, month, locale)}>
      <div className="zenit-calendar__weekdays">
        {weekdays.map(day=><abbr className="zenit-calendar__weekday" key={day.isoDay} title={day.full} aria-label={day.full}>{day.short}</abbr>)}
      </div>
      <div className="zenit-calendar__days">
        {Array.from({length:offset},(_,i)=><span aria-hidden="true" key={`blank-${i}`}/>)}
        {Array.from({length:days},(_,i)=>{
          const day=i+1;
          const iso=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const accessible=formatLong.format(new Date(Date.UTC(year,month,day)));
          return <button className={`zenit-calendar__day ${selected===iso?'zenit-calendar__day--selected':''}`}
            type="button" key={iso} data-calendar-day={day} aria-label={accessible}
            aria-pressed={selected===iso} title={accessible} onClick={()=>setSelected(iso)}>{day}</button>;
        })}
      </div>
    </div>
  </div>;
}
