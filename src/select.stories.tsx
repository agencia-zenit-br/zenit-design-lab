import { useState } from 'react';
import { ZenitSelect, type ZenitOption } from './ZenitSelect';
import { ZenitMultiSelect } from './ZenitMultiSelect';

type ReviewStatus = 'all' | 'ready' | 'pending' | 'suspended';
type Module = 'articles' | 'columns' | 'media' | 'social' | 'analytics';

const reviewStates: readonly ZenitOption<ReviewStatus>[] = [
  { value: 'all', label: 'Todos', group: 'Visibilidad' },
  { value: 'ready', label: 'Listos', group: 'Estados' },
  { value: 'pending', label: 'Pendientes', group: 'Estados' },
  { value: 'suspended', label: 'Suspendidos', group: 'Estados', disabled: true },
];
const modules: readonly ZenitOption<Module>[] = [
  { value: 'articles', label: 'Noticias', group: 'Redacción' },
  { value: 'columns', label: 'Columnas', group: 'Redacción' },
  { value: 'media', label: 'Biblioteca visual', group: 'Redacción' },
  { value: 'social', label: 'Redes sociales', group: 'Distribución' },
  { value: 'analytics', label: 'Analítica', group: 'Operaciones' },
];

function SingleSelectExample() {
  const [value, setValue] = useState<ReviewStatus | null>('all');
  return <div className="lab" data-theme="light" style={{padding:24,minHeight:230}}>
    <ZenitSelect<ReviewStatus> label="Estado editorial" options={reviewStates} value={value}
      onChange={setValue} onClear={() => setValue(null)} searchable/>
  </div>;
}

function MultiSelectExample() {
  const [values, setValues] = useState<Module[]>(['articles','media']);
  return <div className="lab" data-theme="light" style={{padding:24,minHeight:350}}>
    <div style={{maxWidth:350}}>
      <ZenitMultiSelect<Module> label="Módulos disponibles" options={modules}
        values={values} onChange={setValues} searchable/>
    </div>
  </div>;
}

export default { title:'Zenit/Select universal', tags:['autodocs'] };
export const SeleccionUnica = () => <SingleSelectExample/>;
export const SeleccionMultiple = () => <MultiSelectExample/>;
