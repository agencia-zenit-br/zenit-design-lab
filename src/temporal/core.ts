/** Zenit Temporal Core — pure, headless Gregorian civil-date/time/instant operations.
 * No React, product rules, persistence, styling, or implicit local-time to instant conversion.
 * Hebrew/Hijri civil arithmetic and DST-disambiguated scheduling require separate engines.
 */
export type TemporalResult<T> = { ok:true; value:T } | { ok:false; error:string };
export type CivilDate = string; // strictly validated YYYY-MM-DD, Gregorian civil day (timezone-free)
export type TimeOfDay = Readonly<{ hour:number; minute:number; second:number }>;
export type DurationParts = Readonly<{ days:number; hours:number; minutes:number; seconds:number; totalSeconds:number }>;
export type DateInterval = Readonly<{ start:CivilDate; end:CivilDate }>;

const success=<T,>(value:T):TemporalResult<T>=>({ok:true,value});
const failure=(error:string):TemporalResult<never>=>({ok:false,error});
const dayMilliseconds=86_400_000;
const pad=(number:number)=>String(number).padStart(2,'0');

function civilEpoch(iso:CivilDate):number {
  const [year,month,day]=iso.split('-').map(Number);
  const date=new Date(0);
  date.setUTCHours(0,0,0,0);
  date.setUTCFullYear(year,month-1,day);
  return date.getTime();
}
export function validateCivilDate(value:string):TemporalResult<CivilDate> {
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if(!match)return failure('Escribe una fecha completa en formato AAAA-MM-DD.');
  const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
  if(year<100||year>9999||month<1||month>12||day<1||day>31)return failure('La fecha no existe.');
  const valid=new Date(civilEpoch(value));
  if(valid.getUTCFullYear()!==year||valid.getUTCMonth()+1!==month||valid.getUTCDate()!==day)
    return failure('La fecha no existe.');
  return success(value);
}
export function localeDateOrder(locale:string):'DMY'|'MDY'|'YMD' {
  const parts=new Intl.DateTimeFormat(locale,{calendar:'gregory',timeZone:'UTC',
    year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(Date.UTC(2025,10,23)));
  const order=parts.filter(part=>['day','month','year'].includes(part.type)).map(part=>part.type).join('-');
  if(order==='month-day-year')return 'MDY';
  if(order==='year-month-day')return 'YMD';
  return 'DMY';
}
/** Accept ISO or the unambiguous locale-specific numeric date order; no Date.parse heuristics. */
export function parseCivilDate(input:string,locale:string):TemporalResult<CivilDate> {
  const value=input.trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(value))return validateCivilDate(value);
  const match=/^(\d{1,4})[/.\-](\d{1,2})[/.\-](\d{1,4})$/.exec(value);
  if(!match)return failure('Usa una fecha numérica completa según el idioma seleccionado.');
  const numbers=match.slice(1).map(Number);
  const order=localeDateOrder(locale);
  const [year,month,day]=order==='YMD'?numbers:
    order==='MDY'?[numbers[2],numbers[0],numbers[1]]:[numbers[2],numbers[1],numbers[0]];
  if(year<100||year>9999)return failure('Escribe el año con cuatro cifras.');
  return validateCivilDate(`${String(year).padStart(4,'0')}-${pad(month)}-${pad(day)}`);
}
export function formatEditableCivilDate(value:CivilDate,locale:string):string {
  const valid=validateCivilDate(value);
  if(!valid.ok)return value;
  const [year,month,day]=value.split('-');
  const order=localeDateOrder(locale);
  if(order==='MDY')return `${month}/${day}/${year}`;
  if(order==='YMD')return `${year}/${month}/${day}`;
  return `${day}/${month}/${year}`;
}
export function civilDayDifference(start:CivilDate,end:CivilDate):TemporalResult<number> {
  const s=validateCivilDate(start),e=validateCivilDate(end);
  if(!s.ok||!e.ok)return failure('El rango contiene fechas inválidas.');
  const value=Math.round((civilEpoch(end)-civilEpoch(start))/dayMilliseconds);
  if(value<0)return failure('La fecha final no puede ser anterior a la inicial.');
  return success(value);
}
export function dateRangeMetrics(start:CivilDate,end:CivilDate):TemporalResult<{
  elapsedDays:number;inclusiveDays:number;nights:number;
}> {
  const result=civilDayDifference(start,end);
  return result.ok?success({elapsedDays:result.value,inclusiveDays:result.value+1,nights:result.value}):result;
}
export function normalizeMultiDates(values:readonly string[]):TemporalResult<readonly CivilDate[]> {
  for(const item of values)if(!validateCivilDate(item).ok)return failure('La selección contiene una fecha inválida.');
  return success([...new Set(values)].sort());
}
export function validateTimeOfDay(value:TimeOfDay):TemporalResult<TimeOfDay> {
  const {hour,minute,second}=value;
  if(![hour,minute,second].every(Number.isInteger) || hour<0||hour>23||minute<0||minute>59||second<0||second>59)
    return failure('La hora debe estar entre 00:00:00 y 23:59:59.');
  return success({hour,minute,second});
}
export function formatEditableTime(value:TimeOfDay,hourCycle:'h12'|'h23',showSeconds=false):string {
  const h=hourCycle==='h12'?(value.hour%12||12):value.hour;
  return `${pad(h)}:${pad(value.minute)}${showSeconds?':'+pad(value.second):''}${hourCycle==='h12'?(value.hour>=12?' PM':' AM'):''}`;
}
/** Whitespace/AM-PM is explicit for h12; no ambiguous 12:00 is silently normalized. */
export function parseTimeOfDay(input:string,hourCycle:'h12'|'h23'):TemporalResult<TimeOfDay> {
  const match=/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i.exec(input.trim());
  if(!match)return failure('Escribe HH:MM, HH:MM:SS o una hora con AM/PM.');
  let hour=Number(match[1]);
  const minute=Number(match[2]),second=Number(match[3]??0);
  const period=match[4]?.toUpperCase();
  if(hourCycle==='h12') {
    if(!period)return failure('Indica AM o PM para evitar una hora ambigua.');
    if(hour<1||hour>12)return failure('En formato AM/PM la hora debe estar entre 1 y 12.');
    hour=(hour%12)+(period==='PM'?12:0);
  }else if(period){
    return failure('El formato de 24 horas no admite AM/PM.');
  }
  return validateTimeOfDay({hour,minute,second});
}
export function timeOfDaySeconds(value:TimeOfDay):number {
  return value.hour*3600+value.minute*60+value.second;
}
export function secondsToDuration(totalSeconds:number):TemporalResult<DurationParts> {
  if(!Number.isSafeInteger(totalSeconds)||totalSeconds<0)return failure('La duración debe ser un número válido de segundos no negativos.');
  return success({
    days:Math.floor(totalSeconds/86400),hours:Math.floor(totalSeconds%86400/3600),
    minutes:Math.floor(totalSeconds%3600/60),seconds:totalSeconds%60,totalSeconds
  });
}
export function timeRangeDuration(start:TimeOfDay,end:TimeOfDay,allowNextDay=false):TemporalResult<DurationParts> {
  if(!validateTimeOfDay(start).ok||!validateTimeOfDay(end).ok)return failure('El intervalo contiene una hora inválida.');
  let delta=timeOfDaySeconds(end)-timeOfDaySeconds(start);
  if(delta<0&&allowNextDay)delta+=86400;
  if(delta<0)return failure('La hora final es anterior; confirma que el intervalo cruza medianoche.');
  return secondsToDuration(delta);
}
/** Parse only a timezone-explicit ISO instant, rejecting browser Date.parse overflow normalization. */
export function parseExplicitInstant(input:string):TemporalResult<number> {
  const parts=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/i.exec(input);
  if(!parts)return failure('El instante requiere fecha, hora y zona explícita (Z o ±HH:MM).');
  const civil=`${parts[1]}-${parts[2]}-${parts[3]}`;
  if(!validateCivilDate(civil).ok)return failure('La fecha del instante no existe.');
  const hour=Number(parts[4]),minute=Number(parts[5]),second=Number(parts[6]??0);
  if(!validateTimeOfDay({hour,minute,second}).ok)return failure('La hora del instante no es válida.');
  const tz=parts[8].toUpperCase();
  if(tz!=='Z') {
    const hh=Number(tz.slice(1,3)),mm=Number(tz.slice(4,6));
    if(hh>23||mm>59)return failure('El desplazamiento de zona horaria no es válido.');
  }
  const epoch=Date.parse(input);
  return Number.isFinite(epoch)?success(epoch):failure('El instante no se puede interpretar.');
}
export function instantIntervalDuration(startISO:string,endISO:string):TemporalResult<DurationParts> {
  const first=parseExplicitInstant(startISO),last=parseExplicitInstant(endISO);
  if(!first.ok)return first;
  if(!last.ok)return last;
  if(last.value<first.value)return failure('El instante final es anterior al inicial.');
  return secondsToDuration(Math.floor((last.value-first.value)/1000));
}
export function countdownSnapshot(targetEpochMs:number,nowEpochMs:number):{
  state:'pending'|'expired'|'invalid';remaining:DurationParts;
} {
  const zero=secondsToDuration(0);
  if(!zero.ok)throw new Error('Duration invariant violated');
  if(!Number.isFinite(targetEpochMs)||!Number.isFinite(nowEpochMs))
    return {state:'invalid',remaining:zero.value};
  const future=targetEpochMs>nowEpochMs;
  const result=secondsToDuration(future?Math.ceil((targetEpochMs-nowEpochMs)/1000):0);
  return {state:future?'pending':'expired',remaining:result.ok?result.value:zero.value};
}
/** A pure, serializable session. The host injects wall-clock milliseconds.
 * Pausing freezes elapsed wall time. This is not an authoritative cross-device clock. */
export type TimerSession = Readonly<{
  durationMs:number;elapsedMs:number;startedAtMs:number|null;state:'idle'|'running'|'paused'|'completed';
}>;
export function makeTimer(durationSeconds:number):TemporalResult<TimerSession> {
  if(!Number.isSafeInteger(durationSeconds)||durationSeconds<=0||durationSeconds>86400*365)
    return failure('Introduce una duración de 1 segundo a 365 días.');
  return success({durationMs:durationSeconds*1000,elapsedMs:0,startedAtMs:null,state:'idle'});
}
export function timerSnapshot(session:TimerSession,nowMs:number):{
  state:TimerSession['state']; remainingSeconds:number;elapsedSeconds:number;remaining:DurationParts;
} {
  const active=session.startedAtMs===null?0:Math.max(0,nowMs-session.startedAtMs);
  const elapsed=Math.min(session.durationMs,session.elapsedMs+(session.state==='running'?active:0));
  const remainingMs=Math.max(0,session.durationMs-elapsed);
  const complete=remainingMs===0&&session.state==='running';
  const result=secondsToDuration(Math.ceil(remainingMs/1000));
  if(!result.ok)throw new Error('Timer invariant violated');
  return {state:complete?'completed':session.state,
    remainingSeconds:Math.ceil(remainingMs/1000),elapsedSeconds:Math.floor(elapsed/1000),remaining:result.value};
}
export function startTimer(session:TimerSession,nowMs:number):TimerSession {
  if(session.state==='completed'||session.state==='running')return session;
  return {...session,startedAtMs:nowMs,state:'running'};
}
export function pauseTimer(session:TimerSession,nowMs:number):TimerSession {
  if(session.state!=='running')return session;
  const accrued=Math.max(0,nowMs-(session.startedAtMs??nowMs));
  const elapsedMs=Math.min(session.durationMs,session.elapsedMs+accrued);
  return {...session,elapsedMs,startedAtMs:null,
    state:elapsedMs===session.durationMs?'completed':'paused'};
}
export function resetTimer(session:TimerSession):TimerSession {
  return {...session,elapsedMs:0,startedAtMs:null,state:'idle'};
}
