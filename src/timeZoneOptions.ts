import type {ZenitOption} from './ZenitSelect';

/** Searchable IANA timezone catalogue, sourced from the runtime ICU database.
 * Never accept arbitrary browser-text values for end-user regional preferences.
 * Technical zone IDs remain stable persisted values, unlike offset labels.
 */
const friendly:Record<string,string>={
  UTC:'UTC — Tiempo universal',
  'America/Sao_Paulo':'São Paulo, Brasil',
  'America/New_York':'Nueva York, Estados Unidos',
  'America/Los_Angeles':'Los Ángeles, Estados Unidos',
  'America/Bogota':'Bogotá, Colombia',
  'America/Caracas':'Caracas, Venezuela',
  'America/Mexico_City':'Ciudad de México, México',
  'America/Argentina/Buenos_Aires':'Buenos Aires, Argentina',
  'Europe/Madrid':'Madrid, España',
  'Europe/Lisbon':'Lisboa, Portugal',
  'Europe/London':'Londres, Reino Unido',
  'Europe/Paris':'París, Francia',
  'Asia/Jerusalem':'Jerusalén, Israel',
  'Asia/Dubai':'Dubái, Emiratos Árabes Unidos',
  'Asia/Tokyo':'Tokio, Japón',
};
const fallback=Object.keys(friendly).filter(v=>v!=='UTC');
function listZones():string[]{
  try {
    const values=Intl.supportedValuesOf('timeZone');
    if(values.length>0)return values;
  } catch { /* older runtime falls back to a documented short list */ }
  return fallback;
}
const localeGroup=(zone:string):string=>{
  if(zone==='UTC')return 'Universal';
  const prefix=zone.split('/')[0];
  return {America:'América',Europe:'Europa',Africa:'África',Asia:'Asia',
    Australia:'Australia',Pacific:'Pacífico',Atlantic:'Atlántico',Indian:'Índico',
    Antarctica:'Antártida'}[prefix]??'Otras regiones';
};
export const timeZoneOptions:readonly ZenitOption<string>[]=[
  ...new Set(['UTC',...listZones(),...fallback]),
].sort((a,b)=>a.localeCompare(b,'es')).map(value=>{
  const short=value.split('/').slice(1).join(' · ').replace(/_/g,' ');
  return {value,label:friendly[value]?`${friendly[value]} · ${value}`:
    value==='UTC'?'UTC — Tiempo universal':`${short} · ${value}`,
    group:localeGroup(value)};
});
export function friendlyZone(value:string):string{
  return friendly[value]??value.split('/').slice(1).join(' · ').replace(/_/g,' ');
}
