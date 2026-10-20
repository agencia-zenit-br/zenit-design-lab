import type {FilterClause} from './smartSheetCore';

export type DemoInstructionColumn=Readonly<{
  key:string;label:string;values:readonly unknown[];
}>;
export type DemoInstructionProposal=Readonly<{
  clauses:readonly FilterClause[];
  smartOrder:boolean;
  explanation:string;
  limitations:readonly string[];
}>;
const fold=(v:unknown)=>String(v??'').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim();
/** Deterministic fallback for the isolated Design Lab, NOT an LLM.
 * No external calls, records mutation or unverified semantic classification.
 * Proposed filters are human reviewed before they can be applied.
 */
export function proposeDemoInstruction(input:string,columns:readonly DemoInstructionColumn[]):DemoInstructionProposal{
  const prompt=fold(input);
  const smartOrder=/\b(ordenar|ordena|ordenalo|ordenalos|ordenado|organiza|organizalo|organizalos|organizar|clasifica|clasificar)\b/.test(prompt);
  const clauses:FilterClause[]=[];
  const limitations:string[]=[];
  if(prompt.length<8)return {clauses,smartOrder:false,
    explanation:'Escribe una instrucción con información suficiente.',limitations:['Faltan detalles para proponer una operación.']};
  // Only exact known cell values, never inferred semantic synonyms.
  for(const column of columns){
    const unique=[...new Set(column.values.map(fold).filter(v=>v.length>=3&&!/^\d/.test(v)))];
    const matched=unique.filter(v=>{
      const match=new RegExp('(^|[^a-z0-9])'+v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'($|[^a-z0-9])');
      return match.test(prompt);
    });
    if(matched.length===1){
      const candidate=matched[0];
      const conflict=columns.some(other=>other.key!==column.key&&other.values.some(v=>fold(v)===candidate));
      if(!conflict||prompt.includes(fold(column.label)))clauses.push({column:column.key,operator:'equals',value:candidate});
      else limitations.push('«'+candidate+'» aparece en más de una columna; especifica el campo.');
    }else if(matched.length>1&&prompt.includes(fold(column.label))){
      limitations.push('Se detectaron varios valores para «'+column.label+'». Selecciona uno en el filtro estructurado.');
    }
  }
  const range=prompt.match(/entre\s+(?:r\$\s*)?(\d+(?:[.,]\d+)?)\s+(?:y|a)\s+(?:r\$\s*)?(\d+(?:[.,]\d+)?)/);
  const price=columns.find(c=>/precio|price|valor|costo|coste/.test(fold(c.label)));
  if(range&&price)clauses.push({column:price.key,operator:'between',value:range[1],to:range[2]});
  if(clauses.length===0&&!smartOrder)limitations.push('No se pudo interpretar con seguridad. Describe columnas y valores concretos o utiliza Filtros.');
  return {clauses,smartOrder,
    explanation:'Propuesta local verificable basada exclusivamente en valores ya presentes en la hoja.',
    limitations};
}
