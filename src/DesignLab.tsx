import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, MetricCard, StatusPill } from './components';
import { Icon, type IconName } from './Icon';
import { EditorialPreview } from './EditorialPreview';
import { ComponentCatalog } from './ComponentCatalog';
import { ZenitSelect, type ZenitOption } from './ZenitSelect';
import { LabSidebar, type LabSection } from './LabSidebar';

type Mode = 'light' | 'dark' | 'system';
type Product = 'platform' | 'media' | 'cms';
type Section = LabSection;
const navigation: {label:Section;icon:IconName}[] = [
  {label:'Resumen',icon:'dashboard'},
  {label:'Componentes',icon:'components'},
  {label:'Redacción',icon:'editorial'},
];
const products: Record<Product,string> = {platform:'Zenit Platform',media:'Zenit Media Core',cms:'Zenit CMS'};
const productOptions: readonly ZenitOption<Product>[] = [{value:'platform',label:'Platform'},{value:'media',label:'Media Core'},{value:'cms',label:'CMS'}];
const modeOptions: readonly ZenitOption<Mode>[] = [{value:'light',label:'Claro'},{value:'dark',label:'Oscuro'},{value:'system',label:'Sistema'}];
const services: {name:string;detail:string;status:string;icon:IconName}[] = [
  {name:'Media Core',detail:'Producción editorial',status:'Activo',icon:'editorial'},
  {name:'CMS',detail:'Contenidos y sitios',status:'Activo',icon:'components'},
  {name:'Storage Core',detail:'Biblioteca de activos',status:'Activo',icon:'storage'},
];

function initialMode(): Mode {
  try {const value = localStorage.getItem('zenit-design-lab-theme');return value === 'dark'||value === 'light'||value === 'system' ? value : 'light';}
  catch{return 'light';}
}

function initialSidebarCollapsed():boolean { try { return localStorage.getItem('zenit-design-lab-sidebar') === 'collapsed'; } catch { return false; } }

function Overview({showNotice}:{showNotice:(message:string)=>void}) {
  return <>
    <div className="eyebrow">ZENIT / SISTEMA VISUAL</div>
    <div className="hero">
      <div><h1>Espacio de trabajo</h1><p>Referencia de integración visual: navegación, métricas, registros y acciones con una identidad compartida.</p></div>
      <Button onClick={()=>showNotice('Acción de demostración. No se han creado operaciones reales.')}><Icon name="plus" size={15}/> Nueva operación</Button>
    </div>
    <section aria-labelledby="overview"><div className="section-head"><h2 id="overview">Vista general</h2><span>Información de demostración</span></div>
      <div className="metrics">
        <MetricCard label="Servicios activos" value="12" detail="+2 este mes" icon="services"/>
        <MetricCard label="Usuarios" value="28" detail="En 4 organizaciones" icon="users"/>
        <MetricCard label="Almacenamiento" value="64 GB" detail="De 100 GB disponibles" icon="storage"/>
      </div>
    </section>
    <div className="dashboard-grid">
      <section className="panel" aria-labelledby="activity">
        <div className="panel__head"><div><h2 id="activity">Actividad reciente</h2><p>Últimos siete días</p></div><StatusPill>7 días</StatusPill></div>
        <div className="chart" role="img" aria-label="Gráfico ilustrativo de actividad de lunes a domingo">
          <div className="chart__bars">{[43,63,55,77,89,71,84].map((height,index)=><div key={index} className="chart__column"><div className="chart__bar" style={{height:`${height}%`}}/><span>{['L','M','X','J','V','S','D'][index]}</span></div>)}</div>
        </div>
      </section>
      <section className="panel" aria-labelledby="service-list">
        <div className="panel__head"><div><h2 id="service-list">Servicios</h2><p>Productos del entorno de ejemplo</p></div></div>
        <div className="service-list">{services.map(item=><div className="service" key={item.name}>
          <span className="service__icon"><Icon name={item.icon} size={17}/></span>
          <div><strong>{item.name}</strong><small>{item.detail}</small></div>
          <StatusPill tone="success">{item.status}</StatusPill>
        </div>)}</div>
        <Button variant="secondary" onClick={()=>showNotice('Catálogo de servicios aún no implementado en esta demostración.')}>Ver servicios <Icon name="arrow-right" size={14}/></Button>
      </section>
    </div>
    <section className="panel records-panel" aria-labelledby="records-title">
      <div className="panel__head"><div><h2 id="records-title">Registros</h2><p>Patrón de tabla compartido, con márgenes y adaptación móvil</p></div><StatusPill>Ejemplo visual</StatusPill></div>
      <div className="records-grid" role="list">
        {services.map(item=><div className="records-row" role="listitem" key={item.name}><span className="records-name"><Icon name={item.icon} size={16}/>{item.name}</span><span>{item.detail}</span><StatusPill tone="success">{item.status}</StatusPill></div>)}
      </div>
    </section>
  </>;
}

export function DesignLab() {
  const [mode,setMode] = useState<Mode>(initialMode);
  const [systemDark,setSystemDark] = useState(()=>typeof window!=='undefined' && (window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false));
  const [product,setProduct] = useState<Product>('platform');
  const [active,setActive] = useState<Section>('Resumen');
  const [notice,setNotice] = useState('');
  const [sidebarCollapsed,setSidebarCollapsed] = useState(initialSidebarCollapsed);
  const [mobileOpen,setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLButtonElement>(null);
  const closeMobile = useCallback(() => { setMobileOpen(false); mobileMenuRef.current?.focus(); },[]);
  const effective = mode==='system'?(systemDark?'dark':'light'):mode;
  useEffect(()=>{try{localStorage.setItem('zenit-design-lab-theme',mode);}catch{/* storage unavailable */}},[mode]);
  useEffect(()=>{try{localStorage.setItem('zenit-design-lab-sidebar',sidebarCollapsed?'collapsed':'expanded');}catch{/* storage unavailable */}},[sidebarCollapsed]);
  useEffect(()=>{
    const mq=window.matchMedia('(prefers-color-scheme: dark)');
    const onChange=(event:MediaQueryListEvent)=>setSystemDark(event.matches);
    mq.addEventListener('change',onChange);
    return ()=>mq.removeEventListener('change',onChange);
  },[]);
  return <div className="lab" data-theme={effective} data-product={product}>
    <a className="skip" href="#main">Ir al contenido</a>
    <div className="app-chrome"><header className="app-header">
      <div className="app-header__inner">
        <div className="brand"><button ref={mobileMenuRef} type="button" className="icon-button mobile-nav-toggle" aria-label="Abrir navegación lateral" aria-controls="zenit-lab-sidebar" aria-expanded={mobileOpen} onClick={()=>setMobileOpen(true)}><Icon name="menu" size={20}/></button><span className="brand__symbol" aria-hidden="true"><Icon name="components" size={21}/></span><span><strong>ZENIT</strong><small>DESIGN LAB</small></span></div>
        <div className="header-controls">
          <ZenitSelect<Product> mobileSheet={false} label="Producto" value={product} options={productOptions} onChange={setProduct}/>
          <ZenitSelect<Mode> mobileSheet={false} label="Apariencia" value={mode} options={modeOptions} onChange={setMode}/>
          <span className="avatar" aria-label="Perfil de demostración"><Icon name="user" size={17}/></span>
        </div>
      </div>
    </header>
    <div className="app-nav-frame"><nav className="app-nav" aria-label="Secciones del laboratorio">
      {navigation.map(item=><button key={item.label} type="button" className={`nav-item ${active===item.label?'nav-item--active':''}`} aria-current={active===item.label?'page':undefined} onClick={()=>{setActive(item.label);setNotice('');}}>
        <Icon name={item.icon} size={16}/><span>{item.label}</span>
      </button>)}
    </nav></div></div>
    <div className={`app-body ${sidebarCollapsed?'app-body--sidebar-collapsed':''}`}>
      <LabSidebar section={active} collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(value=>!value)} mobileOpen={mobileOpen} onCloseMobile={closeMobile}/>
    <div className="workspace">
      <div className="context-bar"><div className="breadcrumbs"><span>{products[product]}</span><Icon name="chevron-right" size={13}/><span>Design Lab</span><Icon name="chevron-right" size={13}/><strong>{active}</strong></div><span className="context-bar__demo"><Icon name="shield" size={14}/> Entorno de demostración</span></div>
      <main id="main" className="content">
        {notice && <div className="notice" role="status"><Icon name="help" size={17}/><span>{notice}</span><button type="button" className="icon-button" aria-label="Cerrar aviso" onClick={()=>setNotice('')}><Icon name="x" size={16}/></button></div>}
        {active==='Componentes'?<ComponentCatalog/>:active==='Redacción'?<EditorialPreview/>:<Overview showNotice={setNotice}/>}
        <footer className="lab-footer">Sistema visual Zenit · Referencia aprobada V3.0–V4.5.1 · Datos sintéticos · Sin conexión al backend</footer>
      </main>
    </div></div>
  </div>;
}
