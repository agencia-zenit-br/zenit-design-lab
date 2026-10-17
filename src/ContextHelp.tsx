import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

/** Contextual help, never a permanently displayed explanatory paragraph in workspaces. */
export function ContextHelp({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        root.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return <div className={`context-help ${open ? 'context-help--open' : ''}`} ref={root}>
    <button type="button" className="context-help__trigger icon-button"
      aria-label={label} title={label} aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <Icon name="help" size={17}/>
    </button>
    {open && <div className="context-help__popover" role="note">{children}</div>}
  </div>;
}
