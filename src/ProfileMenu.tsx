import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from './Icon';
import { useCompactViewport, useMobileModal } from './mobileModal';

type AccountAction = 'Mi perfil' | 'Organización' | 'Preferencias' | 'Idioma' | 'Ayuda' | 'Cerrar sesión';
const actions: {label: AccountAction; icon: IconName; section: 'account'|'support'}[] = [
  {label:'Mi perfil',icon:'user',section:'account'},
  {label:'Organización',icon:'organizations',section:'account'},
  {label:'Preferencias',icon:'settings',section:'account'},
  {label:'Idioma',icon:'globe',section:'account'},
  {label:'Ayuda',icon:'help',section:'support'},
  {label:'Cerrar sesión',icon:'log-out',section:'support'},
];

/** Profile menu preview: explicit demonstration actions, never a real session control. */
export function ProfileMenu({ onAction }: {onAction: (action:AccountAction)=>void}) {
  const [open,setOpen] = useState(false);
  const trigger=useRef<HTMLButtonElement>(null);
  const root=useRef<HTMLDivElement>(null);
  const popup=useRef<HTMLDivElement>(null);
  const mobile=useCompactViewport();
  useMobileModal(open,mobile,popup);

  const close=(focus=true) => {setOpen(false);if(focus)trigger.current?.focus();};
  useEffect(()=>{
    if(!open)return;
    if(mobile)popup.current?.focus();
    else popup.current?.querySelector<HTMLButtonElement>('.profile-menu__option')?.focus();
    const onDown=(event:PointerEvent)=>{
      if(!root.current?.contains(event.target as Node))setOpen(false);
    };
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.stopPropagation();close();}
      if(event.key==='Tab'&&!mobile&&popup.current){
        const items=[...popup.current.querySelectorAll<HTMLButtonElement>('.profile-menu__option')];
        if(!items.length)return;
        const first=items[0],last=items[items.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    document.addEventListener('pointerdown',onDown);
    document.addEventListener('keydown',onKey);
    return()=>{document.removeEventListener('pointerdown',onDown);document.removeEventListener('keydown',onKey);};
  },[open,mobile]);

  const act=(action:AccountAction)=>{close();onAction(action);};
  return <div className={`profile-menu ${open?'profile-menu--open':''}`} ref={root}>
    <button type="button" ref={trigger} className="profile-menu__trigger"
      aria-label="Abrir menú de perfil" title="Perfil"
      aria-haspopup={mobile?'dialog':'menu'} aria-controls={open?'zenit-profile-menu':undefined}
      aria-expanded={open} onClick={()=>open?close():setOpen(true)}>
      <span className="profile-menu__avatar"><Icon name="user" size={17}/></span>
    </button>
    {open && <div className="profile-menu__backdrop" aria-hidden="true" onClick={()=>close()}/>}
    {open && <div id="zenit-profile-menu" ref={popup}
      className="profile-menu__popover" tabIndex={-1}
      role={mobile?'dialog':'menu'} aria-modal={mobile||undefined}
      aria-label="Menú de perfil">
      <div className="profile-menu__head">
        <div className="profile-menu__identity">
          <span className="profile-menu__identity-icon"><Icon name="user" size={18}/></span>
          <div><strong>Cuenta de demostración</strong><small>Zenit Design Lab</small></div>
        </div>
        <button type="button" className="icon-button profile-menu__close" aria-label="Cerrar menú de perfil" onClick={()=>close()}>
          <Icon name="x" size={17}/>
        </button>
      </div>
      <div className="profile-menu__options">
        {actions.map((action,index)=><div key={action.label}>
          {index===4 && <div className="profile-menu__divider"/>}
          <button type="button" className="profile-menu__option"
            role={mobile?undefined:'menuitem'}
            onClick={()=>act(action.label)}>
            <Icon name={action.icon} size={17}/>
            <span>{action.label}</span>
            {action.label==='Idioma'&&<Icon name="chevron-right" size={14} className="profile-menu__next"/>}
          </button>
        </div>)}
      </div>
    </div>}
  </div>;
}
