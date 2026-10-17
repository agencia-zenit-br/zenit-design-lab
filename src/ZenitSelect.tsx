import { Fragment, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Icon } from './Icon';
import { useCompactViewport, useMobileModal } from './mobileModal';

export type ZenitOption<Value extends string> = {
  value: Value;
  label: string;
  disabled?: boolean;
  group?: string;
};

export type ZenitSelectProps<Value extends string> = {
  label: string;
  value: Value | null;
  options: readonly ZenitOption<Value>[];
  onChange: (value: Value) => void;
  onClear?: () => void;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  mobileSheet?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
};

type VisibleItem<Value extends string> = { option: ZenitOption<Value>; index: number };

const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

/** Approved Zenit Select 03.14: native-free single-choice combobox with groups and optional search. */
export function ZenitSelect<Value extends string>({
  label, value, options, onChange, onClear, searchable = false, disabled = false,
  className = '', mobileSheet = true, placeholder = 'Seleccionar', searchPlaceholder = 'Buscar opciones…',
}: ZenitSelectProps<Value>) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [query, setQuery] = useState('');
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const modal = useRef<HTMLDivElement>(null);
  const compactViewport = useCompactViewport();
  const modalActive = open && mobileSheet && compactViewport;
  useMobileModal(open && mobileSheet, compactViewport, modal);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const selectedIndex = options.findIndex(option => option.value === value);
  const selected = options[selectedIndex];
  const visible: VisibleItem<Value>[] = options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !query || normalize(option.label).includes(normalize(query)) || (option.group && normalize(option.group).includes(normalize(query))));
  const enabledIndices = visible.filter(({ option }) => !option.disabled).map(({ index }) => index);
  const activeIndex = enabledIndices.includes(highlighted) ? highlighted : (enabledIndices[0] ?? -1);
  const popup = open ? `${id}-list` : undefined;
  const activeOptionId = open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined;

  const close = (restoreFocus = false) => {
    setOpen(false);
    setQuery('');
    if (restoreFocus) trigger.current?.focus();
  };
  const openPopup = (target?: number) => {
    if (disabled) return;
    setQuery('');
    setHighlighted(target !== undefined && !options[target]?.disabled ? target : selectedIndex >= 0 && !options[selectedIndex].disabled ? selectedIndex : options.findIndex(option => !option.disabled));
    setOpen(true);
  };
  const choose = (index: number) => {
    if (index < 0 || options[index]?.disabled) return;
    onChange(options[index].value);
    close(true);
  };
  const advance = (direction: number) => {
    if (!enabledIndices.length) return;
    const currentPosition = enabledIndices.indexOf(activeIndex);
    const nextPosition = currentPosition < 0 ? 0 : (currentPosition + direction + enabledIndices.length) % enabledIndices.length;
    setHighlighted(enabledIndices[nextPosition]);
  };

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close(false);
    };
    const blur = () => close(false);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('blur', blur);
    return () => { document.removeEventListener('pointerdown', outside); window.removeEventListener('blur', blur); };
  }, [open]);

  useEffect(() => { if (open && searchable && !modalActive) search.current?.focus(); }, [open, searchable, modalActive]);
  useEffect(() => {
    if (modalActive) modal.current?.focus();
  }, [modalActive, searchable]);

  useEffect(() => {
    if (!open) return;
    const element = optionRefs.current[activeIndex];
    const scrollArea = list.current;
    if (!element || !scrollArea) return;
    if (element.offsetTop < scrollArea.scrollTop) scrollArea.scrollTop = element.offsetTop;
    else if (element.offsetTop + element.offsetHeight > scrollArea.scrollTop + scrollArea.clientHeight)
      scrollArea.scrollTop = element.offsetTop + element.offsetHeight - scrollArea.clientHeight;
  }, [activeIndex, open, query]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const typing = event.target instanceof HTMLInputElement;
    if (event.target instanceof HTMLButtonElement && event.target !== trigger.current &&
        (event.key === 'Enter' || event.key === ' ')) return;
    if (event.key === 'Escape') {
      if (open) { event.preventDefault(); event.stopPropagation(); close(true); }
    } else if (event.key === 'Tab') {
      close(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) openPopup();
      else advance(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      if (typing) return;
      event.preventDefault();
      const index = event.key === 'Home' ? enabledIndices[0] : enabledIndices[enabledIndices.length - 1];
      if (!open) openPopup(index);
      else if (index !== undefined) setHighlighted(index);
    } else if (event.key === 'Enter' || (event.key === ' ' && !typing)) {
      event.preventDefault();
      if (!open) openPopup();
      else choose(activeIndex);
    }
  };

  return <div ref={root} className={`zenit-select ${open ? 'zenit-select--open' : ''} ${mobileSheet?'zenit-select--mobile-sheet':''} ${className}`.trim()} onKeyDown={onKeyDown}>
    <span className="zenit-select__label" id={`${id}-label`}>{label}</span>
    <div className="zenit-select__control">
      <button type="button" ref={trigger}
        role={searchable ? undefined : 'combobox'} aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="listbox"
        aria-controls={popup} aria-expanded={open} aria-activedescendant={!searchable ? activeOptionId : undefined}
        className="zenit-select__trigger" disabled={disabled} onClick={() => open ? close() : openPopup()}>
        <span id={`${id}-value`} className="zenit-select__value">{selected?.label ?? placeholder}</span>
        <Icon name="chevron-right" size={13} className="zenit-select__chevron"/>
      </button>
      {onClear && value !== null && !disabled && <button type="button" className="zenit-select__clear icon-button"
        aria-label={`Limpiar ${label}`} title="Limpiar selección"
        onClick={event => { event.stopPropagation(); onClear(); close(); }}>
        <Icon name="x" size={13}/>
      </button>}
    {open && mobileSheet && <button type="button" className="zenit-select__backdrop" tabIndex={-1}
      aria-label={`Cerrar ${label}`} onClick={() => close(true)}/>}
    {open && <div ref={modal} className="zenit-select__popover" tabIndex={modalActive ? -1 : undefined}
      role={modalActive ? 'dialog' : undefined} aria-modal={modalActive || undefined}
      aria-label={modalActive ? label : undefined}>
      <div className="zenit-select__sheet-head"><strong>{label}</strong>
        <button type="button" className="icon-button" aria-label={`Cerrar ${label}`} onClick={() => close(true)}><Icon name="x" size={19}/></button>
      </div>
      {searchable && <div className="zenit-select__search">
        <Icon name="search" size={15}/>
        <input ref={search} type="text" value={query} placeholder={searchPlaceholder}
          aria-label={`Buscar en ${label}`} role="combobox" aria-expanded={open}
          aria-autocomplete="list" aria-controls={popup} aria-activedescendant={activeOptionId}
          onChange={event => { const next = event.target.value; setQuery(next);
            const first = options.findIndex(option => !option.disabled && (
              normalize(option.label).includes(normalize(next)) ||
              Boolean(option.group && normalize(option.group).includes(normalize(next)))));
            setHighlighted(first);
          }}/>
      </div>}
      <div ref={list} role="listbox" id={`${id}-list`} aria-labelledby={`${id}-label`} className="zenit-select__list">
        {!visible.length && <div role="status" className="zenit-select__empty">Sin resultados</div>}
        {visible.map(({ option, index }, position) => {
          const previous = visible[position - 1]?.option.group;
          return <Fragment key={option.value}>
            {option.group && (position === 0 || option.group !== previous) &&
              <div className="zenit-select__group" role="presentation">{option.group}</div>}
            <div id={`${id}-option-${index}`} role="option"
              ref={element => { optionRefs.current[index] = element; }}
              aria-selected={option.value === value} aria-disabled={option.disabled || undefined}
              className={`zenit-select__option ${activeIndex === index ? 'zenit-select__option--highlighted' : ''}`}
              onPointerEnter={() => { if (!option.disabled) setHighlighted(index); }}
              onPointerDown={event => event.preventDefault()} onClick={() => choose(index)}>
              <span>{option.label}</span>
              {option.value === value && <Icon name="check" size={15}/>}
            </div>
          </Fragment>;
        })}
      </div>
    </div>}
    </div>
  </div>;
}
