'use strict';
/* FASE 3 — Inventem! Un taller real, dibuix amb llapis, àlbum i memòria local.
   No modifica les activitats ni la navegació de les fases anteriors. */
const F3_KEY='nostre-creacions-v3';
const f3={gallery:[],draft:null,object:null,selected:null,color:'#7652c8',brush:8,eraser:false,paintDirty:false};
const palette3=['#7b57d5','#ffab4b','#63bdd0','#ef6ca0','#76c36c','#e7c873','#e8e1f5','#393452'];
const formats3={creature:'CRIATURA',drawing:'DIBUIX',object:'OBJECTE MÀGIC'};
const safe3=strip;
const newCreature3=()=>({kind:'creature',name:'',species:'drac',body:'#7b57d5',belly:'#f1d58a',wings:'ales',ears:'banyes',tail:'llarga',mark:'estrelles'});
const newObject3=()=>({kind:'object',name:'',shape:'vareta',gem:'#63bdd0',power:'llum'});
try{const data=JSON.parse(localStorage.getItem(F3_KEY)||'[]');if(Array.isArray(data)){f3.gallery=data.filter(x=>x&&['creature','drawing','object'].includes(x.kind)).slice(0,12)}}catch{}
f3.draft=newCreature3(); f3.object=newObject3();
const i3=(name,val,selected)=>`<button type="button" class="f3-option ${selected?'active':''}" data-f3-option="${name}" data-f3-value="${safe3(val)}" aria-pressed="${selected}">${safe3(val)}</button>`;
function creatureSVG3(d,small=false){
 const tail=d.tail==='llarga'?'<path d="M605 313Q750 248 710 373Q679 413 631 394" stroke="'+d.body+'" stroke-width="56" fill="none" stroke-linecap="round"/><path d="M690 377q-25 3-48-7" stroke="#fff4d2" stroke-width="13" fill="none"/>':d.tail==='rodona'?'<circle cx="635" cy="330" r="62" fill="'+d.body+'" stroke="#d9c4f6" stroke-width="10"/>':'<path d="M612 332Q735 267 724 347L648 398Z" fill="'+d.body+'"/>';
 const wings=d.wings==='ales'?'<path d="M270 276Q172 113 99 249L115 362 185 316 230 361Z" fill="'+d.body+'" stroke="#503a75" stroke-width="9"/><path d="M516 280Q629 133 696 224L690 331 628 314 587 362Z" fill="'+d.body+'" stroke="#503a75" stroke-width="9"/>':d.wings==='papallona'?'<g fill="'+d.body+'" stroke="#fff2cc" stroke-width="7"><ellipse cx="206" cy="259" rx="105" ry="82" transform="rotate(-28 206 259)"/><ellipse cx="580" cy="259" rx="105" ry="82" transform="rotate(28 580 259)"/></g>':'';
 const ears=d.ears==='banyes'?'<path d="M303 153L291 23Q351 69 372 140M480 150L501 23Q447 60 431 139" fill="#f5c981" stroke="#8f5b6b" stroke-width="8"/>':d.ears==='orelles'?'<ellipse cx="303" cy="76" rx="33" ry="98" transform="rotate(-19 303 76)" fill="'+d.body+'" stroke="#f2c2ca" stroke-width="11"/><ellipse cx="489" cy="76" rx="33" ry="98" transform="rotate(19 489 76)" fill="'+d.body+'" stroke="#f2c2ca" stroke-width="11"/>':'<path d="M293 156L268 32 362 130M492 153L510 29 437 128" fill="'+d.body+'" stroke="#e7cc94" stroke-width="7"/>';
 const body=d.body, belly=d.belly;
 const speciesDetails=d.species==='conill'?'<path d="M377 246v14M414 246v14" stroke="#7b5261" stroke-width="5"/><circle cx="378" cy="250" r="5" fill="#7b5261"/><circle cx="415" cy="250" r="5" fill="#7b5261"/>':d.species==='monstret'?'<path d="M373 270l11 15 11-14 11 14 11-15" stroke="white" stroke-width="9" fill="none"/>':'<path d="M378 264l15 12 18-12" stroke="#fff8e5" stroke-width="7" fill="none"/>';
 const mark=d.mark==='estrelles'?'<g fill="#ffe7a0"><path d="M293 280l9 18 20 3-15 13 4 20-18-9-18 9 4-20-15-13 20-3Z"/><path d="M515 283l5 11 12 1-9 9 2 12-10-6-11 6 3-12-10-9 12-1Z"/></g>':d.mark==='cors'?'<path d="M305 303C254 254 262 234 285 239C304 242 310 262 310 262C333 231 359 244 345 270Z" fill="#ffb2c7"/>':'<g fill="#f5e9c5"><circle cx="290" cy="278" r="12"/><circle cx="325" cy="311" r="9"/><circle cx="520" cy="288" r="12"/></g>';
 return `<svg class="f3-creature-svg" viewBox="0 0 800 520" role="img" aria-label="Criatura màgica: ${safe3(d.species)}"><defs><radialGradient id="f3halo"><stop stop-color="#b8a6ff" stop-opacity=".8"/><stop offset="1" stop-color="#44305e" stop-opacity="0"/></radialGradient></defs><ellipse cx="397" cy="294" rx="340" ry="228" fill="url(#f3halo)"/><ellipse cx="415" cy="470" rx="230" ry="26" fill="#160e2f" opacity=".38"/>${tail}${wings}<ellipse cx="390" cy="336" rx="185" ry="146" fill="${body}" stroke="#493360" stroke-width="9"/><ellipse cx="390" cy="352" rx="111" ry="102" fill="${belly}" opacity=".96"/><path d="M284 431q-30 44-7 50h72q18-5-3-46M453 432q-17 49 5 49h70q22-14-15-52" fill="${body}" stroke="#493360" stroke-width="8"/>${mark}${ears}<ellipse cx="395" cy="194" rx="152" ry="139" fill="${body}" stroke="#493360" stroke-width="9"/><ellipse cx="343" cy="199" rx="35" ry="44" fill="white"/><ellipse cx="453" cy="199" rx="35" ry="44" fill="white"/><ellipse cx="350" cy="209" rx="17" ry="25" fill="#25314a"/><ellipse cx="460" cy="209" rx="17" ry="25" fill="#25314a"/><circle cx="355" cy="202" r="7" fill="white"/><circle cx="465" cy="202" r="7" fill="white"/><ellipse cx="401" cy="258" rx="60" ry="39" fill="${belly}"/><path d="M369 257q32 33 66 0" stroke="#533954" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="396" cy="239" r="9" fill="#5a3f59"/>${speciesDetails}<circle cx="305" cy="265" r="16" fill="#ffb4a7" opacity=".75"/><circle cx="494" cy="265" r="16" fill="#ffb4a7" opacity=".75"/><path d="M250 355q-60-25-82 23M544 355q60-25 77 23" fill="none" stroke="${body}" stroke-width="30" stroke-linecap="round"/>${small?'':'<g fill="#fff5b8"><path d="M120 91l7 18 18 7-18 7-7 18-7-18-18-7 18-7Z"/><path d="M661 137l7 15 15 7-15 7-7 15-7-15-15-7 15-7Z"/></g>'}</svg>`;
}
function objectSVG3(d){const gem=d.gem;const handle='<path d="M365 355L472 108" stroke="#7d4a42" stroke-width="30" stroke-linecap="round"/><path d="M365 355L472 108" stroke="#edc779" stroke-width="10" stroke-linecap="round"/>';
 let shape=d.shape==='vareta'?`${handle}<path d="M474 69l18 29 34 6-24 25 5 35-33-18-31 18 5-35-24-25 33-6Z" fill="${gem}" stroke="#fff2ba" stroke-width="9"/>`:d.shape==='escut'?`<path d="M310 115Q410 59 520 115V260Q505 351 414 410Q326 355 310 260Z" fill="${gem}" stroke="#f6d68a" stroke-width="19"/><path d="M348 157Q414 133 485 157V254Q474 318 415 358Q363 317 348 254Z" fill="#fdf1ce" opacity=".65"/>`:`<path d="M305 120L518 120 563 249 410 410 255 249Z" fill="${gem}" stroke="#ffdb98" stroke-width="17"/><path d="M410 113v285M260 249h300M307 120l103 129 106-129" stroke="#ffffff77" stroke-width="8"/>`;
 let power=d.power==='llum'?'✦':d.power==='protecció'?'❀':'♡';return `<svg viewBox="0 0 800 510" class="f3-creature-svg" role="img" aria-label="Objecte màgic"><defs><radialGradient id="f3aura"><stop stop-color="${gem}" stop-opacity=".48"/><stop offset="1" stop-color="#26143e" stop-opacity="0"/></radialGradient></defs><circle cx="411" cy="246" r="237" fill="url(#f3aura)"/>${shape}<text x="411" y="245" text-anchor="middle" dominant-baseline="central" font-size="65" fill="#fff8cf" paint-order="stroke" stroke="#774e69" stroke-width="3">${power}</text><g fill="#fbe69c"><path d="M163 133l12 25 25 12-25 12-12 25-12-25-25-12 25-12Z"/><path d="M647 294l12 25 25 12-25 12-12 25-12-25-25-12 25-12Z"/></g></svg>`}
function hero3(inner,subtitle='',cls=''){return `<div class="f3-scene ${cls}" style="--f3-bg:url('${IMG('taller')}')">${topbar(state.place)}<div class="f3-panel"><header class="f3-head"><div class="f3-overline">✦ EL NOSTRE UNIVERS ✦</div><h2>🎨 ${inner}</h2>${subtitle?`<p>${subtitle}</p>`:''}</header><div class="f3-body" id="f3-slot"></div></div></div>`}
function button3(label,action,extra=''){return `<button class="f3-btn" type="button" data-f3="${action}" ${extra}>${label}</button>`}
function color3(prop,val,active){return `<button class="f3-swatch ${active?'chosen':''}" type="button" data-f3-color="${prop}" data-f3-value="${val}" style="--swatch:${val}" aria-label="Color ${val}" aria-pressed="${active}"></button>`}
function optionGroup3(label,prop,values,chosen){return `<div class="f3-choice"><span class="f3-label">${label}</span><div class="f3-row">${values.map(v=>i3(prop,v,v===chosen)).join('')}</div></div>`}
function creator3(){let d=f3.draft;let colors=palette3.map(c=>color3('body',c,c===d.body)).join('');return hero3('EL TALLER DE CRIATURES','COM SERÀ LA TEVA CRIATURA?','f3-creator') .replace('<div class="f3-body" id="f3-slot"></div>',`<div class="f3-body f3-columns"><div class="f3-preview"><div class="f3-svg-holder" id="f3-creature-art">${creatureSVG3(d)}</div><label class="f3-name-label" for="f3-name">COM ES DIU?</label><input id="f3-name" class="f3-name" maxlength="22" autocomplete="off" placeholder="NOM DE LA CRIATURA" value="${safe3(d.name)}"></div><div class="f3-controls">${optionGroup3('QUI ÉS?','species',['drac','conill','monstret'],d.species)}<div class="f3-choice"><span class="f3-label">COLOR</span><div class="f3-row">${colors}</div></div>${optionGroup3('ORELLES O BANYES','ears',['banyes','orelles','punxes'],d.ears)}${optionGroup3('ALES','wings',['ales','papallona','cap'],d.wings)}${optionGroup3('COA','tail',['llarga','rodona','punxa'],d.tail)}${optionGroup3('DIBUIXOS','mark',['estrelles','cors','taques'],d.mark)}<div class="f3-row f3-footer">${button3('✦ DESA LA CRIATURA','save-creature')}${button3('↻ UNA ALTRA','new-creature')}${button3('← TALLER','exit')}</div><p class="f3-help" id="f3-feedback" role="status"></p></div></div>`)}
function maker3(){let d=f3.object;return hero3('ELS OBJECTES MÀGICS','INVENTA UN OBJECTE AMB PODERS!','f3-maker').replace('<div class="f3-body" id="f3-slot"></div>',`<div class="f3-body f3-columns"><div class="f3-preview"><div class="f3-svg-holder" id="f3-object-art">${objectSVG3(d)}</div><label class="f3-name-label" for="f3-object-name">POSA-LI NOM</label><input class="f3-name" id="f3-object-name" maxlength="22" placeholder="NOM DE L’OBJECTE" value="${safe3(d.name)}"></div><div class="f3-controls">${optionGroup3('QUÈ INVENTAM?','shape',['vareta','escut','cristall'],d.shape)}<div class="f3-choice"><span class="f3-label">COLOR MÀGIC</span><div class="f3-row">${palette3.map(c=>color3('gem',c,d.gem===c)).join('')}</div></div>${optionGroup3('QUIN PODER TÉ?','power',['llum','protecció','curar'],d.power)}<p class="f3-description" id="f3-powertext">${powerText3(d.power)}</p><div class="f3-row f3-footer">${button3('✦ DESA L’OBJECTE','save-object')}${button3('↻ UN ALTRE','new-object')}${button3('← TALLER','exit')}</div><p class="f3-help" id="f3-feedback" role="status"></p></div></div>`)}
function powerText3(p){return ({llum:'IL·LUMINA ELS LLOCS FOSCOS.',protecció:'CUIDA ELS AMICS DEL BOSC.',curar:'AJUDA LES CRIATURES A RECUPERAR-SE.'})[p]||''}
function draw3(){return hero3('EL QUADERN MÀGIC','DIBUIXA AMB EL DIT O EL LLAPIS!','f3-drawing').replace('<div class="f3-body" id="f3-slot"></div>',`<div class="f3-body f3-drawbody"><div class="f3-drawing-tools"><span class="f3-label">PINTURES</span><div class="f3-row">${palette3.map(c=>`<button class="f3-swatch ${f3.color===c&&!f3.eraser?'chosen':''}" type="button" data-f3-ink="${c}" style="--swatch:${c}" aria-label="Pintar de color ${c}"></button>`).join('')}</div><div class="f3-row">${button3('🖌️ PINZELL','brush')}${button3('◯ GOMA','eraser')}${button3('↶ DESFER','undo')}${button3('✧ NETEJA','clear')}</div></div><div class="f3-canvas-wrap"><canvas id="f3-canvas" width="800" height="480" aria-label="Espai per dibuixar amb el dit o amb llapis digital"></canvas></div><div class="f3-save-strip"><label class="f3-name-label" for="f3-drawing-name">NOM DEL DIBUIX</label><input id="f3-drawing-name" class="f3-name" maxlength="22" placeholder="EL MEU DIBUIX"><div class="f3-row">${button3('✦ DESA EL DIBUIX','save-drawing')}${button3('← TALLER','exit')}</div><p class="f3-help" id="f3-feedback" role="status"></p></div></div>`)}
function gallery3(){let out=f3.gallery.length?`<div class="f3-gallery-grid">${[...f3.gallery].reverse().map(x=>`<article class="f3-card">${x.kind==='drawing'?`<img src="${x.image}" alt="Dibuix ${safe3(x.name)}" loading="lazy">`:x.kind==='object'?objectSVG3(x):creatureSVG3(x,true)}<h3>${safe3(x.name)}</h3><small>${formats3[x.kind]}</small><div class="f3-row">${x.kind!=='drawing'?button3('✎ CANVIA','edit-'+x.id):''}${button3('✕ ESBORRA','delete-'+x.id)}</div></article>`).join('')}</div>`:`<div class="f3-empty">✨<p>AQUÍ GUARDARÀS LES TEVES CREACIONS!</p></div>`;
 return hero3('EL MEU RACÓ','LES COSES QUE HAS INVENTAT','f3-gallery').replace('<div class="f3-body" id="f3-slot"></div>',`<div class="f3-body">${out}<div class="f3-row f3-bottom-actions">${button3('🐉 CREA UNA CRIATURA','creator')}${button3('🖌️ DIBUIXA','draw')}${button3('← TALLER','exit')}</div><p class="f3-help" id="f3-feedback" role="status"></p></div>`)}
Object.assign(SCENES,{f3creator:creator3,f3maker:maker3,f3draw:draw3,f3gallery:gallery3});
// Un sol taller: objectes de la imatge, no tres menús de "posar nom".
const hotspotF2=hotspot;hotspot=function(id){if(state.place==='workshop'){
 if(id==='creature')return go('f3creator');
 if(id==='colors')return go('f3draw');
 if(id==='stars')return go('f3maker');
 if(id==='chest')return go('f3gallery');
 }return hotspotF2(id)};
// Manté visibles les escenes aprovades i canvia només les accions del taller.
const actionF2=action;
action=function(id){if(id==='finish-atelier'){nav('f3draw');return}if(id==='finish-dragon'){nav('f3creator');return}return actionF2(id)};
// També es pot tornar a entrar en una creació de l'àlbum.
const renderF2=render;
render=function(){renderF2();f3bind();f3Continuity()};
function f3Continuity(){
 const kind=state.place;
 const latest=f3.gallery.findLast(x=>x.kind==='creature');const craft=f3.gallery.findLast(x=>x.kind==='object');
 if(kind==='workshop'){
  const foot=app.querySelector('.footer');if(foot){foot.textContent='🦊 TOCA EL DRAC PER CREAR · LES PINTURES PER DIBUIXAR · LES ESTRELLES PER FER MÀGIA · LA CAIXA PER VEURE LES TEVES CREACIONS';foot.classList.add('f3-workshop-footer')}
 }
 if(kind==='school'||kind==='quest'||kind==='finale'){
   const anchor=app.querySelector('.f2-story');if(anchor&&(latest||craft)){
     const el=document.createElement('div');el.className='f3-return-creations';el.innerHTML=`<div class="f3-tiny">${latest?`<span>🐉 ${safe3(latest.name)} T’ACOMPANYA!</span>`:''}${craft?`<span>✨ ${safe3(craft.name)} JA ÉS TEU!</span>`:''}</div>`;
     anchor.append(el);
   }
 }
 if(latest&&['school','finale'].includes(kind)){
   const panel=app.querySelector('.f2-window');if(panel){const el=document.createElement('div');el.className='f3-companion';el.innerHTML=creatureSVG3(latest,true)+`<span>💜 ${safe3(latest.name)}</span>`;const parent=panel.querySelector('.f2-story');if(parent)panel.insertBefore(el,parent)}
 }
 if(kind==='school'&&craft){const links=app.querySelector('.f2-school-links');if(links){const b=document.createElement('button');b.textContent='✨ USAM '+craft.name;b.addEventListener('click',()=>{remember('f3-used');const next=craft.power==='curar'?'rabbit':craft.power==='protecció'?'nest':'spell';state.history.push('school');nav(next);notify(powerText3(craft.power))});links.append(b)}}
 if(craft&&((kind==='rabbit'&&craft.power==='curar')||(kind==='nest'&&craft.power==='protecció')||(kind==='spell'&&craft.power==='llum'))&&state.step===0){
   const actions=app.querySelector('.f2-actions');if(actions){const b=document.createElement('button');b.className='f2-btn';b.textContent='✨ '+craft.name.toLocaleUpperCase('ca');b.addEventListener('click',()=>{remember('f3-used');if(kind==='rabbit'||kind==='nest')state.step=2;else{f2.starlit.add(0);state.step=1}render()});actions.prepend(b)}
 }

}
function f3Save(x){
 let old=f3.gallery.findIndex(a=>a.id===x.id);if(old>=0)f3.gallery.splice(old,1);
 f3.gallery.push(x);f3.gallery=f3.gallery.slice(-12);
 try{localStorage.setItem(F3_KEY,JSON.stringify(f3.gallery))}catch(e){f3.gallery.pop();throw e}
 remember(x.kind==='creature'?'f3-creature':x.kind==='drawing'?'f3-drawing':'f3-object');
}
function f3Name(v,defaultName){const name=String(v||'').trim().replace(/\s+/g,' ').slice(0,22);return name||defaultName}
function f3Message(t){const el=app.querySelector('#f3-feedback');if(el)el.textContent=t;else notify(t)}
function f3NavBack(){state.history=[];nav('workshop')}
function f3Event(act){
 if(act==='exit'){f3NavBack();return}
 if(act==='creator'||act==='draw'||act==='maker'||act==='gallery'){if(act==='draw')f3.draftData='';go(({creator:'f3creator',draw:'f3draw',maker:'f3maker',gallery:'f3gallery'})[act]);return}
 if(act==='new-creature'){f3.draft=newCreature3();nav('f3creator');return}
 if(act==='new-object'){f3.object=newObject3();nav('f3maker');return}
 if(act==='save-creature'||act==='save-object'){
  const creature=act==='save-creature';let obj=creature?f3.draft:f3.object;let input=app.querySelector(creature?'#f3-name':'#f3-object-name');obj.name=f3Name(input?.value,creature?'LA MEVA CRIATURA':'EL MEU OBJECTE');obj.id=obj.id||'creacio-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
  try{f3Save({...obj});notify('✦ CREACIÓ DESADA!');go('f3gallery')}catch{f3Message('NO HI HA ESPAI PER DESAR. REVISA ELS DIBUIXOS ANTICS.')}return
 }
 if(act==='save-drawing'){
  const cv=app.querySelector('#f3-canvas');if(!cv)return;
  const img=cv.toDataURL('image/jpeg',.78);
  let x={kind:'drawing',name:f3Name(app.querySelector('#f3-drawing-name')?.value,'EL MEU DIBUIX'),image:img,id:'dibuix-'+Date.now()};
  try{f3Save(x);notify('✦ DIBUIX DESAT!');f3.draftData='';go('f3gallery')}catch{f3Message('NO HI HA ESPAI PER DESAR. ESBORRA ALGUN DIBUIX ANTIC.')}return
 }
 if(act.startsWith('delete-')){const id=act.slice(7);if(!window.confirm('VOLS ESBORRAR AQUESTA CREACIÓ?'))return;f3.gallery=f3.gallery.filter(x=>x.id!==id);try{localStorage.setItem(F3_KEY,JSON.stringify(f3.gallery))}catch{}nav('f3gallery');return}
 if(act.startsWith('edit-')){let x=f3.gallery.find(x=>x.id===act.slice(5));if(!x)return;if(x.kind==='creature'){f3.draft={...x};nav('f3creator')}else if(x.kind==='object'){f3.object={...x};nav('f3maker')}return}
 if(['brush','eraser'].includes(act)){f3.eraser=act==='eraser';f3MarkTool();return}
 if(act==='clear'){if(!window.confirm('VOLS NETEJAR EL DIBUIX?'))return;f3canvasClear();return}
 if(act==='undo'){f3Undo();return}
}
function f3bind(){
 app.querySelectorAll('[data-f3]').forEach(el=>el.addEventListener('click',()=>f3Event(el.dataset.f3)));
 app.querySelectorAll('[data-f3-option]').forEach(el=>el.addEventListener('click',()=>{let prop=el.dataset.f3Option,v=el.dataset.f3Value,obj=state.place==='f3maker'?f3.object:f3.draft;obj[prop]=v;if(prop==='species'){if(v==='conill'){obj.ears='orelles';obj.wings='cap';obj.tail='rodona'}else if(v==='monstret'){obj.ears='punxes';obj.wings='cap';obj.tail='punxa'}else{obj.ears='banyes';obj.wings='ales';obj.tail='llarga'}f3ChoiceSelected('ears',obj.ears);f3ChoiceSelected('wings',obj.wings);f3ChoiceSelected('tail',obj.tail)}f3UpdatePreview();f3ChoiceSelected(prop,v)}));
 app.querySelectorAll('[data-f3-color]').forEach(el=>el.addEventListener('click',()=>{const obj=state.place==='f3maker'?f3.object:f3.draft;obj[el.dataset.f3Color]=el.dataset.f3Value;f3UpdatePreview();for(let b of app.querySelectorAll(`[data-f3-color="${el.dataset.f3Color}"]`)){b.classList.toggle('chosen',b===el);b.setAttribute('aria-pressed',b===el)}}));
 if(state.place==='f3creator'){let el=app.querySelector('#f3-name');el?.addEventListener('input',()=>f3.draft.name=el.value)}
 if(state.place==='f3maker'){let el=app.querySelector('#f3-object-name');el?.addEventListener('input',()=>f3.object.name=el.value)}
 if(state.place==='f3draw')f3CanvasInit();
}
function f3ChoiceSelected(prop,v){app.querySelectorAll(`[data-f3-option="${prop}"]`).forEach(b=>{const a=b.dataset.f3Value===v;b.classList.toggle('active',a);b.setAttribute('aria-pressed',a)})}
function f3UpdatePreview(){let elem=app.querySelector(state.place==='f3maker'?'#f3-object-art':'#f3-creature-art');if(elem)elem.innerHTML=state.place==='f3maker'?objectSVG3(f3.object):creatureSVG3(f3.draft);let pt=app.querySelector('#f3-powertext');if(pt)pt.textContent=powerText3(f3.object.power)}
let f3UndoStack=[];
function f3CanvasInit(){const c=app.querySelector('#f3-canvas');if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;
 const backdrop=()=>{ctx.fillStyle='#fff9e8';ctx.fillRect(0,0,c.width,c.height)};
 const fromData=(data)=>{let image=new Image();image.onload=()=>{ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(image,0,0,c.width,c.height)};image.src=data};
 if(f3.draftData)fromData(f3.draftData);else backdrop();
 f3UndoStack=[];let painting=false,last=null;
 const pt=e=>{let r=c.getBoundingClientRect();return {x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}};
 const line=(a,b)=>{ctx.strokeStyle=f3.eraser?'#fff9e8':f3.color;ctx.lineWidth=f3.eraser?36:f3.brush;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()};
 c.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();if(f3UndoStack.length>=12)f3UndoStack.shift();f3UndoStack.push(ctx.getImageData(0,0,c.width,c.height));painting=true;last=pt(e);c.setPointerCapture(e.pointerId);line(last,last)});
 c.addEventListener('pointermove',e=>{if(!painting)return;e.preventDefault();const p=pt(e);line(last,p);last=p});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])c.addEventListener(ev,()=>{if(painting)f3.draftData=c.toDataURL('image/jpeg',.7);painting=false;last=null});
 app.querySelectorAll('[data-f3-ink]').forEach(b=>b.addEventListener('click',()=>{f3.color=b.dataset.f3Ink;f3.eraser=false;app.querySelectorAll('[data-f3-ink]').forEach(x=>x.classList.toggle('chosen',x===b));f3MarkTool()}));
 window.f3CanvasUndo=()=>{let prev=f3UndoStack.pop();if(prev){ctx.putImageData(prev,0,0);f3.draftData=c.toDataURL('image/jpeg',.7)}};
 window.f3CanvasClear=()=>{f3UndoStack.push(ctx.getImageData(0,0,c.width,c.height));backdrop();f3.draftData=c.toDataURL('image/jpeg',.7)};
}
function f3MarkTool(){let b=app.querySelector('[data-f3="eraser"]');if(b)b.setAttribute('aria-pressed',f3.eraser?'true':'false');b=app.querySelector('[data-f3="brush"]');if(b)b.setAttribute('aria-pressed',f3.eraser?'false':'true')}
function f3Undo(){if(typeof window.f3CanvasUndo==='function')window.f3CanvasUndo()}
function f3canvasClear(){if(typeof window.f3CanvasClear==='function')window.f3CanvasClear()}
render();
