import { useState, type FormEvent } from 'react';
import { Button, StatusPill } from './components';
import { Icon } from './Icon';

type Errors = { title?:string; email?:string; consent?:string };
const isEmail = (value:string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** Pure client-side validation and feedback: no account data, network or submission. */
export function FormSpecimen() {
  const [title,setTitle] = useState('');
  const [email,setEmail] = useState('');
  const [description,setDescription] = useState('');
  const [consent,setConsent] = useState(false);
  const [errors,setErrors] = useState<Errors>({});
  const [submitted,setSubmitted] = useState(false);
  const [saving,setSaving] = useState(false);

  const validate=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const problems:Errors={};
    if(title.trim().length<3)problems.title='Introduce un título de al menos 3 caracteres.';
    else if(title.trim().length>60)problems.title='El título no puede superar 60 caracteres.';
    if(!isEmail(email.trim()))problems.email='Introduce una dirección de correo válida.';
    if(!consent)problems.consent='Confirma que comprendes que el formulario es una demostración.';
    setErrors(problems);
    setSubmitted(Object.keys(problems).length===0);
    setSaving(false);
  };
  const reset=()=>{
    setTitle('');setEmail('');setDescription('');setConsent(false);
    setErrors({});setSubmitted(false);setSaving(false);
  };
  return <form className="forms-demo" noValidate onSubmit={validate} onReset={event=>{event.preventDefault();reset();}}>
    <div className="forms-demo__grid">
      <label className="forms-demo__field">
        <span>Título <abbr title="Obligatorio">*</abbr></span>
        <input id="forms-demo-title" value={title} minLength={3} maxLength={80}
          autoComplete="off" placeholder="Nombre de la demostración"
          aria-invalid={Boolean(errors.title)} aria-describedby={errors.title?'forms-demo-title-error':undefined}
          onChange={event=>{setTitle(event.target.value);setSubmitted(false);setErrors(prev=>({...prev,title:undefined}));}}/>
        {errors.title&&<small className="forms-demo__error" id="forms-demo-title-error" role="alert">{errors.title}</small>}
      </label>
      <label className="forms-demo__field">
        <span>Correo electrónico <abbr title="Obligatorio">*</abbr></span>
        <input id="forms-demo-email" value={email} autoComplete="off" inputMode="email"
          placeholder="ejemplo@dominio.com" aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email?'forms-demo-email-error':undefined}
          onChange={event=>{setEmail(event.target.value);setSubmitted(false);setErrors(prev=>({...prev,email:undefined}));}}/>
        {errors.email&&<small className="forms-demo__error" id="forms-demo-email-error" role="alert">{errors.email}</small>}
      </label>
      <label className="forms-demo__field forms-demo__field--wide">
        <span>Notas adicionales <small>(opcional)</small></span>
        <textarea rows={3} maxLength={500} value={description}
          placeholder="Información complementaria"
          onChange={event=>{setDescription(event.target.value);setSubmitted(false);}}/>
      </label>
    </div>
    <label className="forms-demo__consent">
      <input type="checkbox" checked={consent} aria-invalid={Boolean(errors.consent)}
        aria-describedby={errors.consent?'forms-demo-consent-error':undefined}
        onChange={event=>{setConsent(event.target.checked);setErrors(prev=>({...prev,consent:undefined}));setSubmitted(false);}}/>
      <span>Confirmo que este formulario utiliza exclusivamente datos de demostración.</span>
    </label>
    {errors.consent&&<small className="forms-demo__error" id="forms-demo-consent-error" role="alert">{errors.consent}</small>}
    <div className="forms-demo__actions">
      <Button type="reset" variant="secondary">Restablecer</Button>
      <Button type="submit"><Icon name="check" size={15}/> Validar formulario</Button>
    </div>
    {submitted&&<div className="forms-demo__success" role="status">
      <StatusPill tone="success">Validación correcta</StatusPill>
      <span>Los campos cumplen las reglas locales. Ningún dato se ha enviado ni almacenado.</span>
    </div>}
    <p className="catalog__footnote">Demostración de campos y validación de interfaz. La validación de servidor, permisos y auditoría corresponde al producto operativo.</p>
  </form>;
}
