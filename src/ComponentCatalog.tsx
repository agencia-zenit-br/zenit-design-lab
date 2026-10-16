import { useState } from 'react';
import { Button, StatusPill } from './components';
import { Icon, type IconName } from './Icon';
import { ZenitSelect, type ZenitOption } from './ZenitSelect';
import { ZenitMultiSelect } from './ZenitMultiSelect';

type Row = { id:number; name:string; category:string; status:string };
type Column = 'name'|'category'|'status';
const names:Record<Column,string>={name:'Elemento',category:'Categoría',status:'Estado'};
const sampleRows:Row[]=[
  {id:1,name:'Documento editorial',category:'Contenido',status:'Activo'},
  {id:2,name:'Biblioteca visual',category:'Recursos',status:'En revisión'},
  {id:3,name:'Plantilla social',category:'Distribución',status:'Activo'},
];
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
  const [rows,setRows]=useState<Row[]>(sampleRows);
  const [columns,setColumns]=useState<Column[]>(['name','category','status']);
  const [selected,setSelected]=useState<number[]>([]);
  const [filter,setFilter]=useState('');
  const [compact,setCompact]=useState(false);
  const [demoFilter,setDemoFilter]=useState<DemoFilter|null>('all');
  const [selectedModules,setSelectedModules]=useState<DemoModule[]>(['articles','media']);
  const [notice,setNotice]=useState('');
  const [confirmDelete,setConfirmDelete]=useState(false);
  const filtered=rows.filter(row=>Object.values(row).some(value=>String(value).toLocaleLowerCase().includes(filter.toLocaleLowerCase())));
  const move=(index:number,direction:number)=>{
    const next=index+direction;
    if(next<0||next>=columns.length)return;
    setColumns(previous=>{const copy=[...previous];[copy[index],copy[next]]=[copy[next],copy[index]];return copy;});
  };
  const add=()=>setRows(previous=>[...previous,{id:Math.max(0,...previous.map(row=>row.id))+1,name:'Nuevo elemento',category:'General',status:'En revisión'}]);
  const remove=()=>{
    setRows(previous=>previous.filter(row=>!selected.includes(row.id)));
    setSelected([]);setConfirmDelete(false);
    setNotice('Los registros seleccionados fueron eliminados únicamente de esta demostración.');
  };
  const change=(id:number,column:Column,value:string)=>setRows(previous=>previous.map(row=>row.id===id?{...row,[column]:value}:row));
  const toggle=(id:number,checked:boolean)=>setSelected(previous=>checked?[...new Set([...previous,id])]:previous.filter(value=>value!==id));
  return <div className="catalog">
    <div className="eyebrow">DESIGN LAB / ESTÁNDARES COMPARTIDOS</div>
    <div className="catalog__intro">
      <div><h1>Componentes</h1><p>Pruebas del lenguaje visual aprobado para toda la familia de productos. Las herramientas de inspección pertenecen al laboratorio, nunca a una interfaz de cliente.</p></div>
      <StatusPill tone="warning">Implementación parcial</StatusPill>
    </div>

    <section className="panel catalog__section" aria-labelledby="catalog-type">
      <div className="panel__head"><div><h2 id="catalog-type">Tipografía y jerarquía</h2><p>Texto neutro, densidad consistente y escala compartida.</p></div></div>
      <h1 className="catalog__display">Título principal</h1>
      <h2>Encabezado de sección</h2>
      <p>Texto de lectura para formularios, registros y paneles de trabajo. El contenido mantiene contraste, interlineado y márgenes constantes en cada producto.</p>
      <small className="catalog__caption">Texto secundario · metadatos y descripciones breves</small>
    </section>

    <section className="panel catalog__section" aria-labelledby="catalog-icons">
      <div className="panel__head"><div><h2 id="catalog-icons">Iconografía SVG</h2><p>Una única familia vectorial de trazos finos. No se utilizan caracteres Unicode como iconos de interfaz.</p></div></div>
      <div className="catalog__icons">{iconExamples.map(item=><div className="catalog__icon" key={item.name}><Icon name={item.name} size={20}/><span>{item.title}</span></div>)}</div>
    </section>

    <section className="panel catalog__section" aria-labelledby="catalog-buttons">
      <div className="panel__head"><div><h2 id="catalog-buttons">Controles, dimensiones y estados</h2><p>Botones compactos 27 px, estándar 32 px, prominentes 37 px. Escala de referencia visual V1.1.</p></div></div>
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
        <div><h2 id="catalog-select">Zenit Select</h2><p>Desplegables universales: bordes redondeados, búsqueda, grupos, selección múltiple y estados vacíos.</p></div>
        <StatusPill tone="warning">Validación visual pendiente</StatusPill>
      </div>
      <div className="catalog__select-grid">
        <div className="catalog__select-example">
          <ZenitSelect<DemoFilter> label="Selección única" value={demoFilter}
            options={demoFilterOptions} onChange={setDemoFilter} onClear={()=>setDemoFilter(null)} searchable
            searchPlaceholder="Buscar estados…"/>
          <p>Buscar por texto, abrir grupos, seleccionar con teclado o limpiar la selección.</p>
        </div>
        <div className="catalog__select-example">
          <ZenitMultiSelect<DemoModule> label="Selección múltiple" values={selectedModules}
            options={demoModules} onChange={setSelectedModules}/>
          <p>Seleccionar varias opciones, retirar chips, limpiar todo y cerrar con «Listo».</p>
        </div>
      </div>
      <p className="catalog__footnote">El prototipo usa datos sintéticos. La virtualización, carga remota de grandes catálogos y validación integral con lectores de pantalla siguen pendientes.</p>
    </section>

    <section className="panel catalog__section" aria-labelledby="catalog-table">
      <div className="panel__head">
        <div><h2 id="catalog-table">Tabla y registros</h2><p>Selección, edición, orden de columnas y conversión a tarjetas en móvil. Sin barra de desplazamiento horizontal.</p></div>
        <StatusPill tone="warning">Faltan interacciones avanzadas</StatusPill>
      </div>
      <div className="catalog__toolbar">
        <label className="catalog__field"><Icon name="search" size={16}/><span className="sr-only">Buscar elementos</span><input value={filter} onChange={event=>setFilter(event.target.value)} placeholder="Buscar elementos…" aria-label="Buscar elementos"/></label>
        <label className="catalog__check"><input type="checkbox" checked={compact} onChange={event=>setCompact(event.target.checked)}/> Densidad compacta</label>
        <div className="catalog__toolbar-actions">
          <Button variant="secondary" size="compact" onClick={add}><Icon name="plus" size={14}/> Añadir</Button>
          <Button variant="danger" size="compact" disabled={!selected.length} onClick={()=>setConfirmDelete(true)}><Icon name="trash" size={14}/> Eliminar ({selected.length})</Button>
        </div>
      </div>
      {confirmDelete&&<div className="catalog__confirm" role="group" aria-label="Confirmar eliminación">
        <Icon name="alert" size={17}/><span>¿Eliminar {selected.length} registro(s) de la demostración?</span>
        <Button variant="secondary" size="compact" onClick={()=>setConfirmDelete(false)}>Cancelar</Button>
        <Button variant="danger" size="compact" onClick={remove}>Confirmar</Button>
      </div>}
      <div className="catalog__table-scroll"><table className={compact?'catalog__table catalog__table--compact':'catalog__table'}>
        <thead><tr>
          <th scope="col"><input type="checkbox" aria-label="Seleccionar todos los elementos visibles" checked={filtered.length>0&&filtered.every(row=>selected.includes(row.id))} onChange={event=>setSelected(previous=>event.target.checked?[...new Set([...previous,...filtered.map(row=>row.id)])]:previous.filter(id=>!filtered.some(row=>row.id===id)))}/></th>
          {columns.map((column,index)=><th key={column} scope="col"><div className="catalog__th">
            <button className="icon-button" title={`Mover ${names[column]} a la izquierda`} aria-label={`Mover ${names[column]} a la izquierda`} disabled={index===0} onClick={()=>move(index,-1)}><Icon name="chevron-left" size={12}/></button>
            <span>{names[column]}</span>
            <button className="icon-button" title={`Mover ${names[column]} a la derecha`} aria-label={`Mover ${names[column]} a la derecha`} disabled={index===columns.length-1} onClick={()=>move(index,1)}><Icon name="chevron-right" size={12}/></button>
          </div></th>)}
        </tr></thead>
        <tbody>
          {filtered.map(row=><tr key={row.id}>
            <td data-label="Seleccionar"><input type="checkbox" aria-label={`Seleccionar ${row.name}`} checked={selected.includes(row.id)} onChange={event=>toggle(row.id,event.target.checked)}/></td>
            {columns.map(column=><td data-label={names[column]} key={column}><input aria-label={`${names[column]} de ${row.name}`} value={row[column]} onChange={event=>change(row.id,column,event.target.value)}/></td>)}
          </tr>)}
          {!filtered.length&&<tr><td className="catalog__empty" colSpan={columns.length+1}>No hay registros que coincidan con la búsqueda.</td></tr>}
        </tbody>
      </table></div>
      <p className="catalog__footnote">Pendiente de implementación y pruebas: arrastre de columnas, redimensionamiento, selección rectangular de celdas, portapapeles Excel, deshacer/rehacer y navegación avanzada. No se declara conformidad funcional completa.</p>
    </section>
  </div>;
}
