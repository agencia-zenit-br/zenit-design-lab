import {useEffect,useRef,useState,type KeyboardEvent} from 'react';
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
  useEffect(()=>{
    if(!open)return;
    const close=(event:PointerEvent)=>{
      if(!root.current?.contains(event.target as Node))setOpen(false);
    };
    document.addEventListener('pointerdown',close);
    return()=>document.removeEventListener('pointerdown',close);
  },[open]);
  const choose=(index:number)=>{
    const next=options[index];if(!next)return;
    onChange(next.value);setOpen(false);trigger.current?.focus();
  };
  const keys=(event:KeyboardEvent<HTMLButtonElement>)=>{
    if(event.key==='Escape'){setOpen(false);trigger.current?.focus();return;}
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();if(!open){setCursor(Math.max(0,options.findIndex(x=>x.value===value)));setOpen(true);}
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
        setOpen(previous=>!previous);
      }}>
      <span>{options.find(option=>option.value===value)?.label??'Seleccionar'}</span>
      <span aria-hidden="true" className="zenit-sheet__picker-arrow"><Icon name="chevron-right" size={14}/></span>
    </button>
    {open&&<div className="zenit-sheet__picker-list" role="listbox" aria-label={label}>
      {options.map((option,index)=><button type="button" role="option"
        aria-selected={option.value===value} key={option.value}
        className={(option.value===value?'is-current ':'')+(cursor===index?'is-highlighted':'')}
        onMouseEnter={()=>setCursor(index)} onClick={()=>choose(index)}>
        {option.label}{option.value===value&&<Icon name="check" size={14}/>}
      </button>)}
    </div>}
  </div>;
}
