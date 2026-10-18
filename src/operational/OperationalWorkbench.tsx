import { useState } from 'react';
import { Button, StatusPill } from '../components';
import { Icon } from '../Icon';
import { ContextHelp } from '../ContextHelp';
import { OperationalRecords, type OperationalColumn, type OperationalFilter } from './OperationalRecords';
import { ActionConfirm, OperationNotice, type FeedbackMessage } from './OperationFeedback';
import { reconcileSelectedIds, type CollectionQuery, type RecordIdentity } from './collectionCore';

type SampleRecord={id:number;name:string;category:string;status:'Activo'|'Pendiente'|'Completado';updated:string;revision:number};
const categories=['General','Contenido','Diseño','Soporte'];
const sampleRows:SampleRecord[]=Array.from({length:17},(_,index)=>({
  id:index+1,name:`Registro ${String(index+1).padStart(2,'0')}`,
  category:categories[index%categories.length],
  status:index%4===0?'Pendiente':index%3===0?'Completado':'Activo',
  updated:`2026-10-${String((index%17)+1).padStart(2,'0')}`,
  revision:1,
}));
const initialQuery:CollectionQuery={search:'',filters:{status:''},sort:{key:'name',direction:'asc'},page:1,pageSize:5};
const columns:readonly OperationalColumn<SampleRecord>[]=[
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
  const [scenario,setScenario]=useState<'ready'|'loading'|'error'>('ready');
  const [sequence,setSequence]=useState(1);
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
    setQuery(initialQuery);setSelected([]);setRows(sampleRows);setNotice(null);setScenario('ready');setCompact(false);setConfirm(false);
  };
  const select=(ids:RecordIdentity[])=>setSelected(reconcileSelectedIds(ids,rows));
  return <div className="operational-workbench" data-operational-workbench="true">
    <div className="operational-workbench__actions">
      <label className="catalog__check"><input type="checkbox" checked={compact}
        onChange={event=>setCompact(event.target.checked)}/> Compacto</label>
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
    <div className="operational-workbench__simulation" aria-label="Estados de demostración">
      <button type="button" className={scenario==='ready'?'operational-workbench__simulation--active':''} onClick={()=>setScenario('ready')}>Datos</button>
      <button type="button" className={scenario==='loading'?'operational-workbench__simulation--active':''} onClick={()=>setScenario('loading')}>Carga</button>
      <button type="button" className={scenario==='error'?'operational-workbench__simulation--active':''} onClick={()=>setScenario('error')}>Error</button>
    </div>
    <OperationNotice notice={notice} onDismiss={()=>setNotice(null)}/>
    {confirm&&<ActionConfirm question={`¿Eliminar ${selected.length} registro(s) de esta demostración?`}
      onConfirm={remove} onCancel={()=>setConfirm(false)}/>}
    <OperationalRecords rows={rows} columns={columns} query={query}
      onQueryChange={setQuery} selectedIds={selected} onSelectedIdsChange={select}
      getRowLabel={row=>row.name} filters={filters} compact={compact}
      isLoading={scenario==='loading'} error={scenario==='error'?'No se pudieron consultar los registros de demostración.':null}
      onRetry={()=>{setScenario('ready');notify('info','Consulta restablecida en el laboratorio.');}}
      onOpenRow={open} emptyLabel="No hay registros para estos filtros."/>
  </div>;
}
