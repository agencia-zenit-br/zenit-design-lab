import { useEffect, useMemo, useState } from 'react';
import { Button } from './components';
import { ContextHelp } from './ContextHelp';
import { ZenitSelect, type ZenitOption } from './ZenitSelect';
import { Icon } from './Icon';
import {
  countdownSnapshot,makeTimer,pauseTimer,resetTimer,startTimer,timerSnapshot,
  type DurationParts,type TimerSession,
} from './temporal/core';

const pad=(n:number)=>String(n).padStart(2,'0');
const initialTarget=()=>new Date(Date.now()+2*86400000+4*3600000).toISOString().replace(/\.\d{3}Z$/,'Z');
type DisplayMode='cards'|'compact'|'progress';
const displayOptions:readonly ZenitOption<DisplayMode>[]=[
  {value:'cards',label:'Tarjetas'},
  {value:'compact',label:'Compacto'},
  {value:'progress',label:'Progreso'},
];
const zero:DurationParts={days:0,hours:0,minutes:0,seconds:0,totalSeconds:0};
function DurationDisplay({parts,mode='cards',seconds=true,progress}:{
  parts:DurationParts;mode:DisplayMode;seconds?:boolean;progress?:number;
}) {
  const units=[{label:'Días',value:parts.days},{label:'Horas',value:parts.hours},
    {label:'Minutos',value:parts.minutes},...(seconds?[{label:'Segundos',value:parts.seconds}]:[])];
  const value=units.map(unit=>pad(unit.value)).join(':');
  if(mode==='compact')return <span className="temporal-duration__compact" aria-label={units.map(u=>u.value+' '+u.label.toLowerCase()).join(', ')}>{value}</span>;
  return <div className="temporal-duration" role="group" aria-label="Duración">
    <div className="temporal-duration__cells">
      {units.map(unit=><div className="temporal-duration__cell" key={unit.label}>
        <strong>{pad(unit.value)}</strong><span>{unit.label}</span>
      </div>)}
    </div>
    {mode==='progress'&&<div className="temporal-duration__progress">
      <div role="progressbar" aria-label="Porcentaje completado" aria-valuemin={0} aria-valuemax={100}
        aria-valuenow={Math.round(Math.max(0,Math.min(100,progress??0)))}
        className="temporal-duration__progress-track">
        <div style={{width:`${Math.max(0,Math.min(100,progress??0))}%`}}/>
      </div>
      <span>{Math.round(Math.max(0,Math.min(100,progress??0)))} %</span>
    </div>}
  </div>;
}
function useWallNow():number {
  const [now,setNow]=useState(()=>Date.now());
  useEffect(()=>{
    const refresh=()=>setNow(Date.now());
    const id=window.setInterval(refresh,500);
    document.addEventListener('visibilitychange',refresh);
    window.addEventListener('focus',refresh);
    return()=>{window.clearInterval(id);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('focus',refresh);};
  },[]);
  return now;
}

/** Countdown to explicit, offset-aware instant; derives each frame from target - Date.now. */
function CountdownDemo({now,display,showSeconds}:{
  now:number;display:DisplayMode;showSeconds:boolean;
}) {
  const [target,setTarget]=useState(initialTarget);
  const [base,setBase]=useState(()=>Date.now());
  const valid=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(target)&&
    Number.isFinite(Date.parse(target));
  const result=countdownSnapshot(valid?Date.parse(target):NaN,now);
  const baseTotal=valid?Math.max(0,Date.parse(target)-base):0;
  const remainingMs=valid?Math.max(0,Date.parse(target)-now):0;
  const progress=baseTotal===0?(result.state==='expired'?100:0):(1-remainingMs/baseTotal)*100;
  const quickSet=(hours:number)=>{
    setBase(Date.now());
    setTarget(new Date(Date.now()+hours*3600000).toISOString().replace(/\.\d{3}Z$/,'Z'));
  };
  return <div className="temporal-live-demo" data-temporal-counter="countdown">
    <div className="temporal-live-demo__quick">
      <Button variant="secondary" size="compact" onClick={()=>quickSet(1)}>En 1 hora</Button>
      <Button variant="secondary" size="compact" onClick={()=>quickSet(24)}>En 1 día</Button>
      <Button variant="secondary" size="compact" onClick={()=>quickSet(72)}>En 3 días</Button>
    </div>
    <label className="temporal-live-demo__field">
      <span>Instante de vencimiento (ISO, UTC u offset)</span>
      <input type="text" spellCheck={false} value={target}
        aria-label="Instante objetivo" aria-invalid={!valid}
        onChange={event=>{setTarget(event.target.value);setBase(Date.now());}}
        placeholder="2026-11-15T12:00:00Z"/>
    </label>
    {!valid&&<span className="temporal-error" role="alert">Introduce fecha, hora y zona explícita: 2026-11-15T12:00:00Z.</span>}
    <DurationDisplay parts={valid?result.remaining:zero} mode={display} seconds={showSeconds} progress={progress}/>
    <span className="temporal-live-demo__state" role="status" aria-live="off">
      {result.state==='pending'?'Tiempo restante':result.state==='expired'?'Plazo vencido':'Fecha objetivo inválida'}
    </span>
    <ContextHelp label="Cómo funciona la cuenta regresiva">
      El valor se calcula contra la fecha y hora de referencia, no restando un segundo por actualización. Se recalcula al volver de una pestaña suspendida. Este ejemplo no cancela ni confirma operaciones.
    </ContextHelp>
  </div>;
}
function TimerDemo({now,display,showSeconds}:{
  now:number;display:DisplayMode;showSeconds:boolean;
}) {
  const [duration,setDuration]=useState('180');
  const [timer,setTimer]=useState<TimerSession>(()=> {
    const result=makeTimer(180);
    if(!result.ok)throw Error('Invalid default timer');
    return result.value;
  });
  const [error,setError]=useState('');
  const snapshot=timerSnapshot(timer,now);
  const remainingTotal=timer.durationMs/1000;
  const progress=remainingTotal>0?100*snapshot.elapsedSeconds/remainingTotal:0;
  const refreshDuration=()=>{
    const result=makeTimer(Number(duration));
    if(!result.ok){setError(result.error);return;}
    setTimer(result.value);setError('');
  };
  const run=()=>{
    if(snapshot.state==='completed'){
      setTimer(startTimer(resetTimer(timer),Date.now()));
    }else setTimer(startTimer(timer,Date.now()));
  };
  const pause=()=>setTimer(current=>pauseTimer(current,Date.now()));
  const reset=()=>{setTimer(current=>resetTimer(current));setError('');};
  const status:Record<TimerSession['state'],string>={
    idle:'Listo',running:'En curso',paused:'En pausa',completed:'Completado'
  };
  return <div className="temporal-live-demo" data-temporal-counter="timer">
    <div className="temporal-live-demo__timer-config">
      <label className="temporal-live-demo__field">
        <span>Duración inicial (segundos)</span>
        <input type="number" min="1" max="31536000" step="1" value={duration}
          aria-label="Duración del temporizador en segundos"
          aria-invalid={Boolean(error)} onChange={event=>setDuration(event.target.value)}/>
      </label>
      <Button variant="secondary" size="standard" onClick={refreshDuration}>Aplicar duración</Button>
    </div>
    {error&&<span className="temporal-error" role="alert">{error}</span>}
    <DurationDisplay parts={snapshot.remaining} mode={display} seconds={showSeconds} progress={progress}/>
    <div className="temporal-live-demo__timer-actions">
      <Button size="standard" onClick={run} disabled={snapshot.state==='running'}>
        <Icon name="clock" size={14}/>{snapshot.state==='paused'?'Reanudar':snapshot.state==='completed'?'Reiniciar':'Iniciar'}
      </Button>
      <Button variant="secondary" onClick={pause} disabled={snapshot.state!=='running'}>Pausar</Button>
      <Button variant="secondary" onClick={reset}>Restablecer</Button>
      <span className="temporal-live-demo__state" role="status" aria-live="off">{status[snapshot.state]}</span>
    </div>
    <ContextHelp label="Precisiones del temporizador">
      La pausa congela el tiempo acumulado; al reanudar se conserva el tiempo restante. El contador es local a esta pestaña, no es un reloj de servidor ni ejecuta acciones productivas.
    </ContextHelp>
  </div>;
}

/** Universal temporal presentation specimens, no domain workflows or side effects. */
export function TemporalDemo() {
  const now=useWallNow();
  const [display,setDisplay]=useState<DisplayMode>('cards');
  const [seconds,setSeconds]=useState(true);
  return <div className="temporal-counters">
    <div className="temporal-counters__preferences">
      <ZenitSelect<DisplayMode> label="Presentación" className="temporal-counters__display"
        value={display} options={displayOptions} onChange={setDisplay}/>
      <label className="datetime-demo__checkbox">
        <input type="checkbox" checked={seconds}
          onChange={event=>setSeconds(event.target.checked)}/> Mostrar segundos
      </label>
    </div>
    <div className="temporal-counters__grid">
      <section className="temporal-counters__card" aria-labelledby="temporal-countdown-title">
        <h3 id="temporal-countdown-title">Cuenta regresiva</h3>
        <CountdownDemo now={now} display={display} showSeconds={seconds}/>
      </section>
      <section className="temporal-counters__card" aria-labelledby="temporal-timer-title">
        <h3 id="temporal-timer-title">Temporizador</h3>
        <TimerDemo now={now} display={display} showSeconds={seconds}/>
      </section>
    </div>
  </div>;
}
