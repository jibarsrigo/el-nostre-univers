const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root={innerHTML:'',querySelectorAll(){return []},querySelector(){return null}};
const store=new Map(),makeNode=()=>({className:'',style:{},textContent:'',append(){},remove(){},setAttribute(){}});
const pocioJSON=()=>JSON.parse(fs.readFileSync('data/pocio-reaccions.json','utf8'));
const fetchMock=()=>Promise.resolve({json:()=>Promise.resolve(pocioJSON())});
const ctx=vm.createContext({document:{getElementById:()=>root,addEventListener(){},fullscreenEnabled:false,fullscreenElement:null,querySelector(){return null},createElement:makeNode},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},fetch:fetchMock,window:{},setTimeout(cb){cb()},console});
function run(s){return vm.runInContext(s,ctx)}
run(fs.readFileSync('js/app.js','utf8'));run(fs.readFileSync('js/fase2.js','utf8'));run(fs.readFileSync('js/jocs.js','utf8'));
run(`nav('jocs')`);assert(root.innerHTML.includes('CAPSA DE JOCS'));
run(`action('jocs-count')`);assert(root.innerHTML.includes('COMPTEM'));
run(`setupJocsCount()`);const goal=run('jocs.count.goal');for(let i=0;i<goal;i++)run(`jocs.count.touched.add(${i})`);run(`jocs.count.picked=${goal}`);run('render()');assert(root.innerHTML.includes('MOLT BÉ'));
run(`action('jocs-puzle')`);assert(root.innerHTML.includes('PUZZLE'));
run(`jocs.pocio.data=${JSON.stringify(pocioJSON())}`);run(`go('jocsPocio')`);
run(`pocioPick('platan');pocioPick('bebeta');pocioMix()`);run('render()');
assert(root.innerHTML.includes('MEGAEXPLOSIÓ')||root.innerHTML.includes('pocio-fx'));
run(`resetOmbres();go('jocsOmbres')`);assert(root.innerHTML.includes('OMBRES TRAPELLES'));
run(`jocs.ombres.lx=14;jocs.ombres.ly=26;ombresReveal();render()`);assert(root.innerHTML.includes('PIPA'));
console.log('OK: jocs hub, comptar, puzle, poció, ombres.');