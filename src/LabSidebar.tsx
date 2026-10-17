import { useEffect, useRef } from 'react';
import { Icon, type IconName } from './Icon';

export type LabSection = 'Resumen' | 'Componentes' | 'Redacción';

type ContextLink = { label:string; target:string; icon:IconName };
const contextLinks: Record<LabSection,ContextLink[]> = {
  Resumen: [
    {label:'Vista general',target:'overview',icon:'dashboard'},
    {label:'Actividad',target:'activity',icon:'activity'},
    {label:'Servicios',target:'service-list',icon:'services'},
    {label:'Registros',target:'records-title',icon:'list'},
  ],
  Componentes: [
    {label:'Tipografía',target:'catalog-type',icon:'edit'},
    {label:'Iconografía',target:'catalog-icons',icon:'components'},
    {label:'Controles',target:'catalog-buttons',icon:'settings'},
    {label:'Desplegables',target:'catalog-select',icon:'filter'},
    {label:'Preferencias',target:'catalog-preferences',icon:'globe'},
    {label:'Calendario',target:'catalog-calendar',icon:'calendar'},
    {label:'Fecha y hora',target:'catalog-datetime',icon:'clock'},
    {label:'Temporizadores',target:'catalog-temporal',icon:'clock'},
    {label:'Skins',target:'catalog-portability',icon:'components'},
    {label:'Formularios',target:'catalog-forms',icon:'edit'},
    {label:'Tablas',target:'catalog-table',icon:'list'},
  ],
  Redacción: [
    {label:'Artículos',target:'editorial-list',icon:'list'},
    {label:'Editor',target:'editorial-editor',icon:'edit'},
  ],
};

/** Contextual product navigation. Global application tabs remain in the horizontal header. */
export function LabSidebar({ section, collapsed, onToggle, mobileOpen, onCloseMobile }: {
  section:LabSection;
  collapsed:boolean;
  onToggle:()=>void;
  mobileOpen:boolean;
  onCloseMobile:()=>void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  useEffect(() => { if (mobileOpen) closeRef.current?.focus(); }, [mobileOpen]);
  useEffect(() => {
    if (!mobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [mobileOpen]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event:KeyboardEvent) => {
      if (event.key==='Escape') { event.preventDefault(); onCloseMobile(); return; }
      if (event.key!=='Tab' || !sidebarRef.current) return;
      const focusable=Array.from(sidebarRef.current.querySelectorAll<HTMLButtonElement|HTMLAnchorElement>('button:not([disabled]),a[href]'))
        .filter(item=>item.getClientRects().length>0);
      if (!focusable.length) return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if (event.shiftKey && document.activeElement===first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement===last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown',onKeyDown);
    return () => window.removeEventListener('keydown',onKeyDown);
  }, [mobileOpen,onCloseMobile]);
  return <>
    {mobileOpen && <button type="button" className="lab-sidebar__backdrop" aria-label="Cerrar menú lateral" onClick={onCloseMobile}/>}
    <aside ref={sidebarRef} role={mobileOpen ? 'dialog' : undefined} aria-modal={mobileOpen ? true : undefined} id="zenit-lab-sidebar" className={`lab-sidebar ${collapsed ? 'lab-sidebar--collapsed' : ''} ${mobileOpen ? 'lab-sidebar--mobile-open' : ''}`}
      aria-label="Navegación contextual" data-sidebar-state={collapsed?'collapsed':'expanded'}>
      <div className="lab-sidebar__header">
        <span className="lab-sidebar__heading">Navegación</span>
        <button type="button" className="icon-button lab-sidebar__collapse" aria-label={collapsed?'Expandir barra lateral':'Contraer barra lateral'}
          title={collapsed?'Expandir barra lateral':'Contraer barra lateral'}
          aria-expanded={!collapsed} onClick={onToggle}>
          <Icon name={collapsed?'chevron-right':'chevron-left'} size={17}/>
        </button>
        <button ref={closeRef} type="button" className="icon-button lab-sidebar__close"
          aria-label="Cerrar navegación lateral" onClick={onCloseMobile}><Icon name="x" size={18}/></button>
      </div>
      <nav aria-label={`Secciones de ${section}`} className="lab-sidebar__navigation">
        <div className="lab-sidebar__caption">{section}</div>
        {contextLinks[section].map(link => <a key={link.target} className="lab-sidebar__link" href={`#${link.target}`}
          title={link.label} aria-label={link.label} onClick={mobileOpen?onCloseMobile:undefined}>
          <Icon name={link.icon} size={17}/><span>{link.label}</span>
        </a>)}
      </nav>
      <div className="lab-sidebar__footer">Navegación de demostración · Datos sintéticos</div>
    </aside>
  </>;
}
