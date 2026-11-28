'use strict';
/* Etapa 5b — LA GRAN AVENTURA (hub visual, primer dia). */
const gaUi={cartaSlot:null,ready:false,err:false};
const GA_STAR='<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M32 2 37 22 52 12 42 27 62 32 42 37 52 52 37 42 32 62 27 42 12 52 22 37 2 32 22 27 12 12 27 22Z"/></svg>';

function granAventuraUiAventuraHub(){
  const bloc=typeof granAventuraBloc==='function'?granAventuraBloc():{};
  if(bloc.aventuraActiva){const av=typeof granAventuraById==='function'?granAventuraById(bloc.aventuraActiva):null;if(av)return av}
  const dies=typeof granAventuraDies==='function'?granAventuraDies():[];
  for(const av of dies){
    if(typeof granAventuraDiaPreparat==='function'&&!granAventuraDiaPreparat(av))continue;
    const clau=typeof granAventuraClau==='function'?granAventuraClau(av.id,bloc.lap):'';
    const st=typeof granAventuraAventuraEstat==='function'?granAventuraAventuraEstat(clau):{estat:'pendent',slots:[]};
    if(st.estat==='en_curs'||st.estat==='completada')return av;
  }
  return granAventuraUiAventuraActiva();
}
function gaDiaProgres(avOpt,stOpt){
  const gm=f2.granMissio;
  let av=avOpt;
  if(!av&&gm?.aventuraId&&typeof granAventuraById==='function')av=granAventuraById(gm.aventuraId);
  if(!av)av=granAventuraUiAventuraHub();
  const total=Math.max(1,av?.slots?.length||3);
  let slots=stOpt?.slots;
  if(!slots&&av)slots=granAventuraUiClauEstat(av).st.slots;
  if(!Array.isArray(slots))slots=[];
  let done=0;
  for(let i=0;i<total;i++)if(slots[i])done++;
  if(gm?.instanciaId&&av?.slots){
    const idx=av.slots.findIndex(s=>s?.instanciaId===gm.instanciaId);
    if(idx>=0&&!slots[idx])done=Math.min(total,done+1);
  }
  return{total,done,aventuraId:av?.id||null};
}
function gaDiaProgresStarsHtml(done,total,pop){
  const n=Math.max(1,Math.floor(total)||3);
  const lit=Math.min(n,Math.max(0,Math.floor(done)||0));
  const popIdx=pop&&lit>0?lit-1:-1;
  return Array.from({length:n},(_,i)=>`<span class="ombres-star ga-dia-star ${i<lit?'ombres-star--on':''} ${i===popIdx?'ombres-star--pop':''}" aria-hidden="true"><svg class="ombres-star-svg" viewBox="0 0 64 64"><path d="M32 5 39 25 61 27 45 42 51 63 32 52 13 63 19 42 3 27 25 25Z"/></svg></span>`).join('');
}
function gaMissioVictoryHtml(subtitle){
  const sub=strip(String(subtitle||'MOLT BÉ!').toUpperCase());
  const prog=gaDiaProgres();
  const stars=`<div class="ga-dia-progres-stars" aria-label="${prog.done} de ${prog.total} missions de l'aventura">${gaDiaProgresStarsHtml(prog.done,prog.total,true)}</div>`;
  const btn=typeof ombresLevelBtn==='function'?ombresLevelBtn('TORNA A L\'AVENTURA','ga-return-hub','primary'):'';
  return `<div class="ga-missio-victoria" role="region" aria-labelledby="ga-missio-title"><div class="ga-missio-victoria-card cartes-party-card cartes-party-card--gran-missio">${stars}<p id="ga-missio-title" class="cartes-party-title">MISSIÓ FETA!</p><p class="cartes-party-sub">${sub}</p><div class="cartes-party-btns ombres-level-btns"><div class="ombres-level-btns-primary">${btn}</div></div></div></div>`;
}

function granAventuraUiEmissorMeta(id){
  if(typeof jocsPairMeta==='function'){const m=jocsPairMeta(id);if(m)return m}
  return{id,label:String(id||'').toUpperCase(),img:''}
}

function granAventuraUiActivitatLabel(plantillaId){
  const def=typeof missionsById==='function'?missionsById(plantillaId):null;
  const map={cartes:'CARTES',ombres:'OMBRES',diferencies:'DIFERÈNCIES'};
  return map[def?.activitatId]||'MISSIÓ'
}

function granAventuraUiAventuraActiva(){
  const bloc=typeof granAventuraBloc==='function'?granAventuraBloc():{};
  let avId=bloc.aventuraActiva;
  if(!avId){
    const r=typeof granAventuraReprendre==='function'?granAventuraReprendre():{ok:false};
    if(r.ok&&r.aventuraId)avId=r.aventuraId;
  }
  if(!avId){
    const prep=typeof granAventuraProperaAventuraId==='function'?granAventuraProperaAventuraId():'ga-dia-001';
    if(prep&&typeof granAventuraInicia==='function')granAventuraInicia(prep);
    avId=prep||'ga-dia-001';
  }
  return typeof granAventuraById==='function'?granAventuraById(avId):null;
}

function granAventuraUiClauEstat(av){
  const bloc=typeof granAventuraBloc==='function'?granAventuraBloc():{};
  const clau=typeof granAventuraClau==='function'?granAventuraClau(av.id,bloc.lap):'';
  const st=typeof granAventuraAventuraEstat==='function'?granAventuraAventuraEstat(clau):{slots:[false,false,false]};
  return{clau,st,lap:bloc.lap};
}

function granAventuraUiClearMissio(){f2.granMissio=null}

function granAventuraUiCartaPortalClear(){document.getElementById('ga-carta-portal')?.remove()}

function granAventuraUiReturnHub(){
  granAventuraUiClearMissio();
  gaUi.cartaSlot=null;
  granAventuraUiCartaPortalClear();
  gaUi.ready=typeof granAventuraDies==='function'&&granAventuraDies().length>0;
  nav('granAventura');
}

function granAventuraUiAbandonMissio(){
  const gm=f2.granMissio;
  if(gm?.missioId&&typeof missioAbandona==='function')missioAbandona(gm.missioId);
  granAventuraUiClearMissio();
}

function granAventuraUiIniciaMissio(instanciaId){
  const can=typeof granAventuraPotIniciarInstancia==='function'?granAventuraPotIniciarInstancia(instanciaId):{ok:false};
  if(!can.ok)return notify('AQUEST SOBRE NO ESTÀ A PUNT ARA.');
  const meta=can.meta||granAventuraMissioInstancia(instanciaId);
  if(!meta)return;
  const def=typeof missionsById==='function'?missionsById(meta.plantillaId):meta.def;
  const sid=typeof activitatsSessionId==='function'?activitatsSessionId():`ga${Date.now().toString(36)}`;
  const ini=typeof missioInicia==='function'?missioInicia(instanciaId,sid):{ok:false};
  if(!ini.ok)return notify('NO PUC COMENÇAR LA MISSIÓ ARA.');
  f2.granMissio={instanciaId,missioId:instanciaId,activitatId:def?.activitatId||null,sessionId:sid,aventuraId:meta.aventuraId||null};
  gaUi.cartaSlot=null;
  const act=def?.activitatId;
  if(act==='cartes'){
    ensurePersonatges(()=>{
      jocsCartesEnsureAdventure();
      f2.pairsLevel=0;
      f2.flipped=[];
      f2.matched=[];
      f2.busy=false;
      f2.pairsAnim={};
      f2.match=[];
      setupPairs();
      f2.sessionId=sid;
      go('pairs');
    });
    return;
  }
  if(act==='ombres'){
    ensureOmbres(()=>{ombresStartLevel(0,sid);go('jocsOmbres')});
    return;
  }
  if(act==='diferencies'){
    ensureDiferencies(()=>{
      if(typeof difDiferenciesStartMission==='function')difDiferenciesStartMission({missioId:instanciaId,sceneId:'biblioteca',roundsGoal:1,returnPlace:'granAventura',sessionId:sid});
      resetDiferencies();
      jocs.diferencies.sessionId=sid;
      go('jocsDiferencies');
    });
    return;
  }
  granAventuraUiAbandonMissio();
  notify('MISSIÓ DESCONEGUDA.');
}

function gaHubMissioStarHtml(done){
  const on=done?' ombres-star--on':'';
  return `<span class="ga-sobre-missio-star ombres-star ga-dia-star${on}" aria-hidden="true"><svg class="ombres-star-svg" viewBox="0 0 64 64"><path d="M32 5 39 25 61 27 45 42 51 63 32 52 13 63 19 42 3 27 25 25Z"/></svg></span>`;
}
function granAventuraUiSobreHtml(av,slot,idx,done){
  const em=granAventuraUiEmissorMeta(slot.emissorId);
  const star=gaHubMissioStarHtml(!!done);
  const img=em.img?`<img class="ga-sobre-portrait" src="${strip(em.img)}" alt="" draggable="false">`:'<span class="ga-sobre-emoji" aria-hidden="true">✉️</span>';
  const name=strip(String(em.label||'').toUpperCase());
  const envCls=done?' ga-sobre-env--fet':'';
  const inner=`<div class="ga-sobre-col">${star}<div class="ga-sobre-env${envCls}">${img}</div><strong class="ga-sobre-nom">${name}</strong></div>`;
  if(done){
    return `<div class="ga-sobre ga-sobre--fet" role="status" aria-label="Missió feta: ${name}">${inner}</div>`;
  }
  return `<button type="button" class="ga-sobre" data-ga-sobre="${strip(slot.instanciaId)}" aria-label="Sobre de ${name}">${inner}</button>`;
}

function granAventuraUiFestaHtml(av,slots){
  const heroes=slots.map(s=>{const em=granAventuraUiEmissorMeta(s.emissorId);const name=strip(String(em.label||'').toUpperCase());return em.img?`<figure class="ga-festa-amic"><img src="${strip(em.img)}" alt="" draggable="false"><figcaption>${name}</figcaption></figure>`:''}).join('');
  const n=Math.max(1,slots.length||3);
  const stars=`<div class="ga-festa-stars ga-dia-progres-stars ga-dia-progres-stars--festa" aria-hidden="true">${gaDiaProgresStarsHtml(n,n,false)}</div>`;
  return `<div class="ga-festa" role="region" aria-labelledby="ga-festa-intro"><div class="ga-festa-panel cartes-party-card cartes-party-card--gran-missio"><p id="ga-festa-intro" class="ga-festa-line ga-festa-line--intro">GRÀCIES PER AJUDAR-NOS!</p>${stars}<div class="ga-festa-hero">${heroes}</div><p class="ga-festa-line ga-festa-line--tanc">HAS COMPLETAT LA GRAN AVENTURA!</p></div></div>`;
}

function granAventuraUiCartaHtml(slot){
  const em=granAventuraUiEmissorMeta(slot.emissorId);
  const txt=strip(String(slot.cartaText||'').toUpperCase());
  const img=em.img?`<img class="ga-carta-portrait" src="${strip(em.img)}" alt="" draggable="false">`:'';
  const lines=txt.split('\n').map(l=>`<span class="ga-carta-line">${l}</span>`).join('');
  return `<div class="ga-carta-mask" role="dialog" aria-modal="true" aria-labelledby="ga-carta-nom"><button type="button" class="ga-carta-fond" data-action="ga-carta-tanca" aria-label="Tancar la carta"></button><div class="ga-carta"><div class="ga-carta-scroll">${img}<p id="ga-carta-nom" class="ga-carta-nom">${strip(String(em.label||'').toUpperCase())}</p><div class="ga-carta-text">${lines}</div><div class="ga-carta-actions">${f2btn('✉️ T\'AJUDO!','ga-missio-start')}${f2btn('TANCA','ga-carta-tanca')}</div></div></div></div>`;
}

function granAventuraUiCartaPortalSync(){
  const id='ga-carta-portal';
  document.getElementById(id)?.remove();
  if(state.place!=='granAventura'||!gaUi.cartaSlot)return;
  const el=document.createElement('div');
  el.id=id;
  el.innerHTML=granAventuraUiCartaHtml(gaUi.cartaSlot);
  el.querySelectorAll('[data-action]').forEach(bt=>bt.addEventListener('click',()=>action(bt.dataset.action)));
  document.body.append(el);
}

function granAventuraHubScene(){
  if(gaUi.err)return f2Scene('LA GRAN AVENTURA','<p class="ga-wait">NO PUC CARREGAR LES AVENTURES.</p>','',f2btn('🗺️ EXPLORA LLIUREMENT','map-go')+f2back(),'mapa','f2-gran-aventura');
  if(!gaUi.ready)return f2Scene('LA GRAN AVENTURA','<p class="ga-wait">CARREGANT...</p>','',f2back(),'mapa','f2-gran-aventura');
  const av=granAventuraUiAventuraHub();
  if(!av||!granAventuraDiaPreparat(av)){
    return f2Scene('LA GRAN AVENTURA','<p class="ga-wait">AVIAT HI HAURÀ MÉS AVENTURES!</p>','<small>ESTEM PREPARANT LES SEGÜENTS CARTES.</small>',f2btn('🗺️ EXPLORA LLIUREMENT','map-go')+f2back(),'mapa','f2-gran-aventura');
  }
  const {st}=granAventuraUiClauEstat(av);
  const slots=av.slots||[];
  const prog=gaDiaProgres(av,st);
  const completada=prog.done>=prog.total&&prog.total>0;
  const cartaOpen=!completada&&!!gaUi.cartaSlot;
  const body=completada?granAventuraUiFestaHtml(av,slots):`<div class="ga-hub"><p class="ga-hub-titol">${strip(av.titol||'AVENTURA')}</p><div class="ga-sobres">${slots.map((s,i)=>granAventuraUiSobreHtml(av,s,i,!!st.slots[i])).join('')}</div><p class="ga-hub-hint">OBRE CADA SOBRE QUAN VULGUIS!</p></div>`;
  const pendent=prog.total-prog.done;
  const cap=completada?'':pendent?`<p>${pendent} MISSI${pendent===1?'Ó':'ONS'} PENDENT${pendent===1?'':'S'}!</p>`:"<p>TRES AMICS T'ESPEREN!</p>";
  const explora=`<button type="button" class="f2-btn f2-btn--ga-map" data-action="map-go">🗺️ EXPLORA LLIUREMENT</button>`;
  let actions=explora+f2back();
  if(completada){
    const nova=typeof ombresLevelBtn==='function'?ombresLevelBtn('NOVA AVENTURA','ga-nova-aventura','primary'):'';
    actions=`<div class="ga-festa-btns ombres-level-btns"><div class="ombres-level-btns-primary">${nova}</div></div>`+actions;
  }
  const cls='f2-gran-aventura'+(cartaOpen?' f2-gran-aventura--carta':'');
  return f2Scene('LA GRAN AVENTURA',body,cap,actions,'mapa',cls);
}

function granAventuraUiEnsure(cb){
  const after=()=>{
    if(typeof ensurePersonatges==='function')ensurePersonatges(()=>{gaUi.ready=true;cb?.()});else{gaUi.ready=true;cb?.()}
  };
  if(typeof missionsLoadCatalog==='function'&&!missionsCatalog.list){
    missionsLoadCatalog(()=>granAventuraLoad(list=>{if(!list){gaUi.err=true;cb?.();return}after()}));
    return;
  }
  granAventuraLoad(list=>{if(!list){gaUi.err=true;cb?.();return}after()});
}

function granAventuraUiOpen(instanciaId){
  const av=granAventuraUiAventuraActiva();
  if(!av)return;
  const slot=av.slots?.find(s=>s.instanciaId===instanciaId);
  if(!slot)return;
  const {st}=granAventuraUiClauEstat(av);
  const idx=av.slots.findIndex(s=>s.instanciaId===instanciaId);
  if(st.slots[idx])return;
  gaUi.cartaSlot=slot;
  render();
}

const actionGaUi=action;
action=function(id){
  switch(id){
    case'open-gran-aventura':gaUi.cartaSlot=null;granAventuraUiCartaPortalClear();granAventuraUiEnsure(()=>go('granAventura'));return;
    case'open-quest':goF2('quest');return;
    case'ga-missio-start':if(gaUi.cartaSlot)granAventuraUiIniciaMissio(gaUi.cartaSlot.instanciaId);return;
    case'ga-carta-tanca':gaUi.cartaSlot=null;granAventuraUiCartaPortalClear();render();return;
    case'ga-return-hub':granAventuraUiReturnHub();return;
    case'ga-nova-aventura':gaUi.cartaSlot=null;granAventuraUiCartaPortalClear();granAventuraUiClearMissio();{const r=typeof granAventuraNovaLap==='function'?granAventuraNovaLap():{ok:false};if(!r.ok){notify('NO PUC COMENÇAR UNA NOVA AVENTURA ARA.');return}render();return}
    case'map-go':gaUi.cartaSlot=null;granAventuraUiCartaPortalClear();nav('map');return;
  }
  return actionGaUi(id);
};

Object.assign(SCENES,{granAventura:granAventuraHubScene});

const renderGaUi=render;
render=function(){
  const out=renderGaUi();
  if(state.place==='granAventura')granAventuraUiCartaPortalSync();
  else granAventuraUiCartaPortalClear();
  app.querySelectorAll('[data-ga-sobre]').forEach(el=>{
    if(el.dataset.gaBound)return;
    el.dataset.gaBound='1';
    el.addEventListener('click',()=>granAventuraUiOpen(el.dataset.gaSobre));
  });
  return out;
};