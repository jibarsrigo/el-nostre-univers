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
run(fs.readFileSync('js/app.js','utf8'));run(fs.readFileSync('js/progres.js','utf8'));run(fs.readFileSync('js/fase2.js','utf8'));run(fs.readFileSync('js/jocs.js','utf8'));
run(`nav('jocs')`);assert(root.innerHTML.includes('CAPSA DE JOCS'));
run(`action('jocs-count')`);assert(root.innerHTML.includes('COMPTEM'));
run(`setupJocsCount()`);const goal=run('jocs.count.goal');for(let i=0;i<goal;i++)run(`jocs.count.touched.add(${i})`);run(`jocs.count.picked=${goal}`);run('render()');assert(root.innerHTML.includes('MOLT BÉ'));
run(`action('jocs-puzle')`);assert(root.innerHTML.includes('PUZZLE'));
run(`jocs.pocio.data=${JSON.stringify(pocioJSON())}`);run(`go('jocsPocio')`);
run(`pocioPick('platan');pocioPick('bebeta');pocioMix()`);run('render()');
assert(root.innerHTML.includes('MEGAEXPLOSIÓ')||root.innerHTML.includes('pocio-fx'));
run(`jocs.ombres.data=${JSON.stringify(ombresJSON())}`);run(`resetOmbres();go('jocsOmbres');render()`);assert(root.innerHTML.includes('OMBRES TRAPELLES')&&root.innerHTML.includes('ombres-pop--levels')&&root.innerHTML.includes('NIVELL 1'),'primera entrada: tria de nivell');
run(`action('ombres-play-level-0');render()`);assert(root.innerHTML.includes('ombres-pop--briefing')&&!root.innerHTML.includes('data-ombres-wall')&&!root.innerHTML.includes('ombres-light-anchor'),'briefing sense mur ni llanterna');
assert(root.innerHTML.includes('ombres-briefing-room')&&root.innerHTML.includes('ombres-briefing-preview')&&root.innerHTML.includes('imagenes/jocs-ombres/jocs-ombres-paret.webp'),'briefing amb nom de sala i vista del mur');
run(`action('ombres-begin-search');render()`);assert(root.innerHTML.includes('ombres-stars')&&root.innerHTML.includes('data-ombres-wall'));
const tid=run('jocs.ombres.targetId'),act=run('jocs.ombres.activeSecrets'),ts=act.find(s=>s.id===tid);
run(`jocs.ombres.lx=${ts.x};jocs.ombres.ly=${ts.y};ombresTryFind(true);render()`);assert(run('jocs.ombres.stars')===1&&run('jocs.ombres.phase')==='found');
run('ombresClearAuto();action("ombres-next-mission");render()');assert(run('jocs.ombres.phase')==='searching'&&!root.innerHTML.includes('ombres-pop--briefing'),'següent cerca sense doble briefing');
assert(run('ombresTeachTap()')===false,'sense TOCA després de 1a cerca nivell 1');
run(`jocs.diferencies.data=${JSON.stringify(difJSON())}`);run('resetDiferencies();go("jocsDiferencies")');assert(run('difPerRound()')===7);assert(run('jocs.diferencies.active.length')===7);assert(run('difScenes().filter(difScenePlayable).map(s=>s.id)').includes(run('jocs.diferencies.sceneId')));for(let i=0;i<12;i++){run('difStartRound()');assert(run('jocs.diferencies.active.every(a=>difAll().some(d=>d.id===a.id))'),'objectes de l’escena triada')}for(let i=0;i<10;i++){const ids=[0,1,2].map(()=>run('difPickSceneId()'));assert(new Set(ids).size===3,'tres fons diferents seguits')}for(const id of run('difScenes().map(s=>s.id)')){run(`jocs.diferencies.sceneId='${id}'`);for(let i=0;i<20;i++){const r=run('(()=>{const g=difGreedyRound(difAll(),difPerRound(),difPerRoundDecoys());return difPlacementsOk(g.active.concat(g.decoys))&&g.active.length===difPerRound()&&g.active.every(a=>difAll().some(d=>d.id===a.id))})()');assert(r,'sortida alternativa sense solapaments a '+id)}}
assert(root.innerHTML.includes('TROBA LES 7 DIFERÈNCIES')||root.innerHTML.includes('7 DIFERÈNCIES'));
run(`resetDiferencies();go('jocsDiferencies');render()`);assert(root.innerHTML.includes('dif-ready')&&root.innerHTML.includes('COMENÇAR NIVELL 1')&&!root.innerHTML.includes('conte-wait'),'primera entrada: ready sense CARREGANT');
assert(root.innerHTML.includes('dif-prep-scene')&&root.innerHTML.includes(run('strip(difScene().base)')),'preparació amb nom i vista de l\'escena');
run(`resetDiferencies();jocs.diferencies.sceneId='taller';var r=difPickRound();jocs.diferencies.active=r.active;jocs.diferencies.decoys=r.decoys;jocs.diferencies.found=new Set();jocs.diferencies.stars=0;jocs.diferencies.phase='searching';jocs.diferencies.assetsReady=true;go('jocsDiferencies')`);assert(run('jocs.diferencies.active.length')===7);
run(`jocs.diferencies.active.forEach(d=>jocs.diferencies.found.add(d.id));jocs.diferencies.stars=1;jocs.diferencies.phase='found';difAdvanceRound();render()`);assert(run('jocs.diferencies.phase')==='searching'&&run('jocs.diferencies.stars')===1);
run(`resetDiferencies();jocs.diferencies.phase='sceneDone';jocs.diferencies.stars=1;jocs.diferencies.assetsReady=true;render()`);assert(root.innerHTML.includes('BUSCA MÉS SECRETS NIVELL 2')&&root.innerHTML.includes('SET DIFERÈNCIES')&&root.innerHTML.includes('dif-done-objs--row')&&root.innerHTML.includes('dif-ready-scene')&&root.innerHTML.includes('dif-prep-scene')&&!root.innerHTML.includes(run('strip(difScene().doneMsg)'))&&(root.innerHTML.match(/class="dif-done-obj"/g)||[]).length===7);{const prev=run('jocs.diferencies.sceneId');run(`action('dif-next')`);assert(run('jocs.diferencies.phase')==='searching'&&run('jocs.diferencies.sceneId')!==prev)}
run(`jocs.diferencies.phase='sceneDone';jocs.diferencies.stars=2;jocs.diferencies.assetsReady=true;render()`);assert(root.innerHTML.includes('BUSCA MÉS SECRETS NIVELL 3'));
run(`jocs.diferencies.phase='completed';jocs.diferencies.stars=3;render()`);assert(root.innerHTML.includes('TORNA A JUGAR')&&!root.innerHTML.includes('BUSCA MÉS SECRETS NIVELL')&&root.innerHTML.includes('TRES ESTRELLES MÀGIQUES!')&&!root.innerHTML.includes('class="dif-done-obj"')&&root.innerHTML.includes('LA TORRE BRILLA'));
run('resetDiferencies();go("jocsDiferencies");action("dif-start-round");render()');assert(run('jocs.diferencies.decoys.length')<=1);assert(run('jocs.diferencies.decoys.every(p=>jocs.diferencies.active.every(a=>a.id!==p.id))'));const h=root.innerHTML;if(run('jocs.diferencies.decoys.length')>0){assert(h.includes('dif-overlay--pair'));const left=(h.split('data-dif-panel="left"')[1]||'').split('data-dif-panel="right"')[0];const right=(h.split('data-dif-panel="right"')[1]||'');assert(left.includes('dif-overlay--pair')&&right.includes('dif-overlay--pair'));}
const a1=run('JSON.stringify(jocs.diferencies.active.map(p=>[Math.round(p.x),Math.round(p.y)]))');run('resetDiferencies();action("dif-start-round");render()');let varied=false;for(let t=0;t<16;t++){const a2=run('JSON.stringify(jocs.diferencies.active.map(p=>[Math.round(p.x),Math.round(p.y)]))');if(a1!==a2){varied=true;break}run('resetDiferencies();action("dif-start-round")')}assert(varied);
{const oj=ombresJSON();assert.equal(oj.secrets.length,15,'ombres 15 personatges');for(const s of oj.secrets){assert(fs.existsSync(s.img)&&fs.existsSync(s.color),s.id+' art');assert(oj.missions.objectives[s.id]&&oj.missions.foundLabels[s.id],s.id+' textos')}const g=oj.secrets.find(s=>s.id==='gat');assert(g&&g.color==='imagenes/personatges/personatge-gat.webp');assert(JSON.parse(fs.readFileSync('data/personatges.json','utf8')).personatges.find(p=>p.id==='gat').enabled)}
const ombSz=[[4,5,6],[5,6,7],[6,7,8],[8,9,10]];
for(let lv=0;lv<ombSz.length;lv++)for(let mi=0;mi<3;mi++){const n=ombSz[lv][mi];let okc=0;for(let t=0;t<40;t++){run(`resetOmbres();jocs.ombres.playingLevel=${lv};jocs.ombres.missionIndex=${mi};jocs.ombres.stars=0;ombresPrepMission('searching')`);assert(run('jocs.ombres.activeSecrets.length')===n,'n='+n+' lv='+lv);assert(run('ombresPositionsOk(jocs.ombres.activeSecrets)'),'colisió n='+n);okc++}assert(okc===40)}
const inFrame=p=>p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100;
for(const id of run('difScenes().map(s=>s.id)')){run(`jocs.diferencies.sceneId='${id}'`);for(let t=0;t<8;t++){run('difStartRound()');const all=run('jocs.diferencies.active.concat(jocs.diferencies.decoys)');assert(all.every(inFrame),'objecte fora del dibuix a '+id);assert(run('difPlacementsOk('+JSON.stringify(all)+')'),'solapament a '+id)}}
run(`go('jocsLupa');action('jocs-lupa-diferencies');render()`);assert(root.innerHTML.includes('DIFERÈNCIES'));
run(`action('end-jocs-diferencies');nav('tower')`);
run(`go('jocsLupa');action('jocs-lupa-diferencies');render()`);assert(root.innerHTML.includes('DIFERÈNCIES'));
run(`action('end-jocs-diferencies')`);
run(`go('jocsLupa');action('jocs-lupa-ombres');render()`);assert(root.innerHTML.includes('OMBRES'));
run(`action('end-jocs-ombres');nav('tower')`);
run(`go('jocsLupa');action('jocs-lupa-ombres');render()`);assert(root.innerHTML.includes('OMBRES'));
run(`action('end-jocs-ombres')`);
const pj=JSON.parse(fs.readFileSync('data/personatges.json','utf8'));
assert.equal(pj.nivells.length,4,'cartes quatre nivells');
const pool=pj.personatges.filter(p=>p.enabled!==false&&String(p.img||'').trim());
assert.ok(new Set(pool.map(p=>p.grup||p.id)).size>=8,'pool cartes >= 8 grups');
console.log('OK: jocs hub, comptar, puzle, poció, ombres, diferencies.');