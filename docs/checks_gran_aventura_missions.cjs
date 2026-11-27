'use strict';
const fs=require('fs'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const reg=JSON.parse(fs.readFileSync(path.join(root,'data/gran-aventura-missions-v1.json'),'utf8'));
const act=JSON.parse(fs.readFileSync(path.join(root,'data/activitats.json'),'utf8'));
assert.equal(reg.versio,1);
const ids=new Set();
const actIds=new Set((act.activitats||[]).map(a=>a.id));
for(const m of reg.missions||[]){
  assert(m.id&&m.activitatId&&m.modeRequerit==='missio','camp obligatori');
  assert(!ids.has(m.id),m.id+' duplicat');
  ids.add(m.id);
  assert(actIds.has(m.activitatId),m.id+' activitat desconeguda');
}
assert.equal(ids.size,3);
['cartes','ombres','diferencies'].forEach(id=>assert(reg.missions.some(m=>m.activitatId===id),id));
console.log('OK: gran-aventura-missions-v1 — ids únics i vincle activitats.');