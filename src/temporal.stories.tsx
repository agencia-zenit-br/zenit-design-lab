import { useState } from 'react';
import { TimeInput, type TimePresentation } from './temporal/TimeInput';
import { CivilDateField } from './temporal/CivilDateField';
import { PortabilityDemo } from './temporal/PortabilityDemo';
import { DateTimeDemo } from './DateTimeDemo';
import { TemporalDemo } from './TemporalDemo';
import { defaultRegionalSettings } from './calendarLocale';
import type { TimeOfDay } from './temporal/core';
import './styles.css';

function TimeHost({presentation,withSeconds=false}:{presentation:TimePresentation;withSeconds?:boolean}) {
  const [value,setValue]=useState<TimeOfDay>({hour:14,minute:30,second:45});
  return <div className="temporal-host temporal-host--zenit" style={{maxWidth:420,margin:20}}>
    <TimeInput label="Hora compartida" value={value} onChange={setValue}
      presentation={presentation} hourCycle="h23" showSeconds={withSeconds}/>
  </div>;
}
function DateHost() {
  const [date,setDate]=useState<string|null>('2026-11-15');
  return <div className="temporal-host temporal-host--zenit" style={{maxWidth:330,margin:20}}>
    <CivilDateField label="Fecha operativa" value={date} onChange={setDate} nullable locale="es-ES"/>
  </div>;
}

export default {title:'Zenit/Temporal Core universal',tags:['autodocs']};
export const SelectorVertical = ()=><TimeHost presentation="wheel" withSeconds/>;
export const EntradaManual = ()=><TimeHost presentation="text" withSeconds/>;
export const EntradaCombinada = ()=><TimeHost presentation="hybrid" />;
export const FechaEditable = ()=><DateHost/>;
export const CalendarioYIntervalos = ()=><div className="lab" data-theme="light" style={{padding:16,maxWidth:900}}><DateTimeDemo settings={defaultRegionalSettings}/></div>;
export const CountdownYTemporizador = ()=><div className="lab" data-theme="light" style={{padding:16,maxWidth:900}}><TemporalDemo/></div>;
export const SkinsSinCambiarMotor = ()=><PortabilityDemo settings={defaultRegionalSettings}/>;
