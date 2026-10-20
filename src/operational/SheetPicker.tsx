import {useEffect,useRef,useState,type KeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import {Icon} from '../Icon';

export type SheetOption=Readonly<{value:string;label:string}>;
type Props={
  label:string;value:string;options:readonly SheetOption[];
  onChange:(next:string)=>void;disabled?:boolean;
};
/** Product-neutral branded listbox; prevents native OS select-popup styling. */
export function SheetPicker({label,value,options,onChange,disabled=false}:Props){
  const [open,setOpen]=useState(false);
  const [cursor,setCursor]=useState(0);
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const popup=useRef<HTMLDivElement>(null);
  const [placement,setPlacement]=useState({top:0,left:0,width:180,maxHeight:220});
  // Portals mounted on document.body do not inherit theme variables scoped
  // to the Design Lab root. Capture the active theme before opening.
  const [palette,setPalette]=useState<Record<string,string>>({});
  const capturePalette=()=>{
    const triggerNode=trigger.current;if(!triggerNode)return;
    const computed=getComputedStyle(triggerNode);
    const variables=['--surface','--surface-muted','--text','--muted','--border',
      '--border-strong','--brand','--field-bg','--control-bg'];
    const next:Record<string,string>={};
    for(const key of variables){
      const value=computed.getPropertyValue(key).trim();
      if(value)next[key]=value;
    }
    setPalette(next);
  };
  const alignPopup=()=>{
    const rect=trigger.current?.getBoundingClientRect();if(!rect)return;
    capturePalette();
    const maxHeight=Math.min(220,Math.max(96,window.innerHeight-24));
    const below=window.innerHeight-rect.bottom;
    const above=rect.top;
    const upwards=below<Math.min(210,maxHeight)&&above>below;
    const width=Math.max(160,rect.width);
    setPlacement({
      top:upwards?Math.max(8,rect.top-maxHeight-5):Math.min(window.innerHeight-8,rect.bottom+5),
      left:Math.max(8,Math.min(rect.left,window.innerWidth-width-8)),
      width:Math.min(width,window.innerWidth-16),maxHeight,
    });
  };
  useEffect(()=>{
    if(!open)return;
    const close=(event:PointerEvent)=>{
      if(!root.current?.contains(event.target as Node)&&!popup.current?.contains(event.target as Node))setOpen(false);
    };
    const reposition=()=>alignPopup();
    document.addEventListener('pointerdown',close);
    window.addEventListener('resize',reposition);
    window.addEventListener('scroll',reposition,true);
    return()=>{document.removeEventListener('pointerdown',close);window.removeEventListener('resize',reposition);window.removeEventListener('scroll',reposition,true);};
  },[open]);
  const choose=(index:number)=>{
    const next=options[index];if(!next)return;
    onChange(next.value);setOpen(false);trigger.current?.focus();
  };
  const keys=(event:KeyboardEvent<HTMLButtonElement>)=>{
    if(event.key==='Escape'){setOpen(false);trigger.current?.focus();return;}
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();if(!open){setCursor(Math.max(0,options.findIndex(x=>x.value===value)));alignPopup();setOpen(true);}
      else setCursor(index=>(index+(event.key==='ArrowDown'?1:-1)+options.length)%Math.max(1,options.length));
    }else if((event.key==='Enter'||event.key===' ')&&open){
      event.preventDefault();choose(cursor);
    }
  };
  return <div className="zenit-sheet__picker" ref={root}>
    <button type="button" className="zenit-sheet__picker-trigger" ref={trigger}
      aria-label={label} aria-haspopup="listbox" aria-expanded={open}
      disabled={disabled} onKeyDown={keys} onClick={()=>{
        setCursor(Math.max(0,options.findIndex(option=>option.value===value)));
        if(!open)alignPopup();
        setOpen(previous=>!previous);
      }}>
      <span>{options.find(option=>option.value===value)?.label??'Seleccionar'}</span>
      <span aria-hidden="true" className="zenit-sheet__picker-arrow"><Icon name="chevron-right" size={14}/></span>
    </button>
    {open&&createPortal(<div ref={popup} className="zenit-sheet__picker-list zenit-sheet__picker-list--portal" role="listbox" aria-label={label} style={{...palette,top:placement.top,left:placement.left,width:placement.width,maxHeight:placement.maxHeight,
      backgroundColor:palette['--surface']||'#ffffff',
      color:palette['--text']||'#17212b',
      borderColor:palette['--border']||'#d9dedb'}}>
      {options.map((option,index)=><button type="button" role="option"
        aria-selected={option.value===value} key={option.value}
        className={(option.value===value?'is-current ':'')+(cursor===index?'is-highlighted':'')}
        onMouseEnter={()=>setCursor(index)} onClick={()=>choose(index)}>
        {option.label}{option.value===value&&<Icon name="check" size={14}/>}
      </button>)}
    </div>,document.body)}
  </div>;
}
