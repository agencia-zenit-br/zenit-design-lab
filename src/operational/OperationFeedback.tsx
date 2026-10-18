import { Button } from '../components';
import { Icon } from '../Icon';
export type FeedbackLevel='success'|'info'|'warning'|'danger';
export type FeedbackMessage=Readonly<{id:number;level:FeedbackLevel;message:string}>;

export function OperationNotice({notice,onDismiss}:{
  notice:FeedbackMessage|null;onDismiss:()=>void;
}) {
  if(!notice)return null;
  const glyph=notice.level==='danger'||notice.level==='warning'?'alert':'check';
  return <div className={`op-feedback op-feedback--${notice.level}`}
    role={notice.level==='danger'?'alert':'status'} aria-live={notice.level==='danger'?'assertive':'polite'}>
    <Icon name={glyph} size={16}/><span>{notice.message}</span>
    <button type="button" className="icon-button" aria-label="Cerrar notificación" onClick={onDismiss}>
      <Icon name="x" size={15}/>
    </button>
  </div>;
}

/** Explicit confirmation only; the consuming product owns permissions, audit and execution.
 * Inline confirmation avoids a faux modal that lacks focus trapping. */
export function ActionConfirm({question,onConfirm,onCancel,busy=false}:{
  question:string;onConfirm:()=>void;onCancel:()=>void;busy?:boolean;
}) {
  return <div className="op-confirm" role="group" aria-label="Confirmación de operación">
    <Icon name="alert" size={17}/><strong>{question}</strong>
    <div className="op-confirm__actions">
      <Button variant="secondary" size="standard" disabled={busy} onClick={onCancel}>Cancelar</Button>
      <Button variant="danger" size="standard" disabled={busy} onClick={onConfirm}>
        {busy?'Procesando…':'Confirmar'}
      </Button>
    </div>
  </div>;
}
