/** Zenit Sheets: pure deterministic operators. Not an authorization boundary.
 * Execute only on rows already authorized by the owning product.
 * LLM interpretations must be converted to reviewed FilterClause entries before execution.
 */
export type FilterOperator='equals'|'contains'|'between'|'oneOf';
export type FilterClause=Readonly<{column:string;operator:FilterOperator;value:string;to?:string;values?:readonly string[]}>;
export type SheetSort=Readonly<{column:string;direction:'asc'|'desc';kind:'auto'|'text'|'number'|'clothing-size'}>;
export type Clarification=Readonly<{field:string;reason:string;options:readonly string[]}>;
export type ProposedNormalization=Readonly<{original:string;canonical:string;aliases:readonly string[];requiresApproval:true}>;
export type SheetBook=Readonly<{id:string;title:string;activeSheetId:string;sheets:readonly Readonly<{id:string;title:string}>[]}>;
const normalized=(v:unknown)=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase();
const sizeSequence=['pp','p','m','g','gg','xgg','xxgg','tamanho unico'];
const sizeAliases:Readonly<Record<string,string>>={
  'pp':'pp','extra pequeno':'pp','xs':'pp','p':'p','pequeno':'p','s':'p',
  'm':'m','medio':'m','medium':'m','g':'g','grande':'g','l':'g',
  'gg':'gg','extra grande':'gg','xl':'gg','xgg':'xgg','xxl':'xgg',
  'xxgg':'xxgg','3xl':'xxgg',
  'tamanho unico':'tamanho unico','tamano unico':'tamanho unico','talla unica':'tamanho unico','talle unico':'tamanho unico',
  'one size':'tamanho unico','unica':'tamanho unico','unico':'tamanho unico',
};
export function clothingSizeRank(value:unknown):number|null{
  const canonical=sizeAliases[normalized(value)];
  return canonical===undefined?null:sizeSequence.indexOf(canonical);
}
export function detectColumnKind(values:readonly unknown[]):'clothing-size'|'number'|'text'{
  const present=values.filter(v=>String(v??'').trim()!=='');
  if(present.length===0)return 'text';
  if(present.every(v=>clothingSizeRank(v)!==null))return 'clothing-size';
  if(present.every(v=>typeof v==='number' || /^-?\d+(?:[.,]\d+)?$/.test(String(v).trim())))return 'number';
  return 'text';
}
const amount=(v:unknown)=>{
  if(typeof v==='number')return Number.isFinite(v)?v:NaN;
  const raw=String(v??'').trim().replace(/(?:R\$|BRL|€|USD|\$)/gi,'').replace(/\s/g,'');
  if(!raw)return NaN;
  const sep=raw.lastIndexOf(',')>raw.lastIndexOf('.')?',':'.';
  const decimal=sep===','?raw.replace(/\./g,'').replace(',','.'):raw.replace(/,/g,'');
  return /^-?\d+(?:\.\d+)?$/.test(decimal)?Number(decimal):NaN;
};
export function filterSheet<Row>(rows:readonly Row[],clauses:readonly FilterClause[],
  value:(row:Row,column:string)=>unknown):Row[]{
  return rows.filter(row=>clauses.every(clause=>{
    const current=value(row,clause.column),needle=normalized(clause.value),actual=normalized(current);
    if(clause.operator==='equals')return actual===needle;
    if(clause.operator==='contains')return actual.includes(needle);
    if(clause.operator==='oneOf')return (clause.values??[clause.value]).some(v=>normalized(v)===actual);
    const n=amount(current),min=amount(clause.value),max=amount(clause.to);
    return Number.isFinite(n)&&Number.isFinite(min)&&Number.isFinite(max)&&min<=n&&n>=min&&n<=max;
  }));
}
/** Stable hierarchical sorting keeps whole records intact and uses the column order as priority. */
export function orderSheet<Row>(rows:readonly Row[],sorts:readonly SheetSort[],
  value:(row:Row,column:string)=>unknown,locale='pt-BR'):Row[]{
  const collator=new Intl.Collator(locale,{numeric:true,sensitivity:'base'});
  const keys=sorts.map(sort=>({...sort,kind:sort.kind==='auto'
    ?detectColumnKind(rows.map(row=>value(row,sort.column))):sort.kind}));
  return rows.map((row,index)=>({row,index})).sort((a,b)=>{
    for(const sort of keys){
      const left=value(a.row,sort.column),right=value(b.row,sort.column);
      let compared=0;
      if(sort.kind==='clothing-size'){
        const x=clothingSizeRank(left),y=clothingSizeRank(right);
        compared=x!==null&&y!==null?x-y:collator.compare(String(left??''),String(right??''));
      }else if(sort.kind==='number'){
        const x=amount(left),y=amount(right);
        compared=Number.isFinite(x)&&Number.isFinite(y)?x-y:collator.compare(String(left??''),String(right??''));
      }else compared=collator.compare(String(left??''),String(right??''));
      if(compared!==0)return (sort.direction==='desc'?-1:1)*compared;
    }
    return a.index-b.index;
  }).map(item=>item.row);
}
/** Approval boundaries are explicit: no normalization is applied by this module. */
export function proposeCanonicalValue(original:string,canonical:string,aliases:readonly string[]):ProposedNormalization{
  return {original,canonical,aliases:[...new Set(aliases)],requiresApproval:true};
}
