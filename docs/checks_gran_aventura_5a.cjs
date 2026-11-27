'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const diesJSON=JSON.parse(fs.readFileSync(path.join(root,'data/gran-aventura-dies-v1.json'),'utf8'));
const missionsJSON=JSON.parse(fs.readFileSync(path.join(root,'data/gran-aventura-missions-v1.json'),'utf8'));
const ls=new Map();
const ctx=vm.createContext({document:{getElementById:()=>({innerHTML:''}),body:{classList:{toggle(){}}},addEventListener(){}},localStorage:{getItem:k=>ls.get(k),setItem:(k,v)=>ls.set(k,v)},sessionStorage:{getItem:()=>null,setItem(){}},window:{},setTimeout(){},console,Math,Date,fetch:u=>Promise.resolve({json:()=>Promise.resolve(String(u).includes('dies')?diesJSON:String(u).includes('missions')?missionsJSON:JSON.parse(fs.readFileSync(path.join(root,'data/activitats.json'),'utf8')))})});
const run=s=>vm.runInContext(s,ctx);
vm.runInContext(fs.readFileSync(path.join(root,'js/progres.js'),'utf8'),ctx,{filename:'progres.js'});
vm.runInContext(fs.readFileSync(path.join(root,'js/granaventura.js'),'utf8'),ctx,{filename:'granaventura.js'});
vm.runInContext(fs.readFileSync(path.join(root,'js/missions.js'),'utf8'),ctx,{filename:'missions.js'});
run(`missionsCatalog.list=${JSON.stringify(missionsJSON.missions)};missionsCatalog.ready=true`);
run(`granAventuraCat.list=${JSON.stringify(diesJSON.aventures)};granAventuraCat.ready=true`);

assert(run('granAventuraInicia("ga-dia-001")').ok);
assert.equal(run('granAventuraBloc().aventuraActiva'),'ga-dia-001');
const i1='ga-dia-001-slot-2';
assert(run(`granAventuraPotIniciarInstancia('${i1}')`).ok);
run(`missioInicia('${i1}','s1')`);
assert(run(`missioActivitatCompleta('${i1}','ombres',{sessionId:'s1',mode:'missio'}).ok`));
const clau=run('granAventuraClau("ga-dia-001",1)');
assert(run(`granAventuraBloc().aventures[${JSON.stringify(clau)}].slots[1]`));

const dupInicia=run(`missioInicia('${i1}','s2')`);
assert(dupInicia.reason==='ja_completada'||dupInicia.reason==='slot_fet');
assert.equal(run(`missioActivitatCompleta('${i1}','ombres',{sessionId:'s2',mode:'missio'}).reason`),'no_activa');
assert(run(`granAventuraBloc().aventures[${JSON.stringify(clau)}].slots[1]`));

run('granAventuraReprendre()');
assert.equal(run('granAventuraBloc().aventuraActiva'),'ga-dia-001');
run(`missioInicia('ga-dia-001-slot-1','s3')`);
assert(run(`missioActivitatCompleta('ga-dia-001-slot-1','cartes',{sessionId:'s3',mode:'missio'}).ok`));
run(`missioInicia('ga-dia-001-slot-3','s4')`);
assert(run(`missioActivitatCompleta('ga-dia-001-slot-3','diferencies',{sessionId:'s4',mode:'missio',ambit:'ronda'}).ok`));

const amicsAbans=run('progresGrupsDescoberts().length');
assert.equal(run('granAventuraBloc().aventuraActiva'),null);
assert(run(`granAventuraBloc().aventures[${JSON.stringify(clau)}].estat==='completada'`));

assert(run('granAventuraInicia("ga-dia-002")').ok);
const r2=run('granAventuraMissioInstancia("ga-dia-002-slot-1").registreId');
assert.equal(r2,'ga-dia-002-slot-1~L1');
for(let d=2;d<=7;d++){
  run(`granAventuraInicia("ga-dia-00${d}")`);
  for(let s=1;s<=3;s++){
    const id=`ga-dia-00${d}-slot-${s}`;
    const act=run(`granAventuraMissioInstancia(${JSON.stringify(id)}).def.activitatId`);
    const sid=`sx${d}${s}`;
    run(`missioInicia(${JSON.stringify(id)},${JSON.stringify(sid)})`);
    const det=act==='diferencies'?`{sessionId:${JSON.stringify(sid)},mode:'missio',ambit:'ronda'}`:`{sessionId:${JSON.stringify(sid)},mode:'missio'}`;
    assert(run(`missioActivitatCompleta(${JSON.stringify(id)},${JSON.stringify(act)},${det})`).ok,`${id}`);
  }
}
assert.equal(run('granAventuraBloc().lap'),2);
assert(run('granAventuraInicia("ga-dia-001")').ok);
const lap2=run('granAventuraMissioInstancia("ga-dia-001-slot-1").registreId');
assert.equal(lap2,'ga-dia-001-slot-1~L2');
run(`missioInicia('ga-dia-001-slot-1','n1')`);
assert(run(`missioActivitatCompleta('ga-dia-001-slot-1','cartes',{sessionId:'n1',mode:'missio'}).ok`));
assert.equal(run('progresGrupsDescoberts().length'),amicsAbans);

console.log('OK: etapa 5a — instàncies, reprendre, cicle 7, sense doble estrella.');