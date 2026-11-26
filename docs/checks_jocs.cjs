const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root={innerHTML:'',querySelectorAll(){return []},querySelector(){return null}};
const store=new Map(),makeNode=()=>({className:'',style:{},textContent:'',append(){},remove(){},setAttribute(){}});
const pocioJSON=()=>JSON.parse(fs.readFileSync('data/pocio-reaccions.json','utf8'));
const ombresJSON=()=>JSON.parse(fs.readFileSync('data/ombres-trapelles.json','utf8'));
const difJSON=()=>JSON.parse(fs.readFileSync('data/diferencies.json','utf8'));
const fetchMock=u=>{const s=String(u);return Promise.resolve({json:()=>Promise.resolve(s.includes('ombres')?ombresJSON():s.includes('diferencies')?difJSON():pocioJSON())})};
const body={append(){},querySelector(){return null},remove(){},classList:{toggle(){}}};
const ctx=vm.createContext({document:{getElementById:()=>root,body,addEventListener(){},fullscreenEnabled:false,fullscreenElement:null,querySelector(){return null},createElement:makeNode},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},fetch:fetchMock,window:{},setTimeout(cb,ms){if(ms>=900)return;cb()},console});
function run(s){return vm.runInContext(s,ctx)}
run(fs.readFileSync('js/app.js','utf8'));run(fs.readFileSync('js/fase2.js','utf8'));run(fs.readFileSync('js/jocs.js','utf8'));
run(`nav('jocs')`);assert(root.innerHTML.includes('CAPSA DE JOCS'));
run(`action('jocs-count')`);assert(root.innerHTML.includes('COMPTEM'));
run(`setupJocsCount()`);const goal=run('jocs.count.goal');for(let i=0;i<goal;i++)run(`jocs.count.touched.add(${i})`);run(`jocs.count.picked=${goal}`);run('render()');assert(root.innerHTML.includes('MOLT BÉ'));
run(`action('jocs-puzle')`);assert(root.innerHTML.includes('PUZZLE'));
run(`jocs.pocio.data=${JSON.stringify(pocioJSON())}`);run(`go('jocsPocio')`);
run(`pocioPick('platan');pocioPick('bebeta');pocioMix()`);run('render()');
assert(root.innerHTML.includes('MEGAEXPLOSIÓ')||root.innerHTML.includes('pocio-fx'));
run(`jocs.ombres.data=${JSON.stringify(ombresJSON())}`);run(`resetOmbres();go('jocsOmbres')`);assert(root.innerHTML.includes('OMBRES TRAPELLES')&&root.innerHTML.includes('ombres-stars'));
const tid=run('jocs.ombres.targetId'),act=run('jocs.ombres.activeSecrets'),ts=act.find(s=>s.id===tid);
run(`jocs.ombres.lx=${ts.x};jocs.ombres.ly=${ts.y};ombresTryFind();render()`);assert(run('jocs.ombres.stars')===1&&run('jocs.ombres.phase')==='found');run('ombresClearAuto();ombresAdvanceMission();render()');assert(root.innerHTML.includes('BUSCA'));
run(`jocs.diferencies.data=${JSON.stringify(difJSON())}`);run('resetDiferencies();go("jocsDiferencies")');assert(run('difPerRound()')===5);assert(run('jocs.diferencies.active.length')===5);assert(['biblioteca','taller'].includes(run('jocs.diferencies.sceneId')));
assert(root.innerHTML.includes('TROBA LES 5 DIFERÈNCIES')||root.innerHTML.includes('5 DIFERÈNCIES'));
run(`resetDiferencies();jocs.diferencies.sceneId='taller';var r=difPickRound();jocs.diferencies.active=r.active;jocs.diferencies.decoys=r.decoys;jocs.diferencies.found=new Set();jocs.diferencies.stars=0;jocs.diferencies.phase='searching';go('jocsDiferencies')`);assert(run('jocs.diferencies.active.length')===5);
run(`jocs.diferencies.active.forEach(d=>jocs.diferencies.found.add(d.id));jocs.diferencies.stars=1;jocs.diferencies.phase='found';difAdvanceRound();render()`);assert(run('jocs.diferencies.phase')==='searching'&&run('jocs.diferencies.stars')===1);
run('resetDiferencies();go("jocsDiferencies");render()');assert(run('jocs.diferencies.decoys.length')<=1);assert(run('jocs.diferencies.decoys.every(p=>jocs.diferencies.active.every(a=>a.id!==p.id))'));const h=root.innerHTML;if(run('jocs.diferencies.decoys.length')>0){assert(h.includes('dif-overlay--pair'));const left=(h.split('data-dif-panel="left"')[1]||'').split('data-dif-panel="right"')[0];const right=(h.split('data-dif-panel="right"')[1]||'');assert(left.includes('dif-overlay--pair')&&right.includes('dif-overlay--pair'));}
const a1=run('JSON.stringify(jocs.diferencies.active.map(p=>[Math.round(p.x),Math.round(p.y)]))');run('resetDiferencies();render()');let varied=false;for(let t=0;t<16;t++){const a2=run('JSON.stringify(jocs.diferencies.active.map(p=>[Math.round(p.x),Math.round(p.y)]))');if(a1!==a2){varied=true;break}run('resetDiferencies()')}assert(varied);
console.log('OK: jocs hub, comptar, puzle, poció, ombres, diferencies.');