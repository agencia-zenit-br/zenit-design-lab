import { useEffect, useState } from 'react';
import { Button, MetricCard, StatusPill } from './components';
import { EditorialPreview } from './EditorialPreview';
import { ComponentCatalog } from './ComponentCatalog';

type Mode = 'light' | 'dark' | 'system';
type Product = 'platform' | 'media' | 'cms';
const productLabels: Record<Product, string> = { platform: 'Platform', media: 'Media Core', cms: 'CMS' };
const navigation = ['Resumen', 'Componentes', 'Redacción', 'Organizaciones', 'Servicios', 'Almacenamiento', 'Consumo', 'Configuración'];
const services = [
  { name: 'Media Core', detail: 'Edición y producción', status: 'Activo' },
  { name: 'CMS', detail: 'Contenido y sitios', status: 'Activo' },
  { name: 'Storage Core', detail: 'Activos y archivos', status: 'Activo' },
];
function initialMode(): Mode { try { const v = localStorage.getItem('design-lab-theme'); return v === 'light' || v === 'dark' || v === 'system' ? v : 'light'; } catch { return 'light'; } }
export function DesignLab() {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  const [product, setProduct] = useState<Product>('platform');
  const [active, setActive] = useState('Resumen');
  const [notice, setNotice] = useState('');
  const effective = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
  useEffect(() => { try { localStorage.setItem('design-lab-theme', mode); } catch { /* private mode */ } }, [mode]);
  useEffect(() => { const mq = window.matchMedia('(prefers-color-scheme: dark)'); const fn = (e: MediaQueryListEvent) => setSystemDark(e.matches); mq.addEventListener('change', fn); return () => mq.removeEventListener('change', fn); }, []);
  return <div className="lab" data-theme={effective} data-product={product}>
    <a className="skip" href="#main">Ir al contenido</a>
    <aside className="sidebar" aria-label="Navegación principal">
      <div className="brand"><span className="brand__symbol" aria-hidden="true">◈</span><span>DESIGN LAB<small>Identidad provisional</small></span></div>
      <div className="sidebar__caption">ESPACIO DE TRABAJO</div>
      <nav aria-label="Secciones del laboratorio">{navigation.map((item, index) => <button key={item} type="button" className={`nav-item ${active === item ? 'nav-item--active' : ''}`} aria-current={active === item ? 'page' : undefined} onClick={() => { setActive(item); if (item !== 'Resumen' && item !== 'Redacción' && item !== 'Componentes') setNotice(`Vista «${item}» pendiente de desarrollo; se mantiene el panel de referencia.`); else setNotice(''); }}><span className="nav-icon" aria-hidden="true">{['▦','▧','✎','▤','◇','▣','▥','⚙'][index]}</span>{item}</button>)}</nav>
      <div className="sidebar__footer">Vista conceptual · Datos sintéticos<br/>No conectada a Platform</div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="breadcrumbs">Familia SaaS <span>/</span> {productLabels[product]} <span>/</span> Vista previa</div><div className="topbar__actions"><label className="field-inline">Producto <select aria-label="Producto de referencia" value={product} onChange={e => setProduct(e.target.value as Product)}><option value="platform">Platform</option><option value="media">Media Core (exploración)</option><option value="cms">CMS (exploración)</option></select></label><label className="field-inline">Apariencia <select aria-label="Apariencia" value={mode} onChange={e => setMode(e.target.value as Mode)}><option value="light">Claro</option><option value="dark">Oscuro</option><option value="system">Sistema</option></select></label><span className="avatar" aria-label="Perfil de demostración">D</span></div></header>
      <main id="main" className="content">
        {active === 'Redacción' ? <EditorialPreview /> : active === 'Componentes' ? <ComponentCatalog /> : <>
        <div className="eyebrow">DESIGN LAB / PRECISION</div>
        <div className="hero"><div><h1>Tu espacio de trabajo,<br/>en un solo lugar.</h1><p>Una experiencia clara para administrar servicios, recursos y operaciones.</p></div><Button onClick={() => setNotice('Acción de demostración: ninguna operación real ha sido creada.')}>+ Nueva operación</Button></div>
        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Cerrar aviso">×</button></div>}
        <section aria-labelledby="overview"><div className="section-head"><h2 id="overview">Vista general</h2><span>Datos de demostración</span></div><div className="metrics"><MetricCard label="Servicios activos" value="12" detail="+2 este mes" icon="◇"/><MetricCard label="Usuarios" value="28" detail="En 4 organizaciones" icon="♙"/><MetricCard label="Activos" value="248" detail="Archivos administrados" icon="▣"/><MetricCard label="Consumo de IA" value="18,4K" detail="Unidades de muestra" icon="✧"/></div></section>
        <div className="dashboard-grid"><section className="panel" aria-labelledby="activity"><div className="panel__head"><div><h2 id="activity">Actividad</h2><p>Operaciones durante la última semana</p></div><StatusPill>Últimos 7 días</StatusPill></div><div className="chart" role="img" aria-label="Gráfico ilustrativo de actividad semanal, con incremento hacia el viernes"><div className="chart__grid"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart__bars">{[43,63,55,77,89,71,84].map((h,i) => <div key={i} className="chart__column"><div className="chart__bar" style={{height:`${h}%`}}/><span>{['L','M','M','J','V','S','D'][i]}</span></div>)}</div></div></section><section className="panel" aria-labelledby="service-list"><div className="panel__head"><div><h2 id="service-list">Servicios</h2><p>Productos y capacidades</p></div></div><div className="service-list">{services.map(s => <div className="service" key={s.name}><span className="service__icon" aria-hidden="true">◇</span><div><strong>{s.name}</strong><small>{s.detail}</small></div><StatusPill tone="success">{s.status}</StatusPill></div>)}</div><Button variant="secondary" onClick={() => setNotice('Catálogo de servicios: vista futura, no disponible en esta demostración.')}>Ver servicios →</Button></section></div>
        <div className="dashboard-grid dashboard-grid--bottom"><section className="panel" aria-labelledby="storage"><div className="panel__head"><div><h2 id="storage">Almacenamiento</h2><p>Capacidad de ejemplo</p></div><strong>64%</strong></div><div className="progress" role="progressbar" aria-valuenow={64} aria-valuemin={0} aria-valuemax={100} aria-label="Uso de almacenamiento"><div/></div><div className="storage-label"><span>64 GB utilizados</span><span>100 GB totales</span></div></section><section className="panel" aria-labelledby="recent"><div className="panel__head"><div><h2 id="recent">Actividad reciente</h2><p>Eventos de demostración</p></div></div><div className="event"><span className="event__dot"/>Se añadió un servicio <small>Hace 2 h</small></div><div className="event"><span className="event__dot"/>Se actualizó un espacio <small>Ayer</small></div></section></div>
        </>}
        <footer className="lab-footer">Precision · Light First / Dark Native · Prototipo visual sin backend · Nombre comercial pendiente</footer>
      </main>
    </div>
  </div>;
}
