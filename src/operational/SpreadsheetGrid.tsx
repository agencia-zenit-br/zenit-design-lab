import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type TouchEvent, type CSSProperties } from 'react';
import type { OperationalColumn } from './OperationalRecords';
import { Icon } from '../Icon';
import type { RecordIdentity, RecordWithId } from './collectionCore';

export type SheetSelection = {
  kind:'cell'|'column'|'row';
  rowId?:RecordIdentity;
  colKey?:string;
  anchorRow?:number;
  anchorCol?:number;
  endRow?:number;
  endCol?:number;
};
export type Guide<T> = {mode:'only'|'through';target:T}|null;
type Menu = {kind:'row'|'column';key:string;label:string;left:number;top:number};
type Props<Row extends RecordWithId> = {
  rows:readonly Row[];
  columns:readonly OperationalColumn<Row>[];
  getRowLabel:(row:Row)=>string;
  from:number;
  total:number;
  page:number;
  pageCount:number;
  pageSize:number;
  search:string;
  onSearch:(value:string)=>void;
  onPage:(value:number)=>void;
  onPageSize:(value:number)=>void;
  onUpdateCell:(rowId:RecordIdentity,columnKey:string,value:string)=>void;
  onRenameColumn:(key:string)=>void;
  onReorderColumn:(from:string,to:string)=>void;
  guideColumn?:Guide<string>;
  guideRow?:Guide<RecordIdentity>;
  onGuideColumn:(guide:Guide<string>)=>void;
  onGuideRow:(guide:Guide<RecordIdentity>)=>void;
  readOnly?:boolean;
  isLoading?:boolean;
  error?:string|null;
  onRetry?:()=>void;
};

/** A presentation adapter over an authorized page. It does not fetch, persist or authorize anything. */
export function SpreadsheetGrid<Row extends RecordWithId>({
  rows,columns,getRowLabel,from,total,page,pageCount,pageSize,search,onSearch,onPage,onPageSize,
  onUpdateCell,onRenameColumn,onReorderColumn,
  guideColumn=null,guideRow=null,onGuideColumn,onGuideRow,readOnly=false,isLoading=false,error=null,onRetry,
}:Props<Row>){
  const [selection,setSelection]=useState<SheetSelection|null>(null);
  const [menu,setMenu]=useState<Menu|null>(null);
  const [widths,setWidths]=useState<Record<string,number>>({});
  const [editing,setEditing]=useState<{rowId:RecordIdentity;key:string}|null>(null);
  const [draft,setDraft]=useState('');
  const [mobileColumn,setMobileColumn]=useState(columns[0]?.key??'');
  const tableRef=useRef<HTMLDivElement>(null);
  const menuRef=useRef<HTMLDivElement>(null);
  const resizeRef=useRef<(()=>void)|null>(null);
  const touchRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const menuTriggerRef=useRef<HTMLElement|null>(null);
  const cancelLongPress=()=>{
    if(touchRef.current!==null){clearTimeout(touchRef.current);touchRef.current=null;}
  };
  const longPress=(kind:'row'|'column',key:string,label:string,event:TouchEvent<HTMLElement>)=>{
    cancelLongPress();
    const touch=event.touches[0];
    if(!touch)return;
    const x=touch.clientX,y=touch.clientY;
    touchRef.current=setTimeout(()=>{openMenu(kind,key,label,x,y);touchRef.current=null;},550);
  };
  const isVisible=(key:string)=>columns.some(col=>col.key===key);
  const pinnedCol=guideColumn&&isVisible(guideColumn.target)?guideColumn:null;
  const pinnedRow=guideRow&&rows.some(row=>row.id===guideRow.target)?guideRow:null;
  const orderedCols=pinnedCol?.mode==='only'
    ?[...columns.filter(col=>col.key===pinnedCol.target),...columns.filter(col=>col.key!==pinnedCol.target)]
    :[...columns];
  const orderedRows=pinnedRow?.mode==='only'
    ?[...rows.filter(row=>row.id===pinnedRow.target),...rows.filter(row=>row.id!==pinnedRow.target)]
    :[...rows];
  const pinnedColCount=pinnedCol?.mode==='only'?1:pinnedCol
    ?Math.max(0,orderedCols.findIndex(col=>col.key===pinnedCol.target)+1):0;
  const pinnedRowCount=pinnedRow?.mode==='only'?1:pinnedRow
    ?Math.max(0,orderedRows.findIndex(row=>row.id===pinnedRow.target)+1):0;
  const colWidth=(key:string)=>widths[key]??164;
  const colOffsets=orderedCols.reduce<Record<string,number>>((all,col,index)=>{
    all[col.key]=index===0?48:48+orderedCols.slice(0,index).reduce((sum,item)=>sum+colWidth(item.key),0);
    return all;
  },{});
  const selected=(rowId:RecordIdentity,key:string,r:number,c:number)=>{
    if(!selection)return false;
    if(selection.kind==='row')return selection.rowId===rowId;
    if(selection.kind==='column')return selection.colKey===key;
    if(selection.anchorRow!==undefined&&selection.endRow!==undefined&&
      selection.anchorCol!==undefined&&selection.endCol!==undefined){
      return r>=Math.min(selection.anchorRow,selection.endRow)&&r<=Math.max(selection.anchorRow,selection.endRow)&&
        c>=Math.min(selection.anchorCol,selection.endCol)&&c<=Math.max(selection.anchorCol,selection.endCol);
    }
    return selection.rowId===rowId&&selection.colKey===key;
  };
  useEffect(()=>{
    if(!menu)return;
    const close=(e:globalThis.PointerEvent)=>{
      if(!menuRef.current?.contains(e.target as Node))setMenu(null);
    };
    const escape=(e:globalThis.KeyboardEvent)=>{
      if(e.key==='Escape'){setMenu(null);menuTriggerRef.current?.focus();}
    };
    document.addEventListener('pointerdown',close);
    document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape);};
  },[menu]);
  useEffect(()=>()=>{resizeRef.current?.();cancelLongPress();},[]);
  useEffect(()=>{
    if(menu)menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  },[menu]);
  const openMenu=(kind:'row'|'column',key:string,label:string,x:number,y:number)=>{
    setEditing(null);
    menuTriggerRef.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const selectedRow=rows.find(row=>String(row.id)===key);
    setSelection(kind==='row'?{kind:'row',rowId:selectedRow?.id}:{kind:'column',colKey:key});
    setMenu({kind,key,label,left:Math.max(6,Math.min(x,window.innerWidth-240)),
      top:Math.max(6,Math.min(y,window.innerHeight-265))});
  };
  const columnMenu=(event:MouseEvent<HTMLElement>,key:string,label:string)=>{
    event.preventDefault();openMenu('column',key,label,event.clientX,event.clientY);
  };
  const rowMenu=(event:MouseEvent<HTMLElement>,id:RecordIdentity,label:string)=>{
    event.preventDefault();openMenu('row',String(id),label,event.clientX,event.clientY);
  };
  const act=(kind:'only'|'through'|'clear'|'rename'|'left'|'right')=>{
    if(!menu)return;
    if(menu.kind==='column'){
      if(kind==='only'||kind==='through')onGuideColumn({mode:kind,target:menu.key});
      if(kind==='clear')onGuideColumn(null);
      if(kind==='rename')onRenameColumn(menu.key);
      const index=columns.findIndex(column=>column.key===menu.key);
      if(kind==='left'&&index>0)onReorderColumn(menu.key,columns[index-1].key);
      if(kind==='right'&&index<columns.length-1)onReorderColumn(menu.key,columns[index+1].key);
    }else{
      const row=rows.find(item=>String(item.id)===menu.key);
      if(row){
        if(kind==='only'||kind==='through')onGuideRow({mode:kind,target:row.id});
        if(kind==='clear')onGuideRow(null);
      }
    }
    setMenu(null);menuTriggerRef.current?.focus();
  };
  const beginResize=(event:PointerEvent<HTMLSpanElement>,key:string)=>{
    if(event.button!==0)return;
    event.preventDefault();event.stopPropagation();
    resizeRef.current?.();
    const initial=colWidth(key),x=event.clientX;
    const move=(ev:globalThis.PointerEvent)=>{
      setWidths(prev=>({...prev,[key]:Math.min(460,Math.max(105,initial+ev.clientX-x))}));
    };
    const stop=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',stop);
      window.removeEventListener('pointercancel',stop);resizeRef.current=null;};
    resizeRef.current=stop;
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',stop);
    window.addEventListener('pointercancel',stop);
  };
  const beginEdit=(row:Row,col:OperationalColumn<Row>)=>{
    if(readOnly)return;
    setEditing({rowId:row.id,key:col.key});
    setDraft(String(col.getValue(row)??''));
    setMenu(null);
  };
  const commit=()=>{
    if(!editing)return;
    onUpdateCell(editing.rowId,editing.key,draft);
    setEditing(null);
  };
  const onCellKey=(event:KeyboardEvent<HTMLTableCellElement>,r:number,c:number,row:Row,col:OperationalColumn<Row>)=>{
    if(event.key==='Enter'||event.key==='F2'){
      event.preventDefault();beginEdit(row,col);return;
    }
    if(event.key==='Escape'){setSelection(null);setMenu(null);return;}
    const moves:Record<string,[number,number]>={ArrowUp:[-1,0],ArrowDown:[1,0],
      ArrowLeft:[0,-1],ArrowRight:[0,1]};
    const move=moves[event.key];
    if(move){
      event.preventDefault();
      const nextRow=Math.max(0,Math.min(orderedRows.length-1,r+move[0]));
      const nextCol=Math.max(0,Math.min(orderedCols.length-1,c+move[1]));
      const next=orderedRows[nextRow],column=orderedCols[nextCol];
      setSelection({kind:'cell',rowId:next.id,colKey:column.key,anchorRow:nextRow,
        endRow:event.shiftKey?nextRow:nextRow,anchorCol:nextCol,endCol:nextCol});
      const cell=[...tableRef.current?.querySelectorAll<HTMLElement>('[data-sheet-cell]')??[]]
        .find(el=>el.dataset.sheetCell===String(next.id)+'::'+column.key);
      cell?.focus();return;
    }
    if(event.key.length===1&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&!readOnly){
      event.preventDefault();setEditing({rowId:row.id,key:col.key});setDraft(event.key);
    }
  };
  const rowOffset=48;
  const freezeStyle=(rowIndex:number,colIndex:number,colKey:string,head=false):CSSProperties=>{
    const pinnedX=colIndex<pinnedColCount,pinnedY=head||rowIndex<pinnedRowCount;
    return {
      ...(pinnedX?{position:'sticky',left:colOffsets[colKey],zIndex:pinnedY?8:4}:{}),
      ...(pinnedY?{position:'sticky',top:head?0:44+rowIndex*rowOffset,zIndex:pinnedX?8:head?6:5}:{}),
    };
  };
  const busy=isLoading||Boolean(error);
  return <section className="zenit-sheet" data-spreadsheet="true" aria-label="Hoja de registros">
    <div className="zenit-sheet__toolbar">
      <label>Buscar en la hoja <input aria-label="Buscar en la hoja" value={search} onChange={event=>onSearch(event.target.value)}/></label>
      <label>Filas por página <select aria-label="Filas por página" value={pageSize}
        onChange={event=>onPageSize(Number(event.target.value))}>
        {[5,10,25].map(size=><option value={size} key={size}>{size}</option>)}
      </select></label>
      <span className="zenit-sheet__hint">Selecciona letras o números; botón secundario o menú contextual para fijar guías</span>
      {(guideColumn||guideRow)&&<button className="zenit-sheet__clear" type="button" onClick={()=>{
        onGuideColumn(null);onGuideRow(null);
      }}>Quitar guías</button>}
    </div>
    {busy?<div className="zenit-sheet__state" role={error?'alert':'status'}>
      {error?<>{error} {onRetry&&<button type="button" onClick={onRetry}>Reintentar</button>}</>:'Cargando registros…'}
    </div>:<>
    <div className="zenit-sheet__scroll" ref={tableRef} data-sheet-scroll="true">
      <table role="grid" aria-label="Hoja editable" className="zenit-sheet__table" style={{width:48+orderedCols.reduce((n,col)=>n+colWidth(col.key),0)}}>
        <colgroup><col style={{width:48}}/>{orderedCols.map(col=><col key={col.key} style={{width:colWidth(col.key)}}/>)}</colgroup>
        <thead><tr>
          <th className="zenit-sheet__corner" aria-label="Esquina de la hoja" style={{position:'sticky',left:0,top:0,zIndex:10}}>#</th>
          {orderedCols.map((col,c)=>{
            const letter=String.fromCharCode(65+c);
            return <th key={col.key} scope="col" className={'zenit-sheet__head'+(selection?.kind==='column'&&selection.colKey===col.key?' is-selected':'')+(c<pinnedColCount?' is-guide':'')}
              style={freezeStyle(-1,c,col.key,true)}
              data-sheet-column={col.key}
              onContextMenu={event=>columnMenu(event,col.key,col.label)}
              onDragOver={event=>event.preventDefault()}
              onDrop={event=>{event.preventDefault();const source=event.dataTransfer.getData('text/plain');if(source&&source!==col.key)onReorderColumn(source,col.key);}}
            >
              <div className="zenit-sheet__head-inner">
                <button type="button" className="zenit-sheet__head-select"
                  draggable onDragStart={event=>event.dataTransfer.setData('text/plain',col.key)}
                  onTouchStart={event=>longPress('column',col.key,col.label,event)}
                  onTouchMove={cancelLongPress} onTouchEnd={cancelLongPress}
                  onClick={()=>setSelection({kind:'column',colKey:col.key})}
                  onContextMenu={event=>columnMenu(event,col.key,col.label)}
                  aria-label={'Seleccionar columna '+col.label}>{letter}</button>
                <button type="button" className="zenit-sheet__head-title"
                  onClick={()=>setSelection({kind:'column',colKey:col.key})}
                  onDoubleClick={()=>onRenameColumn(col.key)}
                  onContextMenu={event=>columnMenu(event,col.key,col.label)}>{col.label}</button>
                <button type="button" className="zenit-sheet__more" aria-label={'Opciones de columna '+col.label}
                  onClick={event=>{const box=event.currentTarget.getBoundingClientRect();
                    openMenu('column',col.key,col.label,box.left,box.bottom+4);}}><Icon name="more" size={15}/></button>
                <span role="separator" aria-orientation="vertical" tabIndex={0} className="zenit-sheet__resizer"
                  aria-label={'Redimensionar '+col.label}
                  onPointerDown={event=>beginResize(event,col.key)}
                  onKeyDown={event=>{
                    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
                      event.preventDefault();setWidths(prev=>({...prev,[col.key]:
                        Math.min(460,Math.max(105,colWidth(col.key)+(event.key==='ArrowRight'?15:-15)))}));
                    }
                  }}/>
              </div>
            </th>;
          })}
        </tr></thead>
        <tbody>
          {orderedRows.map((row,r)=><tr key={String(row.id)} data-sheet-row={String(row.id)}>
            <th className={'zenit-sheet__rowhead'+(selection?.kind==='row'&&selection.rowId===row.id?' is-selected':'')+(r<pinnedRowCount?' is-guide':'')}
              scope="row" style={{position:'sticky',left:0,top:r<pinnedRowCount?44+r*rowOffset:undefined,zIndex:r<pinnedRowCount?9:7}}
              onContextMenu={event=>rowMenu(event,row.id,getRowLabel(row))}>
              <button type="button" className="zenit-sheet__row-select"
                aria-label={'Seleccionar fila '+String(from+r)}
                onTouchStart={event=>longPress('row',String(row.id),getRowLabel(row),event)}
                onTouchMove={cancelLongPress} onTouchEnd={cancelLongPress}
                onClick={()=>setSelection({kind:'row',rowId:row.id})}>{from+r}</button>
              <button type="button" className="zenit-sheet__more" aria-label={'Opciones de fila '+String(from+r)}
                onClick={event=>{const box=event.currentTarget.getBoundingClientRect();
                  openMenu('row',String(row.id),getRowLabel(row),box.left,box.bottom+4);}}><Icon name="more" size={15}/></button>
            </th>
            {orderedCols.map((col,c)=>{
              const active=selected(row.id,col.key,r,c);
              const isEditing=editing?.rowId===row.id&&editing.key===col.key;
              return <td key={col.key} data-sheet-cell={String(row.id)+'::'+col.key}
                data-selected={active?'true':undefined}
                className={(active?'is-selected ':'')+(r<pinnedRowCount||c<pinnedColCount?'is-guide':'')}
                style={freezeStyle(r,c,col.key)}
                tabIndex={0} role="gridcell" aria-selected={active}
                onClick={event=>{
                  if(event.shiftKey&&selection?.kind==='cell'&&selection.anchorRow!==undefined&&selection.anchorCol!==undefined){
                    setSelection({...selection,kind:'cell',endRow:r,endCol:c});
                  }else setSelection({kind:'cell',rowId:row.id,colKey:col.key,
                    anchorRow:r,anchorCol:c,endRow:r,endCol:c});
                }}
                onContextMenu={event=>{if(selection?.kind==='column')columnMenu(event,col.key,col.label);
                  else if(selection?.kind==='row')rowMenu(event,row.id,getRowLabel(row));}}
                onDoubleClick={()=>beginEdit(row,col)}
                onKeyDown={event=>{if(!isEditing)onCellKey(event,r,c,row,col);}}>
                {isEditing?<input autoFocus className="zenit-sheet__cell-editor" aria-label={'Editar '+col.label+' de '+getRowLabel(row)}
                  value={draft} onChange={event=>setDraft(event.target.value)}
                  onBlur={commit}
                  onKeyDown={event=>{
                    if(event.key==='Enter'){event.preventDefault();commit();}
                    if(event.key==='Escape'){event.preventDefault();setEditing(null);}
                    event.stopPropagation();
                  }}/>:String(col.getValue(row)??'')}
              </td>;
            })}
          </tr>)}
        </tbody>
      </table>
      {!orderedRows.length&&<p className="zenit-sheet__empty">No hay registros coincidentes.</p>}
    </div>
    <div className="zenit-sheet__mobile" role="list" aria-label="Registros de la hoja en tarjetas">
      <div className="zenit-sheet__mobile-guide">
        <label>Columna
          <select aria-label="Seleccionar columna móvil" value={isVisible(mobileColumn)?mobileColumn:columns[0]?.key??''}
            onChange={event=>setMobileColumn(event.target.value)}>
            {columns.map(col=><option key={col.key} value={col.key}>{col.label}</option>)}
          </select>
        </label>
        <button type="button" onClick={event=>{const col=columns.find(item=>item.key===(isVisible(mobileColumn)?mobileColumn:columns[0]?.key));
          if(!col)return;const box=event.currentTarget.getBoundingClientRect();
          openMenu('column',col.key,col.label,box.left,box.bottom+4);
        }}>Opciones de columna <Icon name="more" size={15}/></button>
      </div>
      {orderedRows.map((row,r)=><article key={String(row.id)} role="listitem" className="zenit-sheet__card">
        <div className="zenit-sheet__card-head">
          <strong>Fila {from+r}</strong>
          <button type="button" aria-label={'Opciones de fila '+String(from+r)}
            onTouchStart={event=>longPress('row',String(row.id),getRowLabel(row),event)}
            onTouchMove={cancelLongPress} onTouchEnd={cancelLongPress}
            onClick={event=>{
            const box=event.currentTarget.getBoundingClientRect();
            openMenu('row',String(row.id),getRowLabel(row),box.left,box.bottom+4);
          }}><Icon name="more" size={15}/></button>
        </div>
        <dl>{orderedCols.map(col=><div key={col.key}>
          <dt>{col.label}</dt>
          <dd>{editing?.rowId===row.id&&editing.key===col.key
            ?<input autoFocus className="zenit-sheet__cell-editor"
              aria-label={'Editar '+col.label+' de '+getRowLabel(row)} value={draft}
              onChange={event=>setDraft(event.target.value)} onBlur={commit}
              onKeyDown={event=>{
                if(event.key==='Enter'){event.preventDefault();commit();}
                if(event.key==='Escape'){event.preventDefault();setEditing(null);}
              }}/>
            :<button type="button" className="zenit-sheet__mobile-value"
              aria-label={'Editar '+col.label+' de '+getRowLabel(row)}
              onClick={()=>beginEdit(row,col)}>{String(col.getValue(row)??'')||'—'}</button>}
          </dd>
        </div>)}</dl>
      </article>)}
    </div>
    <div className="zenit-sheet__footer">
      <span>{total===0?'0 registros':String(from)+'–'+String(from+orderedRows.length-1)+' de '+String(total)}</span>
      <div><button type="button" disabled={page<=1} onClick={()=>{setSelection(null);onPage(page-1);}}>Anterior</button>
        <span>Página {page} de {pageCount}</span>
        <button type="button" disabled={page>=pageCount} onClick={()=>{setSelection(null);onPage(page+1);}}>Siguiente</button>
      </div>
    </div>
    </>}
    {menu&&<div ref={menuRef} className="zenit-sheet__menu" role="menu" aria-label={'Opciones de '+(menu.kind==='row'?'fila':'columna')}
      style={{left:menu.left,top:menu.top}}>
      <div className="zenit-sheet__menu-caption">{menu.label}</div>
      <button type="button" role="menuitem" onClick={()=>act('only')}>{menu.kind==='row'?'Fijar esta fila como guía':'Fijar esta columna como guía'}</button>
      <button type="button" role="menuitem" onClick={()=>act('through')}>{menu.kind==='row'?'Fijar hasta esta fila':'Fijar hasta esta columna'}</button>
      <button type="button" role="menuitem" onClick={()=>act('clear')}>Quitar fijación</button>
      {menu.kind==='column'&&<>
        <button type="button" role="menuitem" onClick={()=>act('rename')}>Cambiar título</button>
        <button type="button" role="menuitem" onClick={()=>act('left')}>Mover a la izquierda</button>
        <button type="button" role="menuitem" onClick={()=>act('right')}>Mover a la derecha</button>
      </>}
      <button type="button" role="menuitem" onClick={()=>{setMenu(null);menuTriggerRef.current?.focus();}}>Cerrar menú</button>
    </div>}
  </section>;
}
