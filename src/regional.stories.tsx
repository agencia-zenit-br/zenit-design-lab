import { RegionalWorkbench } from './RegionalWorkbench';
import { CalendarSpecimen } from './CalendarSpecimen';
import { DateTimeDemo } from './DateTimeDemo';
import { FormSpecimen } from './FormSpecimen';
import { defaultRegionalSettings, type RegionalSettings } from './calendarLocale';
import './styles.css';

const lab = (children: React.ReactNode) =>
  <div className="lab" data-theme="light" style={{padding:16,minHeight:380,maxWidth:900}}>
    {children}
  </div>;

const saturday:RegionalSettings = {
  ...defaultRegionalSettings, weekStart:'saturday', locale:'es-ES',
};
const rtl:RegionalSettings = {
  ...defaultRegionalSettings, locale:'he-IL',direction:'rtl',
};

export default {title:'Zenit/Calendario y preferencias',tags:['autodocs']};

export const PreferenciasIntegradas = () => lab(<RegionalWorkbench/>);
export const CalendarioEspanol = () => lab(<CalendarSpecimen settings={defaultRegionalSettings}/>);
export const SemanaDesdeSabado = () => lab(<CalendarSpecimen settings={saturday}/>);
export const CalendarioRTL = () => lab(<CalendarSpecimen settings={rtl}/>);
export const MotorNoImplementado = () => lab(<CalendarSpecimen settings={{...defaultRegionalSettings,calendarSystem:'hebrew'}}/>);
export const SelectorFechaHora = () => lab(<DateTimeDemo settings={defaultRegionalSettings}/>);
export const ValidacionFormularios = () => lab(<FormSpecimen/>);
