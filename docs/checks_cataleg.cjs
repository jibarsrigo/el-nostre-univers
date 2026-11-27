'use strict';
const fs = require('fs');
const assert = require('assert');

const catal = JSON.parse(fs.readFileSync('data/cataleg.json', 'utf8'));
const personatges = JSON.parse(fs.readFileSync('data/personatges.json', 'utf8')).personatges || [];

assert.equal(catal.versio, 1);
assert.ok(Array.isArray(catal.entrades) && catal.entrades.length > 0);

const ids = catal.entrades.map(e => e.id);
assert.equal(new Set(ids).size, ids.length, 'ids duplicats');

const req = ['id', 'tipus', 'nom', 'etiquetes', 'estatArt', 'fitxer', 'actiu', 'jocs', 'versio'];
for (const e of catal.entrades) {
  for (const k of req) assert.ok(k in e, `${e.id} falta ${k}`);
  assert.ok(['personatge', 'objecte'].includes(e.tipus));
  assert.ok(['aprovat', 'pendent'].includes(e.estatArt));
  if (e.actiu && e.fitxer) assert.ok(fs.existsSync(e.fitxer), `fitxer inexistent: ${e.fitxer} (${e.id})`);
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

console.log('OK: catàleg v1 —', catal.entrades.length, 'entrades, sync amb personatges.json');