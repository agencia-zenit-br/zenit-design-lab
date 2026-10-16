import { useState } from 'react';
import { Button, StatusPill } from './components';

type Row = { id: number; name: string; category: string; status: string };
const initial: Row[] = [
  { id: 1, name: 'Documento editorial', category: 'Contenido', status: 'Activo' },
  { id: 2, name: 'Biblioteca visual', category: 'Recursos', status: 'En revisión' },
  { id: 3, name: 'Plantilla social', category: 'Distribución', status: 'Activo' },
];
type Column = 'name' | 'category' | 'status';
const labels: Record<Column,string> = { name:'Elemento',category:'Categoría',status:'Estado' };
export function ComponentCatalog() {
  const [rows,setRows] = useState(initial);
  const [columns,setColumns] = useState<Column[]>(['name','category','status']);
  const [selected,setSelected] = useState<number[]>([]);
  const [filter,setFilter] = useState('');
  const [compact,setCompact] = useState(false);
  const [notice,setNotice] = useState('');
  const filtered = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(filter.toLowerCase())));
  const move = (index:number, direction:number) => {
    const next = index + direction;
    if(next < 0 || next >= columns.length) return;
    setColumns(old => { const result = [...old]; [result[index],result[next]] = [result[next],result[index]]; return result; });
  };
  const removeSelected = () => {setRows(old=>old.filter(r=>!selected.includes(r.id)));setSelected([]);};
  return <div className="catalog">
    <div className="eyebrow">DESIGN LAB / COMPONENTES</div>
    <div className="catalog__intro"><div><h1>Biblioteca de componentes</h1><p>Implementación progresiva de las decisiones aprobadas. Los controles de esta página son interactivos y trabajan exclusivamente con datos sintéticos.</p></div><StatusPill tone="warning">Cobertura parcial</StatusPill></div>
    <section className="panel catalog__section" aria-labelledby="catalog-type">
      <div className="panel__head"><div><h2 id="catalog-type">Tipografía y jerarquía</h2><p>Escalas de texto, contraste y espaciado de referencia.</p></div></div>
      <h1 className="catalog__display">Título principal</h1><h2>Encabezado de sección</h2><p>Texto de lectura para descripciones, formularios y contenidos extensos.</p><small>Texto secundario y metadatos</small>
    </section>
    <section className="panel catalog__section" aria-labelledby="catalog-controls">
      <div className="panel__head"><div><h2 id="catalog-controls">Botones, estados y controles</h2><p>Estados y variantes visibles en ambos modos de apariencia.</p></div></div>
      <div className="catalog__row"><Button onClick={()=>setNotice('Acción primaria de demostración.')}>Acción principal</Button><Button variant="secondary" onClick={()=>setNotice('Acción secundaria de demostración.')}>Acción secundaria</Button><button className="button" disabled>Deshabilitado</button><StatusPill tone="success">Activo</StatusPill><StatusPill tone="warning">En revisión</StatusPill><StatusPill>Neutral</StatusPill></div>
      <div className="catalog__row"><label className="catalog__check"><input type="checkbox" checked={compact} onChange={e=>setCompact(e.target.checked)}/> Tabla compacta</label><label className="catalog__field">Buscar elementos <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Buscar…" /></label></div>
      <div className="catalog__message" role="status">{notice}</div>
    </section>
    <section className="panel catalog__section" aria-labelledby="catalog-table">
      <div className="panel__head"><div><h2 id="catalog-table">Tabla dinámica — primera implementación</h2><p>Orden de columnas, selección múltiple, edición y acciones por lote. Otras interacciones aprobadas todavía están pendientes.</p></div></div>
      <div className="catalog__row"><Button variant="secondary" onClick={()=>setRows(old=>[...old,{id:Math.max(0,...old.map(r=>r.id))+1,name:'Nuevo elemento',category:'General',status:'En revisión'}])}>+ Añadir fila</Button><Button variant="secondary" disabled={!selected.length} onClick={removeSelected}>Eliminar selección ({selected.length})</Button><span>{filtered.length} elementos</span></div>
      <div className="catalog__table-scroll"><table className={compact?'catalog__table catalog__table--compact':'catalog__table'}><thead><tr><th scope="col"><input aria-label="Seleccionar todos los elementos visibles" type="checkbox" checked={filtered.length>0&&filtered.every(r=>selected.includes(r.id))} onChange={e=>setSelected(old=>e.target.checked?[...new Set([...old,...filtered.map(r=>r.id)])]:old.filter(id=>!filtered.some(r=>r.id===id)))}/></th>{columns.map((col,i)=><th key={col} scope="col"><span className="catalog__th"><button title={`Mover ${labels[col]} a la izquierda`} aria-label={`Mover ${labels[col]} a la izquierda`} disabled={i===0} onClick={()=>move(i,-1)}>‹</button>{labels[col]}<button title={`Mover ${labels[col]} a la derecha`} aria-label={`Mover ${labels[col]} a la derecha`} disabled={i===columns.length-1} onClick={()=>move(i,1)}>›</button></span></th>)}</tr></thead><tbody>{filtered.map(row=><tr key={row.id}><td><input type="checkbox" aria-label={`Seleccionar ${row.name}`} checked={selected.includes(row.id)} onChange={e=>setSelected(old=>e.target.checked?[...old,row.id]:old.filter(id=>id!==row.id))}/></td>{columns.map(col=><td key={col}><input aria-label={`${labels[col]} de ${row.name}`} value={row[col]} onChange={e=>setRows(old=>old.map(r=>r.id===row.id?{...r,[col]:e.target.value}:r))}/></td>)}</tr>)}</tbody></table></div>
      <p className="catalog__footnote">Pendiente: arrastre, redimensionamiento, rangos de celdas, portapapeles y deshacer/rehacer. Esta tabla no debe considerarse conforme con toda la especificación aprobada.</p>
    </section>
  </div>;
}
