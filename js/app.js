'use strict';
/* El nostre univers — Fase 1: espais i exploració. Sense dependències. */
const app=document.getElementById('app');
const IMG=p=>'imagenes/'+p+'.webp';
const KEY='nostre-fase1-records';
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
const state={place:'welcome',previous:'map',step:0,flash:'',unlocked:{...saved},history:[],full:false};
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(state.unlocked))}catch{}};
const remember=(id)=>{state.unlocked[id]=true;persist()};
const screens={welcome:'benvinguda',map:'mapa',library:'biblioteca',tower:'torre',workshop:'taller'};
const titles={map:'EL NOSTRE UNIVERS',library:'LLEGIM!',tower:'INVESTIGUEM!',workshop:'INVENTEM!'};
const hotspots={
map:[
 ['library','BIBLIOTECA · LLEGIM!','rect',[75,140,620,478]],
 ['tower','TORRE · INVESTIGUEM!','rect',[788,18,1188,498]],
 ['workshop','TALLER · INVENTEM!','rect',[1232,148,1648,528]],
 ['secret','PORTA DIMINUTA','rect',[1188,548,1408,792]],
 ['bridge','EL PONT','rect',[758,528,1142,742]]
],
library:[
 ['book','EL LLIBRE MÀGIC','rect',[560,710,1020,850]],
 ['chest','EL COFRE','rect',[1125,468,1370,648]],
 ['window','LA FINESTRA','rect',[1145,22,1668,448]],
 ['cards','LES CARTES','rect',[1095,705,1635,920]],
 ['owl','EL MUSSOL','rect',[12,8,198,218]],
 ['ladder','L’ESCALA','rect',[248,198,455,575]]
],
tower:[
 ['telescope','EL TELESCOPI','rect',[460,275,705,455]],
 ['orb','LA BOLA MÀGICA','rect',[730,470,880,600]],
 ['chest','EL COFRE','rect',[1125,330,1285,470]],
 ['map','EL MAPA','rect',[910,120,1120,300]],
 ['small-door','LA PORTA PETITA','rect',[1405,520,1545,750]],
 ['stairs','LES ESCALES','rect',[1310,0,1580,400]],
 ['owl','EL MUSSOL','rect',[660,100,800,255]]
],
workshop:[
 ['creature','EL DRAC','rect',[790,430,1040,700]],
 ['colors','LES PINTURES','rect',[40,690,470,920]],
 ['stars','LES ESTRELLES','rect',[1020,20,1260,190]],
 ['chest','LA CAIXA','rect',[1475,465,1635,630]],
 ['window','LA FINESTRA','rect',[0,30,360,430]]
]};
const rooms={library:'📖 LLEGIM!',tower:'🔎 INVESTIGUEM!',workshop:'🎨 INVENTEM!'};
const strip=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function nav(place){state.place=place;state.step=0;render()}
function go(id){state.previous=state.place;state.history.push(state.place);nav(id)}
function back(){nav(state.history.pop()||'map')}
function topbar(place){return `<div class="topbar"><div>${place!=='map'&&place!=='welcome'?`<button class="pill icon" data-action="back" aria-label="Tornar enrere">← TORNAR</button>`:''}<button class="pill" data-action="home">⌂ INICI</button></div><div><button class="pill icon" data-action="help" aria-label="Com es juga?">?</button><button class="pill icon" data-action="fullscreen" aria-label="Pantalla completa">${document.fullscreenElement?'⤢':'⛶'}</button></div></div>`}
const FIREFLY={
map:{library:[150,420],tower:[840,150],workshop:[1570,250],secret:[1168,650],bridge:[810,590]},
library:{book:[980,730],chest:[1348,530],window:[1210,80],cards:[1148,760],owl:[175,55],ladder:[235,240],monster:[470,740],rabbit:[40,850]},
tower:{telescope:[500,320],orb:[855,530],chest:[1255,355],map:[960,155],'small-door':[1435,545],stairs:[1370,95],owl:[785,140],nest:[370,85],lupa:[775,685],pairs:[980,725],words:[48,55]},
workshop:{creature:[845,470],colors:[80,750],stars:[1045,48],chest:[1505,505],window:[55,75],search:[1270,350]}
};
const SOUND_ICON='<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M12 26h10l12-10v32L22 38H12z"/><path class="wave" d="M40 24a12 12 0 0 1 0 16M48 16a22 22 0 0 1 0 32" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
const FULL_ICON='<svg class="ico-enter" viewBox="0 0 64 64" aria-hidden="true"><path d="M12 24V12h12M52 24V12H40M12 40v12h12M52 40v12H40" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><svg class="ico-exit" viewBox="0 0 64 64" aria-hidden="true"><path d="M24 12v12H12M40 12v12h12M24 52V40H12M40 52V40h12" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function musicOn(){const music=document.getElementById('music');return !!(music&&music.paused===false&&music.ended===false)}
function soundButton(ghost){return `<button type="button" class="corner-sound${ghost?' ghost':''}" data-action="music" aria-pressed="${musicOn()?'true':'false'}" aria-label="Música">${ghost?'':SOUND_ICON}</button>`}
function welcomeCorners(){return `<div class="corner-controls">${soundButton(false)}<button type="button" class="corner-full" data-action="fullscreen" aria-label="Pantalla completa">${FULL_ICON}</button></div>`}
function art(place){const hs=hotspots[place]||[];const dots=FIREFLY[place]||{};const zones=hs.map(([id,label,,p])=>{const x=p[0],y=p[1],w=p[2]-p[0],h=p[3]-p[1];const dot=dots[id]||[x+18,y+18];return `<rect tabindex="0" role="button" aria-label="${strip(label)}" data-hotspot="${id}" class="hit" x="${x}" y="${y}" width="${w}" height="${h}"><title>${strip(label)}</title></rect><g class="firefly" aria-hidden="true"><circle cx="${dot[0]}" cy="${dot[1]}" r="20"></circle><circle cx="${dot[0]}" cy="${dot[1]}" r="9"></circle></g>`}).join('');return `<div class="art"><img src="${IMG(screens[place])}" alt="${strip(titles[place]||'Un món màgic')}" draggable="false"><svg class="hit-layer" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid meet">${zones}</svg>${place==='map'?soundButton(true):''}</div>`}
function renderF1(){document.body?.classList.toggle('welcome-open',state.place==='welcome');const place=state.place;
 if(place==='welcome')app.innerHTML=`<div class="world welcome"><div class="art"><img src="${IMG('benvinguda')}" alt="El nostre univers. Un món que creix amb tu" draggable="false"><button class="welcome-start" data-action="start" aria-label="COMENCEM!"></button>${welcomeCorners()}</div></div>`;
 else if(screens[place])app.innerHTML=`<div class="world${place==='map'?' is-map':''}">${art(place)}${topbar(place)}<div class="footer">${place==='map'?'🦊 TOCA UN LLOC I DESCOBREIX QUÈ AMAGA':`🦊 ${rooms[place]} · TOCA ELS OBJECTES`}</div></div>`;
 else renderScene();
 bindF1(); if(typeof bindExtras==='function')bindExtras();}
function sceneFrame(inner,bg='biblioteca'){if(['biblioteca','torre','taller'].includes(screens[state.previous]) && state.place!=='book')bg=screens[state.previous];if(!bg||bg==='benvinguda')bg='mapa';return `<div class="scene" style="background-image:url('${IMG(bg)}')">${topbar(state.place)}<section class="stage">${inner}</section></div>`}
const A=(label,id='next')=>`<button class="choice" data-action="${id}">${label}</button>`;
const B=(label,id)=>`<button class="choice" data-action="${id}">${label}</button>`;
function openSVG(open=false){return `<svg viewBox="0 0 440 250" aria-label="Arbre amb una porta màgica"><defs><linearGradient id="tree" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#653d24"/><stop offset=".55" stop-color="#a56e39"/><stop offset="1" stop-color="#583c24"/></linearGradient></defs><path d="M100 250q45-92 34-250h190q-35 106-30 250" fill="url(#tree)"/><path d="M0 58q65-63 169-48M243 7Q332-13 440 44" fill="none" stroke="#5b863f" stroke-width="65" stroke-linecap="round"/><path d="M0 63q65-63 169-48M243 7Q332-13 440 44" fill="none" stroke="#b3cd56" stroke-width="16" stroke-linecap="round" opacity=".3"/><path d="M169 250v-86a51 51 0 0 1 102 0v86" fill="#352048" stroke="#e5c776" stroke-width="8"/>${open?'<path d="M225 245q20-36 39-42q-28-16-46-1" fill="none" stroke="#ffdc79" stroke-width="11"/>':'<path d="M169 250v-86a51 51 0 0 1 102 0v86Z" fill="#aa663f" stroke="#46263f" stroke-width="6"/><circle cx="252" cy="202" r="7" fill="#ffe28c"/>'}<path d="M25 248q20-26 48-8M360 245q30-26 65-2" fill="none" stroke="#7cae58" stroke-width="11"/><circle cx="87" cy="233" r="7" fill="#f8b5d8"/><circle cx="352" cy="237" r="7" fill="#f8b5d8"/></svg>`}
function bookView(){const s=state.step,done=!!state.unlocked.book;return sceneFrame(`<h2>📖 EL LLIBRE DE LES SORPRESES</h2><div class="book">${s===0?`<button class="cover" data-action="next" aria-label="Obrir el llibre">✦<br>UN BOSC<br>SECRET<br><small style="font:800 18px Trebuchet MS">TOCA PER OBRIR</small></button>`:`<div class="page"><p>${s===1?'UN BOSC MÀGIC':s===2?'UNA PORTA!':'LA PORTA ÉS OBERTA!'}</p>${openSVG(s>=3)}</div><div class="page"><p>${s===1?'QUI HI VIU?':s===2?'TOCA LA PORTA':'QUINA SORPRESA!'}</p>${s>=3?`<div style="font-size:clamp(70px,12vw,130px)">🐇</div>`:`<button class="reveal" data-action="next" aria-label="Descobrir la porta">${openSVG(false)}</button>`}</div>`}</div><div class="actions">${s===0?'':s===1?A('SEGÜENT →'):s===2?A('🚪 OBRIM LA PORTA'):s===3?B('🐇 SALUDA EL CONILL','finish-book'):B('↻ TORNEM A MIRAR','reset-scene')} ${B('← BIBLIOTECA','back')}</div>${done?'<span class="badge">✦ JA CONEIXES AQUEST SECRET</span>':''}`,'biblioteca')}
function chestView(){let s=state.step;return sceneFrame(`<h2>✦ EL COFRE ANTIC</h2><div class="drawer"><div class="inside">${s===0?'🔒':s===1?'✨ 🔑 ✨':'🌟 UNA CLAU DAURADA'}</div></div><p>${s===0?'ESTÀ TANCAT...':s===1?'CLIC! S’HA OBERT!':'GUARDAM LA CLAU!'}</p><div class="actions">${s===0?A('TOCA EL PANY'):s===1?B('🔑 AGAFAM LA CLAU','finish-key'):B('🚪 CERCAM UNA PORTA','secret-door')} ${B('← TORNAR','back')}</div>`,'torre')}
function secretView(){if(state.unlocked.key&&state.step<1)state.step=1;const s=state.step;return sceneFrame(`<h2>🚪 LA PORTA DIMINUTA</h2><div class="portal" style="border-radius:24px;aspect-ratio:1.5;width:min(490px,70vw);height:auto">${s<3?openSVG(s>=2):'<div class="door">🐇</div>'}</div><p>${s===0?'HI HA UNA PORTA PETITONA!':s===1?'QUI LA POT OBRIR?':s===2?'LA PORTA S’OBRE!':'UN CONILL VALENT!'}</p><div class="actions">${s===0?A('TOCA LA PORTA'):s===1?(state.unlocked.key?A('🔑 OBRIM AMB LA CLAU'):B('🔎 CERCAM LA CLAU','tower-go')):s===2?A('ENTRAM →'):B('🐇 EXPLORAM JUNTS!','finish-secret')} ${B('← TORNAR','back')}</div>${s===1&&!state.unlocked.key?'<small class="hint">POTS CERCAR UNA CLAU A LA TORRE</small>':''}`,'mapa')}
function telescopeView(){return sceneFrame(`<h2>🔭 EL TELESCOPI</h2><div class="portal"><img src="${IMG('mapa')}" alt="Vista màgica d’un paisatge llunyà" style="object-position:${state.step?'82% 12%':'58% 28%'}"></div><p>${state.step?'UN CASTELL ENTRE NÚVOLS!':'MIRA BEN ENFORA...'}</p><div class="actions">${state.step?B('✦ HO HE VIST!','finish-telescope'):A('🔭 MIRAM MÉS A PROP')} ${B('← TORRE','back')}</div>`,'torre')}
function owlView(){return sceneFrame(`<h2>🦉 EL MUSSOL MISSATGER</h2><div class="owl">🦉</div>${state.step?`<div class="scroll"><p>HI HA UNA ESCOLA MÀGICA!</p><p>EL MUSSOL ENS HI CONVIDA.</p></div>`:'<p>PORTA UNA CARTA!</p>'}<div class="actions">${state.step?B('✦ DESAM LA CARTA','finish-owl'):A('✉️ OBRIM LA CARTA')} ${B('← TORNAR','back')}</div>`,'torre')}
function windowView(){return sceneFrame(`<h2>🌿 QUÈ HI HA FORA?</h2><div class="portal"><img src="${IMG('mapa')}" alt="El bosc que envolta el nostre univers"></div><p>EL BOSC ESTÀ PLE DE SECRETS!</p><div class="actions">${B('🌳 ANEM AL MAPA','map-go')} ${B('← TORNAR','back')}</div>`,'biblioteca')}
function bridgeView(){return sceneFrame(`<h2>🌉 EL PONT DE LES LLUMS</h2><div class="portal"><img src="${IMG('mapa')}" alt="El pont del riu màgic" style="object-position:54% 70%"></div><p>ON ANIREM ARA?</p><div class="actions">${B('📖 A LA BIBLIOTECA','library-go')}${B('🚪 A LA PORTA SECRETA','secret-door')}${B('← MAPA','back')}</div>`,'mapa')}
function atticView(){return sceneFrame(`<h2>🪜 L’ESCALA DELS LLIBRES</h2><div class="portal"><div class="door">📚</div></div><p>UN LLIBRE HA CAIGUT!</p><div class="actions">${B('📖 L’OBRIM','book-go')}${B('← BIBLIOTECA','back')}</div>`,'biblioteca')}
function letterView(){return sceneFrame(`<h2>✉️ LA CARTA MISTERIOSA</h2><div class="scroll"><p>HOLA, EXPLORADORA!</p><p>HE VIST UNA PORTA MOLT PETITA.</p><p>LA CERCAM?</p></div><div class="actions">${B('🚪 CERCAM LA PORTA','secret-door')}${B('← BIBLIOTECA','back')}</div>`,'biblioteca')}
function boxView(){return sceneFrame(`<h2>🎁 LA CAIXA DE LES SORPRESES</h2><div class="drawer"><div class="inside">${state.step?'🌈 🦋 ✨':'🎁'}</div></div><p>${state.step?'UNA PAPALLONA DE COLORS!':'QUÈ HI TROBAREM?'}</p><div class="actions">${state.step?B('🦋 VISCA!','finish-atelier'):A('OBRIM LA CAIXA')}${B('← TALLER','back')}</div>`,'taller')}
function stairsView(){return sceneFrame(`<h2>🌀 LES ESCALES</h2><div class="stair">🌀🏰</div><p>ON ENS PORTARAN?</p><div class="actions">${B('🦉 SEGUIM EL MUSSOL','owl-go')}${B('🔭 VEIM EL CEL','telescope-go')}${B('← TORRE','back')}</div>`,'torre')}
function mapView(){return sceneFrame(`<h2>🗺️ EL MAPA MISTERIÓS</h2><div class="portal"><img src="${IMG('mapa')}" alt="Mapa del món fantàstic"></div><p>TRES LLOCS PER EXPLORAR!</p><div class="actions">${B('📖 LLEGIM!','library-go')}${B('🎨 INVENTEM!','workshop-go')}${B('← TORRE','back')}</div>`,'torre')}
function crystalView(){return sceneFrame(`<h2>🔮 LA BOLA MÀGICA</h2><div class="portal"><div class="door">${state.step?'🌟':'🔮'}</div></div><p>${state.step?'UNA ESTRELLA ENS GUIA!':'VEUS UNA LLUM A DINS?'}</p><div class="actions">${state.step?B('✨ RECORDAM LA LLUM','finish-crystal'):A('TOCA LA BOLA')} ${B('← TORNAR','back')}</div>`,'torre')}
function atelierView(){return sceneFrame(`<h2>🎨 EL RACÓ DEL TALLER</h2><div class="drawer" style="background:linear-gradient(145deg,#8e5d7d,#432b73)"><div class="inside">${state.step===0?'🎨 🖌️ 🌈':state.step===1?'💛 💜 💙':'✨ 🎨 ✨'}</div></div><p>${state.step===0?'QUÈ PODEM INVENTAR?':state.step===1?'QUINS COLORS TAN BONICS!':'HEM OMPLERT EL TALLER DE COLORS!'}</p><div class="actions">${state.step<2?A(state.step?'PINTAM!':'OBRIM LES PINTURES'):B('✨ QUINA MERAVELLA!','finish-atelier')} ${B('← TALLER','back')}</div><small class="hint">EL TALLER CREATIU COMPLET ARRIBARÀ A LA FASE 3</small>`,'taller')}
function dragonView(){return sceneFrame(`<h2>🐉 EL PETIT DRAC</h2><div class="owl">🐉</div><p>${state.step?'EL DRAC ENS HA VIST!':'MIRA QUI ENS ESPERA!'}</p><div class="actions">${state.step?B('⭐ BON DIA, DRAC!','finish-dragon'):A('SALUDEM EL DRAC')} ${B('← TALLER','back')}</div>`,'taller')}
const SCENES={bridge:bridgeView,attic:atticView,letter:letterView,box:boxView,book:bookView,chest:chestView,secret:secretView,telescope:telescopeView,owl:owlView,window:windowView,stairs:stairsView,mapstudy:mapView,orb:crystalView,atelier:atelierView,dragon:dragonView};
function renderScene(){const f=SCENES[state.place];app.innerHTML=f?f():sceneFrame(`<h2>UN SECRET PER DESCOBRIR</h2>${B('← TORNAR','back')}`);}
function hotspotF1(id){const place=state.place;
 if(place==='map')return go(({library:'library',tower:'tower',workshop:'workshop',secret:'secret',bridge:'bridge'})[id]||'map');
 if(place==='library')return go(({book:'book',chest:'chest',window:'window',cards:'letter',owl:'owl',ladder:'attic'})[id]);
 if(place==='tower')return go(({telescope:'telescope',orb:'orb',chest:'chest',map:'mapstudy','small-door':'secret',stairs:'stairs',owl:'owl'})[id]);
 if(place==='workshop')return go(({creature:'dragon',colors:'atelier',stars:'atelier',chest:'box',window:'window'})[id]);
}
function notify(t){document.querySelector('.notice')?.remove();const e=document.createElement('div');e.className='notice';e.setAttribute('role','status');e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),3000)}
function actionF1(id){switch(id){case'start':nav('map');if(document.fullscreenEnabled&&!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{});break;
case'next':if(state.place==='secret'&&state.step===1&&!state.unlocked.key){notify('LA CLAU ÉS AL COFRE DE LA TORRE!');break;}state.step=Math.min(state.step+1,3);render();break;
case'reset-scene':state.step=0;render();break;
case'back':back();break;
case'home':state.history=[];nav(state.place==='map'?'welcome':'map');break;
case'music':toggleMusic();break;
case'fullscreen':if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else if(document.fullscreenEnabled)document.documentElement.requestFullscreen().catch(()=>{});else notify('PANTALLA COMPLETA NO DISPONIBLE');break;
case'help':notify('TOCA ELS OBJECTES DEL DIBUIX. POTS TORNAR ENRERE SEMPRE.');break;
case'finish-book':remember('book');notify('HAS CONEGUT EL CONILL!');back();break;
case'finish-key':remember('key');notify('JA TENS LA CLAU!');back();break;
case'finish-secret':remember('secret');notify('HAS DESCOBERT LA PORTA!');back();break;
case'finish-owl':remember('owl');notify('CARTA DESADA!');back();break;
case'finish-crystal':remember('crystal');notify('LA LLUM T’ACOMPANYA!');back();break;
case'finish-telescope':remember('telescope');notify('HAS VIST EL CASTELL!');back();break;
case'finish-dragon':remember('dragon');notify('EL DRAC ÉS EL TEU AMIC!');back();break;
case'finish-atelier':remember('atelier');notify('QUINA DESCOBERTA!');back();break;
case'secret-door':go('secret');break;
case'tower-go':go('tower');break;
case'map-go':go('map');break;
case'owl-go':go('owl');break;
case'telescope-go':go('telescope');break;
case'library-go':go('library');break;
case'book-go':go('book');break;
case'workshop-go':go('workshop');break;
default:break;}}
function bindF1(){app.querySelectorAll('[data-hotspot]').forEach(el=>{const run=()=>hotspot(el.dataset.hotspot);el.addEventListener('click',run);el.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();run()}})});app.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>action(el.dataset.action)))}
document.addEventListener('fullscreenchange',()=>{app.querySelectorAll('.pill[data-action="fullscreen"]').forEach(b=>{b.textContent=document.fullscreenElement?'⤢':'⛶'})});
renderF1();
function paintMusic(){const music=document.getElementById('music'),btn=app.querySelector('[data-action="music"]');if(btn&&music&&typeof music.paused==='boolean')btn.setAttribute('aria-pressed',!music.paused&&!music.ended?'true':'false')}
function toggleMusic(){const music=document.getElementById('music');if(!music||typeof music.play!=='function')return;if(!music.paused&&!music.ended){music.pause();return}if(music.ended)music.currentTime=0;const pending=music.play();if(pending&&typeof pending.catch==='function')pending.catch(()=>{})}
function setupMusic(){const music=document.getElementById('music');if(!music||typeof music.play!=='function'||typeof music.addEventListener!=='function')return;['play','pause','ended'].forEach(ev=>music.addEventListener(ev,paintMusic))}
setupMusic();
