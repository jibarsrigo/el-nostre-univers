'use strict';
/* Biblioteca dels Contes Vius. Un lector per a tots els contes del JSON.
   Les il·lustracions interiors no existeixen: no se simulen. */
const CONTES_URL='biblioteca-contes-vius-para-cursor/biblioteca-contes-vius/contenido/contes.json';
const SHELF_URL='biblioteca-contes-vius-para-cursor/biblioteca-contes-vius/recursos/prestatgeria-contes-vius.webp';
const PIPA_PORTADA='pipa-portada.webp';
const PIPA_PAGINES=[
 'PIPA-PAGINAS-SIN-CUBIERTA-PARA-CURSOR/pipa-01-nomes-pagines.webp',
 'PIPA-02-MATEIX-TAMANY-PER-CURSOR/pipa-02-mateix-tamany.webp',
 'PIPA-8-PAGINAS-PARA-CURSOR/PIPA-PAGINAS-SIN-CUBIERTA-PARA-CURSOR/pipa-03-nomes-pagines.webp',
 'PIPA-8-PAGINAS-PARA-CURSOR/PIPA-PAGINAS-SIN-CUBIERTA-PARA-CURSOR/pipa-04-nomes-pagines.webp',
 'PIPA-8-PAGINAS-PARA-CURSOR/PIPA-PAGINAS-SIN-CUBIERTA-PARA-CURSOR/pipa-05-nomes-pagines.webp',
 'PIPA-8-PAGINAS-PARA-CURSOR/PIPA-PAGINAS-SIN-CUBIERTA-PARA-CURSOR/pipa-06-nomes-pagines.webp',
 'PIPA-8-PAGINAS-PARA-CURSOR/PIPA-PAGINAS-SIN-CUBIERTA-PARA-CURSOR/pipa-07-nomes-pagines.webp',
 'PIPA-8-PAGINAS-PARA-CURSOR/PIPA-PAGINAS-SIN-CUBIERTA-PARA-CURSOR/pipa-08-nomes-pagines.webp'
];
const SOPAR_PAGINES=[
 {src:'sopar-01-nomes-pagines.webp'},
 {src:'sopar-02-nomes-pagines.webp',solapa:{text:"GELAT DE CERA D'ORELLA!",x:30,y:60,w:16,h:26}},
 {src:'sopar-03-nomes-pagines.webp',solapa:{text:"QUI L'HA AGAFAT?",x:70,y:56,w:13,h:14}},
 {src:'sopar-04-nomes-pagines.webp',solapa:{text:'NOMÉS ERA SOPA!',x:11,y:38,w:15,h:16}},
 {src:'sopar-05-nomes-pagines.webp'},
 {src:'sopar-06-nomes-pagines.webp'},
 {src:'sopar-07-nomes-pagines.webp'}
];
const SHELF=[
 ['sopar','EL SOPAR DELS EMBULLS',340,228,592,547],
 ['pipa','PIPA I EL MAPA DEL MAR',605,230,906,547],
 ['bosc','EL BOSC DE LES SABATES',948,230,1216,547],
 ['boira','EL NÚVOL PERDUT DE NA BOIRA',1267,225,1576,542],
 ['troc','TROC I LA MUNTANYA DE LLIBRES',460,587,750,885],
 ['nus','NUS FA MIL COSES ALHORA',798,587,1088,886],
 ['bruna','BRUNA I LA POCIÓ SORPRESA',1107,586,1455,887]
];
hotspots.library.push(['contes','ELS CONTES VIUS','rect',[500,155,1095,405]]);
FIREFLY.library.contes=[690,240];
let contesData=null,contesError='',contesLoading=null,conteId='',contePage=0,conteMotion='',pipaObert=false,solapaOberta=false;
function conteList(){return contesData&&Array.isArray(contesData.llibres)?contesData.llibres:[]}
function conteBook(){return conteList().find(b=>b&&b.id===conteId)||null}
function ensureContes(){
 if(contesData||contesLoading)return;
 if(typeof fetch!=='function'){contesError='NO PUC OBRIR ELS CONTES.';return}
 contesLoading=fetch(CONTES_URL).then(r=>{if(!r.ok)throw new Error('contes');return r.json()}).then(data=>{
  contesData=data;contesLoading=null;contesError='';
  if(state.place==='lector'||state.place==='contes')render();
 }).catch(()=>{contesLoading=null;contesError='NO PUC OBRIR ELS CONTES.';if(state.place==='lector')render()});
}
function openShelf(){conteMotion='';go('contes')}
function leaveShelf(){if(state.history[state.history.length-1]==='library')state.history.pop();nav('library')}
function openBook(id){if(id==='pipa'||conteId!==id)contePage=0;if(id==='pipa'){pipaObert=false;const primer=new Image();primer.src=PIPA_PAGINES[0]}conteId=id;conteMotion='';solapaOberta=false;go('lector')}
function backToShelf(){conteMotion='';if(state.history[state.history.length-1]==='contes')state.history.pop();nav('contes')}
function turnPage(dir){
 if(conteId==='sopar'){const n=SOPAR_PAGINES.length,next=contePage+dir;if(next<0||next>=n)return;contePage=next;conteMotion=dir>0?'forward':'back';solapaOberta=false;render();return}
 if(conteId==='pipa'){if(!pipaObert)return;const n=PIPA_PAGINES.length,next=contePage+dir;if(next<0||next>=n)return;contePage=next;conteMotion=dir>0?'forward':'back';render();return}
 const book=conteBook();if(!book)return;
 const n=(book.doblesPagines||[]).length,next=contePage+dir;
 if(next<0||next>=n)return;
 contePage=next;conteMotion=dir>0?'forward':'back';render();
}
function renderPipa(){
 const n=PIPA_PAGINES.length;
 if(contePage<0)contePage=0;
 if(contePage>n-1)contePage=n-1;
 const last=contePage===n-1;
 const fade=conteMotion==='forward'?' conte-fade':'';
 const body=pipaObert?`<figure class="conte-full${fade}"><img src="${PIPA_PAGINES[contePage]}" alt="Doble pàgina il·lustrada de Pipa i el mapa del mar" draggable="false"></figure>`:`<button type="button" class="conte-cover" data-action="contes-open" aria-label="Obrir el llibre"><img src="${PIPA_PORTADA}" alt="" draggable="false"></button><p class="conte-hint">TOCA EL LLIBRE PER OBRIR-LO</p>`;
 const controls=pipaObert?`<div class="conte-controls"><button type="button" class="conte-turn" data-action="contes-prev" aria-label="Pàgina anterior" ${contePage===0?'disabled':''}>‹</button><p class="conte-progress" aria-label="Doble pàgina ${contePage+1} de ${n}">${contePage+1} / ${n}</p><button type="button" class="conte-turn" data-action="contes-next" aria-label="Pàgina següent" ${last?'disabled':''}>›</button>${last?'<button type="button" class="conte-end" data-action="contes-close">TANCAR EL LLIBRE</button>':''}</div>`:'<div class="conte-controls" aria-hidden="true"></div>';
 app.innerHTML=conteRoom(`<div class="conte-stage">${body}${controls}</div>`,'← CONTES','contes-shelf');
}
function renderSopar(){
 const n=SOPAR_PAGINES.length;
 if(contePage<0)contePage=0;
 if(contePage>n-1)contePage=n-1;
 const last=contePage===n-1;
 const fade=conteMotion==='forward'?' conte-fade':'';
 const page=SOPAR_PAGINES[contePage];
 const solapa=page.solapa;
 const flap=solapa?`<button type="button" class="conte-flap" data-action="contes-flap" data-x="${solapa.x}" data-y="${solapa.y}" data-w="${solapa.w}" data-h="${solapa.h}" aria-pressed="${solapaOberta?'true':'false'}" aria-label="${solapaOberta?solapa.text:'TOCA PER DESCOBRIR'}">${solapaOberta?solapa.text:'TOCA'}</button>`:'';
 const body=`<figure class="conte-full${fade}"><img src="${page.src}" alt="Doble pàgina il·lustrada d'El sopar dels embulls" draggable="false">${flap}</figure>`;
 const controls=`<div class="conte-controls"><button type="button" class="conte-turn" data-action="contes-prev" aria-label="Pàgina anterior" ${contePage===0?'disabled':''}>‹</button><p class="conte-progress" aria-label="Doble pàgina ${contePage+1} de ${n}">${contePage+1} / ${n}</p><button type="button" class="conte-turn" data-action="contes-next" aria-label="Pàgina següent" ${last?'disabled':''}>›</button>${last?'<button type="button" class="conte-end" data-action="contes-close">TANCAR EL LLIBRE</button>':''}</div>`;
 app.innerHTML=conteRoom(`<div class="conte-stage">${body}${controls}</div>`,'← CONTES','contes-shelf');
 placeSoparFlap();
}
function placeSoparFlap(){
 if(typeof document.querySelector!=='function')return;
 const img=document.querySelector('.conte-full img');
 const btn=document.querySelector('.conte-flap');
 if(!img||!btn||typeof img.getBoundingClientRect!=='function')return;
 const fit=()=>{
  const r=img.getBoundingClientRect();
  if(!r.width)return;
  btn.style.position='fixed';
  btn.style.left=(r.left+r.width*btn.dataset.x/100)+'px';
  btn.style.top=(r.top+r.height*btn.dataset.y/100)+'px';
  btn.style.width=(r.width*btn.dataset.w/100)+'px';
  btn.style.height=(r.height*btn.dataset.h/100)+'px';
 };
 const run=()=>{fit();if(typeof requestAnimationFrame==='function')requestAnimationFrame(fit)};
 if(img.complete)run();
 else img.addEventListener('load',run);
 if(typeof window.addEventListener==='function'&&!placeSoparFlap.bound){window.addEventListener('resize',placeSoparFlap);placeSoparFlap.bound=true}
}
function conteBar(label,id){
 const full=document.fullscreenElement?'⤢':'⛶';
 return `<div class="topbar"><div><button type="button" class="pill" data-action="${id}">${label}</button><button type="button" class="pill" data-action="home">⌂ INICI</button></div><div><button type="button" class="pill icon" data-action="help" aria-label="Com es juga?">?</button><button type="button" class="pill icon" data-action="fullscreen" aria-label="Pantalla completa">${full}</button></div></div>`;
}
function conteRoom(inner,label,id){
 return `<div class="conte-room" style="background-image:linear-gradient(#140e22c4,#140e22d0),url('${IMG('biblioteca')}')">${conteBar(label,id)}${inner}</div>`;
}
function renderShelf(){
 const zones=SHELF.map(([id,label,x,y,x2,y2])=>`<rect tabindex="0" role="button" aria-label="${strip(label)}" data-hotspot="${id}" class="hit" x="${x}" y="${y}" width="${x2-x}" height="${y2-y}"><title>${strip(label)}</title></rect>`).join('');
 app.innerHTML=`<div class="world"><div class="art shelf-art"><img src="${SHELF_URL}" alt="La biblioteca dels contes vius" draggable="false"><svg class="hit-layer" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid meet">${zones}</svg></div>${conteBar('← LLEGIM!','contes-library')}<div class="footer">🦊 TOCA UNA PORTADA</div></div>`;
}
function renderReader(){
 ensureContes();
 const book=conteBook();
 if(!book){
  app.innerHTML=conteRoom(`<p class="conte-wait">${strip(contesError||'OBRINT EL CONTE...')}</p>`,'← CONTES','contes-shelf');
  return;
 }
 const pages=Array.isArray(book.doblesPagines)?book.doblesPagines:[];
 if(!pages.length){app.innerHTML=conteRoom(`<p class="conte-wait">AQUEST CONTE ENCARA NO TÉ PÀGINES.</p>`,'← CONTES','contes-shelf');return}
 if(book.id==='pipa'){renderPipa();conteMotion='';return}
 if(book.id==='sopar'){renderSopar();conteMotion='';return}
 if(contePage<0)contePage=0;
 if(contePage>pages.length-1)contePage=pages.length-1;
 const page=pages[contePage]||{};
 const n=pages.length,last=contePage===n-1;
 const motion=conteMotion==='forward'||conteMotion==='back'?conteMotion:'';
 const end=last?`<button type="button" class="conte-end" data-action="contes-reread">TORNAM A LLEGIR</button><button type="button" class="conte-end" data-action="contes-shelf">ALTRES CONTES</button>`:'';
 const controls=`<div class="conte-controls"><button type="button" class="conte-turn" data-action="contes-prev" aria-label="Pàgina anterior" ${contePage===0?'disabled':''}>‹</button><p class="conte-progress" aria-label="Doble pàgina ${contePage+1} de ${n}">${contePage+1} / ${n}</p><button type="button" class="conte-turn" data-action="contes-next" aria-label="Pàgina següent" ${last?'disabled':''}>›</button>${end}</div>`;
 const body=`<div class="conte-book ${motion}" aria-live="polite"><div class="conte-pages"><div class="conte-page"><p>${strip(page.esquerra||'')}</p></div><div class="conte-page"><p>${strip(page.dreta||'')}</p></div><p class="conte-pending">IL·LUSTRACIÓ PENDENT</p></div></div>`;
 app.innerHTML=conteRoom(`<div class="conte-stage">${body}${controls}</div>`,'← CONTES','contes-shelf');
 conteMotion='';
}
function renderContes(){if(state.place==='contes')renderShelf();else renderReader();bindF1()}
const hotspotContesPrev=hotspot;
hotspot=function(id){if(state.place==='library'&&id==='contes')return openShelf();if(state.place==='contes'&&id)return openBook(id);return hotspotContesPrev(id)};
const actionContesPrev=action;
action=function(id){
 if(id==='contes-library'){leaveShelf();return}
 if(id==='contes-shelf'||id==='contes-close'){pipaObert=false;backToShelf();return}
 if(id==='contes-open'){pipaObert=true;contePage=0;conteMotion='forward';render();return}
 if(id==='contes-prev'){turnPage(-1);return}
 if(id==='contes-next'){turnPage(1);return}
 if(id==='contes-flap'){const page=SOPAR_PAGINES[contePage];if(conteId!=='sopar'||!page||!page.solapa)return;solapaOberta=!solapaOberta;conteMotion='';render();return}
 if(id==='contes-reread'){contePage=0;conteMotion='back';render();return}
 return actionContesPrev(id);
};
const renderContesPrev=render;
render=function(){
 if(state.place==='contes'||state.place==='lector'){document.body?.classList.toggle('welcome-open',false);renderContes();return}
 renderContesPrev();
 if(state.place==='library'){const foot=app.querySelector('.footer');if(foot)foot.textContent='🦊 LLEGIM! · ELS LLIBRES DE DALT SÓN ELS CONTES VIUS'}
};
document.addEventListener('keydown',e=>{
 if(state.place!=='lector')return;
 if(e.key==='ArrowRight'){e.preventDefault();turnPage(1)}
 else if(e.key==='ArrowLeft'){e.preventDefault();turnPage(-1)}
});
