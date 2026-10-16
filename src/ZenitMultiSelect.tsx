import { Fragment, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Icon } from './Icon';
import type { ZenitOption } from './ZenitSelect';

export type ZenitMultiSelectProps<Value extends string> = {
  label: string;
  values: readonly Value[];
  options: readonly ZenitOption<Value>[];
  onChange: (values: Value[]) => void;
  disabled?: boolean;
  searchable?: boolean;
  placeholder?: string;
  className?: string;
};

const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

/** Multi-selection variant of the approved Zenit Select 03.14; selection stays open until Done. */
export function ZenitMultiSelect<Value extends string>({
  label, values, options, onChange, disabled = false, searchable = true,
  placeholder = 'Seleccionar opciones', className = '',
}: ZenitMultiSelectProps<Value>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selected = options.filter(option => values.includes(option.value));
  const filtered = options.map((option,index)=>({option,index})).filter(({option})=>
    !searchText || normalize(option.label).includes(normalize(searchText)) ||
    Boolean(option.group && normalize(option.group).includes(normalize(searchText))));
  const enabled = filtered.filter(({option})=>!option.disabled).map(({index})=>index);
  const active = enabled.includes(highlighted) ? highlighted : (enabled[0] ?? -1);
  const listId = open ? `${id}-list` : undefined;

  const close = (restoreFocus = false) => {
    setOpen(false);
    setSearchText('');
    if (restoreFocus) trigger.current?.focus();
  };
  const reveal = () => {
    if (disabled) return;
    setSearchText('');
    setHighlighted(options.findIndex(option=>!option.disabled));
    setOpen(true);
  };
  const changeSelection = (value: Value) => {
    const option = options.find(item=>item.value===value);
    if (!option || option.disabled) return;
    onChange(values.includes(value) ? values.filter(item=>item!==value) : [...values,value]);
  };
  const moveActive = (step: number) => {
    if (!enabled.length) return;
    const position = enabled.indexOf(active);
    const next = position === -1 ? 0 : (position + step + enabled.length) % enabled.length;
    setHighlighted(enabled[next]);
  };

  useEffect(() => {
    if (!open) return;
    const outside = (event:PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close(false);
    };
    const loseWindowFocus = () => close(false);
    document.addEventListener('pointerdown',outside);
    window.addEventListener('blur',loseWindowFocus);
    return () => {document.removeEventListener('pointerdown',outside);window.removeEventListener('blur',loseWindowFocus);};
  },[open]);

  useEffect(()=>{if(open&&searchable)input.current?.focus();},[open,searchable]);
  useEffect(()=>{
    if(!open)return;
    const element=optionRefs.current[active],container=list.current;
    if(!element||!container)return;
    if(element.offsetTop<container.scrollTop)container.scrollTop=element.offsetTop;
    else if(element.offsetTop+element.offsetHeight>container.scrollTop+container.clientHeight)
      container.scrollTop=element.offsetTop+element.offsetHeight-container.clientHeight;
  },[active,open,searchText]);

  const onKeyDown = (event:ReactKeyboardEvent<HTMLDivElement>) => {
    if(disabled)return;
    const typing=event.target instanceof HTMLInputElement;
    if(event.target instanceof HTMLButtonElement && event.target!==trigger.current){
      if(event.key==='Escape'&&open){event.preventDefault();close(true);}
      return;
    }
    if(event.key==='Escape'){
      if(open){event.preventDefault();event.stopPropagation();close(true);}
    } else if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();
      if(!open)reveal(); else moveActive(event.key==='ArrowDown'?1:-1);
    } else if(event.key==='Home'||event.key==='End'){
      if(typing)return;
      event.preventDefault();
      const next=event.key==='Home'?enabled[0]:enabled[enabled.length-1];
      if(!open)reveal();else if(next!==undefined)setHighlighted(next);
    } else if(event.key==='Enter'||(event.key===' '&&!typing)){
      if(event.target instanceof HTMLButtonElement && event.target!==trigger.current)return;
      event.preventDefault();
      if(!open)reveal();else if(active>=0)changeSelection(options[active].value);
    } else if(event.key==='Backspace' && typing && !searchText && values.length && open) {
      event.preventDefault();
      onChange(values.slice(0,-1));
    }
  };

  return <div ref={root} className={`zenit-select zenit-select--multiple ${open?'zenit-select--open':''} ${className}`.trim()}
    onKeyDown={onKeyDown}>
    <span className="zenit-select__label" id={`${id}-label`}>{label}</span>
    <div className="zenit-select__multi-control">
      <button type="button" ref={trigger} className="zenit-select__trigger"
        aria-labelledby={`${id}-label ${id}-summary`} aria-haspopup="listbox" aria-expanded={open}
        aria-controls={listId} disabled={disabled}
        onClick={()=>open?close():reveal()}>
        <span id={`${id}-summary`} className="zenit-select__value">
          {values.length ? `${values.length} seleccionado${values.length===1?'':'s'}` : placeholder}
        </span>
        <Icon name="chevron-right" size={13} className="zenit-select__chevron"/>
      </button>
      {!!values.length && !disabled && <button type="button" className="icon-button zenit-select__clear"
        aria-label={`Limpiar selección de ${label}`} title="Limpiar selección" onClick={()=>onChange([])}>
        <Icon name="x" size={13}/>
      </button>}
    </div>
    {!!selected.length && <div className="zenit-select__chips" aria-label={`Seleccionados en ${label}`}>
      {selected.map(option=><span key={option.value} className="zenit-select__chip">
        <span>{option.label}</span>
        {!disabled && <button type="button" className="zenit-select__chip-remove" aria-label={`Quitar ${option.label}`}
          onClick={()=>changeSelection(option.value)}><Icon name="x" size={12}/></button>}
      </span>)}
    </div>}
    {open && <div className="zenit-select__popover">
      {searchable && <div className="zenit-select__search">
        <Icon name="search" size={15}/>
        <input ref={input} type="text" value={searchText} placeholder="Buscar opciones…"
          role="combobox" aria-autocomplete="list" aria-expanded={open}
          aria-controls={listId} aria-activedescendant={active>=0?`${id}-option-${active}`:undefined}
          aria-label={`Buscar en ${label}`} onChange={event=>{
            const query=event.target.value;setSearchText(query);
            setHighlighted(options.findIndex(option=>!option.disabled && (normalize(option.label).includes(normalize(query)) ||
              Boolean(option.group && normalize(option.group).includes(normalize(query))))));
          }}/>
      </div>}
      <div ref={list} role="listbox" aria-multiselectable="true" className="zenit-select__list"
        id={`${id}-list`} aria-labelledby={`${id}-label`}>
        {!filtered.length && <div role="status" className="zenit-select__empty">Sin resultados</div>}
        {filtered.map(({option,index},position)=><Fragment key={option.value}>
          {option.group && (position===0||option.group!==filtered[position-1].option.group) &&
            <div role="presentation" className="zenit-select__group">{option.group}</div>}
          <div ref={element=>{optionRefs.current[index]=element;}} id={`${id}-option-${index}`}
            role="option" aria-selected={values.includes(option.value)} aria-disabled={option.disabled||undefined}
            className={`zenit-select__option ${active===index?'zenit-select__option--highlighted':''}`}
            onPointerEnter={()=>{if(!option.disabled)setHighlighted(index);}}
            onPointerDown={event=>event.preventDefault()} onClick={()=>changeSelection(option.value)}>
            <span>{option.label}</span>
            {values.includes(option.value) && <Icon name="check" size={15}/>}
          </div>
        </Fragment>)}
      </div>
      <div className="zenit-select__footer">
        <span>{values.length} seleccionado{values.length===1?'':'s'}</span>
        <button type="button" className="button button--primary button--compact"
          onClick={()=>close(true)}>Listo</button>
      </div>
    </div>}
  </div>;
}
