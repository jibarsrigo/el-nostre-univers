'use strict';
const fs = require('fs');
const assert = require('assert');
const crypto = require('crypto');

const catal = JSON.parse(fs.readFileSync('data/cataleg.json', 'utf8'));
const personatges = JSON.parse(fs.readFileSync('data/personatges.json', 'utf8')).personatges || [];
const aprov = JSON.parse(fs.readFileSync('data/aprovacions-art.json', 'utf8'));
const aprovIds = new Set((aprov.aprovacions || []).map(a => a.id));

assert.equal(catal.versio, 1);
assert.ok(Array.isArray(catal.entrades) && catal.entrades.length > 0);

const ids = catal.entrades.map(e => e.id);
assert.equal(new Set(ids).size, ids.length, 'ids duplicats');

const req = [
  'id', 'tipus', 'nom', 'etiquetes', 'estatArt', 'fitxer',
  'fitxerDisponible', 'estatPublicacio', 'actiu', 'jocs', 'versio'
];
for (const e of catal.entrades) {
  for (const k of req) assert.ok(k in e, `${e.id} falta ${k}`);
  assert.ok(['personatge', 'objecte', 'auxiliar'].includes(e.tipus));
  assert.ok(['aprovat', 'pendent'].includes(e.estatArt));
  if (e.estatArt === 'aprovat') assert.ok(aprovIds.has(e.id), `${e.id} aprovat sense registre Jose`);
  if (e.actiu && e.fitxer && e.fitxerDisponible) {
    assert.ok(fs.existsSync(e.fitxer), `fitxer inexistent: ${e.fitxer} (${e.id})`);
  }
}

for (const p of personatges) {
  const c = catal.entrades.find(e => e.id === p.id && e.tipus === 'personatge');
  assert.ok(c, `personatge ${p.id} al catàleg`);
  assert.equal(c.nom, p.label);
  assert.equal(c.fitxer, p.img);
  assert.equal(c.actiu, p.enabled !== false);
}

const gat = catal.entrades.find(e => e.id === 'gat');
const nacar = catal.entrades.find(e => e.id === 'nacar');
assert.ok(gat && gat.estatArt === 'aprovat' && gat.jocs.includes('cartes'));
assert.ok(nacar && nacar.estatArt === 'aprovat' && nacar.jocs.includes('cartes') && !nacar.jocs.includes('ombres'));

const drac = catal.entrades.find(e => e.id === 'drac-inventem');
assert.ok(drac && drac.tipus === 'personatge');
assert.ok(drac.jocs.includes('cartes') && drac.jocs.includes('diferencies'));
assert.equal(drac.estatArt, 'pendent');
const sha = p => crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex');
const s1 = sha('imagenes/personatges/personatge-drac-inventem.webp');
const s2 = sha('imagenes/univers-assets/obj-drac-inventem.webp');
assert.equal(s1, s2);

const moix = catal.entrades.find(e => e.id === 'moix');
assert.ok(moix && moix.estatArt === 'pendent' && moix.actiu);

const dors = catal.entrades.find(e => e.id === 'cartes-dors');
assert.ok(dors && dors.tipus === 'auxiliar' && dors.estatArt === 'pendent');

const autoAprovatConte = catal.entrades.filter(e => e.tipus === 'personatge' && (e.contes || e.etiquetes?.includes('conte')) && e.estatArt === 'aprovat');
assert.equal(autoAprovatConte.length, 0, 'cap conte auto-aprovat');

console.log('OK: catàleg —', catal.entrades.length, 'entrades, aprovacions explícites');