import { useState } from 'react';
import { Button } from './components';
import { ZenitSelect, type ZenitOption } from './ZenitSelect';
import { CalendarSpecimen } from './CalendarSpecimen';
import { formatCivilDate, formatHour, type RegionalSettings } from './calendarLocale';

type PickerMode = 'date' | 'range' | 'datetime' | 'time';
const pickerOptions: readonly ZenitOption<PickerMode>[] = [
  {value:'date',label:'Fecha'},
  {value:'range',label:'Rango de fechas'},
  {value:'datetime',label:'Fecha y hora'},
  {value:'time',label:'Hora'},
];
const pad = (value: number) => String(value).padStart(2,'0');
const minutes: readonly ZenitOption<string>[] = Array.from({length:12},(_,i)=>{
  const val=pad(i*5);
  return {value:val,label:val};
});
const periodOptions: readonly ZenitOption<'AM'|'PM'>[] = [
  {value:'AM',label:'AM'},{value:'PM',label:'PM'}
];

/** Date-only values are civil dates. Clock fields store wall time, not unvalidated instants.
 *  Scheduled timezone conversion, ambiguous DST and non-Gregorian engines remain future work. */
export function DateTimeDemo({settings}:{settings:RegionalSettings}) {
  const [mode,setMode] = useState<PickerMode>('date');
  const [date,setDate] = useState('2026-10-17');
  const [rangeStart,setRangeStart] = useState<string|null>(null);
  const [rangeEnd,setRangeEnd] = useState<string|null>(null);
  const [hour,setHour] = useState(14);
  const [minute,setMinute] = useState(30);
  const [notice,setNotice] = useState('');
  const isCalendar = mode!=='time';
  const usesClock = mode==='datetime'||mode==='time';
  const isGregorian = settings.calendarSystem==='gregory';
  const isRange=mode==='range';
  const period: 'AM'|'PM' = hour>=12?'PM':'AM';
  const hourValue=settings.hourCycle==='h12'?pad((hour%12)||12):pad(hour);
  const hourOptions:readonly ZenitOption<string>[] =
    Array.from({length:settings.hourCycle==='h12'?12:24},(_,i)=>{
      const v=pad(settings.hourCycle==='h12'?i+1:i);
      return {value:v,label:v};
    });
  const pickHour=(value:string)=>{
    const n=Number(value);
    setHour(settings.hourCycle==='h12'?(n%12)+(period==='PM'?12:0):n);
    setNotice('');
  };
  const pickPeriod=(p:'AM'|'PM')=>{
    setHour(current=>(current%12)+(p==='PM'?12:0));
    setNotice('');
  };
  const selectDate=(value:string)=>{
    setNotice('');
    if (!isRange){setDate(value);return;}
    if(!rangeStart||rangeEnd||value<rangeStart){
      setRangeStart(value);setRangeEnd(null);
    } else {
      setRangeEnd(value);
    }
  };
  const dateText=isRange?
    (rangeStart?formatCivilDate(rangeStart,settings.locale):'Sin fecha inicial')+
    ' — '+(rangeEnd?formatCivilDate(rangeEnd,settings.locale):'Seleccione la fecha final')
    :formatCivilDate(date,settings.locale);
  const clockText=formatHour(hour,minute,settings);
  const validSelection=(!isCalendar||isGregorian)&&(!isRange||Boolean(rangeStart&&rangeEnd));
  const validate=()=>{
    if(!isGregorian&&isCalendar){
      setNotice('No es posible seleccionar fechas: el motor del calendario elegido está pendiente.');
      return;
    }
    if(isRange&&(!rangeStart||!rangeEnd)){
      setNotice('Selecciona ambas fechas para completar el rango.');
      return;
    }
    setNotice('Selección validada en el laboratorio. No se ha guardado ni programado ningún evento.');
  };

  return <div className="datetime-demo">
    <div className="datetime-demo__controls">
      <ZenitSelect<PickerMode> label="Modo del selector" className="datetime-demo__mode"
        value={mode} options={pickerOptions} onChange={value=>{setMode(value);setNotice('');}}/>
      {usesClock&&<div className="datetime-demo__clock">
        <ZenitSelect<string> label="Hora" value={hourValue} options={hourOptions} onChange={pickHour}/>
        <span className="datetime-demo__colon" aria-hidden="true">:</span>
        <ZenitSelect<string> label="Minuto" value={pad(minute)} options={minutes}
          onChange={value=>{setMinute(Number(value));setNotice('');}}/>
        {settings.hourCycle==='h12'&&
          <ZenitSelect<'AM'|'PM'> label="Período" value={period} options={periodOptions} onChange={pickPeriod}/>}
      </div>}
    </div>
    {isCalendar&&
      <div className="datetime-demo__calendar">
        <CalendarSpecimen settings={settings}
          selectedDate={isRange?null:date} startDate={isRange?rangeStart:null}
          endDate={isRange?rangeEnd:null} onSelectDate={selectDate}
          minDate="2026-01-01" maxDate="2027-12-31"/>
        {isGregorian&&<small>Demostración: selección entre enero de 2026 y diciembre de 2027.</small>}
      </div>}
    <div className="datetime-demo__summary" role="status" aria-live="polite">
      <strong>Resultado de la selección</strong>
      {isCalendar&&
        <p>{isGregorian?dateText:'No disponible hasta implementar el motor de fechas seleccionado.'}</p>}
      {usesClock&&<p>{clockText} · Formato {settings.hourCycle==='h12'?'12 h':'24 h'}</p>}
      <small>Zona horaria preferida: {settings.timeZone}. Esta demostración maneja fechas civiles y horas de pared, no convierte automáticamente horarios de eventos entre zonas.</small>
    </div>
    <div className="datetime-demo__actions">
      <Button size="standard" disabled={!validSelection} onClick={validate}>Validar selección</Button>
      <span role="status" className="datetime-demo__message">{notice}</span>
    </div>
  </div>;
}
