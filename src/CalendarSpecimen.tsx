import { useState } from 'react';
import { Icon } from './Icon';
import {
  calendarMonthLabel, calendarWeekdays, defaultRegionalSettings, resolveDirection,
  resolveWeekStart, type RegionalSettings,
} from './calendarLocale';

type CalendarSpecimenProps = {
  settings?: RegionalSettings;
  selectedDate?: string | null;
  selectedDates?: readonly string[];
  startDate?: string | null;
  endDate?: string | null;
  onSelectDate?: (dateISO: string) => void;
  minDate?: string;
  maxDate?: string;
};

/** A reusable compact Gregorian day grid, with preferences as independent inputs.
 * Hebrew and Hijri civil-date engines are explicitly deferred, NOT simulated by translation. */
export function CalendarSpecimen({
  settings = defaultRegionalSettings,
  selectedDate,
  selectedDates = [],
  startDate,
  endDate,
  onSelectDate,
  minDate,
  maxDate,
}: CalendarSpecimenProps) {
  const [monthKey,setMonthKey] = useState(2026 * 12 + 9);
  const [internalSelected,setInternalSelected] = useState<string | null>('2026-10-17');
  const year = Math.floor(monthKey / 12);
  const month = ((monthKey % 12) + 12) % 12;
  const weekdays = calendarWeekdays(settings.locale,resolveWeekStart(settings));
  const firstDay = new Date(Date.UTC(year,month,1)).getUTCDay();
  const origin = resolveWeekStart(settings) % 7; // Sunday=0, Monday=1, Saturday=6
  const offset = (firstDay - origin + 7) % 7;
  const days = new Date(Date.UTC(year,month+1,0)).getUTCDate();
  const formatLong = new Intl.DateTimeFormat(settings.locale,{
    dateStyle:'full',timeZone:'UTC',calendar:'gregory'
  });
  const direction = resolveDirection(settings);
  const active = selectedDate === undefined ? internalSelected : selectedDate;
  const isSupported = settings.calendarSystem === 'gregory';
  const select = (iso: string) => {
    if (onSelectDate) onSelectDate(iso);
    else setInternalSelected(iso);
  };
  const label=calendarMonthLabel(year,month,settings.locale);

  return <div className="calendar-specimen" dir={direction} data-calendar-system={settings.calendarSystem}>
    {!isSupported ?
      <div className="calendar-specimen__unavailable" role="status">
        <Icon name="calendar" size={21}/>
        <strong>{settings.calendarSystem==='hebrew'?'Calendario hebreo':'Calendario islámico / Hijri'}</strong>
        <span>Motor de fechas pendiente de implementación. No se sustituyen sus fechas por una cuadrícula gregoriana.</span>
      </div> :
      <>
        <div className="calendar-specimen__month-control">
          <button type="button" className="icon-button calendar-specimen__year-step" aria-label="Año anterior"
            onClick={()=>setMonthKey(value=>value-12)}><Icon name="chevron-left" size={13}/><Icon name="chevron-left" size={13}/></button>
          <button type="button" className="icon-button" aria-label="Mes anterior"
            onClick={()=>setMonthKey(value=>value-1)}><Icon name="chevron-left" size={17}/></button>
          <strong className="calendar-specimen__month">{label}</strong>
          <button type="button" className="icon-button" aria-label="Mes siguiente"
            onClick={()=>setMonthKey(value=>value+1)}><Icon name="chevron-right" size={17}/></button>
          <button type="button" className="icon-button calendar-specimen__year-step" aria-label="Año siguiente"
            onClick={()=>setMonthKey(value=>value+12)}><Icon name="chevron-right" size={13}/><Icon name="chevron-right" size={13}/></button>
        </div>
        <div className="zenit-calendar" role="group" aria-label={label} data-week-start={resolveWeekStart(settings)}>
          <div className="zenit-calendar__weekdays">
            {weekdays.map(day=><abbr className="zenit-calendar__weekday" key={day.isoDay}
              title={day.full} aria-label={day.full}>{day.short}</abbr>)}
          </div>
          <div className="zenit-calendar__days">
            {Array.from({length:offset},(_,i)=><span aria-hidden="true" key={`blank-${i}`}/>)}
            {Array.from({length:days},(_,i)=>{
              const day=i+1;
              const iso=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const accessible=formatLong.format(new Date(Date.UTC(year,month,day)));
              const disabled=Boolean(minDate&&iso<minDate||maxDate&&iso>maxDate);
              const inRange=Boolean(startDate&&endDate&&iso>=startDate&&iso<=endDate);
              const selected=active===iso||selectedDates.includes(iso)||startDate===iso||endDate===iso;
              return <button className={`zenit-calendar__day ${selected?'zenit-calendar__day--selected':''} ${inRange?'zenit-calendar__day--in-range':''}`}
                type="button" key={iso} data-calendar-day={day} data-calendar-iso={iso}
                aria-label={accessible} aria-pressed={selected}
                title={accessible} disabled={disabled} onClick={()=>select(iso)}>{day}</button>;
            })}
          </div>
        </div>
      </>}
  </div>;
}
