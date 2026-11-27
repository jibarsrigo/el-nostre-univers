'use strict';
/* Etapa 3a — progrés permanent (B) i clau futura missions (C). Sense migració retroactiva. */
const PROGRES_LS_KEY='nostre-univers-progres-v1';
const PROGRES_SCHEMA=1;
const PROGRES_FONTS_AMIC=new Set(['cartes','ombres','diferencies','fase1','manual']);
function progresEmpty(){return{v:PROGRES_SCHEMA,permanent:{amics:[],fonts:{}},missions:{v:0,registre:{}},meta:{updatedAt:0}}}
function progresNormalizeGrup(g){const s=String(g||'').trim().toLowerCase();return s||''}
function progresNormalizeFont(f){const s=String(f||'').trim().toLowerCase();return PROGRES_FONTS_AMIC.has(s)?s:''}
function progresLoadRaw(){try{const raw=localStorage.getItem(PROGRES_LS_KEY);if(!raw)return null;return JSON.parse(raw)}catch{return null}}
function progresCoerce(data){const out=progresEmpty();if(!data||typeof data!=='object')return out;const v=Number(data.v);if(v!==PROGRES_SCHEMA)return out;const amics=data.permanent?.amics??data.amics;if(Array.isArray(amics)){const set=new Set();amics.forEach(g=>{const n=progresNormalizeGrup(g);if(n)set.add(n)});out.permanent.amics=[...set].sort()}const fonts=data.permanent?.fonts;if(fonts&&typeof fonts==='object'){Object.keys(fonts).forEach(k=>{const g=progresNormalizeGrup(k);if(!g)return;const arr=fonts[k];if(!Array.isArray(arr))return;out.permanent.fonts[g]=[...new Set(arr.map(progresNormalizeFont).filter(Boolean))];})}if(data.missions&&typeof data.missions==='object'){out.missions.v=Number.isInteger(data.missions.v)?data.missions.v:0;const reg=data.missions.registre;if(reg&&typeof reg==='object')out.missions.registre={...reg}}return out}
function progresLoad(){return progresCoerce(progresLoadRaw())}
function progresSave(data){const d=progresCoerce(data);d.meta.updatedAt=Date.now();try{localStorage.setItem(PROGRES_LS_KEY,JSON.stringify(d));return true}catch{return false}}
function progresGrupsDescoberts(){return progresLoad().permanent.amics.slice()}
function progresTeGrup(grup){const g=progresNormalizeGrup(grup);return g?progresGrupsDescoberts().includes(g):false}
function progresGrupDesDePersonatge(p){if(!p||typeof p!=='object')return '';return progresNormalizeGrup(p.grup||p.id)}
function progresGrupDesDePersonatgeId(id,metaFn){if(typeof metaFn!=='function')return progresNormalizeGrup(id);const m=metaFn(id);return progresGrupDesDePersonatge(m)||progresNormalizeGrup(id)}
function progresRegistraDescobert(grup,font){const g=progresNormalizeGrup(grup);if(!g)return false;const f=progresNormalizeFont(font);const data=progresLoad();const amics=data.permanent.amics;if(!amics.includes(g)){amics.push(g);amics.sort()}if(f){if(!data.permanent.fonts[g])data.permanent.fonts[g]=[];const fonts=data.permanent.fonts[g];if(!fonts.includes(f))fonts.push(f)}return progresSave(data)}
function progresGrupsJugables(personatgeList){const set=new Set();(personatgeList||[]).filter(p=>p&&p.enabled!==false).forEach(p=>{const g=progresGrupDesDePersonatge(p);if(g)set.add(g)});return[...set].sort()}
function progresQuedenPerDescobrir(personatgeList){const have=new Set(progresGrupsDescoberts());return progresGrupsJugables(personatgeList).filter(g=>!have.has(g)).length}
function progresSnapshot(){return progresLoad()}
function progresSenseMigracioRetroactiva(){return true}
function progresPersonatgeIdSecretOmbres(secret){return secret&&(secret.personatgeId||secret.id)||''}
function progresPersonatgePerId(id,list){return (list||[]).find(p=>p&&p.id===id)||null}
function progresGrupDesDeSecretOmbres(secret,personatgeList){const pid=progresPersonatgeIdSecretOmbres(secret);if(!pid)return '';const p=progresPersonatgePerId(pid,personatgeList);return p?progresGrupDesDePersonatge(p):progresNormalizeGrup(pid)}
function progresRegistraCartesTauler(ids,metaFn){if(typeof progresRegistraDescobert!=='function')return;(ids||[]).forEach(id=>{const m=typeof metaFn==='function'?metaFn(id):null;const g=m?progresGrupDesDePersonatge(m):progresNormalizeGrup(id);if(g)progresRegistraDescobert(g,'cartes')})}
function progresRegistraOmbresObjectiu(secret,personatgeList){const g=progresGrupDesDeSecretOmbres(secret,personatgeList);if(!g)return false;return progresRegistraDescobert(g,'ombres')}