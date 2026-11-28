'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const personatgesJSON=JSON.parse(fs.readFileSync(path.join(root,'data/personatges.json'),'utf8'));
const ombresJSON=JSON.parse(fs.readFileSync(path.join(root,'data/ombres-trapelles.json'),'utf8'));
assert(runStaticValidacioOmbres());
assert(runIntegracioCartes());
assert(runIntegracioOmbres());
assert(runNovaAventuraConserva());
console.log('OK: etapa 3b — descoberta amics Cartes/Ombres, mapatge drac→drac-mapa.');

function runStaticValidacioOmbres(){
  const pool=personatgesJSON.personatges;
  const drac=ombresJSON.secrets.find(s=>s.id==='drac');
  assert.equal(drac.personatgeId,'drac-mapa');
  assert.equal(drac.color,'imagenes/personatges/personatge-drac-mapa.webp');
  const pm=pool.find(p=>p.id==='drac-mapa');
  assert(pm&&pm.enabled!==false);
  const disabled=pool.find(p=>p.id==='drac');
  assert.equal(disabled.enabled,false);
  for(const s of ombresJSON.secrets){
    const pid=s.personatgeId||s.id;
    const p=pool.find(x=>x.id===pid);
    assert(p&&p.enabled!==false,`secret ${s.id} → personatge ${pid}`);
    assert.equal(p.img,s.color,`color secret ${s.id}`);
  }
  return true;
}

function mkCtx(){
  const ls=new Map(),ss=new Map();
  const rootEl={innerHTML:'',querySelectorAll(){return []},querySelector(){return null}};
  const body={append(){},classList:{toggle(){}}};
  const ctx=vm.createContext({document:{getElementById:()=>rootEl,body,addEventListener(){},querySelector(){return null},createElement:()=>({append(){},remove(){}})},localStorage:{getItem:k=>ls.get(k),setItem:(k,v)=>ls.set(k,v)},sessionStorage:{getItem:k=>ss.get(k),setItem:(k,v)=>ss.set(k,v),removeItem:k=>ss.delete(k)},window:{},setTimeout(cb,ms){if(ms>=900)return;cb()},console,Math,Date,fetch:u=>{const s=String(u);return Promise.resolve({json:()=>Promise.resolve(s.includes('personatges')?personatgesJSON:s.includes('activitats')?JSON.parse(fs.readFileSync(path.join(root,'data/activitats.json'),'utf8')):s.includes('ombres')?ombresJSON:{})})}});
  ctx.localStorageStore=ls;
  ctx.sessionStorageStore=ss;
  for(const f of ['app.js','activitats.js','progres.js','fase2.js','jocs.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f});
  return {ctx,run:s=>vm.runInContext(s,ctx),ls,ss,rootEl};
}

function runIntegracioCartes(){
  const {run,ls}=mkCtx();
  run(`jocs.personatges=${JSON.stringify(personatgesJSON)}`);
  run('activitatsResetMem()');
  run(`go('pairs');setupPairs()`);
  const pairs=run('f2.match');
  for(const animal of new Set(pairs)){const inds=pairs.map((v,i)=>v===animal?i:null).filter(x=>x!==null);run(`clickCard(${inds[0]})`);run(`clickCard(${inds[1]})`);}
  const progres=JSON.parse(ls.get('nostre-univers-progres-v1'));
  assert(progres.permanent.amics.length>=4,'cartes nivell 1 registra amics');
  assert(progres.permanent.fonts&&Object.values(progres.permanent.fonts).some(a=>a.includes('cartes')));
  const grups=new Set(run('progresGrupsDescoberts()'));
  const roster=run('cartesRosterForLevel(0)');
  roster.forEach(id=>{const g=run(`progresGrupDesDePersonatge(jocsPairMeta('${id}'))`);assert(grups.has(g),id+' al tauler → progrés')});
  return true;
}

function runIntegracioOmbres(){
  const {run,ls}=mkCtx();
  run(`jocs.personatges=${JSON.stringify(personatgesJSON)}`);
  run(`jocs.ombres.data=${JSON.stringify(ombresJSON)}`);
  run('resetOmbres();go("jocsOmbres");render()');
  run('action("ombres-play-level-0");render()');
  run('action("ombres-begin-search");render()');
  const tid=run('jocs.ombres.targetId');
  const ts=run('jocs.ombres.activeSecrets').find(s=>s.id===tid);
  run(`jocs.ombres.lx=${ts.x};jocs.ombres.ly=${ts.y};ombresTryFind(true)`);
  const g=run(`progresGrupDesDeSecretOmbres(${JSON.stringify(ts)},personatgeList())`);
  assert(g);
  assert(run(`progresTeGrup(${JSON.stringify(g)})`));
  if(tid==='drac')assert.equal(g,'drac-mapa');
  const progres=JSON.parse(ls.get('nostre-univers-progres-v1'));
  assert(progres.permanent.fonts[g].includes('ombres'));
  return true;
}

function runNovaAventuraConserva(){
  const {run,ls}=mkCtx();
  run(`jocs.personatges=${JSON.stringify(personatgesJSON)}`);
  run('progresRegistraDescobert("pipa","cartes")');
  const abans=ls.get('nostre-univers-progres-v1');
  run('jocsCartesNovaAventura()');
  assert.equal(ls.get('nostre-univers-progres-v1'),abans,'NOVA AVENTURA no esborra col·lecció');
  return true;
}