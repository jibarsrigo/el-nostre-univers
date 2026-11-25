const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root={innerHTML:'',querySelectorAll(){return []},querySelector(){return null}};
const store=new Map(),makeNode=()=>({className:'',style:{},textContent:'',append(){},remove(){},setAttribute(){}});
const ctx=vm.createContext({document:{getElementById:()=>root,addEventListener(){},fullscreenEnabled:false,fullscreenElement:null,querySelector(){return null},createElement:makeNode},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},window:{},setTimeout(cb){cb()},console});
function run(s){return vm.runInContext(s,ctx)}
run(fs.readFileSync('js/app.js','utf8'));run(fs.readFileSync('js/fase2.js','utf8'));
function test(room,txt){run(`nav('${room}')`);assert(root.innerHTML.includes(txt),`${room} lacks ${txt}`)}
test('map','TOCA UN LLOC');test('school','L’ESCOLA DE LA LLUM');
run(`action('school-spell')`);assert(root.innerHTML.includes('LA SALA DELS ENCANTERIS'));for(let i=0;i<3;i++)run(`action('next')`);assert(root.innerHTML.includes('HEM ENCÈS LA LLUM'));run(`action('end-spell')`);assert.equal(run('state.unlocked.spell'),true);
test('monster','MONSTRET MENJAPÀGINES');for(let i=0;i<4;i++)run(`action('next')`);run(`action('end-monster')`);assert.equal(run('state.unlocked.monster'),true);
test('rabbit','CONILL VALENT');for(let i=0;i<3;i++)run(`action('next')`);run(`action('end-rabbit')`);assert.equal(run('state.unlocked.rabbit'),true);
test('nest','NIU DEL BOSC');for(let i=0;i<3;i++)run(`action('next')`);run(`action('end-nest')`);assert.equal(run('state.unlocked.nest'),true);
test('pairs','CARTES DELS CONTES');assert.equal((root.innerHTML.match(/data-card=/g)||[]).length,6);run('setupPairs()');let pairs=run('f2.match');for(const animal of new Set(pairs)){const inds=pairs.map((v,i)=>v===animal?i:null).filter(x=>x!==null);run(`clickCard(${inds[0]})`);run(`clickCard(${inds[1]})`)}assert(root.innerHTML.includes('HAS TROBAT TOTES LES PARELLES'));
test('words','PARAULES SECRETES');let w=run('f2.word');for(const ch of new Set(w))run(`f2.letters.add('${ch}')`);run('render()');assert(root.innerHTML.includes('PARAULA TROBADA'));
test('search','BOSC AMAGAT');for(let i=0;i<5;i++)run(`f2.find.add(${i})`);run('render()');assert(root.innerHTML.includes('5 SECRETS'));
test('quest','LLUM DEL BOSC');assert(root.innerHTML.includes('f2-quest-item'));
console.log('OK: Fase 2, escola, màgia, monstre, conill, niu, parelles, paraules, cerca, campanya.');
