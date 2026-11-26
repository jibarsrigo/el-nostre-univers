'use strict';
/* Activitats i jocs — memòria, comptar, puzles. Els contes els fa Jose al PC. */
const JOCS_PARELLES=[
 {id:'pipa',img:'pipa-portada.webp',label:'Pipa'},
 {id:'sopar',img:'sopar-portada.webp',label:'Sopar'},
 {id:'bosc',img:'bosc-portada.webp',label:'Bosc'},
 {id:'boira',img:'boira-portada.webp',label:'Na Boira'},
 {id:'troc',img:'troc-portada.webp',label:'Troc'}
];
const OMBRES_GOAL=5;
const OMBRES_SVG={
 gat:'<svg class="ombres-shape" viewBox="0 0 120 90" aria-hidden="true"><path fill="currentColor" d="M22 78q-6-32 14-48l12-18 12 16 14-16 12 18q18 14 14 48-32 18-78 0"/><circle cx="40" cy="44" r="5"/><circle cx="80" cy="44" r="5"/><path fill="currentColor" d="M52 58q8 6 16 0" stroke="currentColor" stroke-width="3" fill="none"/></svg>',
 drac:'<svg class="ombres-shape" viewBox="0 0 140 70" aria-hidden="true"><path fill="currentColor" d="M8 52q28-38 62-28 18 22 52 12 8 18 4 32H36q-20 6-28-16z"/><path fill="currentColor" d="M118 38l18-12-6 22z"/></svg>',
 cor:'<svg class="ombres-shape" viewBox="0 0 100 60" aria-hidden="true"><path fill="currentColor" d="M12 52h76l-8-28q-8-16-22-16t-22 16z"/><circle cx="30" cy="22" r="6"/><circle cx="50" cy="14" r="7"/><circle cx="70" cy="22" r="6"/></svg>'
};
const OMBRES_SECRETS=[
 {id:'pipa',img:'pipa-portada.webp',x:12,y:24,r:15,sway:3.6,peek:'Un nas...',reveal:'MIRA! ÉS LA PIPA!'},
 {id:'boira',img:'boira-portada.webp',x:72,y:18,r:15,sway:4.2,peek:'Ales llargues...',reveal:'UN PEGÀS LILA!'},
 {id:'bruna',img:'imagenes/jocs-pocio/jocs-pocio-barret.png',x:48,y:34,r:14,sway:3.9,peek:'Un barret que tremola...',reveal:'UN BARRET VIU!'},
 {id:'troc',img:'troc-portada.webp',x:34,y:60,r:16,sway:4.5,peek:'Un somriure gran...',reveal:'TROC FA GANYOTA!'},
 {id:'sopar',img:'sopar-portada.webp',x:76,y:54,r:15,sway:3.3,peek:'Una gerra fumant...',reveal:'BRUNA MENJA MAGIA!'},
 {id:'bosc',img:'bosc-portada.webp',x:18,y:70,r:14,sway:4.8,peek:'Orelles que pengen...',reveal:'UN CONILL CORRE!'},
 {id:'gat',svg:'gat',x:54,y:82,r:13,sway:3.1,peek:'Mijau fonia...',reveal:'UN GAT FANTASMA!'},
 {id:'drac',svg:'drac',x:90,y:40,r:12,sway:5.1,peek:'Una cua escamosa...',reveal:'DRAC AL FONS!'}
];
const OMBRES_BRICKS='<svg class="ombres-brick" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="ombg" x2="0" y2="1"><stop stop-color="#1a1228"/><stop offset="1" stop-color="#0a0614"/></linearGradient></defs><rect width="800" height="500" fill="url(#ombg)"/><g fill="none" stroke="#2a2038" stroke-width="2" opacity=".55">'+Array.from({length:9},(_,row)=>Array.from({length:14},(_,col)=>{const w=56,h=28,x=(col*w)+(row%2?w/2:0)-20,y=row*h+18;return`<rect x="${x}" y="${y}" width="${w-4}" height="${h-4}" rx="3"/>`}).join('')).join('')+'</g><ellipse cx="400" cy="520" rx="360" ry="80" fill="#000" opacity=".35"/></svg>';
function jocsPairIds(){return JOCS_PARELLES.map(p=>p.id)}
function jocsPairMeta(id){return JOCS_PARELLES.find(p=>p.id===id)||null}
const jocs={count:{items:[],touched:new Set(),goal:0,picked:null},puzle:{order:[0,1,2,3],size:2,img:'pipa-portada.webp'},pocio:{data:null,load:null,sel:[],mixing:false,result:null},ombres:{lx:42,ly:52,found:new Set()}}
const POCIO_URL='data/pocio-reaccions.json';
const JOCS_COMPTAR_POOL=[
 ['🌟','🌟','🌟'],
 ['🐚','🐚','🐚','🐚'],
 ['🦊','🦊','🦊','🦊','🦊'],
 ['✨','✨','✨','✨','✨','✨'],
 ['🐚','🐚','🐚','🦊','🦊','🦊','🌟'],
 ['🐚','🐚','🐚','🐚','🦊','🦊','🦊','🌟'],
 ['✨','✨','✨','✨','🐚','🐚','🐚','🐚','🦊'],
 ['🌟','🌟','🌟','🌟','🌟','🐚','🐚','🐚','🐚','🐚']
];
function jocsShuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function setupJocsCount(){const items=JOCS_COMPTAR_POOL[Math.floor(Math.random()*JOCS_COMPTAR_POOL.length)];jocs.count={items,touched:new Set(),goal:items.length,picked:null}}
function setupJocsPuzle(){jocs.puzle.order=jocsShuffle([0,1,2,3]);jocs.puzle.img=['pipa-portada.webp','sopar-portada.webp','bosc-portada.webp','boira-portada.webp'][Math.floor(Math.random()*4)]}
function jocsMenuScene(){return f2Scene('LA CAPSA DE JOCS','<div class="jocs-menu">'+[['jocs-pocio','🧪 LA POCIÓ EQUIVOCADA'],['jocs-search','🌲 EL BOSC AMAGAT'],['jocs-count','🔢 COMPTEM JUNTS'],['jocs-puzle','🧩 PUZZLE DE PORTADA']].map(([a,t])=>`<button type="button" class="f2-btn jocs-menu-btn" data-action="${a}">${t}</button>`).join('')+'</div>','<p>TRIA UN JOC!</p>',f2back(),'taller','jocs-hub')}
function pocioKey(a,b){return [a,b].sort().join('|')}
function ensurePocio(cb){
 if(jocs.pocio.data)return cb();
 if(jocs.pocio.load){jocs.pocio.load.then(cb);return}
 jocs.pocio.load=fetch(POCIO_URL).then(r=>r.json()).then(d=>{jocs.pocio.data=d;cb()}).catch(()=>{notify('NO PUC CARREGAR LA POCIÓ');cb()});
}
function resetPocio(){jocs.pocio.sel=[];jocs.pocio.mixing=false;jocs.pocio.result=null}
function jocsPocioScene(){
 const d=jocs.pocio.data;
 if(!d){ensurePocio(()=>{if(state.place==='jocsPocio')render()});return f2Scene('LA POCIÓ EQUIVOCADA','<p class="conte-wait">CARREGANT...</p>','','',f2back(),'taller','jocs-pocio')}
 let art='';
 if(jocs.pocio.result){
  const r=jocs.pocio.result;
  art=`<div class="pocio-stage"><img class="pocio-fx" src="${strip(r.img)}" alt=""><p class="pocio-text">${strip(r.text)}</p></div>`;
 }else{
  const cal=d.caldero?`<img class="pocio-caldero" src="${strip(d.caldero)}" alt="Calderó">`:'';
  const ings=d.ingredients.map(ing=>{const on=jocs.pocio.sel.includes(ing.id);
   return `<button type="button" class="pocio-ing ${on?'chosen':''}" data-pocio-ing="${ing.id}" aria-pressed="${on}"><img src="${strip(ing.img)}" alt=""><span>${strip(ing.nom)}</span></button>`}).join('');
  art=`<div class="pocio-stage ${jocs.pocio.mixing?'pocio-stage--mix':''}">${cal}<div class="pocio-ing-wrap">${ings}</div><p class="pocio-hint">${jocs.pocio.sel.length===2?'PREM MESCLAR!':'TRIA DOS INGREDIENTS.'}</p></div>`;
 }
 const actions=jocs.pocio.result?(f2btn('↻ UN ALTRE','reset-jocs-pocio')+f2btn('✨ GENIAL!','end-jocs-pocio')):(jocs.pocio.sel.length===2?f2btn('🧪 MESCLAR!','jocs-pocio-mix'):'')+f2btn('↻ NETEJA','reset-jocs-pocio');
 return f2Scene('LA POCIÓ EQUIVOCADA',art,`<p>${jocs.pocio.result?'QUINA SORPRESA!':'MIXA SENSE POR. ÉS UN JOC!'}</p>`,actions+f2back(),'taller','jocs-pocio');
}
function pocioPick(id){
 if(jocs.pocio.result||!jocs.pocio.data)return;
 const i=jocs.pocio.sel.indexOf(id);
 if(i>=0){jocs.pocio.sel.splice(i,1);render();return}
 if(jocs.pocio.sel.length>=2)jocs.pocio.sel.shift();
 jocs.pocio.sel.push(id);render();
}
function pocioMix(){
 const d=jocs.pocio.data;
 if(!d||jocs.pocio.sel.length!==2)return;
 const k=pocioKey(jocs.pocio.sel[0],jocs.pocio.sel[1]);
 jocs.pocio.mixing=true;render();
 setTimeout(()=>{jocs.pocio.result=d.reaccions[k]||d.defecte;jocs.pocio.mixing=false;render()},600);
}
function jocsCountScene(){if(!jocs.count.items.length)setupJocsCount();const n=jocs.count.touched.size,g=jocs.count.goal;const items=jocs.count.items.map((em,i)=>`<button type="button" class="jocs-count-item ${jocs.count.touched.has(i)?'touched':''}" data-jocs-count="${i}" aria-label="Objecte ${i+1}" ${jocs.count.touched.has(i)?'disabled':''}>${em}</button>`).join('');const opts=jocsShuffle([g,Math.max(1,g-1),g+1].filter((v,i,a)=>a.indexOf(v)===i)).slice(0,3).map(v=>`<button type="button" class="f2-btn" data-jocs-pick="${v}">${v}</button>`).join('');const won=jocs.count.picked===g;return f2Scene('COMPTEM JUNTS!',`<div class="jocs-count-stage">${items}</div><div class="jocs-count-ask"><p>QUANTS N’HI HA?</p><div class="jocs-count-opts">${opts}</div></div>`,`<p>${won?'MOLT BÉ! ERA '+g+'!':jocs.count.picked&&jocs.count.picked!==g?'PROVA UNA ALTRA XIFRA!':'TOCA CADA OBJECTE I DESPRÉS TRIA EL NÚMERO.'}</p>`,(won?f2btn('🌟 MOLT BÉ!','end-jocs-count'):'')+f2btn('↻ UN ALTRE','reset-jocs-count')+f2back(),'taller','jocs-count')}
function jocsPuzlePiece(idx){const o=jocs.puzle.order[idx],row=Math.floor(o/2),col=o%2;return `<button type="button" class="jocs-puzle-piece" data-jocs-puz="${idx}" style="background-image:url('${jocs.puzle.img}');background-size:200% 200%;background-position:${col?'100%':'0%'} ${row?'100%':'0%'}" aria-label="Peça ${idx+1}"></button>`}
function jocsPuzleScene(){if(!jocs.puzle.order.length)setupJocsPuzle();const won=jocs.puzle.order.every((v,i)=>v===i);const grid=jocs.puzle.order.map((_,i)=>jocsPuzlePiece(i)).join('');return f2Scene('PUZZLE DE PORTADA',`<div class="jocs-puzle-grid">${grid}</div>`,`<p>${won?'LA PORTADA ESTÀ COMPLETA!':'TOCA DUES PEÇES PER CANVIAR-LES DE LLOC.'}</p>`,(won?f2btn('✨ GENIAL!','end-jocs-puzle'):'')+f2btn('↻ UN ALTRE','reset-jocs-puzle')+f2back(),'taller','jocs-puzle')}
let jocsPuzleSel=null;
function jocsPuzleTap(i){if(jocs.puzle.order.every((v,idx)=>v===idx))return;if(jocsPuzleSel===null){jocsPuzleSel=i;return}if(jocsPuzleSel===i){jocsPuzleSel=null;return}const a=jocsPuzleSel;jocsPuzleSel=null;[jocs.puzle.order[a],jocs.puzle.order[i]]=[jocs.puzle.order[i],jocs.puzle.order[a]];render()}
function resetOmbres(){jocs.ombres={lx:42,ly:52,found:new Set()}}
function ombresDist(s){const dx=s.x-jocs.ombres.lx,dy=s.y-jocs.ombres.ly;return Math.hypot(dx,dy)}
function ombresLight(s){if(jocs.ombres.found.has(s.id))return'lit';const d=ombresDist(s);if(d<=s.r)return'lit';if(d<=s.r*1.5)return'peek';return'dim'}
function ombresFigBody(s){if(s.svg)return OMBRES_SVG[s.svg]||'';return `<img src="${strip(s.img)}" alt="">`}
function ombresFigHtml(s){const st=ombresLight(s),cap=st==='lit'?strip(s.reveal||''):st==='peek'?strip(s.peek||''):'';const cls=`ombres-fig ombres-fig--${st} ombres-fig--sway`;return `<figure class="${cls}" style="left:${s.x}%;top:${s.y}%;--sway:${s.sway||4}s">${ombresFigBody(s)}<figcaption>${cap}</figcaption></figure>`}
function ombresTryFind(){const before=jocs.ombres.found.size;OMBRES_SECRETS.forEach(s=>{if(jocs.ombres.found.has(s.id))return;if(ombresDist(s)<=s.r)jocs.ombres.found.add(s.id)});if(jocs.ombres.found.size>before){const id=[...jocs.ombres.found].slice(-1)[0],s=OMBRES_SECRETS.find(x=>x.id===id);if(s)notify(s.reveal||'')}}
function ombresReveal(){ombresTryFind();render()}
function ombresMove(clientX,clientY){const wall=app.querySelector('[data-ombres-wall]');if(!wall)return;const r=wall.getBoundingClientRect();jocs.ombres.lx=Math.max(3,Math.min(97,(clientX-r.left)/r.width*100));jocs.ombres.ly=Math.max(3,Math.min(97,(clientY-r.top)/r.height*100));ombresTryFind();render()}
function jocsOmbresScene(){
 const n=OMBRES_SECRETS.length,f=jocs.ombres.found.size,done=f>=OMBRES_GOAL;
 const figs=OMBRES_SECRETS.map(ombresFigHtml).join('');
 const art=`<p class="ombres-lead">LA PARET DE LA TORRE SOMRIU AMB OMBRES. QUI S'HI AMAGA?</p><div class="ombres-wall" data-ombres-wall style="--lx:${jocs.ombres.lx}%;--ly:${jocs.ombres.ly}%"><div class="ombres-back">${OMBRES_BRICKS}</div><div class="ombres-screen">${figs}</div><div class="ombres-veil" aria-hidden="true"></div><div class="ombres-glow" aria-hidden="true"></div><div class="ombres-sparkles" aria-hidden="true">${[0,1,2].map(i=>`<span style="--mi:${i}"></span>`).join('')}</div><span class="ombres-lantern" aria-hidden="true"></span><div class="ombres-curtain ombres-curtain--l" aria-hidden="true"></div><div class="ombres-curtain ombres-curtain--r" aria-hidden="true"></div></div>`;
 const hint=done?'HAS ESCOLTAT CINC OMBRES! SEGUEIX SI VOLS!':f?`ENCARA QUEDEN SECRETS (${f}/${n})...`:'PASSA LA LUPA LENT PER LA PARET...';
 return f2Scene('LES OMBRES TRAPELLES',art,`<p>${hint}</p><small>${f} / ${n} DESCOBERTES · CALEN ${OMBRES_GOAL} PER ACABAR</small>`,(done?f2btn('✨ GENIAL!','end-jocs-ombres'):'')+f2btn('↻ TORNAR A MIRAR','reset-jocs-ombres')+f2back(),'torre','jocs-ombres');
}
Object.assign(SCENES,{jocs:jocsMenuScene,jocsCount:jocsCountScene,jocsPuzle:jocsPuzleScene,jocsPocio:jocsPocioScene,jocsOmbres:jocsOmbresScene});
const hotspotJocs=hotspot;
hotspot=function(id){if(state.place==='workshop'&&id==='search'){go('jocs');return}if(state.place==='tower'&&id==='lupa'){resetOmbres();go('jocsOmbres');return}return hotspotJocs(id)};
const actionJocs=action;
action=function(id){switch(id){
case'jocs-search':go('search');return;
case'jocs-count':go('jocsCount');return;
case'jocs-puzle':setupJocsPuzle();go('jocsPuzle');return;
case'jocs-pocio':resetPocio();go('jocsPocio');return;
case'jocs-pocio-mix':pocioMix();return;
case'end-jocs-pocio':notify('QUINA POCIÓ!');remember('jocs-pocio');nav('workshop');return;
case'reset-jocs-pocio':resetPocio();render();return;
case'end-jocs-count':notify('HAS COMPTAT MOLT BÉ!');remember('jocs-count');nav('workshop');return;
case'end-jocs-puzle':notify('PUZZLE FET!');remember('jocs-puzle');nav('workshop');return;
case'reset-jocs-count':setupJocsCount();jocsPuzleSel=null;render();return;
case'reset-jocs-puzle':setupJocsPuzle();jocsPuzleSel=null;render();return;
case'end-jocs-ombres':notify('OMBRES DESVELADES!');remember('jocs-ombres');nav('tower');return;
case'reset-jocs-ombres':resetOmbres();render();return;
}return actionJocs(id)};
const renderJocs=render;
render=function(){renderJocs();jocsBind()};
function jocsBind(){app.querySelectorAll('[data-jocs-count]').forEach(el=>el.addEventListener('click',()=>{jocs.count.touched.add(Number(el.dataset.jocsCount));render()}));app.querySelectorAll('[data-jocs-pick]').forEach(el=>el.addEventListener('click',()=>{if(jocs.count.touched.size<jocs.count.goal){notify('PRIMER TOCA TOTS ELS OBJECTES!');return}jocs.count.picked=Number(el.dataset.jocsPick);render()}));app.querySelectorAll('[data-jocs-puz]').forEach(el=>el.addEventListener('click',()=>jocsPuzleTap(Number(el.dataset.jocsPuz))));app.querySelectorAll('[data-pocio-ing]').forEach(el=>el.addEventListener('click',()=>pocioPick(el.dataset.pocioIng)));const wall=app.querySelector('[data-ombres-wall]');if(wall&&!wall.dataset.ombresBound){wall.dataset.ombresBound='1';const mv=e=>{if(e.pointerType==='mouse'&&e.buttons===0)return;ombresMove(e.clientX,e.clientY)};wall.addEventListener('pointerdown',e=>{wall.setPointerCapture(e.pointerId);ombresMove(e.clientX,e.clientY)});wall.addEventListener('pointermove',mv);wall.addEventListener('touchmove',e=>{e.preventDefault();if(e.touches[0])ombresMove(e.touches[0].clientX,e.touches[0].clientY)},{passive:false})}}