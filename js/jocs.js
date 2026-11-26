'use strict';
/* Activitats i jocs — memòria, comptar, puzles. Els contes els fa Jose al PC. */
const JOCS_PARELLES=[
 {id:'pipa',img:'pipa-portada.webp',label:'Pipa'},
 {id:'sopar',img:'sopar-portada.webp',label:'Sopar'},
 {id:'bosc',img:'bosc-portada.webp',label:'Bosc'},
 {id:'boira',img:'boira-portada.webp',label:'Na Boira'},
 {id:'troc',img:'troc-portada.webp',label:'Troc'}
];
const OMBRES_URL='data/ombres-trapelles.json';
const DIFERENCIES_URL='data/diferencies.json';
const OMBRES_BRICKS='<svg class="ombres-brick" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="ombg" x2="0" y2="1"><stop stop-color="#30243E"/><stop offset="1" stop-color="#0a0614"/></linearGradient></defs><rect width="800" height="500" fill="url(#ombg)"/><g fill="none" stroke="#572039" stroke-width="2" opacity=".45">'+Array.from({length:9},(_,row)=>Array.from({length:14},(_,col)=>{const w=56,h=28,x=(col*w)+(row%2?w/2:0)-20,y=row*h+18;return`<rect x="${x}" y="${y}" width="${w-4}" height="${h-4}" rx="3"/>`}).join('')).join('')+'</g></svg>';
const OMBRES_MISSION_SIZES=[4,5,6];
const OMBRES_MIN_POS_DIST=15;
let ombresLastTargetId=null,ombresAutoTimer=null;
function ombresClearAuto(){if(ombresAutoTimer){clearTimeout(ombresAutoTimer);ombresAutoTimer=null}}
function ombresScheduleAdvance(){ombresClearAuto();const ms=jocs.ombres.stars>=3?1500:1000;ombresAutoTimer=setTimeout(()=>{ombresAutoTimer=null;if(state.place!=='jocsOmbres'||jocs.ombres.phase!=='found')return;jocs.ombres.starPop=false;if(jocs.ombres.stars>=3){jocs.ombres.phase='completed';render();return}ombresAdvanceMission();render()},ms)}
function ombresCfg(){return jocs.ombres.data||{missions:{},secrets:[]}}
function ombresMissions(){return ombresCfg().missions||{}}
function ombresAllSecrets(){return ombresCfg().secrets||[]}
function ombresSecrets(){return jocs.ombres.activeSecrets.length?jocs.ombres.activeSecrets:ombresAllSecrets()}
function ombresObjective(id){return strip((ombresMissions().objectives||{})[id]||'BUSCA!')}
function ombresFoundLabel(id){return strip((ombresMissions().foundLabels||{})[id]||ombresObjective(id).replace(/^BUSCA/,'HAS TROBAT'))}
function ombresTargetText(id){return jocs.ombres.phase==='found'?ombresFoundLabel(id):ombresObjective(id)}
function ombresMissionSize(){return OMBRES_MISSION_SIZES[jocs.ombres.missionIndex]||4}
function ombresPositionsOk(list){for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const dx=list[i].x-list[j].x,dy=list[i].y-list[j].y;if(Math.hypot(dx,dy)<OMBRES_MIN_POS_DIST)return false}return true}
function ombresShufflePositions(secrets){const pos=ombresAllSecrets().map(s=>({x:s.x,y:s.y}));for(let t=0;t<40;t++){const sh=jocsShuffle(pos),placed=secrets.map((s,i)=>({...s,x:sh[i].x,y:sh[i].y}));if(ombresPositionsOk(placed))return placed}return secrets.map((s,i)=>({...s,x:pos[i%pos.length].x,y:pos[i%pos.length].y}))}
function ombresPickTarget(){const all=ombresAllSecrets().map(s=>s.id);let pool=all.filter(id=>!jocs.ombres.usedTargets.includes(id));if(!pool.length)pool=[...all];if(jocs.ombres.missionIndex===0&&!jocs.ombres.usedTargets.length&&ombresLastTargetId&&pool.length>1)pool=pool.filter(id=>id!==ombresLastTargetId);return pool[Math.floor(Math.random()*pool.length)]}
function ombresStartMission(){const all=ombresAllSecrets(),n=ombresMissionSize(),targetId=ombresPickTarget();jocs.ombres.targetId=targetId;const others=jocsShuffle(all.filter(s=>s.id!==targetId)).slice(0,n-1),chosen=[all.find(s=>s.id===targetId),...others];jocs.ombres.activeSecrets=ombresShufflePositions(chosen);jocs.ombres.found=new Set();jocs.ombres.distractorNotified=new Set();jocs.ombres.phase='searching'}
function ombresStarsHtml(){const n=jocs.ombres.stars,pop=jocs.ombres.starPop;return [0,1,2].map(i=>`<span class="ombres-star ${i<n?'ombres-star--on':''} ${i===n-1&&pop?'ombres-star--pop':''}" aria-hidden="true"><svg class="ombres-star-svg" viewBox="0 0 64 64"><path d="M32 5 39 25 61 27 45 42 51 63 32 52 13 63 19 42 3 27 25 25Z"/></svg></span>`).join('')}
function ombresTargetRow(){const id=jocs.ombres.targetId,s=ombresAllSecrets().find(x=>x.id===id);if(!s||jocs.ombres.phase==='completed')return'';const done=jocs.ombres.phase==='found';return `<div class="ombres-objective ${done?'ombres-objective--found':''}"><img class="ombres-objective-thumb" src="${strip(s.img)}" alt=""><p class="ombres-objective-text">${ombresTargetText(id)}</p></div>`}
function ombresHeadHtml(){const m=ombresMissions();if(jocs.ombres.phase==='completed')return'';const showGoal=jocs.ombres.phase==='found'||jocs.ombres.phase==='searching';return `<div class="ombres-head"><div class="ombres-head-main">${showGoal?ombresTargetRow():''}<div class="ombres-stars" aria-label="${strip(m.starsLabel||'Estrelles')}">${ombresStarsHtml()}</div></div><p class="ombres-head-hint">${strip(m.hint||'')}</p></div>`}
function ombresCelebrateHtml(){const m=ombresMissions(),tower=strip(m.celebrateTower||'imagenes/torre.webp');return `<div class="ombres-celebrate" role="region" aria-labelledby="ombres-celebrate-msg"><div class="ombres-celebrate-stars" aria-hidden="true">${ombresStarsHtml()}</div><p class="visually-hidden">${strip(m.completedTitle||'')}</p><p id="ombres-celebrate-msg" class="ombres-celebrate-msg">${strip(m.completedMsg||'')}</p><img class="ombres-celebrate-tower" src="${tower}" alt="La torre il·luminada" draggable="false"></div>`}
function ombresAdvanceMission(){jocs.ombres.usedTargets.push(jocs.ombres.targetId);if(jocs.ombres.stars>=3){jocs.ombres.phase='completed';return}jocs.ombres.missionIndex=Math.min(2,jocs.ombres.missionIndex+1);ombresStartMission();jocs.ombres.lx=42;jocs.ombres.ly=52}
function ensureOmbres(cb){
 if(jocs.ombres.data)return cb();
 if(jocs.ombres.load){jocs.ombres.load.then(cb);return}
 jocs.ombres.load=fetch(OMBRES_URL).then(r=>r.json()).then(d=>{jocs.ombres.data=d;cb()}).catch(()=>{notify('NO PUC CARREGAR LES OMBRES');cb()});
}
function jocsPairIds(){return JOCS_PARELLES.map(p=>p.id)}
function jocsPairMeta(id){return JOCS_PARELLES.find(p=>p.id===id)||null}
const jocs={count:{items:[],touched:new Set(),goal:0,picked:null},puzle:{order:[0,1,2,3],size:2,img:'pipa-portada.webp'},pocio:{data:null,load:null,sel:[],mixing:false,result:null},ombres:{data:null,load:null,lx:42,ly:52,found:new Set(),stars:0,missionIndex:0,phase:'searching',targetId:null,usedTargets:[],activeSecrets:[],distractorNotified:new Set(),starPop:false},diferencies:{data:null,load:null,activeIds:[],found:new Set(),stars:0,phase:'searching',starPop:false,lastMsg:''}}
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
function jocsLupaMenuScene(){return f2Scene('LA LUPA MÀGICA','<div class="jocs-menu">'+[['jocs-lupa-ombres','🔦 LES OMBRES TRAPELLES'],['jocs-lupa-diferencies','🔍 TROBA LES DIFERÈNCIES']].map(([a,t])=>`<button type="button" class="f2-btn jocs-menu-btn" data-action="${a}">${t}</button>`).join('')+'</div>','<p>TRIA UNA AVENTURA DE LA TORRE!</p>',f2btn('← TORNA A LA TORRE','end-jocs-lupa'),'torre','jocs-lupa')}
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
function resetOmbres(){ombresClearAuto();const {data,load}=jocs.ombres;if(jocs.ombres.targetId)ombresLastTargetId=jocs.ombres.targetId;jocs.ombres={data,load,lx:42,ly:52,found:new Set(),stars:0,missionIndex:0,phase:'searching',targetId:null,usedTargets:[],activeSecrets:[],distractorNotified:new Set(),starPop:false};if(data)ombresStartMission()}
function difCfg(){return jocs.diferencies.data||{}}
function difAll(){return difCfg().scene?.diffs||[]}
function difById(id){return difAll().find(d=>d.id===id)}
function difPickActive(){const all=difAll(),n=difCfg().perRound||3;return jocsShuffle(all).slice(0,Math.min(n,all.length)).map(d=>d.id)}
function resetDiferencies(){const {data,load}=jocs.diferencies;jocs.diferencies={data,load,activeIds:difPickActive(),found:new Set(),stars:0,phase:'searching',starPop:false,lastMsg:''}}
function ensureDiferencies(cb){if(jocs.diferencies.data)return cb();if(jocs.diferencies.load){jocs.diferencies.load.then(cb);return}jocs.diferencies.load=fetch(DIFERENCIES_URL).then(r=>r.json()).then(d=>{jocs.diferencies.data=d;cb()}).catch(()=>{notify('NO PUC CARREGAR LES DIFERÈNCIES');cb()})}
function difStarsHtml(){const n=jocs.diferencies.stars,pop=jocs.diferencies.starPop;return [0,1,2].map(i=>`<span class="ombres-star ${i<n?'ombres-star--on':''} ${i===n-1&&pop?'ombres-star--pop':''}" aria-hidden="true"><svg class="ombres-star-svg" viewBox="0 0 64 64"><path d="M32 5 39 25 61 27 45 42 51 63 32 52 13 63 19 42 3 27 25 25Z"/></svg></span>`).join('')}
function difHeadHtml(){const cfg=difCfg();if(jocs.diferencies.phase==='completed')return'';const msg=jocs.diferencies.lastMsg?`<p class="dif-found-msg">${strip(jocs.diferencies.lastMsg)}</p>`:'';return `<div class="dif-head"><div class="ombres-stars" aria-label="${strip(cfg.starsLabel||'Estrelles')}">${difStarsHtml()}</div>${msg}<p class="ombres-head-hint">${strip(cfg.hint||'')}</p></div>`}
function difOverlayStyle(d){return `left:${d.x}%;top:${d.y}%;width:${d.w}%;transform:translate(-50%,-50%)`}
function difMarkHtml(d){return `<span class="dif-mark" style="${difOverlayStyle(d)}" aria-hidden="true"></span>`}
function difPanelHtml(side,base,overlays){const marks=overlays.filter(d=>jocs.diferencies.found.has(d.id)).map(difMarkHtml).join('');const extra=side==='right'?overlays.filter(d=>!jocs.diferencies.found.has(d.id)).map(d=>`<img class="dif-overlay" src="${strip(d.img)}" alt="" draggable="false" style="${difOverlayStyle(d)}">`).join(''):'';return `<button type="button" class="dif-panel" data-dif-panel="${side}" aria-label="${side==='left'?'Quadre esquer':'Quadre dret'}"><img class="dif-base" src="${strip(base)}" alt="" draggable="false">${extra}${marks}</button>`}
function difCelebrateHtml(){const cfg=difCfg();return `<div class="dif-celebrate"><div class="ombres-celebrate-stars" aria-hidden="true">${difStarsHtml()}</div><p class="ombres-celebrate-msg">${strip(cfg.completedMsg||'')}</p><img class="dif-celebrate-art" src="${strip(cfg.scene?.base||'')}" alt="" draggable="false"></div>`}
function difDist(px,py,d){return Math.hypot(px-d.x,py-d.y)}
function difTryTap(clientX,clientY,panel){const r=panel.getBoundingClientRect();const x=(clientX-r.left)/r.width*100,y=(clientY-r.top)/r.height*100;const active=jocs.diferencies.activeIds.map(difById).filter(Boolean).filter(d=>!jocs.diferencies.found.has(d.id));for(const d of active){if(difDist(x,y,d)<=d.r){jocs.diferencies.found.add(d.id);jocs.diferencies.stars=Math.min(3,jocs.diferencies.stars+1);jocs.diferencies.starPop=true;jocs.diferencies.lastMsg=d.message||'';if(jocs.diferencies.stars>=3)jocs.diferencies.phase='completed';return true}}return false}
function jocsDiferenciesScene(){const cfg=difCfg();if(!jocs.diferencies.data){ensureDiferencies(()=>{if(state.place==='jocsDiferencies')render()});return f2Scene(strip(cfg.title||'TROBA LES DIFERÈNCIES'),'<p class="conte-wait">CARREGANT...</p>','',f2back(),'torre','jocs-diferencies')}if(!jocs.diferencies.activeIds.length)resetDiferencies();const base=cfg.scene?.base||'',overlays=jocs.diferencies.activeIds.map(difById).filter(Boolean),completed=jocs.diferencies.phase==='completed';const stage=completed?difCelebrateHtml():`<div class="dif-stage">${difPanelHtml('left',base,overlays)}${difPanelHtml('right',base,overlays)}</div>`;const actions=completed?f2btn('↻ TORNA A JUGAR','dif-replay')+f2btn('✨ TORNA A LA TORRE','end-jocs-diferencies'):f2btn('↩ TORNAR A LA TORRE','end-jocs-diferencies');return f2Scene(strip(cfg.title||'TROBA LES DIFERÈNCIES'),stage,completed?`<p>${strip(cfg.completedTitle||'')}</p>`:difHeadHtml(),actions,'torre','jocs-diferencies')}
function ombresDist(s){const dx=s.x-jocs.ombres.lx,dy=s.y-jocs.ombres.ly;return Math.hypot(dx,dy)}
function ombresLight(s,prev){if(jocs.ombres.found.has(s.id))return'lit';const d=ombresDist(s),r=s.r,p=prev||'dim';if(d<=r)return'lit';if(p==='peek'){if(d<=r*1.7)return'peek';return'dim'}if(d<=r*1.35)return'peek';return'dim'}
function ombresFigBody(s){return `<img class="ombres-silueta" src="${strip(s.img)}" alt="" decoding="async" draggable="false">`}
function ombresFigCap(s,st){return st==='lit'?strip(s.reveal||''):st==='peek'?strip(s.peek||''):''}
function ombresFigHtml(s){const st=ombresLight(s);return `<figure data-ombres-id="${strip(s.id)}" data-ombres-st="${st}" class="ombres-fig ombres-fig--${st} ombres-fig--sway" style="left:${s.x}%;top:${s.y}%;--sway:${s.sway||4}s">${ombresFigBody(s)}<figcaption>${ombresFigCap(s,st)}</figcaption></figure>`}
function ombresPaintFoot(){}
function ombresPaintLight(){const wall=app.querySelector('[data-ombres-wall]');if(!wall)return;wall.style.setProperty('--lx',jocs.ombres.lx+'%');wall.style.setProperty('--ly',jocs.ombres.ly+'%');const w=wall.clientWidth,h=wall.clientHeight,anchor=wall.querySelector('[data-ombres-anchor]');if(anchor&&w&&h)anchor.style.transform=`translate3d(${jocs.ombres.lx/100*w}px,${jocs.ombres.ly/100*h}px,0)`;ombresSecrets().forEach(s=>{const el=wall.querySelector(`[data-ombres-id="${s.id}"]`);if(!el)return;const prev=el.getAttribute('data-ombres-st')||'dim',st=ombresLight(s,prev);if(st!==prev){el.className=`ombres-fig ombres-fig--${st} ombres-fig--sway`;el.setAttribute('data-ombres-st',st)}const cap=el.querySelector('figcaption');if(cap)cap.textContent=ombresFigCap(s,st)})}
function ombresBack(cfg){const w=cfg.wall?`<img class="ombres-brick-art" src="${strip(cfg.wall)}" alt="" draggable="false">`:'';return `<div class="ombres-back">${OMBRES_BRICKS}${w}</div>`}
function ombresTryFind(){if(jocs.ombres.phase!=='searching')return false;const list=ombresSecrets(),tid=jocs.ombres.targetId;let hit=false;list.forEach(s=>{if(ombresDist(s)>s.r)return;if(s.id===tid){if(jocs.ombres.found.has(s.id))return;jocs.ombres.found.add(s.id);jocs.ombres.stars=Math.min(3,jocs.ombres.stars+1);jocs.ombres.starPop=true;jocs.ombres.phase='found';hit=true}else jocs.ombres.found.add(s.id)});if(hit)ombresScheduleAdvance();return hit}
function ombresReveal(){if(ombresTryFind())render();else ombresPaintLight()}
function ombresMove(clientX,clientY){const wall=app.querySelector('[data-ombres-wall]');if(!wall)return;const r=wall.getBoundingClientRect();jocs.ombres.lx=Math.max(3,Math.min(97,(clientX-r.left)/r.width*100));jocs.ombres.ly=Math.max(3,Math.min(97,(clientY-r.top)/r.height*100));if(ombresTryFind())render();else ombresPaintLight()}
function ombresLupa(cfg){const src=cfg.lupa?`<img class="ombres-lupa-art" src="${strip(cfg.lupa)}" alt="" draggable="false">`:'';return `${src}<span class="ombres-lantern" aria-hidden="true"></span>`}
function ombresF2Scene(headHTML,stageHTML,footHTML,actions){return `<div class="f2-scene f2-scene--ombres" style="background:#07040f">${topbar(state.place)}<div class="f2-window f2-window--ombres"><h2 class="ombres-title">LES OMBRES TRAPELLES</h2>${headHTML}<div class="f2-illustrated f2-illustrated--ombres">${stageHTML}</div><div class="f2-story f2-story--ombres">${footHTML}</div><div class="f2-actions f2-actions--ombres">${actions}</div></div></div>`}
function jocsOmbresScene(){
 const cfg=ombresCfg(),m=ombresMissions();
 if(!jocs.ombres.data){ensureOmbres(()=>{if(state.place==='jocsOmbres')render()});return ombresF2Scene('','<p class="conte-wait">CARREGANT...</p>','',f2back())}
 if(!jocs.ombres.activeSecrets.length)ombresStartMission();
 const list=ombresSecrets(),completed=jocs.ombres.phase==='completed',found=jocs.ombres.phase==='found';
 const stage=completed?ombresCelebrateHtml():(()=>{const figs=list.map(ombresFigHtml).join('');const lightCore=`<div class="ombres-glow"></div><div class="ombres-sparkles">${[0,1,2,3,4].map(i=>`<span style="--mi:${i}"></span>`).join('')}</div>${ombresLupa(cfg)}`;return `<div class="ombres-wall" data-ombres-wall style="--lx:${jocs.ombres.lx}%;--ly:${jocs.ombres.ly}%">${ombresBack(cfg)}<div class="ombres-screen">${figs}</div><div class="ombres-veil-base" aria-hidden="true"></div><div class="ombres-light-anchor" data-ombres-anchor aria-hidden="true">${lightCore}</div><div class="ombres-curtain ombres-curtain--l" aria-hidden="true"></div><div class="ombres-curtain ombres-curtain--r" aria-hidden="true"></div></div>`})();
 const footMsg='';
 const head=ombresHeadHtml();
 let actions='';
 if(completed)actions=f2btn('↻ TORNA A JUGAR','ombres-replay-session')+f2btn('✨ TORNA A LA TORRE','end-jocs-ombres');
 else actions=f2btn('↩ TORNAR A LA TORRE','end-jocs-ombres');
 return ombresF2Scene(head,stage,footMsg,actions);
}
Object.assign(SCENES,{jocs:jocsMenuScene,jocsCount:jocsCountScene,jocsPuzle:jocsPuzleScene,jocsPocio:jocsPocioScene,jocsOmbres:jocsOmbresScene,jocsLupa:jocsLupaMenuScene,jocsDiferencies:jocsDiferenciesScene});
const hotspotJocs=hotspot;
hotspot=function(id){if(state.place==='workshop'&&id==='search'){go('jocs');return}if(state.place==='tower'&&id==='lupa'){go('jocsLupa');return}return hotspotJocs(id)};
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
case'end-jocs-ombres':ombresClearAuto();if(jocs.ombres.stars>=3){notify(strip(ombresMissions().completedTitle||'TRES ESTRELLES!'));remember('jocs-ombres')}nav('tower');return;
case'ombres-next-mission':ombresClearAuto();jocs.ombres.starPop=false;ombresAdvanceMission();render();return;
case'ombres-complete-session':ombresClearAuto();jocs.ombres.phase='completed';render();return;
case'ombres-replay-session':resetOmbres();render();return;
case'reset-jocs-ombres':resetOmbres();render();return;
case'jocs-lupa-ombres':resetOmbres();ensureOmbres(()=>go('jocsOmbres'));return;
case'jocs-lupa-diferencies':ensureDiferencies(()=>{resetDiferencies();go('jocsDiferencies')});return;
case'end-jocs-lupa':nav('tower');return;
case'end-jocs-diferencies':if(jocs.diferencies.stars>=3){notify(strip(difCfg().completedTitle||'TRES DIFERÈNCIES!'));remember('jocs-diferencies')}nav('tower');return;
case'dif-replay':resetDiferencies();render();return;
}return actionJocs(id)};
const renderJocs=render;
render=function(){renderJocs();jocsBind()};
let ombresRaf=0,ombresPtr=null;
function jocsBind(){app.querySelectorAll('[data-jocs-count]').forEach(el=>el.addEventListener('click',()=>{jocs.count.touched.add(Number(el.dataset.jocsCount));render()}));app.querySelectorAll('[data-jocs-pick]').forEach(el=>el.addEventListener('click',()=>{if(jocs.count.touched.size<jocs.count.goal){notify('PRIMER TOCA TOTS ELS OBJECTES!');return}jocs.count.picked=Number(el.dataset.jocsPick);render()}));app.querySelectorAll('[data-jocs-puz]').forEach(el=>el.addEventListener('click',()=>jocsPuzleTap(Number(el.dataset.jocsPuz))));app.querySelectorAll('[data-pocio-ing]').forEach(el=>el.addEventListener('click',()=>pocioPick(el.dataset.pocioIng)));const wall=app.querySelector('[data-ombres-wall]');if(wall&&!wall.dataset.ombresBound){wall.dataset.ombresBound='1';const flush=()=>{ombresRaf=0;if(ombresPtr){ombresMove(ombresPtr[0],ombresPtr[1]);ombresPtr=null}};const mv=e=>{if(e.pointerType==='mouse'&&e.buttons===0)return;ombresPtr=[e.clientX,e.clientY];if(!ombresRaf)ombresRaf=requestAnimationFrame(flush)};const dragOff=()=>wall.classList.remove('ombres-wall--drag');wall.addEventListener('pointerdown',e=>{wall.classList.add('ombres-wall--drag');wall.setPointerCapture(e.pointerId);ombresMove(e.clientX,e.clientY)});wall.addEventListener('pointermove',mv);wall.addEventListener('pointerup',dragOff);wall.addEventListener('pointercancel',dragOff);ombresPaintLight();if(jocs.ombres.starPop)setTimeout(()=>{jocs.ombres.starPop=false;const el=app.querySelector('.ombres-star--pop');if(el)el.classList.remove('ombres-star--pop')},700)}
app.querySelectorAll('[data-dif-panel]').forEach(el=>{if(el.dataset.difBound)return;el.dataset.difBound='1';el.addEventListener('pointerdown',e=>{if(jocs.diferencies.phase!=='searching')return;if(difTryTap(e.clientX,e.clientY,el)){notify(strip(jocs.diferencies.lastMsg||'BÉ!'));render();if(jocs.diferencies.starPop)setTimeout(()=>{jocs.diferencies.starPop=false;render()},700)}})})}