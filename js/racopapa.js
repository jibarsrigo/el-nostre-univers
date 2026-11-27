'use strict';
/* Etapa 4 — EL RACÓ DE PAPA: còpia i recuperació (només adult). */
const RACO_PAPA_SESSION='racopapa-adult-v1';
const RACO_PAPA_TAPS_NEEDED=7;
const RACO_PAPA_CODE='PAPA';
let racopapaTapCount=0;
let racopapaTapT=0;
const racopapa={draft:'',status:''};

function racopapaAdultOk(){try{return sessionStorage.getItem(RACO_PAPA_SESSION)==='1'}catch{return false}}
function racopapaSetAdult(ok){try{if(ok)sessionStorage.setItem(RACO_PAPA_SESSION,'1');else sessionStorage.removeItem(RACO_PAPA_SESSION)}catch{}}

function racopapaFooterTap(){
  if(state.place!=='map')return;
  const now=Date.now();
  if(!racopapaTapT||now-racopapaTapT>4500){racopapaTapCount=0}
  racopapaTapT=now;
  racopapaTapCount++;
  if(racopapaTapCount>=RACO_PAPA_TAPS_NEEDED){racopapaTapCount=0;racopapaOpenGate()}
}

function racopapaOpenGate(){state.previous='map';go('racopapa-gate')}

function racopapaGateScene(){
  return f2Scene('ACCES RESERVAT',`<label class="raco-label" for="raco-code">CODI SECRET (4 LLETRES)</label><input id="raco-code" class="f2-name raco-input" maxlength="12" autocomplete="off" spellcheck="false" placeholder="••••"><p class="raco-hint">NOMÉS PER A PARES I MARES. LA NENA NO HA DE VEURE AQUEST LLOC.</p>`,`<p id="raco-gate-msg" role="status"></p>`,f2btn('ENTRAR','raco-gate-enter')+f2btn('← MAPA','raco-gate-cancel'),'mapa','raco-gate')
}

function racopapaPanelScene(){
  const msg=strip(racopapa.status||'');
  return f2Scene('EL RACÓ DE PAPA',`<p class="raco-lead">DESA I RECUPERA EL PROGRÉS DEL DISPOSITIU.</p><textarea id="raco-json" class="raco-textarea" rows="9" spellcheck="false" placeholder="Enganxa aquí el JSON de la còpia de seguretat..." aria-label="JSON de la còpia">${strip(racopapa.draft)}</textarea><label class="raco-check"><input type="checkbox" id="raco-replace-ok"> <span>ENTENC QUE SUBSTITUIRÉ TOTES LES DADES LOCALS DEL JOC</span></label>`,`<p id="raco-panel-msg" class="raco-msg" role="status">${msg}</p>`,f2btn('📤 EXPORTAR CÒPIA','raco-export')+f2btn('📥 FUSIONAR','raco-import-merge')+f2btn('⚠️ SUBSTITUIR TOT','raco-import-replace')+f2btn('SORTIR','raco-exit'),'mapa','raco-panel')
}

function racopapaSetStatus(t){racopapa.status=String(t||'')}
function racopapaReadJson(){
  const el=app.querySelector('#raco-json');
  return el?String(el.value||'').trim():racopapa.draft
}
function racopapaSaveDraft(){
  racopapa.draft=racopapaReadJson()
}

function racopapaExport(){
  if(typeof progresBackupExportString!=='function')return racopapaSetStatus('NO ES POT EXPORTAR ARA.');
  const json=progresBackupExportString();
  racopapa.draft=json;
  racopapaSetStatus('CÒPIA LLESTA. REVISA EL TEXT I DESA’L EN UN LLOC SEGUR.');
  const el=app.querySelector('#raco-json');
  if(el)el.value=json;
  try{
    if(typeof navigator!=='undefined'&&navigator.clipboard?.writeText)navigator.clipboard.writeText(json).catch(()=>{})
  }catch{}
  try{
    const blob=new Blob([json],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='el-nostre-univers-copia.json';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }catch{}
}

function racopapaImport(mode){
  racopapaSaveDraft();
  let pack;
  try{pack=JSON.parse(racopapa.draft)}catch{racopapaSetStatus('EL TEXT NO ÉS UN JSON VÀLID.');return}
  if(mode==='replace'){
    const ok=app.querySelector('#raco-replace-ok')?.checked;
    if(!ok){racopapaSetStatus('MARCA LA CASLLA DE CONFIRMACIÓ ABANS DE SUBSTITUIR TOT.');return}
    if(typeof window.confirm==='function'&&!window.confirm('SUBSTITUIR TOTES LES DADES LOCALS? AQUEST PAS NO ES POT DESFER FÀCILMENT.'))return;
  }
  if(typeof progresBackupImport!=='function'){racopapaSetStatus('NO ES POT IMPORTAR ARA.');return}
  const opts=mode==='replace'?{mode:'replace',replaceConfirmed:true}:{mode:'merge'};
  const r=progresBackupImport(pack,opts);
  if(!r.ok){
    const why=r.reason==='validacio'?'LA CÒPIA NO ÉS CORRECTA.':r.reason==='replace'?'CAL CONFIRMAR LA SUBSTITUCIÓ.':'NO S’HA POGUT DESAR.';
    racopapaSetStatus(why);
    return
  }
  racopapaSetStatus(mode==='replace'?'DADES SUBSTITUÏDES.':'DADES FUSIONADES CORRECTAMENT.')
}

function racopapaTryEnter(){
  const el=app.querySelector('#raco-code');
  const code=String(el?.value||'').trim().toUpperCase();
  const msg=app.querySelector('#raco-gate-msg');
  if(code!==RACO_PAPA_CODE){if(msg)msg.textContent='CODI INCORRECTE.';return}
  racopapaSetAdult(true);
  racopapaSetStatus('');
  nav('racopapa');
}

const actionRaco=action;
action=function(id){
  switch(id){
    case'raco-gate-enter':racopapaTryEnter();return;
    case'raco-gate-cancel':racopapaSetAdult(false);back();return;
    case'raco-export':racopapaExport();render();return;
    case'raco-import-merge':racopapaImport('merge');render();return;
    case'raco-import-replace':racopapaImport('replace');render();return;
    case'raco-exit':racopapaSaveDraft();racopapaSetAdult(false);racopapaSetStatus('');back();return;
  }
  return actionRaco(id)
};

Object.assign(SCENES,{'racopapa-gate':racopapaGateScene,racopapa:racopapaPanelScene});

const renderRacoGate=render;
render=function(){
  if(state.place==='racopapa'&&!racopapaAdultOk()){nav('racopapa-gate');return}
  const out=renderRacoGate();
  if(state.place==='map'){
    const foot=app.querySelector('.footer');
    if(foot&&!foot.dataset.racoBound){foot.dataset.racoBound='1';foot.addEventListener('click',racopapaFooterTap)}
  }
  return out
};