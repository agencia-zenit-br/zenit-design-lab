/** Zenit UI Core: deterministic, pure collection operations.
 * No DOM, React, tenant assumptions, backend credentials, roles or product-specific rules.
 * Display filtering never authorizes access: the server must scope all fetched rows.
 */
export type RecordIdentity=string|number;
export type RecordWithId={id:RecordIdentity};
export type SortDirection='asc'|'desc';
export type SortSpec<Key extends string=string>=Readonly<{key:Key;direction:SortDirection}>|null;
export type CollectionQuery<Key extends string=string>=Readonly<{
  search:string;
  filters:Readonly<Record<string,string>>;
  sort:SortSpec<Key>;
  page:number;pageSize:number;
}>;
export type CollectionColumn<Row>=Readonly<{
  key:string;
  label:string;
  getValue:(row:Row)=>string|number|null|undefined;
  filterable?:boolean;
  sortable?:boolean;
}>;
export type CollectionResult<Row>=Readonly<{
  allMatching:readonly Row[];
  visibleRows:readonly Row[];
  total:number;
  page:number;
  pageCount:number;
  pageSize:number;
  from:number;
  to:number;
  hasPrevious:boolean;
  hasNext:boolean;
}>;
const fold=(text:unknown)=>String(text??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim();
const safePage=(n:number)=>Number.isSafeInteger(n)&&n>0?n:1;
const safeSize=(n:number)=>Number.isSafeInteger(n)&&n>=1&&n<=250?n:10;
export function queryCollection<Row extends RecordWithId>(
  rows:readonly Row[],
  columns:readonly CollectionColumn<Row>[],
  query:CollectionQuery,
  locale='es-ES',
):CollectionResult<Row>{
  const byKey=new Map(columns.map(column=>[column.key,column]));
  const needle=fold(query.search);
  const filtered=rows.filter(row=>{
    if(needle&&!columns.some(column=>fold(column.getValue(row)).includes(needle)))return false;
    return Object.entries(query.filters).every(([key,value])=>{
      if(!value)return true;
      const column=byKey.get(key);
      return Boolean(column?.filterable)&&fold(column.getValue(row))===fold(value);
    });
  });
  const sort=query.sort;
  const column=sort?byKey.get(sort.key):null;
  const collator=new Intl.Collator(locale,{numeric:true,sensitivity:'base'});
  const allMatching=column?.sortable?[...filtered].sort((first,second)=>{
    const a=column.getValue(first),b=column.getValue(second);
    const compared=typeof a==='number'&&typeof b==='number'?a-b:
      collator.compare(String(a??''),String(b??''));
    return (sort?.direction==='desc'?-1:1)*compared;
  }):filtered;
  const pageSize=safeSize(query.pageSize);
  const total=allMatching.length;
  const pageCount=Math.max(1,Math.ceil(total/pageSize));
  const page=Math.min(safePage(query.page),pageCount);
  const from=(page-1)*pageSize;
  return {allMatching,visibleRows:allMatching.slice(from,from+pageSize),
    total,page,pageCount,pageSize,from:total?from+1:0,to:Math.min(from+pageSize,total),
    hasPrevious:page>1,hasNext:page<pageCount};
}
/** Selection remains stable across pagination and filters.
 * Remove IDs only when source rows actually cease to exist, not when hidden by a filter. */
export function reconcileSelectedIds<Row extends RecordWithId>(ids:readonly RecordIdentity[],rows:readonly Row[]):RecordIdentity[]{
  const possible=new Set(rows.map(row=>row.id));
  return [...new Set(ids)].filter(id=>possible.has(id));
}
export function toggleIds(ids:readonly RecordIdentity[],targets:readonly RecordIdentity[],checked:boolean):RecordIdentity[]{
  const next=new Set(ids);
  for(const target of targets)checked?next.add(target):next.delete(target);
  return [...next];
}
export function selectedAllVisible(ids:readonly RecordIdentity[],rows:readonly RecordWithId[]):boolean{
  return rows.length>0&&rows.every(row=>ids.includes(row.id));
}
export function nextSort<Key extends string>(current:SortSpec<Key>,key:Key):SortSpec<Key>{
  if(!current||current.key!==key)return {key,direction:'asc'};
  return current.direction==='asc'?{key,direction:'desc'}:null;
}
