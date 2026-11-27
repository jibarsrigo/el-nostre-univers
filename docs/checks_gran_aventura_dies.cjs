'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const dies=JSON.parse(fs.readFileSync(path.join(root,'data/gran-aventura-dies-v1.json'),'utf8'));
const missions=JSON.parse(fs.readFileSync(path.join(root,'data/gran-aventura-missions-v1.json'),'utf8'));
const tpl=new Set((missions.missions||[]).map(m=>m.id));
assert.equal(dies.versio,1);
assert.equal((dies.aventures||[]).length,7);
const inst=new Set();
for(const av of dies.aventures){
  assert(av.id&&av.titol);
  assert.equal((av.slots||[]).length,3);
  for(const s of av.slots){
    assert(s.instanciaId&&s.plantillaMissioId&&s.emissorId);
    assert(!inst.has(s.instanciaId),s.instanciaId);
    inst.add(s.instanciaId);
    assert(tpl.has(s.plantillaMissioId),s.plantillaMissioId);
  }
}
assert.equal(inst.size,21);
console.log('OK: gran-aventura-dies-v1 — 7 aventures, instàncies úniques.');