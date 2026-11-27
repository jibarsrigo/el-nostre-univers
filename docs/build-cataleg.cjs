'use strict';
/* Genera data/cataleg.json des de les fonts actuals (etapa 1). Sense canviar jocs encara. */
const fs = require('fs');
const path = require('path');

const personatges = JSON.parse(fs.readFileSync('data/personatges.json', 'utf8')).personatges || [];
const dif = JSON.parse(fs.readFileSync('data/diferencies.json', 'utf8'));
const ombres = JSON.parse(fs.readFileSync('data/ombres-trapelles.json', 'utf8'));
const paraules = JSON.parse(fs.readFileSync('data/paraules.json', 'utf8'));

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

const APROVAT_EXPLICIT = new Set(['gat', 'nacar']);

function estatArt(p) {
  if (p.enabled === false) return 'pendent';
  if ((p.tags || []).includes('conte') || APROVAT_EXPLICIT.has(p.id)) return 'aprovat';
  const fitxer = p.img;
  if (!fitxer || !fs.existsSync(fitxer)) return 'pendent';
  return 'aprovat';
}

function jocsPersonatge(p) {
  const j = [];
  if ((p.tags || []).includes('conte')) j.push('conte');
  if (p.enabled !== false && (p.tags || []).includes('web')) j.push('cartes');
  if (ombresIds.has(p.id)) j.push('ombres');
  if (paraulaIds.has(p.id) || p.id === 'gat') j.push('paraules');
  return [...new Set(j)];
}

const entradesPersonatge = personatges.map(p => ({
  id: p.id,
  tipus: 'personatge',
  nom: p.label,
  etiquetes: [...(p.tags || [])],
  estatArt: estatArt(p),
  fitxer: p.img || '',
  actiu: p.enabled !== false,
  jocs: jocsPersonatge(p),
  versio: 1,
  ...(p.grup ? { grup: p.grup } : {}),
  ...(p.contes ? { contes: p.contes } : {})
}));

const personatgeIds = new Set(personatges.map(p => p.id));
const objecteVistos = new Map();
for (const scene of dif.scenes || []) {
  for (const d of scene.diffs || []) {
    if (!d.id || objecteVistos.has(d.id) || personatgeIds.has(d.id)) continue;
    objecteVistos.set(d.id, {
      id: d.id,
      tipus: 'objecte',
      nom: d.message ? String(d.message).replace(/\s*!\s*$/, '') : d.id,
      etiquetes: ['diferencies', scene.id],
      estatArt: fs.existsSync(d.img) ? 'aprovat' : 'pendent',
      fitxer: d.img,
      actiu: true,
      jocs: ['diferencies'],
      versio: 1
    });
  }
}

const etiquetesInicials = [...new Set(entradesPersonatge.flatMap(e => e.etiquetes).concat([...objecteVistos.values()].flatMap(e => e.etiquetes)))]
  .filter(Boolean)
  .sort();

const out = {
  versio: 1,
  titol: "Catàleg comú de l'univers",
  etiquetesInicials,
  entrades: [...entradesPersonatge, ...objecteVistos.values()].sort((a, b) => (a.tipus === b.tipus ? a.id.localeCompare(b.id) : a.tipus.localeCompare(b.tipus)))
};

fs.writeFileSync('data/cataleg.json', JSON.stringify(out, null, 2) + '\n');
console.log('OK: data/cataleg.json —', out.entrades.length, 'entrades');