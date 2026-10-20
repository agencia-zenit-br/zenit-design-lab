import { useEffect, useRef, useState, type KeyboardEvent, type ClipboardEvent, type MouseEvent, type PointerEvent, type TouchEvent, type CSSProperties } from 'react';
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
export type SheetCellFormat = {align:'left'|'center'|'right'|'justify';bold:boolean;italic:boolean;underline:boolean;highlight:boolean};
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
  cellFormats?:Readonly<Record<string,SheetCellFormat>>;
  onCellFormatsChange?:(formats:Record<string,SheetCellFormat>)=>void;
  rowTitles?:Readonly<Record<string,string>>;
  onRowTitlesChange?:(titles:Record<string,string>)=>void;
  readOnly?:boolean;
  isLoading?:boolean;
  error?:string|null;
  onRetry?:()=>void;
};

/** A presentation adapter over an authorized page. It does not fetch, persist or authorize anything. */
export function SpreadsheetGrid<Row extends RecordWithId>({
  rows,columns,getRowLabel,from,total,page,search,onSearch,
  onUpdateCell,onRenameColumn,onReorderColumn,
  guideColumn=null,guideRow=null,onGuideColumn,onGuideRow,
  cellFormats:controlledFormats,onCellFormatsChange,rowTitles:controlledRowTitles,onRowTitlesChange,
  readOnly=false,isLoading=false,error=null,onRetry,
}:Props<Row>){
  const [selection,setSelection]=useState<SheetSelection|null>(null);
  const [sheetTitle,setSheetTitle]=useState('Hoja de registros');
  const [editingRowTitle,setEditingRowTitle]=useState<string|null>(null);
  // A visual draft is never a business record; adapters must opt in to persistence.
  const [draftCells,setDraftCells]=useState<Record<string,string>>({});
  const [draftEditing,setDraftEditing]=useState<string|null>(null);
  const [draftInput,setDraftInput]=useState('');
  const [draftRowTitles,setDraftRowTitles]=useState<Record<string,string>>({});
  const draftKey=(r:number,c:number)=>r+':'+c;
  const draftRowKey=(r:number)=>'__draft_row_'+r;
  const draftId=(r:number)=>draftRowKey(r);
  const [localRowTitles,setLocalRowTitles]=useState<Record<string,string>>({});
  const [localFormats,setLocalFormats]=useState<Record<string,SheetCellFormat>>({});
  const rowTitles=controlledRowTitles??localRowTitles;
  const cellFormats=controlledFormats??localFormats;
  const updateRowTitle=(id:RecordIdentity,title:string)=>{
    if(readOnly)return;
    const next={...rowTitles,[String(id)]:title};
    if(controlledRowTitles===undefined)setLocalRowTitles(next);
    onRowTitlesChange?.(next);
  };
  const formatKey=(id:RecordIdentity,key:string)=>String(id)+'::'+key;
  const applyFormat=(change:Partial<{align:'left'|'center'|'right'|'justify';bold:boolean;italic:boolean;underline:boolean;highlight:boolean}>)=>{
    if(selection?.kind!=='cell')return;
    const rowStart=Math.min(selection.anchorRow??0,selection.endRow??0);
    const rowEnd=Math.max(selection.anchorRow??0,selection.endRow??0);
    const colStart=Math.min(selection.anchorCol??0,selection.endCol??0);
    const colEnd=Math.max(selection.anchorCol??0,selection.endCol??0);
    if(readOnly)return;
    const previous=cellFormats;
    {
      const next={...previous};
      for(let r=rowStart;r<=rowEnd;r++)for(let c=colStart;c<=colEnd;c++){
        const row=orderedRows[r],col=orderedCols[c];if(!row||!col)continue;
        const key=formatKey(row.id,col.key);
        next[key]={...(previous[key]??{align:'left',bold:false,italic:false,underline:false,highlight:false}),...change};
      }
      if(controlledFormats===undefined)setLocalFormats(next);
      onCellFormatsChange?.(next);
    }
  };
  const [menu,setMenu]=useState<Menu|null>(null);
  const [widths,setWidths]=useState<Record<string,number>>({});
  const [editing,setEditing]=useState<{rowId:RecordIdentity;key:string;origin:'desktop'|'mobile'}|null>(null);
  const [draft,setDraft]=useState('');
  const [mobileColumn,setMobileColumn]=useState(columns[0]?.key??'');
  const [viewport,setViewport]=useState({width:820,height:300});

  const [dragging,setDragging]=useState(false);
  const dragAnchor=useRef<{row:number;col:number}|null>(null);

  const tableRef=useRef<HTMLDivElement>(null);
  const menuRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const element=tableRef.current;
    if(!element)return;
    const observer=new ResizeObserver(()=>{
      setViewport({width:element.clientWidth,height:element.clientHeight});
    });
    observer.observe(element);
    setViewport({width:element.clientWidth,height:element.clientHeight});
    return()=>observer.disconnect();
  },[]);
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
  // Display-only cells complete the available grid; they are never records or writes.
  const [columnCanvasReserve,setColumnCanvasReserve]=useState(0);
  const extraColumns=Math.max(0,Math.min(64,Math.max(columnCanvasReserve,Math.ceil((viewport.width-96-orderedCols.reduce((n,col)=>n+colWidth(col.key),0))/164))));
  const visualColumns=[...orderedCols,...Array.from({length:extraColumns},(_,index)=>({
    key:'__blank_col_'+index,label:'',getValue:()=>'',sortable:false
  } as OperationalColumn<Row>))];
  // Grow the visual canvas in bounded batches as users approach its last visible guides.
  // Placeholders remain display-only: no synthetic records are sent to the adapter.
  const [rowCanvasReserve,setRowCanvasReserve]=useState(0);
  const extraRows=Math.min(160,Math.max(20,rowCanvasReserve,Math.ceil((viewport.height-44-orderedRows.length*48)/48)));
  const isBlankColumn=(key:string)=>key.startsWith('__blank_col_');
  const columnLetter=(index:number)=>{
    let value='',n=index+1;
    while(n>0){n--;value=String.fromCharCode(65+(n%26))+value;n=Math.floor(n/26);}
    return value;
  };
  const colOffsets=visualColumns.reduce<Record<string,number>>((all,col,index)=>{
    all[col.key]=index===0?96:96+visualColumns.slice(0,index).reduce((sum,item)=>sum+colWidth(item.key),0);
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
    setMenu(null);
    if(kind!=='rename')menuTriggerRef.current?.focus();
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
  const beginEdit=(row:Row,col:OperationalColumn<Row>,origin:'desktop'|'mobile'='desktop')=>{
    if(readOnly)return;
    skipBlurCommit.current=false;
    setEditing({rowId:row.id,key:col.key,origin});
    setDraft(String(col.getValue(row)??''));
    setMenu(null);
  };
  const skipBlurCommit=useRef(false);
  const cancelEdit=()=>{
    skipBlurCommit.current=true;
    setEditing(null);
  };
  const commit=(value:string)=>{
    if(!editing||skipBlurCommit.current){skipBlurCommit.current=false;return;}
    const source=rows.find(row=>row.id===editing.rowId);
    const column=columns.find(col=>col.key===editing.key);
    const before=source&&column?String(column.getValue(source)??''):null;
    if(before!==null&&before!==value){
      undoStack.current.push({rowId:editing.rowId,key:editing.key,before,after:value});
      if(undoStack.current.length>100)undoStack.current.shift();
    }
    if(before!==value)onUpdateCell(editing.rowId,editing.key,value);
    setEditing(null);
  };
  const blurCommit=(value:string)=>{
    if(skipBlurCommit.current){skipBlurCommit.current=false;return;}
    commit(value);
  };
  const endDrag=()=>{dragAnchor.current=null;setDragging(false);};
  useEffect(()=>{
    if(!dragging)return;
    window.addEventListener('pointerup',endDrag);
    window.addEventListener('pointercancel',endDrag);
    return()=>{window.removeEventListener('pointerup',endDrag);window.removeEventListener('pointercancel',endDrag);};
  },[dragging]);
  const selectCell=(rowId:RecordIdentity,key:string,r:number,c:number,extend=false)=>{
    if(extend&&selection?.kind==='cell'&&selection.anchorRow!==undefined&&selection.anchorCol!==undefined){
      setSelection({...selection,endRow:r,endCol:c});
    }else{
      setSelection({kind:'cell',rowId,colKey:key,anchorRow:r,anchorCol:c,endRow:r,endCol:c});
    }
  };
  const undoStack=useRef<Array<{rowId:RecordIdentity;key:string;before:string;after:string}>>([]);
  const undoLastEdit=()=>{
    const last=undoStack.current.pop();
    if(!last||readOnly)return;
    onUpdateCell(last.rowId,last.key,last.before);
  };
  const exportCsv=()=>{
    // Export only the authorized, currently loaded page. Never include visual filler cells.
    const quote=(value:unknown)=>'"'+String(value??'').replace(/"/g,'""')+'"';
    const lines=[
      orderedCols.map(col=>quote(col.label)).join(','),
      ...orderedRows.map(row=>orderedCols.map(col=>quote(col.getValue(row))).join(','))
    ];
    const csv='\uFEFF'+lines.join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a');
    link.href=url;link.download='zenit-hoja-pagina-'+page+'.csv';
    document.body.appendChild(link);link.click();link.remove();
    URL.revokeObjectURL(url);
  };
  const copySelection=(event:ClipboardEvent<HTMLTableElement>)=>{
    // Do not intercept native copying from an active editor or a text selection.
    if(editing||event.target instanceof HTMLInputElement||event.target instanceof HTMLTextAreaElement||
      (typeof window!=='undefined'&&window.getSelection()?.toString()))return;
    if(selection?.kind!=='cell'||selection.anchorRow===undefined||selection.endRow===undefined||
      selection.anchorCol===undefined||selection.endCol===undefined)return;
    const top=Math.max(0,Math.min(selection.anchorRow,selection.endRow));
    const bottom=Math.min(orderedRows.length-1,Math.max(selection.anchorRow,selection.endRow));
    const left=Math.max(0,Math.min(selection.anchorCol,selection.endCol));
    const right=Math.min(orderedCols.length-1,Math.max(selection.anchorCol,selection.endCol));
    if(bottom<top||right<left)return;
    // TSV is interoperable with Excel and Google Sheets. Only authorized loaded cells are exported.
    const escapeValue=(value:unknown)=>String(value??'').replace(/\t/g,' ').replace(/\r?\n/g,' ');
    const text=orderedRows.slice(top,bottom+1).map(row=>
      orderedCols.slice(left,right+1).map(col=>escapeValue(col.getValue(row))).join('\t')
    ).join('\n');
    event.clipboardData.setData('text/plain',text);
    event.preventDefault();
  };
  const onCellKey=(event:KeyboardEvent<HTMLTableCellElement>,r:number,c:number,row:Row,col:OperationalColumn<Row>)=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'&&!event.shiftKey){
      event.preventDefault();undoLastEdit();return;
    }
    if(event.key==='Tab'){event.preventDefault();const index=r*visualColumns.length+c+(event.shiftKey?-1:1);focusCoordinate(Math.floor(Math.max(0,index)/visualColumns.length),Math.max(0,index)%visualColumns.length);return;}
    if(event.key==='Enter'||event.key==='F2'){
      event.preventDefault();beginEdit(row,col);return;
    }
    if(event.key==='Escape'){setSelection(null);setMenu(null);return;}
    const moves:Record<string,[number,number]>={ArrowUp:[-1,0],ArrowDown:[1,0],
      ArrowLeft:[0,-1],ArrowRight:[0,1]};
    const move=moves[event.key];
    if(move){
      event.preventDefault();
      const baseRow=event.shiftKey&&selection?.kind==='cell'&&selection.endRow!==undefined?selection.endRow:r;
      const baseCol=event.shiftKey&&selection?.kind==='cell'&&selection.endCol!==undefined?selection.endCol:c;
      focusCoordinate(baseRow+move[0],baseCol+move[1],event.shiftKey);return;
    }
    if(event.key.length===1&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&!readOnly){
      event.preventDefault();skipBlurCommit.current=false;setEditing({rowId:row.id,key:col.key,origin:'desktop'});setDraft(event.key);
    }
  };
  const focusCoordinate=(r:number,c:number,extend=false)=>{
    const maxR=orderedRows.length+extraRows-1;
    const maxC=visualColumns.length-1;
    const nextR=Math.max(0,Math.min(maxR,r)),nextC=Math.max(0,Math.min(maxC,c));
    const row=orderedRows[nextR],col=visualColumns[nextC];
    if(!col)return;
    const rowId=row?.id??draftId(from+nextR);
    if(extend&&selection?.kind==='cell'&&selection.anchorRow!==undefined&&selection.anchorCol!==undefined){
      setSelection({...selection,endRow:nextR,endCol:nextC});
    }else selectCell(rowId,col.key,nextR,nextC);
    if(nextR>=orderedRows.length+extraRows-2&&extraRows<160){
      setRowCanvasReserve(previous=>Math.min(160,Math.max(previous,extraRows)+20));
    }
    if(nextC>=visualColumns.length-2&&extraColumns<64){
      setColumnCanvasReserve(previous=>Math.min(64,Math.max(previous,extraColumns)+8));
    }
    requestAnimationFrame(()=>tableRef.current?.querySelector<HTMLElement>(
      '[data-sheet-coordinate="'+nextR+':'+nextC+'"]')?.focus());
  };
  const blankCellKey=(event:KeyboardEvent<HTMLElement>,r:number,c:number)=>{
    if(event.key==='Escape'){setSelection(null);return;}
    const moves:Record<string,[number,number]>={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};
    const move=moves[event.key];
    if(move){event.preventDefault();focusCoordinate(r+move[0],c+move[1],event.shiftKey);return;}
    if(event.key==='Tab'){event.preventDefault();
      const index=r*visualColumns.length+c+(event.shiftKey?-1:1);
      focusCoordinate(Math.floor(Math.max(0,index)/visualColumns.length),Math.max(0,index)%visualColumns.length);return;
    }
    const key=draftKey(from+r,c);
    if(event.key==='F2'||event.key==='Enter'){
      event.preventDefault();setDraftInput(draftCells[key]??'');setDraftEditing(key);return;
    }
    if(event.key.length===1&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&!readOnly){
      event.preventDefault();setDraftInput(event.key);setDraftEditing(key);
    }
  };
  const draftCell=(r:number,c:number,key:string)=><span key={key}
      className={'zenit-sheet__draft-cell'+(selected(orderedRows[r]?.id??draftId(from+r),visualColumns[c]?.key??'',r,c)?' is-selected':'')}
      role="gridcell" tabIndex={0} data-sheet-coordinate={r+':'+c}
      aria-label={'Celda '+columnLetter(c)+(from+r)+' editable'}
      onClick={event=>{if(draftEditing===null)selectCell(orderedRows[r]?.id??draftId(from+r),visualColumns[c].key,r,c,event.shiftKey);}}
      onDoubleClick={()=>{if(!readOnly){const name=draftKey(from+r,c);setDraftInput(draftCells[name]??'');setDraftEditing(name);}}}
      onKeyDown={event=>blankCellKey(event,r,c)}>
      {draftEditing===draftKey(from+r,c)?<input autoFocus className="zenit-sheet__draft-input" value={draftInput}
        aria-label={'Editar '+columnLetter(c)+(from+r)}
        onChange={event=>setDraftInput(event.target.value)}
        onClick={event=>event.stopPropagation()}
        onBlur={()=>{setDraftCells(previous=>({...previous,[draftKey(from+r,c)]:draftInput}));setDraftEditing(null);}}
        onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setDraftEditing(null);}
          else if(event.key==='Enter'||event.key==='Tab'){event.preventDefault();event.stopPropagation();setDraftCells(previous=>({...previous,[draftKey(from+r,c)]:draftInput}));setDraftEditing(null);focusCoordinate(r+(event.key==='Enter'?1:0),c+(event.key==='Tab'?(event.shiftKey?-1:1):0));}}}/>
        :draftCells[draftKey(from+r,c)]??''}
    </span>;
  const rowOffset=48;
  const freezeStyle=(rowIndex:number,colIndex:number,colKey:string,head=false):CSSProperties=>{
    const pinnedX=colIndex<pinnedColCount,pinnedY=head||rowIndex<pinnedRowCount;
    return {
      ...(pinnedX?{position:'sticky',left:colOffsets[colKey],zIndex:pinnedY?8:4}:{}),
      ...(pinnedY?{position:'sticky',top:head?0:44+rowIndex*rowOffset,zIndex:pinnedX?8:head?6:5}:{}),
    };
  };
  const busy=isLoading||Boolean(error);
  return <section className="zenit-sheet" data-spreadsheet="true" aria-label={sheetTitle}>
    <div className="zenit-sheet__toolbar">
      <label>Título de la tabla <input aria-label="Título de la tabla" value={sheetTitle} maxLength={120} onChange={event=>setSheetTitle(event.target.value)}/></label>
      <div className="zenit-sheet__format-toolbar" role="toolbar" aria-label="Herramientas de hoja">
        <div className="zenit-sheet__ribbon-group" role="group" aria-label="Edición">
          <button type="button" title="Deshacer última edición" aria-label="Deshacer última edición" disabled={readOnly} onClick={undoLastEdit}>↶</button>
          <button type="button" title="Exportar datos visibles como CSV" aria-label="Exportar CSV" disabled={isLoading||Boolean(error)||orderedRows.length===0} onClick={exportCsv}><Icon name="external" size={15}/></button>
        </div>
        <div className="zenit-sheet__ribbon-group" role="group" aria-label="Alineación">
          {([["left","Izquierda","≡"],["center","Centro","☷"],["right","Derecha","≣"],["justify","Justificado","☰"]] as const).map(([align,label,symbol])=>
            <button key={align} type="button" title={label} aria-label={'Alinear '+label.toLowerCase()} disabled={readOnly||selection?.kind!=="cell"} aria-pressed={selection?.kind==='cell'&&selection.rowId!==undefined&&selection.colKey!==undefined&&cellFormats[formatKey(selection.rowId,selection.colKey)]?.align===align} onClick={()=>applyFormat({align})}>{symbol}</button>)}
        </div>
        <div className="zenit-sheet__ribbon-group" role="group" aria-label="Énfasis">
          {([["bold","Negrita","B"],["italic","Cursiva","I"],["underline","Subrayado","U"],["highlight","Resaltado","▰"]] as const).map(([key,label,symbol])=>
            <button key={key} type="button" title={label} aria-label={label} className={'zenit-sheet__tool-'+key} disabled={readOnly||selection?.kind!=="cell"} aria-pressed={Boolean(selection?.kind==='cell'&&selection.rowId!==undefined&&selection.colKey&&cellFormats[formatKey(selection.rowId,selection.colKey)]?.[key])} onClick={()=>{const current=selection?.rowId!==undefined&&selection.colKey?cellFormats[formatKey(selection.rowId,selection.colKey)]:undefined;applyFormat({[key]:!current?.[key]} as Partial<{bold:boolean;italic:boolean;underline:boolean;highlight:boolean}>);}}>{symbol}</button>)}
        </div>
      </div>
      <label>Buscar en la hoja <input aria-label="Buscar en la hoja" value={search} onChange={event=>onSearch(event.target.value)}/></label>
      <span className="zenit-sheet__hint">Selecciona letras o números; botón secundario o menú contextual para fijar guías</span>
      {(guideColumn||guideRow)&&<button className="zenit-sheet__clear" type="button" onClick={()=>{
        onGuideColumn(null);onGuideRow(null);
      }}>Quitar guías</button>}
    </div>
    {busy?<div className="zenit-sheet__state" role={error?'alert':'status'}>
      {error?<>{error} {onRetry&&<button type="button" onClick={onRetry}>Reintentar</button>}</>:'Cargando registros…'}
    </div>:<>
    <div className="zenit-sheet__scroll" ref={tableRef} data-sheet-scroll="true" onScroll={event=>{
      const element=event.currentTarget;
      if(element.scrollHeight-element.scrollTop-element.clientHeight<110&&extraRows<160)
        setRowCanvasReserve(previous=>Math.min(160,Math.max(previous,extraRows)+20));
      if(element.scrollWidth-element.scrollLeft-element.clientWidth<220&&extraColumns<64)
        setColumnCanvasReserve(previous=>Math.min(64,Math.max(previous,extraColumns)+8));
    }}>
      <table role="grid" onCopy={copySelection} aria-label={sheetTitle||"Hoja editable"} className="zenit-sheet__table" style={{width:96+visualColumns.reduce((n,col)=>n+colWidth(col.key),0)}}>
        <colgroup><col style={{width:96}}/>{visualColumns.map(col=><col key={col.key} style={{width:colWidth(col.key)}}/>)}</colgroup>
        <thead><tr>
          <th className="zenit-sheet__corner" aria-label="Esquina de la hoja" style={{position:'sticky',left:0,top:0,zIndex:10}}></th>
          {visualColumns.map((col,c)=>{
            const letter=columnLetter(c);
            if(isBlankColumn(col.key))return <th key={col.key} className="zenit-sheet__head zenit-sheet__placeholder" scope="col" data-sheet-placeholder-column={col.key} style={freezeStyle(-1,c,col.key,true)}>
              <span className="zenit-sheet__axis-token" aria-hidden="true">{letter}</span>
            </th>;
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
                  aria-label={'Seleccionar columna '+col.label}><span className="zenit-sheet__axis-token">{letter}</span></button>
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
                onClick={()=>setSelection({kind:'row',rowId:row.id})}><span className="zenit-sheet__axis-token">{from+r}</span></button>
              <button type="button" className="zenit-sheet__more" aria-label={'Opciones de fila '+String(from+r)}
                onClick={event=>{const box=event.currentTarget.getBoundingClientRect();
                  openMenu('row',String(row.id),getRowLabel(row),box.left,box.bottom+4);}}><Icon name="more" size={15}/></button>
              {editingRowTitle===String(row.id)?<input autoFocus className="zenit-sheet__row-title" aria-label={"Título de fila "+String(from+r)} placeholder="Título opcional" maxLength={80} value={rowTitles[String(row.id)]??""} onChange={event=>updateRowTitle(row.id,event.target.value)} onBlur={()=>setEditingRowTitle(null)} onKeyDown={event=>{if(event.key==='Enter'||event.key==='Escape'){event.preventDefault();setEditingRowTitle(null);}}} disabled={readOnly}/>:rowTitles[String(row.id)]?<button type="button" className="zenit-sheet__row-label" title="Doble clic para editar título de fila" onDoubleClick={()=>setEditingRowTitle(String(row.id))}>{rowTitles[String(row.id)]}</button>:null}
              {!readOnly&&editingRowTitle!==String(row.id)&&<button type="button" className="zenit-sheet__row-label-edit" aria-label={"Editar título de fila "+String(from+r)} title="Añadir título opcional a esta fila" onClick={()=>setEditingRowTitle(String(row.id))}><Icon name="edit" size={12}/></button>}
            </th>
            {visualColumns.map((col,c)=>{
              if(isBlankColumn(col.key))return <td key={col.key} className="zenit-sheet__placeholder" data-sheet-placeholder-cell="true">{draftCell(r,c,col.key)}</td>;
              const active=selected(row.id,col.key,r,c);
              const minRow=Math.min(selection?.anchorRow??r,selection?.endRow??r);
              const maxRow=Math.max(selection?.anchorRow??r,selection?.endRow??r);
              const minCol=Math.min(selection?.anchorCol??c,selection?.endCol??c);
              const maxCol=Math.max(selection?.anchorCol??c,selection?.endCol??c);
              const rangeEdge=selection?.kind==='cell'&&active?[
                r===minRow?'top':'',r===maxRow?'bottom':'',c===minCol?'left':'',c===maxCol?'right':''
              ].filter(Boolean).join(' '):undefined;
              const isEditing=editing?.origin==='desktop'&&editing.rowId===row.id&&editing.key===col.key;
              return <td key={col.key} data-sheet-coordinate={r+':'+c} data-sheet-cell={String(row.id)+'::'+col.key}
                data-selected={active?'true':undefined} data-range-edge={rangeEdge}
                className={(active?'is-selected ':'')+(r<pinnedRowCount||c<pinnedColCount?'is-guide':'')}
                style={{...freezeStyle(r,c,col.key),textAlign:cellFormats[formatKey(row.id,col.key)]?.align??"left",fontWeight:cellFormats[formatKey(row.id,col.key)]?.bold?700:undefined,fontStyle:cellFormats[formatKey(row.id,col.key)]?.italic?"italic":undefined,textDecoration:cellFormats[formatKey(row.id,col.key)]?.underline?"underline":undefined,backgroundColor:cellFormats[formatKey(row.id,col.key)]?.highlight?"#fff1a8":undefined}}
                tabIndex={0} role="gridcell" aria-selected={active}
                onClick={event=>{if(!dragging)selectCell(row.id,col.key,r,c,event.shiftKey);}}
                onPointerDown={event=>{
                  if(event.button!==0||editing)return;
                  dragAnchor.current={row:r,col:c};setDragging(true);
                  selectCell(row.id,col.key,r,c,event.shiftKey);
                }}
                onPointerEnter={()=>{
                  if(!dragAnchor.current)return;
                  setSelection(prev=>prev?.kind==='cell'?{...prev,endRow:r,endCol:c}:prev);
                }}
                onContextMenu={event=>{if(selection?.kind==='column')columnMenu(event,col.key,col.label);
                  else if(selection?.kind==='row')rowMenu(event,row.id,getRowLabel(row));}}
                onDoubleClick={()=>beginEdit(row,col)}
                onKeyDown={event=>{if(!isEditing)onCellKey(event,r,c,row,col);}}>
                {isEditing?<input autoFocus className="zenit-sheet__cell-editor" aria-label={'Editar '+col.label+' de '+getRowLabel(row)}
                  value={draft} onChange={event=>setDraft(event.target.value)}
                  onBlur={event=>blurCommit(event.currentTarget.value)}
                  onKeyDown={event=>{
                    if(event.key==='Enter'){event.preventDefault();commit(event.currentTarget.value);}
                    if(event.key==='Escape'){event.preventDefault();cancelEdit();}
                    event.stopPropagation();
                  }}/>:String(col.getValue(row)??'')}
              </td>;
            })}
          </tr>)}
        </tbody>
      </table>
      {Array.from({length:extraRows},(_,index)=>{const rowIndex=orderedRows.length+index,display=from+rowIndex,rowKey=draftRowKey(display);
        return <div key={index} data-sheet-placeholder-row="true" className="zenit-sheet__placeholder-row">
          <span className="zenit-sheet__placeholder-index">
            <span className="zenit-sheet__placeholder-row-select"><span className="zenit-sheet__axis-token">{display}</span></span>
            {editingRowTitle===rowKey?<input autoFocus className="zenit-sheet__row-title" aria-label={'Título de fila '+display} value={draftRowTitles[rowKey]??''} maxLength={80} placeholder="Título opcional"
              onChange={event=>setDraftRowTitles(previous=>({...previous,[rowKey]:event.target.value}))}
              onBlur={()=>setEditingRowTitle(null)} onKeyDown={event=>{if(event.key==='Enter'||event.key==='Escape')setEditingRowTitle(null);}}/>:
              draftRowTitles[rowKey]?<button type="button" className="zenit-sheet__row-label" onDoubleClick={()=>setEditingRowTitle(rowKey)}>{draftRowTitles[rowKey]}</button>:null}
            <button type="button" className="zenit-sheet__row-label-edit" aria-label={'Editar título de fila '+display} onClick={()=>setEditingRowTitle(rowKey)}><Icon name="edit" size={12}/></button>
          </span>
          {visualColumns.map((col,c)=><span key={col.key} className="zenit-sheet__placeholder-cell" style={{width:colWidth(col.key)}}>{draftCell(rowIndex,c,col.key)}</span>)}
        </div>;
      })}
      {!orderedRows.length&&total>0&&<p className="zenit-sheet__empty">No hay registros coincidentes.</p>}
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
          <dd>{editing?.origin==='mobile'&&editing.rowId===row.id&&editing.key===col.key
            ?<input autoFocus className="zenit-sheet__cell-editor"
              aria-label={'Editar '+col.label+' de '+getRowLabel(row)} value={draft}
              onChange={event=>setDraft(event.target.value)} onBlur={event=>blurCommit(event.currentTarget.value)}
              onKeyDown={event=>{
                if(event.key==='Enter'){event.preventDefault();commit(event.currentTarget.value);}
                if(event.key==='Escape'){event.preventDefault();cancelEdit();}
              }}/>
            :<button type="button" className="zenit-sheet__mobile-value"
              aria-label={'Editar '+col.label+' de '+getRowLabel(row)}
              onClick={()=>beginEdit(row,col,'mobile')}>{String(col.getValue(row)??'')||'—'}</button>}
          </dd>
        </div>)}</dl>
      </article>)}
    </div>
    <div className="zenit-sheet__footer"><span>{total} registros disponibles · las celdas vacías son borradores locales</span></div>
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
