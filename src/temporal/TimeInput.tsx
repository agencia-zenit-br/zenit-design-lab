import { useEffect, useRef, useState, type TouchEvent, type WheelEvent } from 'react';
import { Icon } from './Icon';
import { formatEditableTime, parseTimeOfDay, type TimeOfDay } from './temporal/core';
import type { HourCycle } from './calendarLocale';

export type TimePresentation = 'wheel' | 'text' | 'hybrid';
type TimeInputProps = {
  label:string;
  value:TimeOfDay;
  onChange:(value:TimeOfDay)=>void;
  hourCycle:HourCycle;
  showSeconds?:boolean;
  presentation?:TimePresentation;
  disabled?:boolean;
  minuteStep?:number;
  secondStep?:number;
};
type TimeUnit = 'hour'|'minute'|'second';
const pad=(value:number)=>String(value).padStart(2,'0');

function TimeWheel({value,onChange,hourCycle,showSeconds,minuteStep,secondStep}:{
  value:TimeOfDay;onChange:(value:TimeOfDay)=>void;hourCycle:HourCycle;
  showSeconds:boolean;minuteStep:number;secondStep:number;
}) {
  const touches=useRef<Record<string,number>>({});
  const values:{type:TimeUnit;title:string;step:number}[]=[
    {type:'hour',title:'Hora',step:1},{type:'minute',title:'Minutos',step:minuteStep},
    ...(showSeconds?[{type:'second' as const,title:'Segundos',step:secondStep}]:[]),
  ];
  const period=value.hour>=12?'PM':'AM';
  const change=(type:TimeUnit,delta:number)=>{
    const base=value[type], max=type==='hour'?24:60;
    const next=((base+delta)%max+max)%max;
    onChange({...value,[type]:next});
  };
  const display=(type:TimeUnit,n:number)=>{
    if(type==='hour'&&hourCycle==='h12')return pad(n%12||12);
    return pad(n);
  };
  const makeWheel=(type:TimeUnit,title:string,step:number)=>{
    const base=value[type],max=type==='hour'?24:60;
    const previous=((base-step)%max+max)%max;
    const next=(base+step)%max;
    const wheel=(event:WheelEvent<HTMLDivElement>)=>{
      if(event.deltaY) {
        event.preventDefault();
        change(type,event.deltaY>0?step:-step);
      }
    };
    const start=(event:TouchEvent<HTMLDivElement>)=>{
      touches.current[type]=event.changedTouches[0]?.clientY??0;
    };
    const end=(event:TouchEvent<HTMLDivElement>)=>{
      const startY=touches.current[type],endY=event.changedTouches[0]?.clientY;
      if(startY===undefined||endY===undefined)return;
      const difference=endY-startY;
      if(Math.abs(difference)>18)change(type,difference<0?step:-step);
      delete touches.current[type];
    };
    return <div key={type} className="temporal-wheel__unit" data-time-unit={type}>
      <span className="temporal-wheel__label">{title}</span>
      <div className="temporal-wheel__track" onWheel={wheel} onTouchStart={start} onTouchEnd={end}>
        <button type="button" className="temporal-wheel__adjacent"
          aria-label={`Valor anterior de ${title}`} onClick={()=>change(type,-step)}>
          {display(type,previous)}
        </button>
        <button type="button" className="temporal-wheel__active" aria-label={`${title}: ${display(type,base)}. Flecha arriba o abajo para ajustar`}
          role="spinbutton" aria-valuemin={0} aria-valuemax={max-1} aria-valuenow={base}
          aria-valuetext={display(type,base)}
          onKeyDown={event=>{
            if(event.key==='ArrowUp'){event.preventDefault();change(type,step);}
            if(event.key==='ArrowDown'){event.preventDefault();change(type,-step);}
            if(event.key==='PageUp'){event.preventDefault();change(type,step*5);}
            if(event.key==='PageDown'){event.preventDefault();change(type,-step*5);}
            if(event.key==='Home'){event.preventDefault();onChange({...value,[type]:0});}
            if(event.key==='End'){event.preventDefault();onChange({...value,[type]:max-1});}
          }}>
          {display(type,base)}
        </button>
        <button type="button" className="temporal-wheel__adjacent"
          aria-label={`Valor siguiente de ${title}`} onClick={()=>change(type,step)}>
          {display(type,next)}
        </button>
      </div>
    </div>;
  };
  return <div className="temporal-wheel" aria-label="Selector vertical de hora">
    <div className="temporal-wheel__values">
      {values.map((item,i)=><div className="temporal-wheel__segment" key={item.type}>
        {i>0&&<span className="temporal-wheel__colon" aria-hidden="true">:</span>}
        {makeWheel(item.type,item.title,item.step)}
      </div>)}
    </div>
    {hourCycle==='h12'&&
      <div className="temporal-wheel__period" role="group" aria-label="Período horario">
        {(['AM','PM'] as const).map(item=><button key={item} type="button"
          className={`temporal-wheel__period-button ${period===item?'temporal-wheel__period-button--active':''}`}
          aria-pressed={period===item} onClick={()=>onChange({...value,hour:value.hour%12+(item==='PM'?12:0)})}>{item}</button>)}
      </div>}
  </div>;
}

/** Controlled presentation adapter. Wheel and text share one time value, no duplicated parsing rules. */
export function TimeInput({
  label,value,onChange,hourCycle,showSeconds=false,presentation='hybrid',disabled=false,
  minuteStep=1,secondStep=1,
}:TimeInputProps) {
  const [draft,setDraft]=useState(()=>formatEditableTime(value,hourCycle,showSeconds));
  const [error,setError]=useState('');
  useEffect(()=>{
    setDraft(formatEditableTime(value,hourCycle,showSeconds));
    setError('');
  },[value.hour,value.minute,value.second,hourCycle,showSeconds]);
  const commit=()=>{
    const parsed=parseTimeOfDay(draft,hourCycle);
    if(!parsed.ok){setError(parsed.error);return;}
    if(parsed.value.minute%minuteStep!==0||parsed.value.second%secondStep!==0){
      setError('El valor no coincide con el intervalo configurado.');
      return;
    }
    if(!showSeconds&&parsed.value.second!==0){
      setError('Habilita los segundos antes de introducirlos.');
      return;
    }
    setError('');
    onChange(parsed.value);
    setDraft(formatEditableTime(parsed.value,hourCycle,showSeconds));
  };
  return <div className="temporal-time-input" data-time-input={presentation}>
    {presentation!=='wheel'&&
      <label className="temporal-time-input__field">
        <span>{label}</span>
        <input type="text" inputMode="text" autoComplete="off" spellCheck={false}
          value={draft} disabled={disabled}
          placeholder={hourCycle==='h12'?'02:30 PM':'14:30'}
          aria-invalid={Boolean(error)}
          aria-describedby={error?`${label.replace(/\s/g,'-')}-time-error`:undefined}
          onChange={event=>{setDraft(event.target.value);setError('');}}
          onBlur={commit}
          onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();commit();}}}/>
      </label>}
    {presentation!=='text'&&!disabled&&
      <TimeWheel value={value} onChange={onChange} hourCycle={hourCycle}
        showSeconds={showSeconds} minuteStep={minuteStep} secondStep={secondStep}/>}
    {error&&<small id={`${label.replace(/\s/g,'-')}-time-error`} className="temporal-time-input__error" role="alert">{error}</small>}
  </div>;
}
