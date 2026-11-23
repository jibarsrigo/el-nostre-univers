'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const memory={};
const node=()=>({innerHTML:'',textContent:'',classList:{add(){},toggle(){}},querySelectorAll(){return []},querySelector(){return null},addEventListener(){},append(){},remove(){},setAttribute(){}});
const app=node();
const doc={getElementById(){return app},querySelector(){return null},addEventListener(){},createElement:node,fullscreenEnabled:false,fullscreenElement:null};
const env={document:doc,localStorage:{getItem:k=>memory[k]||null,setItem(k,v){memory[k]=v}},window:{confirm(){return true}},setTimeout(){},Image:function(){},console,Math,Date};
const c=vm.createContext(env),run=src=>vm.runInContext(src,c);
for(const file of ['app.js','fase2.js','fase3.js','contes.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),c,{filename:file});
let n=0;const test=(fn)=>{fn();n++};
const get=s=>JSON.parse(JSON.stringify(run(s)));
const places=['map','library','tower','workshop'];
for(const p of places){test(()=>{run(`nav('${p}')`);assert.match(app.innerHTML,/class="art"/);assert.match(app.innerHTML,/data-hotspot/)});}
const expected={map:['library','tower','workshop','secret','bridge'],library:['book','chest','window','cards','owl','ladder','monster','rabbit','contes'],tower:['telescope','orb','chest','map','small-door','stairs','owl','nest','pairs','words'],workshop:['creature','colors','stars','chest','window','search']};
for(const [place,keys] of Object.entries(expected)){
 const hs=get(`hotspots.${place}`);let seen=new Set();
 for(const item of hs){test(()=>{
  const [id,label,,[x,y,x2,y2]]=item;assert(!seen.has(id),`duplicated ${place}/${id}`);seen.add(id);
  assert(x>=0&&y>=0&&x2<=1672&&y2<=941&&x2>x&&y2>y,`invalid rect ${place}/${id}`);
  assert(label.length>3);
 })}
 test(()=>{assert.deepEqual([...seen].sort(),keys.sort())});
 for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++)test(()=>{
  const a=hs[i][3],b=hs[j][3],area=Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]));
  const smaller=Math.min((a[2]-a[0])*(a[3]-a[1]),(b[2]-b[0])*(b[3]-b[1]));
  assert(area/smaller<0.1,`hotspot collision ${place}: ${hs[i][0]} / ${hs[j][0]}`);
 });
}
const scenes=get('Object.keys(SCENES)');
for(const s of scenes)test(()=>{run(`state.place=${JSON.stringify(s)}; state.step=0;render()`);assert(app.innerHTML.length>100,`empty scene ${s}`)});
for(const s of scenes)test(()=>{run(`state.place=${JSON.stringify(s)};state.step=1;render()`);assert(app.innerHTML.length>100,`empty scene ${s} step 1`)});
for(const s of scenes)test(()=>{run(`state.place=${JSON.stringify(s)};state.step=3;render()`);assert(app.innerHTML.length>100,`empty scene ${s} step 3`)});
test(()=>{run(`state.history=[];nav('map');hotspot('library');hotspot('book')`);assert.equal(run('state.place'),'book')});
test(()=>{run(`action('next')`);assert.equal(run('state.step'),1)});
test(()=>{run(`action('back')`);assert.equal(run('state.place'),'library')});
test(()=>{run(`nav('tower');hotspot('owl')`);assert.equal(run('state.place'),'school')});
test(()=>{run(`nav('workshop');hotspot('creature')`);assert.equal(run('state.place'),'f3creator')});
test(()=>{run(`nav('workshop');hotspot('colors')`);assert.equal(run('state.place'),'f3draw')});
test(()=>{run(`nav('workshop');hotspot('stars')`);assert.equal(run('state.place'),'f3maker')});
test(()=>{run(`nav('workshop');hotspot('chest')`);assert.equal(run('state.place'),'f3gallery')});
test(()=>{run(`setupPairs()`);assert.equal(run('f2.match.length'),6);assert.equal(run('new Set(f2.match).size'),3)});
test(()=>{run(`setupWord()`);assert(run('WORDS.includes(f2.word)'))});
test(()=>{run(`f3Save({...newCreature3(),id:'test-creature',name:'Guspira'})`);assert.equal(get('f3.gallery').length,1);assert.equal(get('f3.gallery')[0].name,'Guspira')});
test(()=>{run(`state.place='f3creator';f3NavBack()`);assert.equal(run('state.place'),'workshop');assert.equal(get('state.history').length,0)});
test(()=>{run(`state.history=[];nav('library');hotspot('contes')`);assert.equal(run('state.place'),'contes');assert.match(app.innerHTML,/prestatgeria-contes-vius/);for(const id of ['sopar','pipa','bosc','boira','troc','nus','bruna'])assert.match(app.innerHTML,new RegExp('data-hotspot="'+id+'"'))});
test(()=>{run(`contesData={llibres:[{id:'pipa',titol:'PIPA I EL MAPA DEL MAR',doblesPagines:[{numero:1,esquerra:'PIPA TROBA UN MAPA.',dreta:'HI HA UNA ESTRELLA!',direccioArtistica:'NO MOSTRAR AIXO',interaccioProposada:'TAMPOC AIXO',ilustracioFinal:null}]},{id:'sopar',titol:'EL SOPAR',doblesPagines:[{numero:1,esquerra:'BRUNA FA UN SOPAR.',dreta:'AVUI HI HA FESTA!',ilustracioFinal:null}]}]}`);run(`hotspot('pipa')`);assert.equal(run('state.place'),'lector');assert.match(app.innerHTML,/pipa-portada/);assert.match(app.innerHTML,/TOCA EL LLIBRE PER OBRIR-LO/);assert.doesNotMatch(app.innerHTML,/exemple-pipa/);assert.doesNotMatch(app.innerHTML,/conte-book/);assert.doesNotMatch(app.innerHTML,/NO MOSTRAR AIXO/);run(`action('contes-open')`);assert.match(app.innerHTML,/pipa-01-nomes-pagines/);assert.match(app.innerHTML,/conte-full/);assert.match(app.innerHTML,/1 \/ 8/);assert.doesNotMatch(app.innerHTML,/TANCAR EL LLIBRE/);assert.doesNotMatch(app.innerHTML,/conte-narrativa/);run(`action('contes-next')`);assert.match(app.innerHTML,/pipa-02-mateix-tamany/);assert.doesNotMatch(app.innerHTML,/TANCAR EL LLIBRE/);assert.match(app.innerHTML,/2 \/ 8/);run(`for(let i=0;i<6;i++)action('contes-next')`);assert.match(app.innerHTML,/pipa-08-nomes-pagines/);assert.match(app.innerHTML,/TANCAR EL LLIBRE/);assert.match(app.innerHTML,/8 \/ 8/);run(`action('contes-close')`);assert.equal(run('state.place'),'contes');run(`hotspot('sopar')`);assert.match(app.innerHTML,/sopar-01-nomes-pagines/);assert.match(app.innerHTML,/conte-full/);assert.match(app.innerHTML,/1 \/ 7/);assert.doesNotMatch(app.innerHTML,/TANCAR EL LLIBRE/);assert.doesNotMatch(app.innerHTML,/BRUNA FA UN SOPAR/);assert.doesNotMatch(app.innerHTML,/IL·LUSTRACIÓ PENDENT/);assert.doesNotMatch(app.innerHTML,/conte-book/);assert.doesNotMatch(app.innerHTML,/pipa-portada/);run(`action('contes-next')`);assert.match(app.innerHTML,/sopar-02-nomes-pagines/);assert.match(app.innerHTML,/2 \/ 7/);assert.doesNotMatch(app.innerHTML,/TANCAR EL LLIBRE/);run(`action('contes-next')`);assert.match(app.innerHTML,/sopar-03-nomes-pagines/);assert.match(app.innerHTML,/3 \/ 7/);assert.doesNotMatch(app.innerHTML,/TANCAR EL LLIBRE/);run(`action('contes-next')`);assert.match(app.innerHTML,/sopar-04-nomes-pagines/);assert.match(app.innerHTML,/4 \/ 7/);assert.doesNotMatch(app.innerHTML,/TANCAR EL LLIBRE/);run(`action('contes-next')`);assert.match(app.innerHTML,/sopar-05-nomes-pagines/);assert.match(app.innerHTML,/5 \/ 7/);assert.doesNotMatch(app.innerHTML,/TANCAR EL LLIBRE/);run(`action('contes-next')`);assert.match(app.innerHTML,/sopar-06-nomes-pagines/);assert.match(app.innerHTML,/6 \/ 7/);assert.doesNotMatch(app.innerHTML,/TANCAR EL LLIBRE/);run(`action('contes-next')`);assert.match(app.innerHTML,/sopar-07-nomes-pagines/);assert.match(app.innerHTML,/7 \/ 7/);assert.match(app.innerHTML,/TANCAR EL LLIBRE/)});

const contesFile=JSON.parse(fs.readFileSync(path.join(root,'biblioteca-contes-vius-para-cursor/biblioteca-contes-vius/contenido/contes.json'),'utf8'));
test(()=>{assert.equal(contesFile.llibres.length,7);assert.deepEqual(contesFile.llibres.map(b=>b.id).sort(),['boira','bosc','bruna','nus','pipa','sopar','troc']);for(const b of contesFile.llibres){assert.equal(b.doblesPagines.length,8);for(const p of b.doblesPagines){assert.equal(p.ilustracioFinal,null);assert.equal(typeof p.esquerra,'string');assert.equal(typeof p.dreta,'string')}}});
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const ref of [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(x=>x[1]))test(()=>assert(fs.existsSync(path.join(root,ref)),`missing resource ${ref}`));
const files=get('Object.values(screens)');for(const f of files)test(()=>assert(fs.existsSync(path.join(root,'imagenes',f+'.webp'))));
console.log(`FASE 4: ${n} comprovacions de navegació, escenes, hotspots, recursos, jocs i memòria superades.`);
