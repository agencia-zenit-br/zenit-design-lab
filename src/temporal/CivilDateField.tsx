import { useEffect, useState } from 'react';
import { formatEditableCivilDate,parseCivilDate,validateCivilDate,type CivilDate } from './core';

type Props={
  label:string;
  value:CivilDate|null;
  locale:string;
  onChange:(next:CivilDate|null)=>void;
  minDate?:CivilDate;
  maxDate?:CivilDate;
  nullable?:boolean;
};

/** Direct civil-date entry uses strict locale order and Gregorian validation. */
export function CivilDateField({label,value,locale,onChange,minDate,maxDate,nullable=false}:Props) {
  const [draft,setDraft]=useState(value?formatEditableCivilDate(value,locale):'');
  const [error,setError]=useState('');
  useEffect(()=>{
    setDraft(value?formatEditableCivilDate(value,locale):'');
    setError('');
  },[value,locale]);
  const errorId=`temporal-date-${label.replace(/[^a-z0-9]/gi,'-')}-error`;
  const commit=()=>{
    if(nullable&&!draft.trim()){setError('');onChange(null);return;}
    const parsed=parseCivilDate(draft,locale);
    if(!parsed.ok){setError(parsed.error);return;}
    if(minDate&&parsed.value<minDate||maxDate&&parsed.value>maxDate){
      setError('La fecha está fuera del período permitido.');
      return;
    }
    if(!validateCivilDate(parsed.value).ok){setError('La fecha no existe.');return;}
    setError('');setDraft(formatEditableCivilDate(parsed.value,locale));
    onChange(parsed.value);
  };
  return <label className="temporal-date-field">
    <span>{label}</span>
    <input type="text" inputMode="text" autoComplete="off"
      aria-label={label} aria-invalid={Boolean(error)}
      aria-describedby={error?errorId:undefined}
      placeholder={formatEditableCivilDate('2026-11-15',locale)}
      value={draft} onChange={event=>{setDraft(event.target.value);setError('');}}
      onBlur={commit} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();commit();}}}/>
    <small id={errorId} role={error?'alert':undefined} className="temporal-date-field__error temporal-feedback-slot">{error}</small>
  </label>;
}
