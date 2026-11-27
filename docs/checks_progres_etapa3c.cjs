'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const personatgesJSON=JSON.parse(fs.readFileSync(path.join(root,'data/personatges.json'),'utf8'));

function mkCtx(){
  const ls=new Map(),ss=new Map();
  const rootEl={innerHTML:'',querySelectorAll(){return []},querySelector(){return null}};
  const body={append(){},classList:{toggle(){}}};
  const ctx=vm.createContext({document:{getElementById:()=>rootEl,body,addEventListener(){},querySelector(){return null},createElement:()=>({append(){},remove(){}})},localStorage:{getItem:k=>ls.get(k),setItem:(k,v)=>ls.set(k,v),removeItem:k=>ls.delete(k)},sessionStorage:{getItem:k=>ss.get(k),setItem:(k,v)=>ss.set(k,v),removeItem:k=>ss.delete(k)},window:{},setTimeout(cb,ms){if(ms>=900)return;cb()},console,Math,Date,fetch:u=>Promise.resolve({json:()=>Promise.resolve(u.includes('personatges')?personatgesJSON:{})})});
  for(const f of ['app.js','activitats.js','progres.js','fase2.js','fase3.js','jocs.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f});
  return {run:s=>vm.runInContext(s,ctx),ls};
}

const {run,ls}=mkCtx();
run(`jocs.personatges=${JSON.stringify(personatgesJSON)}`);
run('activitatsResetMem()');
ls.set('nostre-fase1-records',JSON.stringify({pairs:true,spell:true}));
ls.set('nostre-creacions-v3',JSON.stringify([{kind:'creature',id:'c1',name:'Espurna'}]));
run('progresRegistraDescobert("pipa","cartes")');
const abans=run('progresGrupsDescoberts().length');

run(`go('pairs');setupPairs()`);
const pairs=run('f2.match');
for(const animal of new Set(pairs)){const inds=pairs.map((v,i)=>v===animal?i:null).filter(x=>x!==null);run(`clickCard(${inds[0]})`);run(`clickCard(${inds[1]})`);}
assert(run('progresGrupsDescoberts().length')>abans,'3b augmenta col·lecció després victòria Cartes');
run('cartesRosterForLevel(0)').forEach(id=>{const g=run(`progresGrupDesDePersonatge(jocsPairMeta('${id}'))`);assert(g&&run(`progresTeGrup(${JSON.stringify(g)})`),'tauler → progrés '+id)});

const exported=run('progresBackupExport()');
assert.equal(exported.backupVersion,1);
assert.ok(exported.keys['nostre-univers-progres-v1']);
const round=JSON.parse(run('progresBackupExportString()'));
assert.equal(run(`progresBackupValidaPack(${JSON.stringify(round)}).ok`),true);

const snapProgres=ls.get('nostre-univers-progres-v1');
const mal={backupVersion:1,app:'el-nostre-univers',keys:{'nostre-univers-progres-v1':{v:99,permanent:{amics:['x']}}}};
assert.equal(run(`progresBackupImport(${JSON.stringify(mal)},{mode:'merge'})`).ok,false);
assert.equal(ls.get('nostre-univers-progres-v1'),snapProgres,'import invàlid no escriu');

ls.clear();
run(`progresBackupImport(${JSON.stringify(round)},{mode:'merge'})`);
assert(run('progresTeGrup("pipa")'));
assert(JSON.parse(ls.get('nostre-fase1-records')).pairs===true);

ls.set('nostre-fase1-records',JSON.stringify({book:true}));
const mergePack={backupVersion:1,app:'el-nostre-univers',keys:{'nostre-fase1-records':{monster:true},'nostre-univers-progres-v1':{v:1,permanent:{amics:['gat'],fonts:{gat:['ombres']}},missions:{v:0,registre:{}},meta:{}},'nostre-creacions-v3':[{kind:'drawing',id:'d2',name:'Sol'}]}};
run(`progresBackupImport(${JSON.stringify(mergePack)},{mode:'merge'})`);
const rec=JSON.parse(ls.get('nostre-fase1-records'));
assert(rec.book&&rec.monster);
assert(run('progresTeGrup("gat")')&&run('progresTeGrup("pipa")'));

const evilSnap=ls.get('nostre-creacions-v3');
assert.equal(run(`progresBackupImport(${JSON.stringify({backupVersion:1,app:'el-nostre-univers',keys:{'nostre-creacions-v3':'bad'}})},{mode:'merge'})`).ok,false);
assert.equal(ls.get('nostre-creacions-v3'),evilSnap);

assert.equal(run(`progresBackupImport(${JSON.stringify({backupVersion:1,app:'el-nostre-univers',keys:{'nostre-fase1-records':{words:true}}})},{mode:'replace'})`).ok,false);
assert(run(`progresBackupImport(${JSON.stringify({backupVersion:1,app:'el-nostre-univers',keys:{'nostre-fase1-records':{words:true}}})},{mode:'replace',replaceConfirmed:true})`).ok);
assert.equal(JSON.parse(ls.get('nostre-fase1-records')).words,true);

console.log('OK: etapa 3c — exportació, recuperació merge, import invàlid rebutjat.');