import { useState } from 'react';
import { Button, StatusPill } from './components';
import { Icon } from './Icon';
import { ContextHelp } from './ContextHelp';

type Article = { id: number; title: string; summary: string; body: string; status: 'Borrador' | 'En revisión' | 'Aprobado'; revision: number };
const initialArticles: Article[] = [
  { id: 1, title: 'Nueva cobertura para la edición de hoy', summary: 'Resumen de demostración para verificar la composición editorial.', body: 'Texto de ejemplo. Este contenido no corresponde a una noticia publicada.', status: 'Borrador', revision: 1 },
  { id: 2, title: 'Análisis de la agenda informativa', summary: 'Pieza editorial de muestra en proceso de revisión.', body: 'Contenido sintético utilizado exclusivamente para la vista previa.', status: 'En revisión', revision: 2 },
];
export function EditorialPreview() {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [selected, setSelected] = useState<number | null>(1);
  const [notice, setNotice] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const article = articles.find(item => item.id === selected);
  function update(changes: Partial<Article>) {
    setArticles(items => items.map(item => item.id === selected ? { ...item, ...changes } : item));
  }
  function transition(status: Article['status']) {
    if (!article) return;
    if (status === 'En revisión' && !article.title.trim()) {
      setNotice('El título es obligatorio para enviar el artículo a revisión.');
      return;
    }
    if (status === 'Borrador' && !returnReason.trim()) {
      setNotice('Indica el motivo de devolución antes de continuar.');
      return;
    }
    update({ status, revision: article.revision + 1 });
    setReturnReason('');
    setNotice('Cambio simulado localmente. No se ha modificado ningún artículo real.');
  }
  return <section className="editorial-preview" aria-label="Vista previa editorial">
    <div className="hero editorial-hero"><div className="editorial-title"><h1>Producción editorial</h1><ContextHelp label="Información sobre esta demostración"><strong>Vista de demostración</strong><p>Explora el flujo de borradores, revisión y aprobación con datos sintéticos. No está conectada a la API ni modifica contenido real.</p></ContextHelp></div><Button onClick={() => { const id = Math.max(0, ...articles.map(item => item.id)) + 1; setArticles(items => [...items, { id, title: 'Nuevo borrador', summary: '', body: '', status: 'Borrador', revision: 1 }]); setSelected(id); setReturnReason(''); setNotice('Borrador de demostración creado en memoria, sin conexión al servidor.'); }}><Icon name="plus" size={14}/> Nuevo artículo</Button></div>
    {notice && <div className="notice" role="status">{notice}<button type="button" aria-label="Cerrar aviso" onClick={() => setNotice('')} className="icon-button"><Icon name="x" size={16}/></button></div>}
    <div className="editorial-layout">
      <section id="editorial-list" className="panel editorial-list" aria-label="Lista de artículos"><div className="panel__head"><div><h2>Artículos</h2></div><span className="editorial-count" aria-label="Total de artículos">{articles.length}</span></div>
        {articles.map(item => <button type="button" key={item.id} className={`editorial-item ${selected === item.id ? 'editorial-item--selected' : ''}`} onClick={() => { setSelected(item.id); setReturnReason(''); setNotice(''); }} aria-pressed={selected === item.id}><strong>{item.title}</strong><span>{item.status} · Revisión {item.revision}</span></button>)}
      </section>
      <section id="editorial-editor" className="panel editorial-editor" aria-label="Editor de artículo">
        {article ? <><div className="panel__head"><div><h2>Editor</h2><p>Revisión {article.revision}</p></div><StatusPill>{article.status}</StatusPill></div>
          <label className="editorial-field">Título<input value={article.title} disabled={article.status !== 'Borrador'} onChange={event => update({ title: event.target.value })}/></label>
          <label className="editorial-field">Resumen<textarea rows={3} value={article.summary} disabled={article.status !== 'Borrador'} onChange={event => update({ summary: event.target.value })}/></label>
          <label className="editorial-field">Cuerpo<textarea rows={9} value={article.body} disabled={article.status !== 'Borrador'} onChange={event => update({ body: event.target.value })}/></label>
          {article.status === 'En revisión' && <label className="editorial-field">Motivo de devolución<textarea rows={2} maxLength={4000} value={returnReason} onChange={event => setReturnReason(event.target.value)} placeholder="Obligatorio para devolver el artículo"/></label>}
          <div className="editorial-actions">{article.status === 'Borrador' && <Button onClick={() => transition('En revisión')}>Enviar a revisión</Button>}{article.status === 'En revisión' && <><Button onClick={() => transition('Aprobado')}>Aprobar</Button><Button variant="secondary" onClick={() => transition('Borrador')}>Devolver</Button></>}{article.status === 'Aprobado' && <span>Artículo aprobado (demostración)</span>}</div>
        </> : <p>Selecciona un artículo.</p>}
      </section>
    </div>
  </section>;
}
