/** IANA civil wall-clock ↔ instant conversion, independent of React or products.
 * Rejects nonexistent and ambiguous daylight-saving local times rather than guessing.
 * Real scheduling remains server-validated; this is a UI prototype parser.
 */
import {parseTimeOfDay,validateCivilDate,type TemporalResult} from './core.ts';

const good=<T,>(value:T):TemporalResult<T>=>({ok:true,value});
const bad=(error:string):TemporalResult<never>=>({ok:false,error});
const pad=(value:number)=>String(value).padStart(2,'0');

export function zonedInstantFields(instantMs:number,timeZone:string):
  TemporalResult<{date:string;time:string;second:number}> {
  try {
    const formatter=new Intl.DateTimeFormat('en-CA',{
      timeZone,calendar:'gregory',hourCycle:'h23',
      year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',second:'2-digit',
    });
    const fields=Object.fromEntries(formatter.formatToParts(new Date(instantMs))
      .filter(entry=>['year','month','day','hour','minute','second'].includes(entry.type))
      .map(entry=>[entry.type,entry.value]));
    const date=`${fields.year}-${fields.month}-${fields.day}`;
    const time=`${fields.hour}:${fields.minute}`;
    if(!validateCivilDate(date).ok)return bad('No se pudo interpretar el calendario de la zona.');
    return good({date,time,second:Number(fields.second)});
  }catch {return bad('Zona horaria no disponible.');}
}

/** Map entered local date + HH:MM and an IANA zone to exactly one real instant.
 * Sample adjacent days to discover both offsets of a daylight-saving transition.
 * No nonexistent/ambiguous local civil times are normalized silently.
 */
export function resolveZonedDateTime(date:string,time:string,timeZone:string):TemporalResult<number>{
  const civil=validateCivilDate(date),clock=parseTimeOfDay(time,'h23');
  if(!civil.ok)return bad(civil.error);
  if(!clock.ok)return bad('Introduce una hora válida, por ejemplo 14:30.');
  if(clock.value.second!==0)return bad('Este campo acepta precisión de minutos.');
  const [year,month,day]=date.split('-').map(Number);
  const desiredMs=Date.UTC(year,month-1,day,clock.value.hour,clock.value.minute,0);
  const offsets=new Set<number>();
  for(let i=-48;i<=48;i+=12){
    const sample=desiredMs+i*3600000;
    const parts=zonedInstantFields(sample,timeZone);
    if(!parts.ok)return parts;
    const [y,m,d]=parts.value.date.split('-').map(Number);
    const [hh,mm]=parts.value.time.split(':').map(Number);
    const reflectedUtc=Date.UTC(y,m-1,d,hh,mm,parts.value.second);
    offsets.add(reflectedUtc-sample);
  }
  const matches:number[]=[];
  for(const offset of offsets){
    const candidate=desiredMs-offset;
    const parts=zonedInstantFields(candidate,timeZone);
    if(parts.ok&&parts.value.date===date&&parts.value.time===time&&parts.value.second===0)
      matches.push(candidate);
  }
  const unique=[...new Set(matches)].sort((a,b)=>a-b);
  if(unique.length===0)return bad('Esta hora no existe en la zona elegida debido al cambio horario.');
  if(unique.length>1)return bad('Esta hora se repite por un cambio horario. Selecciona otro horario o consulta la zona.');
  return good(unique[0]);
}
