'use strict';
/* Etapa 3d — registre de missions LA GRAN AVENTURA (sense UI). */
const MISSIONS_URL='data/gran-aventura-missions-v1.json';
const MISSIONS_REG_V=1;
const missionsCatalog={list:null,ready:false,failed:false};
function missionsNormalizeId(id){return String(id||'').trim()}
function missionsLoadCatalog(cb){if(missionsCatalog.list)return cb(missionsCatalog.list);if(missionsCatalog.failed)return cb(null);if(typeof fetch!=='function'){missionsCatalog.failed=true;return cb(null)}fetch(MISSIONS_URL).then(r=>r.json()).then(d=>{missionsCatalog.list=Array.isArray(d?.missions)?d.missions:[];missionsCatalog.ready=true;cb(missionsCatalog.list)}).catch(()=>{missionsCatalog.failed=true;cb(null)})}
function missionsById(id){const mid=missionsNormalizeId(id);return(missionsCatalog.list||[]).find(m=>m.id===mid)||null}
function missioDefinicio(id){
  const direct=missionsById(id);
  if(direct)return{registreId:missionsNormalizeId(id),def:direct,plantillaId:direct.id};
  if(typeof granAventuraMissioInstancia==='function'){const g=granAventuraMissioInstancia(id);if(g&&g.def)return{registreId:g.registreId,def:g.def,plantillaId:g.plantillaId,instanciaId:g.instanciaId}}
  return null
}
function missioRegistreLoad(){const p=typeof progresLoad==='function'?progresLoad():{missions:{registre:{}}};const r=p.missions?.registre;return r&&typeof r==='object'&&!Array.isArray(r)?{...r}:{}}
function missioRegistreSave(reg){if(typeof progresLoad!=='function'||typeof progresSave!=='function')return false;const p=progresLoad();p.missions=p.missions||{v:MISSIONS_REG_V,registre:{}};p.missions.v=MISSIONS_REG_V;p.missions.registre={...reg};return progresSave(p)}
function missioEntradaBuida(){return{estat:'pendent',completacions:[],sessioActiva:null,recompensaClaimed:false}}
function missioGetEntrada(reg,mid){return reg[mid]||missioEntradaBuida()}
function missioAbracaAltres(reg,exceptMid){Object.keys(reg).forEach(k=>{if(k===exceptMid)return;const e=reg[k];if(e&&e.estat==='en_curs'){e.estat='pendent';e.sessioActiva=null;reg[k]=e}})}
function missioIdEnCurs(reg){const ids=Object.keys(reg).filter(k=>reg[k]?.estat==='en_curs');return ids.length===1?ids[0]:ids.length?ids[0]:null}
function missioInicia(missioId,sessionId){
  const pack=missioDefinicio(missioId);
  if(!pack||!sessionId)return{ok:false,reason:'missio'};
  const rid=pack.registreId;
  const reg=missioRegistreLoad();
  const e=missioGetEntrada(reg,rid);
  if(e.estat==='completada')return{ok:false,reason:'ja_completada'};
  if(pack.instanciaId&&typeof granAventuraPotIniciarInstancia==='function'){const g=granAventuraPotIniciarInstancia(pack.instanciaId);if(!g.ok)return g}
  missioAbracaAltres(reg,rid);
  e.estat='en_curs';e.sessioActiva=sessionId;reg[rid]=e;
  return missioRegistreSave(reg)?{ok:true,registreId:rid}:{ok:false,reason:'escriptura'}
}
function missioAbandona(missioId){
  const pack=missioDefinicio(missioId);
  if(!pack)return{ok:false,reason:'missio'};
  const rid=pack.registreId;
  const reg=missioRegistreLoad();
  const e=missioGetEntrada(reg,rid);
  if(e.estat!=='en_curs')return{ok:false,reason:'estat'};
  e.estat='pendent';e.sessioActiva=null;reg[rid]=e;
  return missioRegistreSave(reg)?{ok:true}:{ok:false,reason:'escriptura'}
}
function missioValidaCompletada(missioId,activitatId,detail){
  const pack=missioDefinicio(missioId);
  if(!pack)return{ok:false,reason:'desconeguda'};
  const def=pack.def;
  if(def.activitatId!==activitatId)return{ok:false,reason:'activitat'};
  if(detail?.mode!=='missio')return{ok:false,reason:'lliure'};
  if(def.modeRequerit&&detail.mode!==def.modeRequerit)return{ok:false,reason:'mode'};
  return{ok:true,def,pack}
}
function missioActivitatCompleta(missioId,activitatId,detail){
  const v=missioValidaCompletada(missioId,activitatId,detail);
  if(!v.ok)return v;
  const pack=v.pack;
  const rid=pack.registreId;
  const sid=detail?.sessionId;
  if(!sid)return{ok:false,reason:'sessio'};
  const reg=missioRegistreLoad();
  const e=missioGetEntrada(reg,rid);
  if(e.estat!=='en_curs')return{ok:false,reason:'no_activa'};
  const actiu=missioIdEnCurs(reg);
  if(actiu&&actiu!==rid)return{ok:false,reason:'altra_activa'};
  if(e.estat==='completada'||e.completacions.some(c=>c.sessionId===sid))return{ok:false,reason:'duplicat'};
  if(e.sessioActiva&&e.sessioActiva!==sid)return{ok:false,reason:'sessio_activa'};
  e.estat='completada';e.sessioActiva=null;e.completacions=[...e.completacions,{sessionId:sid,activitatId,ts:Date.now()}];
  reg[rid]=e;
  if(!missioRegistreSave(reg))return{ok:false,reason:'escriptura'};
  if(pack.instanciaId&&typeof granAventuraOnMissioCompletada==='function')granAventuraOnMissioCompletada(rid);
  return{ok:true,registreId:rid}
}
function missioEsCompletada(missioId){
  const pack=missioDefinicio(missioId);
  if(!pack)return false;
  const e=missioGetEntrada(missioRegistreLoad(),pack.registreId);
  return e.estat==='completada'
}
function missioContextLliure(mode){return mode!=='missio'}