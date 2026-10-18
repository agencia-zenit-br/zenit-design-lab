import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
 queryCollection,reconcileSelectedIds,toggleIds,selectedAllVisible,nextSort,
} from '../src/operational/collectionCore.ts';

const rows=[
 {id:1,name:'Árbol',status:'Activo',amount:20},
 {id:2,name:'Azul',status:'Pendiente',amount:8},
 {id:3,name:'Café',status:'Activo',amount:7},
 {id:4,name:'Beta',status:'Completado',amount:2},
 {id:5,name:'Álamo',status:'Activo',amount:35},
 {id:6,name:'Destino',status:'Pendiente',amount:12},
];
const columns=[
 {key:'name',label:'Nombre',getValue:row=>row.name,sortable:true},
 {key:'status',label:'Estado',getValue:row=>row.status,filterable:true,sortable:true},
 {key:'amount',label:'Cantidad',getValue:row=>row.amount,sortable:true},
];
const base={search:'',filters:{},sort:null,page:1,pageSize:2};
test('Collection search normalizes diacritics and returns non-mutated pagination results',()=>{
 const original=[...rows];
 const value=queryCollection(rows,columns,{...base,search:'arbol'});
 assert.equal(value.total,1);
 assert.equal(value.visibleRows[0].id,1);
 assert.deepEqual(rows,original);
 const empty=queryCollection(rows,columns,{...base,search:'inexistente'});
 assert.equal(empty.total,0);
 assert.equal(empty.page,1);
 assert.equal(empty.from,0);
 assert.equal(empty.to,0);
});
test('Controlled paging clamps invalid page and pages preserve source order',()=>{
 const second=queryCollection(rows,columns,{...base,page:2});
 assert.deepEqual(second.visibleRows.map(row=>row.id),[3,4]);
 assert.equal(second.from,3);
 assert.equal(second.to,4);
 const last=queryCollection(rows,columns,{...base,page:99});
 assert.equal(last.page,3);
 assert.deepEqual(last.visibleRows.map(row=>row.id),[5,6]);
 const invalid=queryCollection(rows,columns,{...base,page:0,pageSize:0});
 assert.equal(invalid.page,1);
 assert.equal(invalid.pageSize,10);
});
test('Filters and sorting operate only on opt-in column contracts',()=>{
 const active=queryCollection(rows,columns,{...base,filters:{status:'Activo'},sort:{key:'amount',direction:'asc'},pageSize:10});
 assert.deepEqual(active.visibleRows.map(row=>row.id),[3,1,5]);
 const desc=queryCollection(rows,columns,{...base,sort:{key:'name',direction:'desc'},pageSize:10});
 assert.equal(desc.visibleRows[0].name,'Destino');
 const missing=queryCollection(rows,columns,{...base,filters:{unknown:'x'}});
 assert.equal(missing.total,0);
 assert.equal(queryCollection(rows,columns,{...base,sort:{key:'amount',direction:'desc'},pageSize:10}).visibleRows[0].id,5);
});
test('Selection persists across filters/pages while respecting actual removals',()=>{
 const firstPage=queryCollection(rows,columns,base);
 const selected=toggleIds([],firstPage.visibleRows.map(row=>row.id),true);
 assert.deepEqual(selected,[1,2]);
 assert.ok(selectedAllVisible(selected,firstPage.visibleRows));
 assert.ok(!selectedAllVisible(selected,rows));
 const addLater=toggleIds(selected,[4],true);
 assert.deepEqual(addLater,[1,2,4]);
 assert.deepEqual(reconcileSelectedIds(addLater,rows.filter(row=>row.id!==2)),[1,4]);
 assert.deepEqual(toggleIds(addLater,[1],false),[2,4]);
 assert.equal(selectedAllVisible([],[]),false);
});
test('Sort cycles ascending -> descending -> original order',()=>{
 const asc=nextSort(null,'name');
 assert.deepEqual(asc,{key:'name',direction:'asc'});
 const desc=nextSort(asc,'name');
 assert.deepEqual(desc,{key:'name',direction:'desc'});
 assert.equal(nextSort(desc,'name'),null);
});
