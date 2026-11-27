const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root={innerHTML:'',querySelectorAll(){return []},querySelector(){return null}};
const store=new Map(),makeNode=()=>({className:'',style:{},textContent:'',append(){},remove(){},setAttribute(){}});
const ctx=vm.createContext({document:{getElementById:()=>root,addEventListener(){},fullscreenEnabled:false,fullscreenElement:null,querySelector(){return null},createElement:makeNode},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},window:{},setTimeout(cb,ms){if(ms>=900)return;cb()},console});
ctx.localStorageStore=store;
function run(s){return vm.runInContext(s,ctx)}
const personatgesJSON=()=>JSON.parse(fs.readFileSync('data/personatges.json','utf8'));
const activitatsJSON=()=>JSON.parse(fs.readFileSync('data/activitats.json','utf8'));
const fetchMock=u=>{const s=String(u);return Promise.resolve({json:()=>Promise.resolve(s.includes('personatges')?personatgesJSON():s.includes('activitats')?activitatsJSON():{})})};
ctx.fetch=fetchMock;
run(fs.readFileSync('js/app.js','utf8'));
run(fs.readFileSync('js/activitats.js','utf8'));
run(fs.readFileSync('js/fase2.js','utf8'));
run(fs.readFileSync('js/jocs.js','utf8'));
run(`jocs.personatges=${JSON.stringify(personatgesJSON())}`);
function test(room,txt){run(`nav('${room}')`);assert(root.innerHTML.includes(txt),`${room} lacks ${txt}`)}
test('map','TOCA UN LLOC');test('school','L’ESCOLA DE LA LLUM');
run(`action('school-spell')`);assert(root.innerHTML.includes('LA SALA DELS ENCANTERIS'));for(let i=0;i<3;i++)run(`action('next')`);assert(root.innerHTML.includes('HEM ENCÈS LA LLUM'));run(`action('end-spell')`);assert.equal(run('state.unlocked.spell'),true);
test('monster','MONSTRET MENJAPÀGINES');for(let i=0;i<4;i++)run(`action('next')`);run(`action('end-monster')`);assert.equal(run('state.unlocked.monster'),true);
test('rabbit','CONILL VALENT');for(let i=0;i<3;i++)run(`action('next')`);run(`action('end-rabbit')`);assert.equal(run('state.unlocked.rabbit'),true);
test('nest','NIU DEL BOSC');for(let i=0;i<3;i++)run(`action('next')`);run(`action('end-nest')`);assert.equal(run('state.unlocked.nest'),true);
test('pairs','CARTES DE L’UNIVERS');run('setupPairs()');assert.equal(run('f2.match.length'),10);assert.equal(new Set(run('f2.match')).size,5);assert.equal((root.innerHTML.match(/data-card=/g)||[]).length,10);let pairs=run('f2.match');for(const animal of new Set(pairs)){const inds=pairs.map((v,i)=>v===animal?i:null).filter(x=>x!==null);run(`clickCard(${inds[0]})`);run(`clickCard(${inds[1]})`)}assert(root.innerHTML.includes('HAS TROBAT TOTS ELS AMICS!'));assert.equal(run('state.unlocked.pairs'),true);
{run('setupPairs()');const m=run('f2.match');let a=0,b=1;for(let i=0;i<m.length;i++)for(let j=i+1;j<m.length;j++)if(m[i]!==m[j]){a=i;b=j;i=m.length;break;}run(`clickCard(${a})`);run(`clickCard(${b})`);assert(run('f2.busy')===true);run(`action('reset-pairs')`);assert(run('f2.busy')===false&&run('f2.flipped.length')===0);run('render()');assert((root.innerHTML.match(/data-card=/g)||[]).length===10)}
run(`go('pairs');render()`);assert(root.innerHTML.includes('CARTES'));run(`nav('tower')`);run(`go('pairs');render()`);assert(root.innerHTML.includes('CARTES'));
run(`go('words');render()`);assert(root.innerHTML.includes('PARAULES'));run(`nav('tower')`);run(`go('words');render()`);assert(root.innerHTML.includes('PARAULES'));
run(`f2.paraules=${fs.readFileSync('data/paraules.json','utf8')}`);test('words','PARAULES SECRETES');{const pj=run('f2.paraules');for(const w of pj.words){assert(/^[A-Z]+$/.test(w.word),'paraula sense accents '+w.word);assert(fs.existsSync(w.img),'imatge '+w.img)}let w=run('f2.word');for(const ch of new Set(w))run(`wordsGuess('${ch}')`);run('render()');assert(root.innerHTML.includes('PARAULA TROBADA')&&run('f2.wg.stars')===1&&root.innerHTML.includes('SEGÜENT PARAULA'));run(`action('next-word')`);const miss=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(c=>!run('f2.word').includes(c)).slice(0,6);for(const c of miss)run(`wordsGuess('${c}')`);run('render()');assert(root.innerHTML.includes('MAGDALENES')&&run('f2.wg.stars')===1&&(root.innerHTML.match(/w-treat--eaten/g)||[]).length===6);run(`action('next-word');action('next-word')`);assert(run('f2.wg.done')&&root.innerHTML.includes('HAS TROBAT 1 DE 3 PARAULES'))}
test('search','BOSC AMAGAT');for(let i=0;i<5;i++)run(`f2.find.add(${i})`);run('render()');assert(root.innerHTML.includes('5 SECRETS'));
test('quest','LLUM DEL BOSC');assert(root.innerHTML.includes('f2-quest-item'));
require('./checks_activitats_runtime.cjs')(ctx);
console.log('OK: Fase 2, escola, màgia, monstre, conill, niu, parelles, paraules, cerca, campanya.');