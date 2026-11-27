'use strict';
/* Etapa 5b — LA GRAN AVENTURA (hub visual, primer dia). */
const gaUi={cartaSlot:null,ready:false,err:false};
const GA_STAR='<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M32 2 37 22 52 12 42 27 62 32 42 37 52 52 37 42 32 62 27 42 12 52 22 37 2 32 22 27 12 12 27 22Z"/></svg>';

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
  f2.granMissio={instanciaId,missioId:instanciaId,activitatId:def?.activitatId||null,sessionId:sid};
  gaUi.cartaSlot=null;
  const act=def?.activitatId;
  if(act==='cartes'){
    ensurePersonatges(()=>{
      jocsCartesEnsureAdventure();
      f2.pairsLevel=0;
      setupPairs();
      f2.matched=[];
      go('pairs');
    });
    return;
  }
  if(act==='ombres'){
    ensureOmbres(()=>{ombresStartLevel(0);go('jocsOmbres')});
    return;
  }
  if(act==='diferencies'){
    ensureDiferencies(()=>{
      if(typeof difDiferenciesStartMission==='function')difDiferenciesStartMission({missioId:instanciaId,sceneId:'biblioteca',roundsGoal:1,returnPlace:'granAventura'});
      resetDiferencies();
      go('jocsDiferencies');
    });
    return;
  }
  granAventuraUiAbandonMissio();
  notify('MISSIÓ DESCONEGUDA.');
}

function granAventuraUiSobreHtml(av,slot,idx,done){
  const em=granAventuraUiEmissorMeta(slot.emissorId);
  const star=done?`<span class="ga-sobre-star">${GA_STAR}</span>`:`<span class="ga-sobre-star off">${GA_STAR}</span>`;
  const img=em.img?`<img src="${strip(em.img)}" alt="" draggable="false">`:'✉️';
  const dis=done?' disabled':'';
  const tag=granAventuraUiActivitatLabel(slot.plantillaMissioId);
  return `<button type="button" class="ga-sobre" data-ga-sobre="${strip(slot.instanciaId)}" aria-label="Sobre de ${strip(em.label)}"${dis}><div class="ga-sobre-env">${img}${star}</div><strong>${strip(String(em.label||'').toUpperCase())}</strong><small>${tag}</small></button>`;
}

function granAventuraUiFestaHtml(av,slots){
  const heroes=slots.map(s=>{const em=granAventuraUiEmissorMeta(s.emissorId);return em.img?`<figure><img src="${strip(em.img)}" alt="" draggable="false"><figcaption>${strip(String(em.label||'').toUpperCase())}</figcaption></figure>`:''}).join('');
  const stars=`<div class="ga-festa-stars" aria-hidden="true">${[0,1,2].map(()=>`<span class="ga-sobre-star">${GA_STAR}</span>`).join('')}</div>`;
  return `<div class="ga-festa" role="region" aria-labelledby="ga-festa-title"><p id="ga-festa-title" class="ga-carta-text">GRÀCIES, AMIGA!\nHAS COMPLETAT LA GRAN AVENTURA!</p>${stars}<div class="ga-festa-hero">${heroes}</div></div>`;
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
  const av=granAventuraUiAventuraActiva();
  if(!av||!granAventuraDiaPreparat(av)){
    return f2Scene('LA GRAN AVENTURA','<p class="ga-wait">AVIAT HI HAURÀ MÉS AVENTURES!</p>','<small>ESTEM PREPARANT LES SEGÜENTS CARTES.</small>',f2btn('🗺️ EXPLORA LLIUREMENT','map-go')+f2back(),'mapa','f2-gran-aventura');
  }
  const {st}=granAventuraUiClauEstat(av);
  const slots=av.slots||[];
  const completada=st.slots.every(Boolean);
  const cartaOpen=!completada&&!!gaUi.cartaSlot;
  const body=completada?granAventuraUiFestaHtml(av,slots):`<div class="ga-hub"><p class="ga-hub-titol">${strip(av.titol||'AVENTURA')}</p><div class="ga-sobres">${slots.map((s,i)=>granAventuraUiSobreHtml(av,s,i,st.slots[i])).join('')}</div><p class="ga-hub-hint">OBRE CADA SOBRE QUAN VULGUIS. L'ORDRE ÉS LLIURE!</p></div>`;
  const cap=completada?'<p>UNA ESTRELA DAURADA PER CADA MISSIÓ!</p>':"<p>TRES AMICS T'ESPEREN!</p>";
  const explora=`<button type="button" class="f2-btn f2-btn--ga-map" data-action="map-go">🗺️ EXPLORA LLIUREMENT</button>`;
  const cls='f2-gran-aventura'+(cartaOpen?' f2-gran-aventura--carta':'');
  return f2Scene('LA GRAN AVENTURA',body,`${cap}<small>EXPLORA EL MAPA QUAN VULGUIS.</small>`,explora+f2back(),'mapa',cls);
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