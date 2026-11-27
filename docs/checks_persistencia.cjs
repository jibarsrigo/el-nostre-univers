// Simula tancar el navegador i tornar a obrir: localStorage conserva fites i creacions.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const mem={
  'nostre-fase1-records':JSON.stringify({pairs:true,words:true,spell:true}),
  'nostre-creacions-v3':JSON.stringify([{kind:'creature',name:'Espurna guardada',id:'persist-1',wings:'papallona'}])
};
const dummy={innerHTML:'',querySelectorAll:()=>[],querySelector:()=>null};
const body={append(){},querySelector:()=>null,classList:{toggle(){}}};
const load=()=>{
  const ctx=vm.createContext({document:{getElementById:()=>dummy,body,addEventListener(){},fullscreenEnabled:false,fullscreenElement:null,querySelector:()=>null,createElement:()=>({style:{},append(){}})},localStorage:{getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v}},fetch:()=>Promise.resolve({json:()=>Promise.resolve({})}),window:{confirm:()=>true},setTimeout:()=>{},Image:function(){},console,Math,Date});
  for(const f of ['app.js','activitats.js','fase2.js','fase3.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f});
  return s=>vm.runInContext(s,ctx);
};
const run=load();
assert(run('state.unlocked.pairs')===true);
assert(run('state.unlocked.words')===true);
assert(run('f3.gallery.length')===1);
assert(run('f3.gallery[0].name')==='Espurna guardada');
const creacionsAbans=mem['nostre-creacions-v3'];
const recordsAbans=mem['nostre-fase1-records'];
run('f2.sessionId="persist-test"');
run(`activitatCompleta('cartes',{sessionId:'persist-test',nivell:'aventurera'})`);
assert(mem['nostre-creacions-v3']===creacionsAbans,'creacions intactes');
const rec=JSON.parse(mem['nostre-fase1-records']);
assert(rec.pairs===true&&rec.words===true&&rec.spell===true,'records anteriors conservats');
console.log('OK: localStorage conserva fites i creacions en reobrir.');