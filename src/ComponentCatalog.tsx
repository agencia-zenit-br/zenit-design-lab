import { useState } from 'react';
import { Button, StatusPill } from './components';
import { Icon, type IconName } from './Icon';
import { ZenitSelect, type ZenitOption } from './ZenitSelect';
import { ZenitMultiSelect } from './ZenitMultiSelect';
import { RegionalWorkbench } from './RegionalWorkbench';
import { ContextHelp } from './ContextHelp';
import { OperationalWorkbench } from './operational/OperationalWorkbench';

type DemoFilter = 'all'|'active'|'review'|'paused';
type DemoModule = 'articles'|'columns'|'media'|'social'|'metrics'|'users'|'storage';
const demoFilterOptions:readonly ZenitOption<DemoFilter>[]=[
  {value:'all',label:'Todos',group:'Visibilidad'},
  {value:'active',label:'Activos',group:'Estado'},
  {value:'review',label:'En revisión',group:'Estado'},
  {value:'paused',label:'Suspendidos',group:'Estado',disabled:true},
];
const demoModules:readonly ZenitOption<DemoModule>[]=[
  {value:'articles',label:'Noticias',group:'Editorial'},
  {value:'columns',label:'Columnas',group:'Editorial'},
  {value:'media',label:'Biblioteca visual',group:'Editorial'},
  {value:'social',label:'Redes sociales',group:'Distribución'},
  {value:'metrics',label:'Métricas',group:'Operaciones'},
  {value:'users',label:'Usuarios',group:'Operaciones'},
  {value:'storage',label:'Almacenamiento',group:'Operaciones'},
];
const iconExamples:{name:IconName;title:string}[]=[
  {name:'dashboard',title:'Panel'}, {name:'editorial',title:'Editorial'}, {name:'services',title:'Módulos'},
  {name:'search',title:'Buscar'}, {name:'filter',title:'Filtros'}, {name:'settings',title:'Ajustes'},
  {name:'users',title:'Usuarios'}, {name:'storage',title:'Archivos'}, {name:'bell',title:'Avisos'},
  {name:'edit',title:'Editar'}, {name:'check',title:'Confirmar'}, {name:'trash',title:'Eliminar'},
];

export function ComponentCatalog() {
  const [demoFilter,setDemoFilter]=useState<DemoFilter|null>('all');
  const [selectedModules,setSelectedModules]=useState<DemoModule[]>(['articles','media']);
  const [notice,setNotice]=useState('');
  return <div className="catalog">
    <div className="eyebrow">DESIGN LAB / ESTÁNDARES COMPARTIDOS</div>
    <div className="catalog__intro">
      <div><h1>Componentes</h1>
        <ContextHelp label="Acerca del catálogo de componentes">Pruebas de lenguaje visual y funciones comunes para el ecosistema Zenit. Los datos e interacciones son demostraciones aisladas.</ContextHelp>
      </div>
    </div>

    <section className="panel catalog__section" aria-labelledby="catalog-type">
      <div className="panel__head"><div><h2 id="catalog-type">Tipografía y jerarquía</h2><ContextHelp label="Sobre la tipografía">Un sistema común de escalas y jerarquías para títulos, lectura y metadatos.</ContextHelp></div></div>
      <h1 className="catalog__display">Título principal</h1>
      <h2>Encabezado de sección</h2>
      <p>Texto de lectura para formularios, registros y paneles de trabajo. El contenido mantiene contraste, interlineado y márgenes constantes en cada producto.</p>
      <small className="catalog__caption">Texto secundario · metadatos y descripciones breves</small>
    </section>

    <section className="panel catalog__section" aria-labelledby="catalog-icons">
      <div className="panel__head"><div><h2 id="catalog-icons">Iconografía SVG</h2><ContextHelp label="Sobre la iconografía">Familia de iconos vectoriales compartidos. Los símbolos Unicode no se usan como iconos operativos.</ContextHelp></div></div>
      <div className="catalog__icons">{iconExamples.map(item=><div className="catalog__icon" key={item.name}><Icon name={item.name} size={20}/><span>{item.title}</span></div>)}</div>
    </section>

    <section className="panel catalog__section" aria-labelledby="catalog-buttons">
      <div className="panel__head"><div><h2 id="catalog-buttons">Controles, dimensiones y estados</h2><ContextHelp label="Sobre dimensiones y estados">Botones 27, 32 y 37 píxeles; estados visuales coherentes con los tokens compartidos.</ContextHelp></div></div>
      <div className="catalog__row">
        <Button size="compact" onClick={()=>setNotice('Botón compacto activado en la demostración.')}>Compacto</Button>
        <Button size="standard" onClick={()=>setNotice('Botón estándar activado en la demostración.')}><Icon name="plus" size={14}/> Estándar</Button>
        <Button size="prominent" onClick={()=>setNotice('Botón prominente activado en la demostración.')}>Prominente</Button>
        <Button variant="secondary" onClick={()=>setNotice('Acción secundaria de demostración.')}>Secundario</Button>
        <Button disabled>Deshabilitado</Button>
      </div>
      <div className="catalog__row">
        <StatusPill tone="success">Activo</StatusPill><StatusPill tone="warning">En revisión</StatusPill>
        <StatusPill tone="danger">Error</StatusPill><StatusPill>Neutral</StatusPill>
      </div>
      <div className="catalog__message" role="status">{notice}</div>
    </section>

    <section className="panel catalog__section" aria-labelledby="catalog-select">
      <div className="panel__head">
        <div><h2 id="catalog-select">Zenit Select</h2><ContextHelp label="Acerca de Zenit Select">Selector universal con búsqueda, grupos, selección única y múltiple, chips y estados vacíos. La virtualización y servicios remotos quedan pendientes.</ContextHelp></div>
      </div>
      <div className="catalog__select-grid">
        <div className="catalog__select-example">
          <ZenitSelect<DemoFilter> label="Selección única" value={demoFilter}
            options={demoFilterOptions} onChange={setDemoFilter} onClear={()=>setDemoFilter(null)} searchable
            searchPlaceholder="Buscar estados…"/>
          <ContextHelp label="Ayuda para selección única">Busca en los grupos, selecciona una opción, usa teclado y limpia la selección desde el campo.</ContextHelp>
        </div>
        <div className="catalog__select-example">
          <ZenitMultiSelect<DemoModule> label="Selección múltiple" values={selectedModules}
            options={demoModules} onChange={setSelectedModules}/>
          <ContextHelp label="Ayuda para selección múltiple">Selecciona opciones, elimina chips o vacía la lista; confirma con «Listo».</ContextHelp>
        </div>
      </div>
      <ContextHelp label="Limitaciones del selector">Los datos son sintéticos. Quedan pendientes la virtualización, búsqueda remota y certificación integral con lectores de pantalla.</ContextHelp>
    </section>

    <RegionalWorkbench/>

    <section className="panel catalog__section" aria-labelledby="catalog-operational">
      <div className="panel__head"><div><h2 id="catalog-operational">Registros y tablas</h2>
        <ContextHelp label="Acerca de los registros universales">Única implementación de tablas y registros: añadir, editar y renombrar columnas (también las fijadas como guía), fijar encabezados y filas, y utilizar tarjetas móviles. Toda edición es una demostración local, sin llamadas a Platform.</ContextHelp>
      </div></div>
      <OperationalWorkbench/>
    </section>


  </div>;
}
