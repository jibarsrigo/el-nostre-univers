'use strict';
/* Genera data/cataleg.json — etapa 1. No modifica jocs ni JSON antics. */
const fs = require('fs');
const crypto = require('crypto');

const personatges = JSON.parse(fs.readFileSync('data/personatges.json', 'utf8')).personatges || [];
const dif = JSON.parse(fs.readFileSync('data/diferencies.json', 'utf8'));
const ombres = JSON.parse(fs.readFileSync('data/ombres-trapelles.json', 'utf8'));
const paraules = JSON.parse(fs.readFileSync('data/paraules.json', 'utf8'));
const aprov = JSON.parse(fs.readFileSync('data/aprovacions-art.json', 'utf8'));

const ombresIds = new Set((ombres.secrets || []).map(s => s.id));
const paraulaIds = new Set(
  (paraules.words || [])
    .map(w => w.img || '')
    .filter(Boolean)
    .map(img => {
      const m = img.match(/personatge-([^.]+)\.webp/);
      return m ? m[1] : '';
    })
    .filter(Boolean)
);

const aprovMap = new Map((aprov.aprovacions || []).map(a => [a.id, a]));

function fileSha(p) {
  if (!p || !fs.existsSync(p)) return null;
  return crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex');
}

function estatArt(id, fitxer) {
  const a = aprovMap.get(id);
  if (!a) return 'pendent';
  if (a.fitxer && fitxer && a.fitxer !== fitxer) return 'pendent';
  return 'aprovat';
}

function fitxerDisponible(p) {
  return !!(p && fs.existsSync(p));
}

function estatPublicacio(disponible, actiu) {
  return disponible && actiu ? 'publicat' : disponible ? 'local' : 'falta';
}

function jocsPersonatgeBase(p) {
  const j = [];
  if ((p.tags || []).includes('conte')) j.push('conte');
  if (p.enabled !== false && (p.tags || []).includes('web')) j.push('cartes');
  if (ombresIds.has(p.id)) j.push('ombres');
  if (paraulaIds.has(p.id) || p.id === 'gat') j.push('paraules');
  return [...new Set(j)];
}

const catalog = new Map();

for (const p of personatges) {
  const fitxer = p.img || '';
  const disp = fitxerDisponible(fitxer);
  const actiu = p.enabled !== false;
  catalog.set(p.id, {
    id: p.id,
    tipus: 'personatge',
    nom: p.label,
    etiquetes: [...(p.tags || [])],
    estatArt: estatArt(p.id, fitxer),
    fitxer,
    fitxersRelacionats: [],
    fitxerDisponible: disp,
    estatPublicacio: estatPublicacio(disp, actiu),
    actiu,
    jocs: jocsPersonatgeBase(p),
    versio: 1,
    ...(p.grup ? { grup: p.grup } : {}),
    ...(p.contes ? { contes: p.contes } : {})
  });
}

const difIdsPerEscena = new Map();
for (const scene of dif.scenes || []) {
  for (const d of scene.diffs || []) {
    if (!d.id || !d.img) continue;
    const prev = difIdsPerEscena.get(d.id) || { imgs: new Set(), escenes: new Set(), message: d.message };
    prev.imgs.add(d.img);
    prev.escenes.add(scene.id);
    if (d.message) prev.message = d.message;
    difIdsPerEscena.set(d.id, prev);
  }
}

for (const [id, info] of difIdsPerEscena) {
  const imgs = [...info.imgs];
  const shas = imgs.map(fileSha).filter(Boolean);
  const uniqSha = [...new Set(shas)];
  if (uniqSha.length > 1) {
    throw new Error(`Catàleg: id "${id}" amb continguts diferents: ${imgs.join(' vs ')}`);
  }

  if (catalog.has(id)) {
    const ent = catalog.get(id);
    if (imgs.length) {
      const shaDif = fileSha(imgs[0]);
      const shaCat = fileSha(ent.fitxer);
      if (shaCat && shaDif && shaCat !== shaDif) {
        throw new Error(`Catàleg: "${id}" personatge i diferències amb SHA diferent`);
      }
      for (const alt of imgs) {
        if (alt !== ent.fitxer && !ent.fitxersRelacionats.includes(alt)) ent.fitxersRelacionats.push(alt);
      }
    }
    if (!ent.jocs.includes('diferencies')) ent.jocs.push('diferencies');
    for (const t of info.escenes) {
      const tag = `diferencies-${t}`;
      if (!ent.etiquetes.includes(tag)) ent.etiquetes.push(tag);
    }
    if (!ent.etiquetes.includes('diferencies')) ent.etiquetes.push('diferencies');
    continue;
  }

  const fitxer = imgs[0] || '';
  const disp = fitxerDisponible(fitxer);
  catalog.set(id, {
    id,
    tipus: 'objecte',
    nom: info.message ? String(info.message).replace(/\s*!\s*$/, '') : id,
    etiquetes: ['diferencies', ...[...info.escenes].map(s => `diferencies-${s}`)],
    estatArt: 'pendent',
    fitxer,
    fitxersRelacionats: imgs.slice(1),
    fitxerDisponible: disp,
    estatPublicacio: estatPublicacio(disp, true),
    actiu: true,
    jocs: ['diferencies'],
    versio: 1
  });
}

const dorsPath = 'imagenes/cartes-dors.webp';
if (fitxerDisponible(dorsPath)) {
  catalog.set('cartes-dors', {
    id: 'cartes-dors',
    tipus: 'auxiliar',
    nom: 'Dors de les cartes',
    etiquetes: ['cartes'],
    estatArt: 'pendent',
    fitxer: dorsPath,
    fitxersRelacionats: [],
    fitxerDisponible: true,
    estatPublicacio: 'publicat',
    actiu: true,
    jocs: ['cartes'],
    versio: 1
  });
}

const etiquetesInicials = [...new Set([...catalog.values()].flatMap(e => e.etiquetes))].filter(Boolean).sort();

const out = {
  versio: 1,
  titol: "Catàleg comú de l'univers",
  etiquetesInicials,
  entrades: [...catalog.values()].sort((a, b) => {
    const o = { auxiliar: 0, objecte: 1, personatge: 2 };
    const ta = o[a.tipus] ?? 9;
    const tb = o[b.tipus] ?? 9;
    return ta !== tb ? ta - tb : a.id.localeCompare(b.id);
  })
};

fs.writeFileSync('data/cataleg.json', JSON.stringify(out, null, 2) + '\n');
console.log('OK: data/cataleg.json —', out.entrades.length, 'entrades');