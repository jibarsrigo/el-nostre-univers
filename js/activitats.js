'use strict';
/* Registre d'activitats — runtime mínim (etapa 2). Sense dependències externes. */
const ACTIVITATS_URL='data/activitats.json';
const SESSIONS_KEY='nostre-activitats-sessions-v1';
const SESSIONS_CAP=24;
const activitatsReg={data:null,ready:false,failed:false};
const memCompleted=new Set();

function activitatsSessionId(){
  try{
    if(typeof crypto!=='undefined'&&crypto.randomUUID)return crypto.randomUUID();
  }catch{}
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`;
}

function activitatsLoadSessions(){
  try{
    const raw=localStorage.getItem(SESSIONS_KEY);
    if(!raw)return {};
    const o=JSON.parse(raw);
    return o&&typeof o==='object'&&!Array.isArray(o)?o:{};
  }catch{return {};}
}

function activitatsSaveSessions(data){
  try{localStorage.setItem(SESSIONS_KEY,JSON.stringify(data));}catch{}
}

function activitatsTrimIds(list){
  if(!Array.isArray(list))return [];
  return list.length<=SESSIONS_CAP?list:list.slice(-SESSIONS_CAP);
}

function activitat(id){
  const list=activitatsReg.data?.activitats;
  return Array.isArray(list)?list.find(a=>a.id===id)||null:null;
}

function activitatsLegacyKey(id){
  const meta=activitat(id);
  if(meta?.legacyRecordKey)return meta.legacyRecordKey;
  if(id==='cartes')return 'pairs';
  if(id==='ombres')return 'jocs-ombres';
  return null;
}

function activitatsRecordLegacy(id,detail){
  if(id==='ombres')return Number(detail?.nivell)===3;
  return true;
}

function activitatCompleta(id,detail){
  const sessionId=detail?.sessionId;
  if(!sessionId||!id)return false;
  const memKey=`${id}:${sessionId}`;
  if(memCompleted.has(memKey))return false;

  const store=activitatsLoadSessions();
  const prev=store[id]?.completedSessionIds;
  if(Array.isArray(prev)&&prev.includes(sessionId))return false;

  memCompleted.add(memKey);
  const bucket=store[id]||{completedSessionIds:[]};
  const ids=Array.isArray(bucket.completedSessionIds)?bucket.completedSessionIds:[];
  if(!ids.includes(sessionId)){
    bucket.completedSessionIds=activitatsTrimIds([...ids,sessionId]);
    store[id]=bucket;
    activitatsSaveSessions(store);
  }

  const legacy=activitatsLegacyKey(id);
  if(legacy&&typeof remember==='function'&&activitatsRecordLegacy(id,detail))remember(legacy);
  return true;
}

function activitatsResetMem(){memCompleted.clear();}

(function activitatsInit(){
  if(typeof fetch!=='function'){activitatsReg.failed=true;return;}
  fetch(ACTIVITATS_URL).then(r=>{if(!r.ok)throw 0;return r.json();}).then(d=>{
    activitatsReg.data=d;
    activitatsReg.ready=true;
  }).catch(()=>{activitatsReg.failed=true;});
})();