'use strict';
/* Activitats i jocs — memòria, comptar, puzles. Els contes els fa Jose al PC. */
const JOCS_PARELLES=[
 {id:'pipa',img:'pipa-portada.webp',label:'Pipa'},
 {id:'sopar',img:'sopar-portada.webp',label:'Sopar'},
 {id:'bosc',img:'bosc-portada.webp',label:'Bosc'},
 {id:'boira',img:'boira-portada.webp',label:'Na Boira'}
];
function jocsPairIds(){return JOCS_PARELLES.map(p=>p.id)}
function jocsPairMeta(id){return JOCS_PARELLES.find(p=>p.id===id)||null}
const jocs={count:{items:[],touched:new Set(),goal:0,picked:null},puzle:{order:[0,1,2,3],size:2,img:'pipa-portada.webp'},pocio:{data:null,load:null,sel:[],mixing:false,result:null}}
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
Object.assign(SCENES,{jocs:jocsMenuScene,jocsCount:jocsCountScene,jocsPuzle:jocsPuzleScene,jocsPocio:jocsPocioScene});
const hotspotJocs=hotspot;
hotspot=function(id){if(state.place==='workshop'&&id==='search'){go('jocs');return}return hotspotJocs(id)};
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
}return actionJocs(id)};
const renderJocs=render;
render=function(){renderJocs();jocsBind()};
function jocsBind(){app.querySelectorAll('[data-jocs-count]').forEach(el=>el.addEventListener('click',()=>{jocs.count.touched.add(Number(el.dataset.jocsCount));render()}));app.querySelectorAll('[data-jocs-pick]').forEach(el=>el.addEventListener('click',()=>{if(jocs.count.touched.size<jocs.count.goal){notify('PRIMER TOCA TOTS ELS OBJECTES!');return}jocs.count.picked=Number(el.dataset.jocsPick);render()}));app.querySelectorAll('[data-jocs-puz]').forEach(el=>el.addEventListener('click',()=>jocsPuzleTap(Number(el.dataset.jocsPuz))));app.querySelectorAll('[data-pocio-ing]').forEach(el=>el.addEventListener('click',()=>pocioPick(el.dataset.pocioIng)))}