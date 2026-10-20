import test from 'node:test';
import assert from 'node:assert/strict';
import {clothingSizeRank,detectColumnKind,filterSheet,orderSheet,proposeCanonicalValue} from '../src/operational/smartSheetCore.ts';
const rows=[
  {id:1,type:'Camiseta',size:'GG',color:'Azul',price:'R$ 85,00',print:'Spider-Man'},
  {id:2,type:'Camiseta',size:'P',color:'Azul',price:'R$ 69,90',print:'Los Simpson'},
  {id:3,type:'Camiseta',size:'Tamanho Único',color:'Negro',price:'R$ 90,00',print:'Sin estampa'},
  {id:4,type:'Camiseta',size:'G',color:'Azul',price:'R$ 110,00',print:'Bart Simpson'},
  {id:5,type:'Pantalón',size:'M',color:'Azul',price:'R$ 75,00',print:'Dibujos animados'},
  {id:6,type:'Camiseta',size:'M',color:'Azul',price:'R$ 79,00',print:'Batman'},
];
const get=(row,key)=>row[key];
test('clothing size axis is semantic and case/accent insensitive',()=>{
  assert.deepEqual(['P','M','G','GG','Tamaño Único'].map(size=>clothingSizeRank(size)),[1,2,3,4,7]);
  assert.equal(clothingSizeRank('XXL'),5);
  assert.equal(clothingSizeRank('???'),null);
  assert.equal(detectColumnKind(rows.map(r=>r.size)),'clothing-size');
});
test('hierarchical sorting preserves full rows and original input',()=>{
  const result=orderSheet(rows,[{column:'type',direction:'asc',kind:'text'},{column:'size',direction:'asc',kind:'auto'},
    {column:'color',direction:'asc',kind:'text'},{column:'price',direction:'asc',kind:'number'}],get);
  assert.deepEqual(result.map(r=>r.id),[2,6,4,1,3,5]);
  assert.equal(rows[0].id,1);
});
test('multiple structured filters AND together with BRL amount bounds',()=>{
  const result=filterSheet(rows,[{column:'type',operator:'equals',value:'camiseta'},
    {column:'color',operator:'equals',value:'azul'},
    {column:'price',operator:'between',value:'50',to:'100'},
    {column:'print',operator:'contains',value:'SIMpson'}],get);
  assert.deepEqual(result.map(r=>r.id),[2]);
});
test('normalization is a proposal only and requires approval',()=>{
  const proposal=proposeCanonicalValue('remera','Camiseta',['remera','franela','t-shirt','remera']);
  assert.equal(proposal.requiresApproval,true);
  assert.deepEqual(proposal.aliases,['remera','franela','t-shirt']);
});

test('XP and L can be garment sizes only in the declared field taxonomy',()=>{
  assert.equal(clothingSizeRank('XP'),0);
  assert.equal(clothingSizeRank('L'),3);
  const definition={ordered:['XP','P','M','G','GG','Única'],aliases:{'l':'G','one size':'Única'}};
  assert.equal(clothingSizeRank('L',definition),3);
  assert.equal(clothingSizeRank('one size',definition),5);
  const mixed=[{id:1,size:'L',name:'L'},{id:2,size:'P',name:'P'}];
  assert.deepEqual(orderSheet(mixed,[{column:'size',direction:'asc',kind:'auto'}],(r,c)=>r[c],'pt-BR',{size:definition}).map(r=>r.id),[2,1]);
});
