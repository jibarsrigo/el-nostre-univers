'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const missionsJSON=JSON.parse(fs.readFileSync(path.join(root,'data/gran-aventura-missions-v1.json'),'utf8'));
const gate={value:'PAPA',};
const gateMsg={textContent:''};
const ls=new Map();
const ss=new Map();
const appEl={
  innerHTML:'',
  querySelectorAll(){return []},
  querySelector(sel){
    if(sel==='#raco-code')return gate;
    if(sel==='#raco-gate-msg')return gateMsg;
  }
};
const ctx=vm.createContext({
  document:{
    getElementById:()=>appEl,
    querySelector:()=>null,
    querySelectorAll:()=>[],
    body:{classList:{toggle(){}}},
    createElement:()=>({click(){},href:''}),
    addEventListener(){},
    fullscreenEnabled:false,
    fullscreenElement:null
  },
  localStorage:{getItem:k=>ls.get(k),setItem:(k,v)=>ls.set(k,v),removeItem:k=>ls.delete(k)},
  sessionStorage:{getItem:k=>ss.get(k),setItem:(k,v)=>ss.set(k,v),removeItem:k=>ss.delete(k)},
  navigator:{clipboard:{writeText(){}},},
  window:{confirm:()=>true},
  setTimeout(){},
  console,Math,Date,
  Blob:function(){},
  URL:{createObjectURL:()=>'',revokeObjectURL(){}},
  fetch:u=>Promise.resolve({json:()=>Promise.resolve(String(u).includes('missions')?missionsJSON:JSON.parse(fs.readFileSync(path.join(root,'data/activitats.json'),'utf8')))})
});
const run=s=>vm.runInContext(s,ctx);
const files=['app.js','activitats.js','progres.js','missions.js','fase2.js','racopapa.js'];
files.forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f}));
run('missionsCatalog.list=JSON.parse('+JSON.stringify(JSON.stringify(missionsJSON.missions))+');missionsCatalog.ready=true');

assert.equal(run('RACO_PAPA_CODE'),'PAPA');
run(`nav('map');for(let i=0;i<7;i++)racopapaFooterTap()`);
assert.equal(run('state.place'),'racopapa-gate');
run(`action('raco-gate-enter')`);
assert.equal(run('state.place'),'racopapa');
assert.equal(ss.get('racopapa-adult-v1'),'1');

const exported=run('progresBackupExport()');
assert.equal(exported.backupVersion,1);
run('racopapaExport()');
assert(run('racopapa.draft.length>20'));

const mid='ga-exp-dif-biblioteca-01';
const mid2='ga-mem-cartes-exploradora-01';
run(`missioInicia('${mid}','s1')`);
run(`missioInicia('${mid2}','s2')`);
assert.equal(run(`missioGetEntrada(missioRegistreLoad(),'${mid}').estat`),'pendent');
assert.equal(run(`missioGetEntrada(missioRegistreLoad(),'${mid2}').estat`),'en_curs');
run(`missioAbandona('${mid2}')`);
assert.equal(run(`missioActivitatCompleta('${mid2}','cartes',{sessionId:'s2',mode:'missio'}).reason`),'no_activa');
run(`missioInicia('${mid2}','s3')`);
assert(run(`missioActivitatCompleta('${mid2}','cartes',{sessionId:'s3',mode:'missio'}).ok`));

run(`action('raco-exit')`);
assert.equal(ss.get('racopapa-adult-v1'),undefined);

console.log('OK: etapa 4 — racó de papa, accés discret i missions única activa.');