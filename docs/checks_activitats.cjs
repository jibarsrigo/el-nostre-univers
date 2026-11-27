'use strict';
const fs = require('fs');
const assert = require('assert');
const path = require('path');

const root = path.resolve(__dirname, '..');
const reg = JSON.parse(fs.readFileSync(path.join(root, 'data/activitats.json'), 'utf8'));
const personatges = JSON.parse(fs.readFileSync(path.join(root, 'data/personatges.json'), 'utf8'));
const fase2 = fs.readFileSync(path.join(root, 'js/fase2.js'), 'utf8');

const SALA_TO_PLACE = {
  torre: 'tower',
  biblioteca: 'library',
  taller: 'workshop',
  mapa: 'map'
};

const HOTSPOTS = {
  map: ['library', 'tower', 'workshop', 'secret', 'bridge'],
  library: ['book', 'chest', 'window', 'cards', 'owl', 'ladder', 'monster', 'rabbit', 'contes'],
  tower: ['telescope', 'orb', 'chest', 'map', 'small-door', 'stairs', 'owl', 'nest', 'pairs', 'words', 'lupa'],
  workshop: ['creature', 'colors', 'stars', 'chest', 'window', 'search']
};

const PLACES_FROM_HOTSPOT = {
  pairs: 'pairs',
  words: 'words',
  search: 'search',
  monster: 'monster',
  rabbit: 'rabbit'
};

assert.equal(reg.versio, 1);
assert.ok(Array.isArray(reg.familles) && reg.familles.length > 0, 'familles buides');
const familleIds = new Set(reg.familles.map(f => f.id));
assert.equal(familleIds.size, reg.familles.length, 'ids familles duplicats');

const activitats = reg.activitats || [];
assert.ok(activitats.length > 0, 'cap activitat');
const actIds = activitats.map(a => a.id);
assert.equal(new Set(actIds).size, actIds.length, 'ids activitats duplicats');

const nivellIds = new Set((personatges.nivells || []).map(n => n.id));

const reqAct = [
  'id', 'nom', 'familia', 'ubicacio', 'entrada', 'nivells',
  'disponible', 'legacyRecordKey', 'finalitzacio', 'granAventura'
];

for (const a of activitats) {
  for (const k of reqAct) assert.ok(k in a, `${a.id} falta ${k}`);
  assert.ok(familleIds.has(a.familia), `${a.id} familia inexistent: ${a.familia}`);

  const { sala, hotspot } = a.ubicacio;
  assert.ok(sala && hotspot, `${a.id} ubicacio incompleta`);
  const place = SALA_TO_PLACE[sala];
  assert.ok(place, `${a.id} sala desconeguda: ${sala}`);
  assert.ok(
    (HOTSPOTS[place] || []).includes(hotspot),
    `${a.id} hotspot ${hotspot} no existeix a ${place}`
  );

  const ent = a.entrada;
  assert.equal(ent.tipus, 'hotspot', `${a.id} entrada.tipus`);
  assert.equal(ent.place, place, `${a.id} entrada.place ha de coincidir amb ubicacio.sala`);
  assert.equal(ent.hotspotId, hotspot, `${a.id} entrada.hotspotId ha de coincidir amb ubicacio.hotspot`);
  assert.ok(
    (HOTSPOTS[ent.place] || []).includes(ent.hotspotId),
    `${a.id} hotspot d'entrada inexistent`
  );

  assert.equal(a.nivells.font, 'personatges', `${a.id} nivells.font`);
  assert.ok(Array.isArray(a.nivells.claus) && a.nivells.claus.length, `${a.id} nivells.claus`);
  for (const clau of a.nivells.claus) {
    assert.ok(nivellIds.has(clau), `${a.id} nivell inexistent a personatges.json: ${clau}`);
  }

  const dest = PLACES_FROM_HOTSPOT[ent.hotspotId] || null;
  if (dest) {
    assert.match(fase2, new RegExp(`${dest}:`), `${a.id} escena ${dest} no registrada a fase2`);
  }

  const ga = a.granAventura;
  assert.strictEqual(typeof ga.candidataMissio, 'boolean');
  assert.strictEqual(typeof ga.validadaMissio, 'boolean');

  assert.equal(a.finalitzacio.tipus, 'condicio');
  assert.ok(a.finalitzacio.condicio);
  assert.ok(a.finalitzacio.puntUnic);
}

const cartes = activitats.find(a => a.id === 'cartes');
assert.ok(cartes, 'pilot cartes obligatori');
assert.equal(cartes.legacyRecordKey, 'pairs');
assert.equal(cartes.granAventura.candidataMissio, true);
assert.equal(cartes.granAventura.validadaMissio, false);
assert.equal(activitats.length, 1, 'etapa 2 PR A: només pilot cartes');
assert.deepEqual(cartes.nivells.claus.sort(), [...nivellIds].sort(), 'cartes claus = personatges.nivells');
assert.equal(cartes.nivells.claus.length, 4, 'cartes: quatre nivells');

console.log('OK: activitats —', activitats.length, 'activitat(s),', reg.familles.length, 'familles');