import { useState } from 'react';
import { Button, StatusPill } from '../components';
import { Icon } from '../Icon';
import { ContextHelp } from '../ContextHelp';
import { OperationalRecords, type OperationalColumn, type OperationalFilter } from './OperationalRecords';
import { ActionConfirm, OperationNotice, type FeedbackMessage } from './OperationFeedback';
import { queryCollection, reconcileSelectedIds, type CollectionQuery, type RecordIdentity } from './collectionCore';

type SampleRecord={id:number;name:string;category:string;status:'Activo'|'Pendiente'|'Completado';updated:string;revision:number;extras?:Record<string,string>};
const categories=['General','Contenido','Diseño','Soporte'];
const sampleRows:SampleRecord[]=Array.from({length:17},(_,index)=>({
  id:index+1,name:`Registro ${String(index+1).padStart(2,'0')}`,
  category:categories[index%categories.length],
  status:index%4===0?'Pendiente':index%3===0?'Completado':'Activo',
  updated:`2026-10-${String((index%17)+1).padStart(2,'0')}`,
  revision:1,
}));
const initialQuery:CollectionQuery={search:'',filters:{status:''},sort:{key:'name',direction:'asc'},page:1,pageSize:5};
const baseColumns:readonly OperationalColumn<SampleRecord>[]=[
  {key:'name',label:'Nombre',getValue:row=>row.name,sortable:true},
  {key:'category',label:'Categoría',getValue:row=>row.category,sortable:true,filterable:true},
  {key:'status',label:'Estado',getValue:row=>row.status,sortable:true,filterable:true,
    render:row=><StatusPill tone={row.status==='Completado'?'success':row.status==='Pendiente'?'warning':'neutral'}>{row.status}</StatusPill>},
  {key:'updated',label:'Actualizado',getValue:row=>row.updated,sortable:true},
];
const filters:readonly OperationalFilter[]=[{key:'status',label:'Estado',options:[
  {value:'',label:'Todos'},
  {value:'Activo',label:'Activo'},
  {value:'Pendiente',label:'Pendiente'},
  {value:'Completado',label:'Completado'},
]}];

/** Product-neutral record consumer, with simulated data and explicit local-only feedback.
 * A future Platform backend may replace this state via RecordsDataSource adapter. */
export function OperationalWorkbench(){
  const [rows,setRows]=useState<SampleRecord[]>(sampleRows);
  const [query,setQuery]=useState<CollectionQuery>(initialQuery);
  const [selected,setSelected]=useState<RecordIdentity[]>([]);
  const [notice,setNotice]=useState<FeedbackMessage|null>(null);
  const [confirm,setConfirm]=useState(false);
  const [compact,setCompact]=useState(false);
  const [remote,setRemote]=useState(false);
  const [scenario,setScenario]=useState<'ready'|'loading'|'error'>('ready');
  const [sequence,setSequence]=useState(1);
  const [customColumns,setCustomColumns]=useState<{key:string;label:string}[]>([]);
  const [hiddenColumns,setHiddenColumns]=useState<string[]>([]);
  const [columnLabel,setColumnLabel]=useState('');
  const [columnSerial,setColumnSerial]=useState(1);
  const [freezeHeader,setFreezeHeader]=useState(true);
  const [freezeFirstColumn,setFreezeFirstColumn]=useState(false);
  const [freezeFirstRow,setFreezeFirstRow]=useState(false);
  const allColumns:readonly OperationalColumn<SampleRecord>[]=[
    ...baseColumns,
    ...customColumns.map(column=>({
      key:column.key,label:column.label,
      getValue:(row:SampleRecord)=>row.extras?.[column.key]??'',
      render:(row:SampleRecord)=><input className="operational-records__editable-cell"
        type="text" aria-label={column.label+' de '+row.name}
        value={row.extras?.[column.key]??''}
        onChange={event=>{
          const value=event.target.value;
          setRows(previous=>previous.map(item=>item.id===row.id
            ? {...item,extras:{...item.extras,[column.key]:value}}:item));
        }}/>,
    })),
  ];
  const visibleColumns=allColumns.filter(column=>!hiddenColumns.includes(column.key));
  const addColumn=()=>{
    const label=columnLabel.trim();
    if(!label){notify('warning','Escribe un nombre para la nueva columna.');return;}
    if(label.length>40){notify('warning','El nombre de columna no puede superar 40 caracteres.');return;}
    const key='custom_'+columnSerial;
    setCustomColumns(previous=>[...previous,{key,label}]);
    setColumnSerial(value=>value+1);
    setColumnLabel('');
    notify('success','Se añadió una columna editable solo a la demostración.');
  };
  const shiftColumn=(key:string,delta:number)=>{
    setCustomColumns(previous=>{
      const index=previous.findIndex(column=>column.key===key),next=index+delta;
      if(index<0||next<0||next>=previous.length)return previous;
      const reordered=[...previous];
      [reordered[index],reordered[next]]=[reordered[next],reordered[index]];
      return reordered;
    });
  };
  const notify=(level:FeedbackMessage['level'],message:string)=>{
    setNotice({id:sequence,level,message});setSequence(previous=>previous+1);
  };
  const add=()=>{
    const id=Math.max(0,...rows.map(row=>row.id))+1;
    setRows(previous=>[...previous,{
      id,name:`Registro ${String(id).padStart(2,'0')}`,category:'General',
      status:'Pendiente',updated:'2026-10-18',revision:1,
    }]);
    setQuery(previous=>({...previous,search:'',filters:{status:''},sort:null,page:1}));
    notify('success','Se añadió un registro de ejemplo. No se enviaron datos al servidor.');
  };
  const remove=()=>{
    const toRemove=new Set(selected);
    setRows(previous=>previous.filter(row=>!toRemove.has(row.id)));
    setSelected([]);
    setConfirm(false);
    notify('success',`Se eliminaron ${toRemove.size} registros únicamente de la demostración.`);
  };
  const open=(row:SampleRecord)=>notify('info',`Se seleccionó «${row.name}». La apertura de detalles se implementará en cada producto consumidor.`);
  const reset=()=>{
    setQuery(initialQuery);setSelected([]);setRows(sampleRows);setNotice(null);setScenario('ready');setCompact(false);setRemote(false);setConfirm(false);
    setCustomColumns([]);setHiddenColumns([]);setColumnLabel('');setColumnSerial(1);
    setFreezeHeader(true);setFreezeFirstColumn(false);setFreezeFirstRow(false);
  };
  const select=(ids:RecordIdentity[])=>setSelected(reconcileSelectedIds(ids,rows));
  // The Lab uses a synthetic, in-memory server simulator. No remote API is invoked.
  const simulated=queryCollection(rows,visibleColumns,query);
  const pageResult=remote?{rows:simulated.visibleRows,total:simulated.total,
    page:simulated.page,pageSize:simulated.pageSize}:undefined;
  return <div className="operational-workbench" data-operational-workbench="true">
    <div className="operational-workbench__actions">
      <label className="catalog__check"><input type="checkbox" checked={compact}
        onChange={event=>setCompact(event.target.checked)}/> Compacto</label>
      <label className="catalog__check"><input type="checkbox" data-remote-page-demo="true" checked={remote}
        onChange={event=>setRemote(event.target.checked)}/> Servidor simulado</label>
      <div className="operational-workbench__action-buttons">
        <Button variant="secondary" size="compact" onClick={add}><Icon name="plus" size={14}/> Añadir</Button>
        <Button variant="danger" size="compact" disabled={!selected.length}
          onClick={()=>setConfirm(true)}><Icon name="trash" size={14}/> Eliminar ({selected.length})</Button>
        <Button variant="ghost" size="compact" onClick={reset}>Restablecer ejemplo</Button>
      </div>
      <ContextHelp label="Simular estados de consulta">
        Los controles de prueba permiten comprobar carga, error y recuperación sin conexión a servidores reales.
        La autorización, auditoría y resolución de conflictos pertenecen al adaptador del producto.
      </ContextHelp>
    </div>
    <div className="operational-workbench__columns" data-column-manager="true">
      <div className="operational-workbench__columns-head">
        <strong>Columnas de la tabla</strong>
        <ContextHelp label="Gestión de columnas de ejemplo">
          Las columnas personalizadas y sus valores son locales a esta demostración.
          Modificar la vista no modifica el esquema ni los permisos de una base de datos.
        </ContextHelp>
      </div>
      <div className="operational-workbench__column-add">
        <label className="operational-workbench__column-label">Nueva columna
          <input aria-label="Nombre de columna nueva" value={columnLabel} maxLength={40}
            onChange={event=>setColumnLabel(event.target.value)}
            onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();addColumn();}}}
            placeholder="Ejemplo: Responsable"/>
        </label>
        <Button size="compact" variant="secondary" onClick={addColumn}>
          <Icon name="plus" size={13}/> Añadir columna
        </Button>
      </div>
      <div className="operational-workbench__column-list" aria-label="Visibilidad y orden de columnas">
        {allColumns.map(column=><div className="operational-workbench__column-item" key={column.key}>
          <label className="catalog__check"><input type="checkbox"
            checked={!hiddenColumns.includes(column.key)}
            aria-label={'Mostrar columna '+column.label}
            disabled={column.key==='name'}
            onChange={event=>setHiddenColumns(previous=>event.target.checked
              ? previous.filter(key=>key!==column.key):[...previous,column.key])}/>
            <span>{column.label}</span>
          </label>
          {column.key.startsWith('custom_')&&<>
            <button className="icon-button" type="button"
              aria-label={'Mover '+column.label+' a la izquierda'}
              disabled={customColumns.findIndex(item=>item.key===column.key)===0}
              onClick={()=>shiftColumn(column.key,-1)}><Icon name="chevron-left" size={14}/></button>
            <button className="icon-button" type="button"
              aria-label={'Mover '+column.label+' a la derecha'}
              disabled={customColumns.findIndex(item=>item.key===column.key)===customColumns.length-1}
              onClick={()=>shiftColumn(column.key,1)}><Icon name="chevron-right" size={14}/></button>
            <button className="icon-button" type="button"
              aria-label={'Eliminar columna '+column.label}
              onClick={()=>{
                setCustomColumns(previous=>previous.filter(item=>item.key!==column.key));
                setHiddenColumns(previous=>previous.filter(key=>key!==column.key));
                if(query.sort?.key===column.key)setQuery(previous=>({...previous,sort:null,page:1}));
              }}><Icon name="x" size={14}/></button>
          </>}
        </div>)}
      </div>
      <div className="operational-workbench__freeze" role="group" aria-label="Filas y columnas guía">
        <label className="catalog__check"><input type="checkbox" checked={freezeHeader}
          onChange={event=>setFreezeHeader(event.target.checked)}/> Fijar encabezado</label>
        <label className="catalog__check"><input type="checkbox" checked={freezeFirstRow}
          onChange={event=>setFreezeFirstRow(event.target.checked)}/> Fijar primera fila</label>
        <label className="catalog__check"><input type="checkbox" checked={freezeFirstColumn}
          onChange={event=>setFreezeFirstColumn(event.target.checked)}/> Fijar primera columna</label>
      </div>
    </div>
    <div className="operational-workbench__simulation" aria-label="Estados de demostración">
      <button type="button" className={scenario==='ready'?'operational-workbench__simulation--active':''} onClick={()=>setScenario('ready')}>Datos</button>
      <button type="button" className={scenario==='loading'?'operational-workbench__simulation--active':''} onClick={()=>setScenario('loading')}>Carga</button>
      <button type="button" className={scenario==='error'?'operational-workbench__simulation--active':''} onClick={()=>setScenario('error')}>Error</button>
    </div>
    <div className="operational-workbench__feedback-slot" data-feedback-slot="true">
      <OperationNotice notice={notice} onDismiss={()=>setNotice(null)}/>
      {confirm&&<ActionConfirm question={`¿Eliminar ${selected.length} registro(s) de esta demostración?`}
        onConfirm={remove} onCancel={()=>setConfirm(false)}/>}
    </div>
    <OperationalRecords rows={remote?[]:rows} pageResult={pageResult} columns={visibleColumns} query={query}
      onQueryChange={setQuery} selectedIds={selected} onSelectedIdsChange={select}
      getRowLabel={row=>row.name} filters={filters} compact={compact}
      freezeHeader={freezeHeader} freezeFirstRow={freezeFirstRow} freezeFirstColumn={freezeFirstColumn}
      isLoading={scenario==='loading'} error={scenario==='error'?'No se pudieron consultar los registros de demostración.':null}
      onRetry={()=>{setScenario('ready');notify('info','Consulta restablecida en el laboratorio.');}}
      onOpenRow={open} emptyLabel="No hay registros para estos filtros."/>
  </div>;
}
