import { useState } from 'react';
import { Button } from './components';
import { ZenitSelect, type ZenitOption } from './ZenitSelect';
import { CalendarSpecimen } from './CalendarSpecimen';
import { ContextHelp } from './ContextHelp';
import { CivilDateField } from './temporal/CivilDateField';
import { TimeInput, type TimePresentation } from './temporal/TimeInput';
import { formatCivilDate, type RegionalSettings } from './calendarLocale';
import {
  dateRangeMetrics,formatEditableTime,normalizeMultiDates,timeRangeDuration,
  type CivilDate,type TimeOfDay,
} from './temporal/core';

type PickerMode = 'date'|'range'|'multidate'|'datetime'|'time'|'timerange';
const pickerOptions: readonly ZenitOption<PickerMode>[] = [
  {value:'date',label:'Fecha'},
  {value:'range',label:'Rango de fechas'},
  {value:'multidate',label:'Varios días'},
  {value:'datetime',label:'Fecha y hora'},
  {value:'time',label:'Hora'},
  {value:'timerange',label:'Intervalo horario'},
];
const presentationOptions:readonly ZenitOption<TimePresentation>[]=[
  {value:'hybrid',label:'Selector y escritura'},
  {value:'wheel',label:'Selector vertical'},
  {value:'text',label:'Solo escritura'},
];
const defaultTime:TimeOfDay={hour:14,minute:30,second:0};
const defaultEnd:TimeOfDay={hour:16,minute:0,second:0};
const exampleStart='2026-10-17';
const startBounds='2026-01-01',endBounds='2028-12-31';

/** Product-neutral controlled date/time showcase: calendar, wheel and manual input
 * consume one pure validation core. Business use cases interpret its results. */
export function DateTimeDemo({settings}:{settings:RegionalSettings}) {
  const [mode,setMode]=useState<PickerMode>('date');
  const [date,setDate]=useState<CivilDate>(exampleStart);
  const [rangeStart,setRangeStart]=useState<CivilDate|null>(null);
  const [rangeEnd,setRangeEnd]=useState<CivilDate|null>(null);
  const [dates,setDates]=useState<readonly CivilDate[]>([]);
  const [time,setTime]=useState<TimeOfDay>(defaultTime);
  const [endTime,setEndTime]=useState<TimeOfDay>(defaultEnd);
  const [presentation,setPresentation]=useState<TimePresentation>('hybrid');
  const [seconds,setSeconds]=useState(false);
  const [allowNextDay,setAllowNextDay]=useState(false);
  const [notice,setNotice]=useState('');
  const isRange=mode==='range',isMultiple=mode==='multidate';
  const isCalendar=mode==='date'||isRange||isMultiple||mode==='datetime';
  const isClock=mode==='time'||mode==='datetime'||mode==='timerange';
  const isTimeRange=mode==='timerange';
  const calendarSupported=settings.calendarSystem==='gregory';
  const rangeMetrics=rangeStart&&rangeEnd?dateRangeMetrics(rangeStart,rangeEnd):null;
  const timeMetrics=isTimeRange?timeRangeDuration(time,endTime,allowNextDay):null;
  const selectDate=(iso:string)=>{
    setNotice('');
    if(isMultiple){
      setDates(previous=>{
        const result=normalizeMultiDates(previous.includes(iso)?previous.filter(item=>item!==iso):[...previous,iso]);
        return result.ok?result.value:previous;
      });
      return;
    }
    if(!isRange){setDate(iso);return;}
    if(!rangeStart||rangeEnd||iso<rangeStart){setRangeStart(iso);setRangeEnd(null);}
    else setRangeEnd(iso);
  };
  const clearSelection=()=>{
    setNotice('');
    if(isRange){setRangeStart(null);setRangeEnd(null);}
    else if(isMultiple)setDates([]);
    else if(isTimeRange){setTime(defaultTime);setEndTime(defaultEnd);setAllowNextDay(false);}
    else {setDate(exampleStart);setTime(defaultTime);}
  };
  const selectionError=isCalendar&&!calendarSupported?'Motor de calendario no implementado':
    isRange&&!rangeStart||isRange&&!rangeEnd?'Selecciona ambas fechas del rango':
    isRange&&rangeMetrics&&!rangeMetrics.ok?rangeMetrics.error:
    isMultiple&&dates.length===0?'Selecciona uno o más días':
    isTimeRange&&timeMetrics&&!timeMetrics.ok?timeMetrics.error:'';
  const validate=()=>{
    if(selectionError){setNotice(selectionError);return;}
    setNotice('Selección validada en el laboratorio. No se ha guardado ni programado ningún evento.');
  };
  const dateText=isRange ?
    (rangeStart?formatCivilDate(rangeStart,settings.locale):'Sin fecha inicial')+' — '+
    (rangeEnd?formatCivilDate(rangeEnd,settings.locale):'Sin fecha final'):
    isMultiple?dates.map(value=>formatCivilDate(value,settings.locale)).join(' · ')||'Sin selección':
    formatCivilDate(date,settings.locale);
  const showHour=()=>{
    const props={hourCycle:settings.hourCycle,showSeconds:seconds,presentation};
    if(isTimeRange)return <div className="datetime-demo__time-range">
      <TimeInput label="Hora inicial" value={time} onChange={setTime} {...props}/>
      <TimeInput label="Hora final" value={endTime} onChange={setEndTime} {...props}/>
    </div>;
    return <TimeInput label="Hora" value={time} onChange={setTime} {...props}/>;
  };
  const total=timeMetrics&&timeMetrics.ok?timeMetrics.value:null;
  const durationText=total?
    [total.days?total.days+' d':null,total.hours+' h',total.minutes+' min',seconds?total.seconds+' s':null]
      .filter(Boolean).join(' '):null;
  return <div className="datetime-demo" data-temporal-mode={mode}>
    <div className="datetime-demo__controls">
      <ZenitSelect<PickerMode> label="Modo del selector" className="datetime-demo__mode"
        value={mode} options={pickerOptions}
        onChange={value=>{setMode(value);setNotice('');}}/>
      {isClock&&<div className="datetime-demo__preferences">
        <ZenitSelect<TimePresentation> label="Presentación" className="datetime-demo__presentation"
          value={presentation} options={presentationOptions} onChange={setPresentation}/>
        <label className="datetime-demo__checkbox">
          <input type="checkbox" checked={seconds}
            onChange={event=>setSeconds(event.target.checked)}/> Segundos
        </label>
        {isTimeRange&&<label className="datetime-demo__checkbox">
          <input type="checkbox" checked={allowNextDay}
            onChange={event=>setAllowNextDay(event.target.checked)}/> Termina al día siguiente
        </label>}
        <ContextHelp label="Cómo se calculan los intervalos horarios">
          El intervalo usa horas de reloj. Para eventos programados con zonas horarias y cambios de horario de verano será necesaria una conversión validada a instantes reales.
        </ContextHelp>
      </div>}
    </div>
    {isCalendar&&calendarSupported&&
      <div className="datetime-demo__date-fields">
        {isRange?<>
          <CivilDateField label="Fecha inicial" value={rangeStart} locale={settings.locale}
            minDate={startBounds} maxDate={endBounds} nullable onChange={setRangeStart}/>
          <CivilDateField label="Fecha final" value={rangeEnd} locale={settings.locale}
            minDate={startBounds} maxDate={endBounds} nullable onChange={setRangeEnd}/>
        </>:!isMultiple?
          <CivilDateField label="Fecha" value={date} locale={settings.locale}
            minDate={startBounds} maxDate={endBounds}
            onChange={value=>{if(value)setDate(value);}}/>:null}
      </div>}
    {isCalendar&&<div className="datetime-demo__calendar">
      <CalendarSpecimen settings={settings} selectedDate={isRange||isMultiple?null:date}
        selectedDates={isMultiple?dates:[]} startDate={isRange?rangeStart:null}
        endDate={isRange?rangeEnd:null} onSelectDate={selectDate}
        minDate={startBounds} maxDate={endBounds}/>
    </div>}
    {isClock&&<div className="datetime-demo__clock">{showHour()}</div>}
    <div className="datetime-demo__summary" role="status" aria-live="polite">
      <div className="datetime-demo__summary-head">
        <strong>Resultado de la selección</strong>
        <ContextHelp label="Acerca de fechas civiles y tiempo real">
          Las fechas civiles no son instantes UTC. Los intervalos horarios mostrados son horas de reloj;
          horarios de verano, eventos reales y reglas comerciales requieren validación específica del producto.
        </ContextHelp>
      </div>
      {isCalendar&&<p>{calendarSupported?dateText:'Calendario pendiente de implementación'}</p>}
      {isRange&&rangeMetrics?.ok&&<div className="datetime-demo__metrics">
        <span><strong>{rangeMetrics.value.inclusiveDays}</strong> días incluidos</span>
        <span><strong>{rangeMetrics.value.elapsedDays}</strong> días transcurridos</span>
        <span><strong>{rangeMetrics.value.nights}</strong> noches (ejemplo alojamiento)</span>
      </div>}
      {isMultiple&&<p><strong>{dates.length}</strong> días individuales seleccionados</p>}
      {isClock&&<p>{formatEditableTime(time,settings.hourCycle,seconds)}
        {isTimeRange&&' — '+formatEditableTime(endTime,settings.hourCycle,seconds)}</p>}
      {isTimeRange&&<p className="datetime-demo__duration">
        {durationText?'Duración: '+durationText:(timeMetrics&&!timeMetrics.ok?timeMetrics.error:'')}
      </p>}
    </div>
    <div className="datetime-demo__actions">
      <Button variant="secondary" onClick={clearSelection}>Limpiar selección</Button>
      <Button size="standard" disabled={Boolean(selectionError)} onClick={validate}>Validar selección</Button>
      <span role="status" className="datetime-demo__message">{notice}</span>
    </div>
  </div>;
}
