import { type ReactNode, useId } from 'react';
import { Button } from '../components';
import { Icon } from '../Icon';
import { ZenitSelect, type ZenitOption } from '../ZenitSelect';
import {
  nextSort,queryCollection,presentServerPage,selectedAllVisible,toggleIds,
  type CollectionColumn,type CollectionQuery,type RecordIdentity,type RecordWithId,type ServerPage,
} from './collectionCore';

export type OperationalColumn<Row>=CollectionColumn<Row>&{
  render?:(row:Row)=>ReactNode;
};
export type OperationalFilter=Readonly<{
  key:string;label:string;options:readonly ZenitOption<string>[];
}>;
type Props<Row extends RecordWithId>={
  rows?:readonly Row[];
  pageResult?:ServerPage<Row>;
  columns:readonly OperationalColumn<Row>[];
  query:CollectionQuery;
  onQueryChange:(value:CollectionQuery)=>void;
  selectedIds:readonly RecordIdentity[];
  onSelectedIdsChange:(value:RecordIdentity[])=>void;
  getRowLabel:(row:Row)=>string;
  renderMobileTitle?:(row:Row)=>ReactNode;
  mobileTitleColumnKey?:string;
  filters?:readonly OperationalFilter[];
  isLoading?:boolean;
  error?:string|null;
  onRetry?:()=>void;
  onOpenRow?:(row:Row)=>void;
  emptyLabel?:string;
  compact?:boolean;
  freezeHeader?:boolean;
  freezeFirstColumn?:boolean;
  freezeFirstRow?:boolean;
  locale?:string;
};

/** Presentation-only record collection. Never interprets a UI flag as authorization.
 * Loading/errors and domain operations are provided by each product adapter. */
export function OperationalRecords<Row extends RecordWithId>({
  rows=[],pageResult,columns,query,onQueryChange,selectedIds,onSelectedIdsChange,getRowLabel,
  filters=[],isLoading=false,error=null,onRetry,onOpenRow,emptyLabel='No hay registros.',
  compact=false,freezeHeader=false,freezeFirstColumn=false,freezeFirstRow=false,locale='es-ES',
  renderMobileTitle,mobileTitleColumnKey,
}:Props<Row>){
  // Remote pages already carry authoritative filtering, sorting and pagination.
  // In-memory mode remains unchanged for local fixtures and small datasets.
  const result=pageResult?presentServerPage(pageResult):queryCollection(rows,columns,query,locale);
  const id=useId();
  const selectedOnPage=selectedAllVisible(selectedIds,result.visibleRows);
  const update=(patch:Partial<CollectionQuery>)=>onQueryChange({...query,...patch});
  const toggleVisible=(checked:boolean)=>{
    onSelectedIdsChange(toggleIds(selectedIds,result.visibleRows.map(row=>row.id),checked));
  };
  const toggleOne=(record:Row,checked:boolean)=>{
    onSelectedIdsChange(toggleIds(selectedIds,[record.id],checked));
  };
  const pageSizeOptions:readonly ZenitOption<string>[]=[
    {value:'5',label:'5'},{value:'10',label:'10'},{value:'25',label:'25'},
  ];
  const selectedCount=selectedIds.length;
  const busy=isLoading||Boolean(error);
  return <section className={`operational-records ${compact?'operational-records--compact':''} ${freezeHeader?'operational-records--freeze-header':''} ${freezeFirstColumn?'operational-records--freeze-first-column':''} ${freezeFirstRow?'operational-records--freeze-first-row':''}`}
    aria-label="Registros operativos" data-operational-records="true">
    <div className="operational-records__toolbar">
      <label className="operational-records__search">
        <Icon name="search" size={16}/>
        <span className="sr-only">Buscar registros</span>
        <input aria-label="Buscar registros" value={query.search}
          placeholder="Buscar…" onChange={event=>update({search:event.target.value,page:1})}/>
      </label>
      {filters.map(filter=><ZenitSelect<string> key={filter.key} label={filter.label}
        className="operational-records__filter" searchable
        value={query.filters[filter.key]??''}
        options={filter.options}
        onChange={value=>update({filters:{...query.filters,[filter.key]:value},page:1})}/>)}
      <ZenitSelect<string> label="Por página" className="operational-records__limit"
        value={String(query.pageSize)} options={pageSizeOptions}
        onChange={value=>update({pageSize:Number(value),page:1})}/>
    </div>
    {busy?<div className="operational-records__state" role={error?'alert':'status'}>
      {error?<><Icon name="alert" size={18}/><span>{error}</span>
        {onRetry&&<Button variant="secondary" size="compact" onClick={onRetry}>Reintentar</Button>}</>:
        <><span className="operational-records__spinner" aria-hidden="true"/><span>Cargando registros…</span></>}
    </div>:<>
      <div className="operational-records__selected" role="status" aria-live="polite">
        {selectedCount>0&&<>{selectedCount} seleccionado(s)
          <Button variant="ghost" size="compact" onClick={()=>onSelectedIdsChange([])}>Limpiar selección</Button></>}
      </div>
      <div className="operational-records__desktop" data-record-scroll-region="true">
        <table style={{minWidth:`max(100%, ${100+columns.length*155+(onOpenRow?105:0)}px)`}}>
          <thead><tr>
            <th scope="col"><input id={id+'-all'} type="checkbox" checked={selectedOnPage}
              aria-label="Seleccionar todos los registros de esta página"
              onChange={event=>toggleVisible(event.target.checked)}/></th>
            {columns.map(column=><th key={column.key} scope="col"
              aria-sort={query.sort?.key===column.key?(query.sort.direction==='asc'?'ascending':'descending'):'none'}>
              {column.sortable?<button type="button" className="operational-records__sort"
                onClick={()=>update({sort:nextSort(query.sort,column.key),page:1})}
                aria-label={`Ordenar por ${column.label}`}>
                <span>{column.label}</span><Icon name="filter" size={13}/>
              </button>:column.label}
            </th>)}
            {onOpenRow&&<th scope="col">Acciones</th>}
          </tr></thead>
          <tbody>{result.visibleRows.map((row,rowIndex)=><tr key={String(row.id)} data-record-row={rowIndex}>
            <td><input type="checkbox" checked={selectedIds.includes(row.id)}
              aria-label={`Seleccionar ${getRowLabel(row)}`}
              onChange={event=>toggleOne(row,event.target.checked)}/></td>
            {columns.map(column=><td key={column.key} data-label={column.label}>
              {column.render?column.render(row):String(column.getValue(row)??'')}
            </td>)}
            {onOpenRow&&<td><Button size="compact" variant="secondary" onClick={()=>onOpenRow(row)}>
              Abrir</Button></td>}
          </tr>)}</tbody>
        </table>
        {result.total===0&&<div className="operational-records__empty" role="status">{emptyLabel}</div>}
      </div>
      <div className="operational-records__mobile" role="list" aria-label="Registros en tarjetas">
        {result.visibleRows.length>0&&<label className="operational-records__mobile-all">
          <input type="checkbox" aria-label="Seleccionar los registros de esta página"
            checked={selectedOnPage} onChange={event=>toggleVisible(event.target.checked)}/>
          <span>Seleccionar página</span>
        </label>}
        {result.visibleRows.map(row=><article key={String(row.id)} role="listitem"
          className="operational-records__card" data-record-id={row.id}>
          <div className="operational-records__card-head">
            <label><input type="checkbox" checked={selectedIds.includes(row.id)}
              aria-label={`Seleccionar ${getRowLabel(row)}`}
              onChange={event=>toggleOne(row,event.target.checked)}/></label>
            <div className="operational-records__card-title">
              {renderMobileTitle?renderMobileTitle(row):<strong>{getRowLabel(row)}</strong>}
            </div>
          </div>
          <dl>{columns.filter(column=>!(renderMobileTitle&&column.key===mobileTitleColumnKey)).map(column=><div key={column.key}>
            <dt>{column.label}</dt>
            <dd>{column.render?column.render(row):String(column.getValue(row)??'')}</dd>
          </div>)}</dl>
          {onOpenRow&&<Button variant="secondary" size="standard" onClick={()=>onOpenRow(row)}>Abrir</Button>}
        </article>)}
        {result.total===0&&<p className="operational-records__empty" role="status">{emptyLabel}</p>}
      </div>
      <div className="operational-records__footer">
        <span role="status" aria-live="polite">{result.total===0?'0 registros':
          `${result.from}–${result.to} de ${result.total}`}</span>
        <div className="operational-records__pages">
          <Button variant="secondary" size="compact" disabled={!result.hasPrevious}
            onClick={()=>update({page:result.page-1})}><Icon name="chevron-left" size={13}/> Anterior</Button>
          <span>Página {result.page} de {result.pageCount}</span>
          <Button variant="secondary" size="compact" disabled={!result.hasNext}
            onClick={()=>update({page:result.page+1})}>Siguiente <Icon name="chevron-right" size={13}/></Button>
        </div>
      </div>
    </>}
  </section>;
}
