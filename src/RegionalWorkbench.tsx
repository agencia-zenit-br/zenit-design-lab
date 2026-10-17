import { useState } from 'react';
import { Button, StatusPill } from './components';
import { Icon } from './Icon';
import { ZenitSelect, type ZenitOption } from './ZenitSelect';
import { CalendarSpecimen } from './CalendarSpecimen';
import { DateTimeDemo } from './DateTimeDemo';
import { FormSpecimen } from './FormSpecimen';
import {
  defaultRegionalSettings, formatInstantInZone, localeOptions,
  resolveDirection, resolveWeekStart, validRegionalSettings,
  type RegionalSettings, type CalendarSystem, type CalendarLanguage,
  type WeekStartPreference, type HourCycle, type DirectionPreference,
} from './calendarLocale';

const storageKey = 'zenit-design-lab-regional-demo-v1';
const weekStartOptions: readonly ZenitOption<WeekStartPreference>[] = [
  {value:'auto',label:'Según la región'},
  {value:'monday',label:'Lunes'},
  {value:'saturday',label:'Sábado'},
  {value:'sunday',label:'Domingo'},
];
const calendarOptions: readonly ZenitOption<CalendarSystem>[] = [
  {value:'gregory',label:'Gregoriano'},
  {value:'hebrew',label:'Hebreo (motor pendiente)'},
  {value:'islamic',label:'Islámico / Hijri (motor pendiente)'},
];
const hourOptions: readonly ZenitOption<HourCycle>[] = [
  {value:'h23',label:'24 horas'},
  {value:'h12',label:'12 horas (AM/PM)'},
];
const directionOptions: readonly ZenitOption<DirectionPreference>[] = [
  {value:'auto',label:'Según idioma'},
  {value:'ltr',label:'Izquierda a derecha'},
  {value:'rtl',label:'Derecha a izquierda'},
];

function restorePreferences(): RegionalSettings {
  try {
    const saved=localStorage.getItem(storageKey);
    return saved?validRegionalSettings(JSON.parse(saved)):{...defaultRegionalSettings};
  } catch { return {...defaultRegionalSettings}; }
}

function timezoneValid(value: string): boolean {
  try { new Intl.DateTimeFormat('es-ES',{timeZone:value}); return true; }
  catch { return false; }
}

/** One editable preview and one persisted demo configuration. Never a real account setting. */
export function RegionalWorkbench() {
  const [saved,setSaved] = useState<RegionalSettings>(restorePreferences);
  const [draft,setDraft] = useState<RegionalSettings>(saved);
  const [notice,setNotice] = useState('');
  const changed=JSON.stringify(saved)!==JSON.stringify(draft);
  const timezoneOk=timezoneValid(draft.timeZone);
  const update=<K extends keyof RegionalSettings>(key: K, value:RegionalSettings[K])=>{
    setDraft(previous=>({...previous,[key]:value}));
    setNotice('');
  };
  const save=()=>{
    if(!timezoneOk)return;
    try {
      localStorage.setItem(storageKey,JSON.stringify(draft));
      setSaved({...draft});
      setNotice('Preferencias de demostración guardadas en este navegador.');
    } catch {setNotice('El navegador no permitió guardar las preferencias; la vista previa sigue disponible.');}
  };
  const reset=()=>{setDraft({...defaultRegionalSettings});setNotice('Valores predeterminados cargados en la vista previa. Guarda para conservarlos.');};
  const referenceInstant = timezoneOk?formatInstantInZone('2026-10-17T15:30:00Z',draft):null;

  return <>
    <section className="panel catalog__section" aria-labelledby="catalog-preferences">
      <div className="panel__head">
        <div><h2 id="catalog-preferences">Preferencias regionales</h2>
          <p>Idioma, calendario, semana, reloj, zona horaria y dirección se configuran por separado.</p></div>
        <StatusPill tone={changed?'warning':'success'}>{changed?'Cambios sin guardar':'Sin cambios'}</StatusPill>
      </div>
      <div className="regional-prefs__grid">
        <ZenitSelect<CalendarLanguage> label="Idioma" className="regional-prefs__select regional-prefs__locale"
          value={draft.locale} options={localeOptions} onChange={value=>update('locale',value)}/>
        <ZenitSelect<WeekStartPreference> label="Inicio de semana" className="regional-prefs__select regional-prefs__week"
          value={draft.weekStart} options={weekStartOptions} onChange={value=>update('weekStart',value)}/>
        <ZenitSelect<CalendarSystem> label="Sistema de calendario" className="regional-prefs__select regional-prefs__calendar"
          value={draft.calendarSystem} options={calendarOptions} onChange={value=>update('calendarSystem',value)}/>
        <ZenitSelect<HourCycle> label="Formato horario" className="regional-prefs__select regional-prefs__hours"
          value={draft.hourCycle} options={hourOptions} onChange={value=>update('hourCycle',value)}/>
        <ZenitSelect<DirectionPreference> label="Dirección de lectura" className="regional-prefs__select regional-prefs__direction"
          value={draft.direction} options={directionOptions} onChange={value=>update('direction',value)}/>
        <label className="regional-prefs__timezone">
          <span>Zona horaria IANA</span>
          <input type="text" value={draft.timeZone} spellCheck={false}
            aria-label="Zona horaria IANA" aria-invalid={!timezoneOk}
            aria-describedby={!timezoneOk?'regional-timezone-error':undefined}
            onChange={event=>update('timeZone',event.target.value)}/>
          {!timezoneOk&&<small id="regional-timezone-error" className="regional-prefs__error" role="alert">Introduce una zona horaria válida, como America/Sao_Paulo.</small>}
        </label>
      </div>
      <div className="regional-prefs__preview">
        <Icon name="globe" size={17}/>
        <div><strong>Vista previa de preferencias</strong>
          <p>Semana desde {resolveWeekStart(draft)===1?'lunes':resolveWeekStart(draft)===6?'sábado':'domingo'} · Lectura {resolveDirection(draft).toUpperCase()} · {draft.hourCycle==='h12'?'AM/PM':'24 h'}.</p>
          {referenceInstant&&<p>Instante de ejemplo en {draft.timeZone}: {referenceInstant}</p>}
        </div>
      </div>
      {draft.calendarSystem!=='gregory'&&
        <p className="regional-prefs__planned" role="status">
          <Icon name="alert" size={15}/>
          El calendario seleccionado está previsto en la arquitectura, pero su motor no está implementado. No mostraremos fechas gregorianas disfrazadas.
        </p>}
      <div className="regional-prefs__actions">
        <Button variant="secondary" size="standard" onClick={reset}>Restablecer valores</Button>
        <Button size="standard" disabled={!changed||!timezoneOk} onClick={save}>
          <Icon name="check" size={14}/> Guardar preferencias
        </Button>
      </div>
      <div className="regional-prefs__notice" role="status">{notice}</div>
      <p className="catalog__footnote">Configuración local del prototipo. No modifica perfiles reales ni políticas de una organización.</p>
    </section>

    <section className="panel catalog__section" aria-labelledby="catalog-calendar">
      <div className="panel__head">
        <div><h2 id="catalog-calendar">Calendario</h2>
          <p>Cuadrícula centrada, iniciales locales y comienzo de semana configurable.</p></div>
      </div>
      <CalendarSpecimen settings={draft}/>
    </section>

    <section className="panel catalog__section" aria-labelledby="catalog-datetime">
      <div className="panel__head">
        <div><h2 id="catalog-datetime">Fecha y hora</h2>
          <p>Fecha, rango, fecha y hora, y reloj; mismas preferencias regionales.</p></div>
        <StatusPill tone="warning">Prototipo funcional</StatusPill>
      </div>
      <DateTimeDemo settings={draft}/>
    </section>

    <section className="panel catalog__section" aria-labelledby="catalog-forms">
      <div className="panel__head">
        <div><h2 id="catalog-forms">Formularios y validación</h2>
          <p>Campos coherentes, errores accesibles y confirmación local sin enviar datos.</p></div>
      </div>
      <FormSpecimen/>
    </section>
  </>;
}
