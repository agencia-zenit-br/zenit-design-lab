import { useState } from 'react';
import { TimeInput } from './TimeInput';
import { formatEditableTime,type TimeOfDay } from './core';
import type { RegionalSettings } from '../calendarLocale';

export function ZenitTimeConsumer({value,onChange,settings}:{
  value:TimeOfDay;onChange:(value:TimeOfDay)=>void;settings:RegionalSettings;
}) {
  return <section className="temporal-host temporal-host--zenit" data-temporal-host="zenit">
    <span className="temporal-host__brand">ZENIT / WORKFLOW</span>
    <h3>Hora de inicio</h3>
    <TimeInput label="Hora del proceso" value={value} onChange={onChange}
      hourCycle={settings.hourCycle} showSeconds={false} presentation="text"/>
  </section>;
}
export function ClientTimeConsumer({value,onChange,settings}:{
  value:TimeOfDay;onChange:(value:TimeOfDay)=>void;settings:RegionalSettings;
}) {
  return <section className="temporal-host temporal-host--client" data-temporal-host="client">
    <span className="temporal-host__brand">CLIENTE / HOTEL DEMO</span>
    <h3>Horario de llegada</h3>
    <TimeInput label="Hora de llegada" value={value} onChange={onChange}
      hourCycle={settings.hourCycle} showSeconds={false} presentation="text"/>
  </section>;
}

/** Two independent consumer wrappers reuse the same controlled value and pure validation.
 * Deliberately avoids importing either product's domain model into TimeInput. */
export function PortabilityDemo({settings}:{settings:RegionalSettings}) {
  const [value,setValue]=useState<TimeOfDay>({hour:14,minute:30,second:0});
  return <div className="temporal-portability">
    <div className="temporal-portability__hosts">
      <ZenitTimeConsumer value={value} onChange={setValue} settings={settings}/>
      <ClientTimeConsumer value={value} onChange={setValue} settings={settings}/>
    </div>
    <div className="temporal-portability__value" role="status">
      <span>Valor compartido:</span>
      <strong>{formatEditableTime(value,settings.hourCycle)}</strong>
    </div>
  </div>;
}
