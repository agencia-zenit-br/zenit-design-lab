import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';

export type ZenitOption<Value extends string> = { value: Value; label: string; disabled?: boolean };

type ZenitSelectProps<Value extends string> = {
  label: string;
  value: Value;
  options: readonly ZenitOption<Value>[];
  onChange: (value: Value) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Design Lab implementation of the approved 03.14 select-only pattern.
 * A non-native, rounded, anchored popup with single selection and keyboard navigation.
 * Multi-select, search, remote filtering and grouped choices are separate unimplemented modes.
 */
export function ZenitSelect<Value extends string>({ label, value, options, onChange, disabled = false, className = '' }: ZenitSelectProps<Value>) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const selectedIndex = options.findIndex(option => option.value === value);
  const selected = options[selectedIndex];
  const activeIndex = Math.max(0, highlighted);

  const selectable = (index: number) => index >= 0 && index < options.length && !options[index].disabled;
  const stepIndex = (start: number, direction: number) => {
    for (let count = 1; count <= options.length; count++) {
      const candidate = (start + direction * count + options.length * (count + 1)) % options.length;
      if (selectable(candidate)) return candidate;
    }
    return start;
  };
  const openPopup = (initial?: number) => {
    if (disabled || !options.length) return;
    setHighlighted(initial !== undefined && selectable(initial) ? initial : selectable(selectedIndex) ? selectedIndex : stepIndex(options.length - 1, 1));
    setOpen(true);
  };
  const closePopup = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  };
  const choose = (index: number) => {
    if (!selectable(index)) return;
    onChange(options[index].value);
    closePopup(true);
  };

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    const blurWindow = () => setOpen(false);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('blur', blurWindow);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('blur', blurWindow);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const option = optionRefs.current[activeIndex];
    const panel = list.current;
    if (option && panel) {
      const top = option.offsetTop;
      if (top < panel.scrollTop) panel.scrollTop = top;
      else if (top + option.offsetHeight > panel.scrollTop + panel.clientHeight) {
        panel.scrollTop = top + option.offsetHeight - panel.clientHeight;
      }
    }
  }, [open, activeIndex]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === 'Escape') {
      if (open) { event.preventDefault(); closePopup(); }
      return;
    }
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      if (!open) openPopup(selectedIndex < 0 ? undefined : selectedIndex);
      else setHighlighted(previous => stepIndex(previous, direction));
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const first = event.key === 'Home';
      const indices = first ? options.map((_, i) => i) : options.map((_, i) => options.length - 1 - i);
      const next = indices.find(selectable);
      if (next !== undefined) { if (!open) openPopup(next); else setHighlighted(next); }
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(activeIndex);
      else openPopup();
    }
  };

  return <div ref={root} className={`zenit-select ${open ? 'zenit-select--open' : ''} ${className}`.trim()}>
    <span className="zenit-select__label" id={`${id}-label`}>{label}</span>
    <button
      type="button" ref={trigger} role="combobox" aria-labelledby={`${id}-label ${id}-value`}
      aria-haspopup="listbox" aria-controls={`${id}-list`} aria-expanded={open}
      aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
      className="zenit-select__trigger"
      disabled={disabled}
      onClick={() => open ? closePopup() : openPopup()}
      onKeyDown={handleKeyDown}>
      <span id={`${id}-value`} className="zenit-select__value">{selected?.label ?? 'Seleccionar'}</span>
      <Icon name="chevron-right" size={13} className="zenit-select__chevron" />
    </button>
    {open && <div className="zenit-select__popover">
      <div ref={list} role="listbox" id={`${id}-list`} aria-labelledby={`${id}-label`} className="zenit-select__list">
        {options.map((option, index) => <div
          key={option.value} id={`${id}-option-${index}`}
          ref={element => { optionRefs.current[index] = element; }}
          role="option" aria-selected={option.value === value} aria-disabled={option.disabled || undefined}
          className={`zenit-select__option ${highlighted === index ? 'zenit-select__option--highlighted' : ''}`}
          onPointerEnter={() => { if (!option.disabled) setHighlighted(index); }}
          onPointerDown={event => event.preventDefault()}
          onClick={() => choose(index)}>
          <span>{option.label}</span>
          {option.value === value && <Icon name="check" size={15} />}
        </div>)}
      </div>
    </div>}
  </div>;
}
