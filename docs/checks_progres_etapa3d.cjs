'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const missionsJSON=JSON.parse(fs.readFileSync(path.join(root,'data/gran-aventura-missions-v1.json'),'utf8'));

const ls=new Map();
const ctx=vm.createContext({document:{getElementById:()=>({innerHTML:''}),body:{classList:{toggle(){}}},addEventListener(){}},localStorage:{getItem:k=>ls.get(k),setItem:(k,v)=>ls.set(k,v)},sessionStorage:{getItem:()=>null,setItem(){}},window:{},setTimeout(){},console,Math,Date,fetch:u=>Promise.resolve({json:()=>Promise.resolve(String(u).includes('missions')?missionsJSON:JSON.parse(fs.readFileSync(path.join(root,'data/activitats.json'),'utf8')))})});
const run=s=>vm.runInContext(s,ctx);
vm.runInContext(fs.readFileSync(path.join(root,'js/progres.js'),'utf8'),ctx,{filename:'progres.js'});
vm.runInContext(fs.readFileSync(path.join(root,'js/missions.js'),'utf8'),ctx,{filename:'missions.js'});
vm.runInContext(fs.readFileSync(path.join(root,'js/activitats.js'),'utf8'),ctx,{filename:'activitats.js'});
ctx.remember=()=>{};
run(`missionsCatalog.list=${JSON.stringify(missionsJSON.missions)};missionsCatalog.ready=true`);

const mid='ga-exp-dif-biblioteca-01';
run(`missioInicia('${mid}','sess-a')`);
run(`activitatCompleta('diferencies',{sessionId:'sess-lliure',mode:'lliure',missioId:'${mid}',ambit:'ronda'})`);
assert.equal(run(`missioEsCompletada('${mid}')`),false,'lliure no completa missió');

assert.equal(run(`missioActivitatCompleta('${mid}','diferencies',{sessionId:'sess-b',mode:'missio',ambit:'ronda'}).ok`),false,'sessió activa');
run(`activitatCompleta('diferencies',{sessionId:'sess-a',mode:'missio',missioId:'${mid}',ambit:'ronda'})`);
assert(run(`missioEsCompletada('${mid}')`));
assert.equal(run(`missioActivitatCompleta('${mid}','diferencies',{sessionId:'sess-c',mode:'missio',ambit:'ronda'}).ok`),false,'no duplicar recompensa');

run(`missioAbandona('ga-mem-cartes-exploradora-01')`);
assert.equal(run(`missioActivitatCompleta('ga-mem-cartes-exploradora-01','cartes',{sessionId:'s1',mode:'missio'}).reason`),'no_activa','després abandonar cal tornar a iniciar');
assert.equal(run(`missioInicia('ga-mem-cartes-exploradora-01','s1')`).ok,true);

const creacions=[];
for(let i=0;i<15;i++)creacions.push({kind:'creature',id:'c'+i,name:'C'+i});
ls.set('nostre-creacions-v3',JSON.stringify([{kind:'creature',id:'x',name:'Local'}]));
run(`progresBackupImport(${JSON.stringify({backupVersion:1,app:'el-nostre-univers',keys:{'nostre-creacions-v3':creacions}})},{mode:'merge'})`);
const merged=JSON.parse(ls.get('nostre-creacions-v3'));
assert.equal(merged.length,16,'merge creacions sense tall silenciós 12');

console.log('OK: etapa 3d — missions, separació lliure/missió, merge creacions.');