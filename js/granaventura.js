'use strict';
/* Etapa 5a — motor d’instàncies LA GRAN AVENTURA (sense UI). */
const GRAN_AVENTURA_DIES_URL='data/gran-aventura-dies-v1.json';
const GRAN_AVENTURA_V=1;
const granAventuraCat={list:null,ready:false,failed:false};

function granAventuraNormalizeId(id){return String(id||'').trim()}
function granAventuraLoad(cb){if(granAventuraCat.list)return cb(granAventuraCat.list);if(granAventuraCat.failed)return cb(null);if(typeof fetch!=='function'){granAventuraCat.failed=true;return cb(null)}fetch(GRAN_AVENTURA_DIES_URL).then(r=>r.json()).then(d=>{granAventuraCat.list=Array.isArray(d?.aventures)?d.aventures:[];granAventuraCat.ready=true;cb(granAventuraCat.list)}).catch(()=>{granAventuraCat.failed=true;cb(null)})}
function granAventuraDies(){return granAventuraCat.list||[]}
function granAventuraById(avId){const id=granAventuraNormalizeId(avId);return granAventuraDies().find(a=>a.id===id)||null}
function granAventuraInstanciaSlot(instanciaId){
  const iid=granAventuraNormalizeId(instanciaId);
  for(const av of granAventuraDies()){const slots=av.slots||[];const idx=slots.findIndex(s=>s?.instanciaId===iid);if(idx>=0)return{aventura:av,slot:slots[idx],slotIndex:idx}}
  return null
}
function granAventuraClau(aventuraId,lap){return`${granAventuraNormalizeId(aventuraId)}~L${Math.max(1,Math.floor(lap)||1)}`}
function granAventuraParseClau(clau){const m=String(clau||'').match(/^(.+)~L(\d+)$/);return m?{aventuraId:m[1],lap:Number(m[2])}:null}
function granAventuraEmptyBloc(){return{v:GRAN_AVENTURA_V,lap:1,aventuraActiva:null,aventures:{},recompensesInventem:{}}}
function granAventuraCoerceBloc(g){
  const out=granAventuraEmptyBloc();
  if(!g||typeof g!=='object')return out;
  out.lap=Math.max(1,Math.floor(Number(g.lap))||1);
  out.aventuraActiva=g.aventuraActiva?granAventuraNormalizeId(g.aventuraActiva):null;
  const av=g.aventures;
  if(av&&typeof av==='object'){Object.keys(av).forEach(k=>{const x=av[k];if(!x||typeof x!=='object')return;const slots=Array.isArray(x.slots)?x.slots.map(s=>!!s):[false,false,false];while(slots.length<3)slots.push(false);out.aventures[k]={estat:x.estat==='completada'?'completada':x.estat==='en_curs'?'en_curs':'pendent',slots:slots.slice(0,3),completadaAt:Number(x.completadaAt)||0,recompensaClaimed:!!x.recompensaClaimed}})}
  const re=g.recompensesInventem;
  if(re&&typeof re==='object')out.recompensesInventem={...re};
  return out
}
function granAventuraBloc(){
  const p=typeof progresLoad==='function'?progresLoad():{};
  return granAventuraCoerceBloc(p.granAventura)
}
function granAventuraSaveBloc(bloc){
  if(typeof progresLoad!=='function'||typeof progresSave!=='function')return false;
  const p=progresLoad();
  p.granAventura=granAventuraCoerceBloc(bloc);
  return progresSave(p)
}
function granAventuraRegistreMissioId(instanciaId,lap){return`${granAventuraNormalizeId(instanciaId)}~L${lap}`}
function granAventuraMissioInstancia(instanciaId){
  const hit=granAventuraInstanciaSlot(instanciaId);
  if(!hit||!hit.slot?.plantillaMissioId)return null;
  const def=typeof missionsById==='function'?missionsById(hit.slot.plantillaMissioId):null;
  if(!def)return null;
  const bloc=granAventuraBloc();
  const regId=granAventuraRegistreMissioId(instanciaId,bloc.lap);
  return{registreId:regId,def,plantillaId:hit.slot.plantillaMissioId,instanciaId:granAventuraNormalizeId(instanciaId),aventuraId:hit.aventura.id,slotIndex:hit.slotIndex,emissorId:hit.slot.emissorId||null}
}
function granAventuraAventuraEstat(clau){
  const bloc=granAventuraBloc();
  return bloc.aventures[clau]||{estat:'pendent',slots:[false,false,false],completadaAt:0,recompensaClaimed:false}
}
function granAventuraDiaPreparat(av){
  if(!av||!Array.isArray(av.slots)||av.slots.length<3)return false;
  return av.slots.every(s=>String(s.cartaText||'').trim().length>0)
}
function granAventuraProperaAventuraId(){
  const bloc=granAventuraBloc();
  const dies=granAventuraDies();
  for(const av of dies){
    if(!granAventuraDiaPreparat(av))continue;
    const clau=granAventuraClau(av.id,bloc.lap);const e=granAventuraAventuraEstat(clau);if(e.estat!=='completada')return av.id
  }
  return null
}
function granAventuraTotesCompletadesLap(lap,blocOpt){
  const dies=granAventuraDies();
  if(!dies.length)return false;
  const bloc=blocOpt||granAventuraBloc();
  const avents=bloc.aventures||{};
  return dies.every(av=>((avents[granAventuraClau(av.id,lap)]||{}).estat==='completada'))
}
function granAventuraInicia(aventuraId){
  const avId=granAventuraNormalizeId(aventuraId);
  const av=granAventuraById(avId);
  if(!av)return{ok:false,reason:'aventura'};
  const bloc=granAventuraBloc();
  if(bloc.aventuraActiva&&bloc.aventuraActiva!==avId){const actClau=granAventuraClau(bloc.aventuraActiva,bloc.lap);const act=granAventuraAventuraEstat(actClau);if(act.estat==='en_curs')return{ok:false,reason:'altra_activa',aventuraId:bloc.aventuraActiva}}
  const clau=granAventuraClau(avId,bloc.lap);
  const cur=granAventuraAventuraEstat(clau);
  if(cur.estat==='completada')return{ok:false,reason:'ja_completada'};
  bloc.aventuraActiva=avId;
  bloc.aventures[clau]={...cur,estat:'en_curs',slots:cur.slots.slice(0,3)};
  return granAventuraSaveBloc(bloc)?{ok:true,clau,lap:bloc.lap}:{ok:false,reason:'escriptura'}
}
function granAventuraIniciaPropera(){
  const bloc=granAventuraBloc();
  if(bloc.aventuraActiva){const clau=granAventuraClau(bloc.aventuraActiva,bloc.lap);const e=granAventuraAventuraEstat(clau);if(e.estat==='en_curs')return granAventuraInicia(bloc.aventuraActiva)}
  const id=granAventuraProperaAventuraId();
  if(!id)return{ok:false,reason:'sense_aventures'};
  return granAventuraInicia(id)
}
function granAventuraNovaLap(){
  const bloc=granAventuraBloc();
  bloc.lap=Math.max(1,Math.floor(Number(bloc.lap))||1)+1;
  bloc.aventuraActiva=null;
  if(!granAventuraSaveBloc(bloc))return{ok:false,reason:'escriptura'};
  const seg=granAventuraIniciaPropera();
  return seg?.ok?{ok:true,lap:granAventuraBloc().lap,...seg}:{ok:false,reason:seg?.reason||'inici'}
}
function granAventuraReprendre(){
  const bloc=granAventuraBloc();
  if(!bloc.aventuraActiva)return granAventuraIniciaPropera();
  const clau=granAventuraClau(bloc.aventuraActiva,bloc.lap);
  const e=granAventuraAventuraEstat(clau);
  if(e.estat==='completada')return granAventuraIniciaPropera();
  if(e.estat!=='en_curs')return granAventuraInicia(bloc.aventuraActiva);
  return{ok:true,aventuraId:bloc.aventuraActiva,clau,lap:bloc.lap,reprendre:true}
}
function granAventuraPotIniciarInstancia(instanciaId){
  const meta=granAventuraMissioInstancia(instanciaId);
  if(!meta)return{ok:false,reason:'instancia'};
  const bloc=granAventuraBloc();
  if(bloc.aventuraActiva!==meta.aventuraId)return{ok:false,reason:'aventura_inactiva'};
  const clau=granAventuraClau(meta.aventuraId,bloc.lap);
  const st=granAventuraAventuraEstat(clau);
  if(st.estat!=='en_curs')return{ok:false,reason:'aventura_estat'};
  if(st.slots[meta.slotIndex])return{ok:false,reason:'slot_fet'};
  return{ok:true,meta,clau}
}
function granAventuraMarcaSlotFet(instanciaId){
  const meta=granAventuraMissioInstancia(instanciaId);
  if(!meta)return{ok:false,reason:'instancia'};
  const bloc=granAventuraBloc();
  const clau=granAventuraClau(meta.aventuraId,bloc.lap);
  const st=granAventuraAventuraEstat(clau);
  if(st.slots[meta.slotIndex])return{ok:true,jaMarcada:true,clau};
  const slots=st.slots.slice(0,3);
  slots[meta.slotIndex]=true;
  const completada=slots.every(Boolean);
  bloc.aventures[clau]={...st,slots,estat:completada?'completada':st.estat==='pendent'?'en_curs':st.estat,completadaAt:completada?Date.now():st.completadaAt||0};
  if(completada){
    bloc.aventuraActiva=null;
    if(granAventuraTotesCompletadesLap(bloc.lap,bloc))bloc.lap+=1;
  }
  return granAventuraSaveBloc(bloc)?{ok:true,completada,clau,lap:bloc.lap}:{ok:false,reason:'escriptura'}
}
function granAventuraOnMissioCompletada(registreId){
  const raw=String(registreId||'');
  const instanciaId=raw.includes('~L')?raw.split('~L')[0]:'';
  if(!instanciaId)return{ok:false,reason:'id'};
  return granAventuraMarcaSlotFet(instanciaId)
}
function granAventuraReclamaInventem(aventuraId,lap){
  const avId=granAventuraNormalizeId(aventuraId);
  const av=granAventuraById(avId);
  if(!av||!av.recompensaInventemId)return{ok:false,reason:'sense_recompensa'};
  const clau=granAventuraClau(avId,lap);
  const st=granAventuraAventuraEstat(clau);
  if(st.estat!=='completada')return{ok:false,reason:'incompleta'};
  const bloc=granAventuraBloc();
  const key=`${clau}`;
  if(bloc.recompensesInventem[key])return{ok:false,reason:'duplicat'};
  bloc.recompensesInventem[key]=av.recompensaInventemId;
  bloc.aventures[clau]={...st,recompensaClaimed:true};
  return granAventuraSaveBloc(bloc)?{ok:true,id:av.recompensaInventemId}:{ok:false,reason:'escriptura'}
}