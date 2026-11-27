'use strict';
const fs = require('fs');
const assert = require('assert');
const path = require('path');

const root = path.resolve(__dirname, '..');
const reg = JSON.parse(fs.readFileSync(path.join(root, 'data/activitats.json'), 'utf8'));
const personatges = JSON.parse(fs.readFileSync(path.join(root, 'data/personatges.json'), 'utf8'));
const fase2 = fs.readFileSync(path.join(root, 'js/fase2.js'), 'utf8');
const jocs = fs.readFileSync(path.join(root, 'js/jocs.js'), 'utf8');
const diferencies = JSON.parse(fs.readFileSync(path.join(root, 'data/diferencies.json'), 'utf8'));
const difSceneIds = new Set((diferencies.scenes || []).map(s => s.id));

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

  if (a.nivells.font === 'personatges') {
    assert.ok(Array.isArray(a.nivells.claus) && a.nivells.claus.length, `${a.id} nivells.claus`);
    for (const clau of a.nivells.claus) {
      assert.ok(nivellIds.has(clau), `${a.id} nivell inexistent a personatges.json: ${clau}`);
    }
  } else if (a.nivells.font === 'ombres') {
    assert.equal(a.nivells.comptador, 4, `${a.id}: quatre nivells de dificultat`);
    assert.equal(a.nivells.cerquesPerNivell, 3, `${a.id}: tres cerques per nivell`);
    assert.equal(a.finalitzacio.ambit, 'nivell', `${a.id} finalitzacio.ambit`);
    assert.equal(a.recompensaAventuraCompleta?.legacyRecordKey, 'jocs-ombres', `${a.id} recompensa torre`);
    assert.deepEqual(
      a.nivells.midesSiluetesPerNivell,
      [[4, 5, 6], [5, 6, 7], [6, 7, 8], [8, 9, 10]],
      `${a.id} midesSiluetesPerNivell`
    );
    assert.equal(a.nivells.poolPersonatges, 15, `${a.id} pool personatges`);
    assert.ok(!a.nivells.claus, `${a.id} ombres sense claus personatges`);
  } else if (a.nivells.font === 'diferencies') {
    assert.equal(a.nivells.diferenciesPerRonda, 7, `${a.id}: set diferències per ronda`);
    assert.equal(a.nivells.rondesPerSessioLliure, 3, `${a.id}: tres rondes lliure`);
    assert.ok(Array.isArray(a.nivells.escenes) && a.nivells.escenes.length, `${a.id} escenes`);
    for (const sid of a.nivells.escenes) {
      assert.ok(difSceneIds.has(sid), `${a.id} escena inexistent: ${sid}`);
    }
    assert.equal(a.finalitzacio.ambitLliure, 'sessio', `${a.id} ambitLliure`);
    assert.equal(a.finalitzacio.ambitMissio, 'ronda', `${a.id} ambitMissio`);
    assert.equal(a.recompensaAventuraCompleta?.legacyRecordKey, 'jocs-diferencies', `${a.id} recompensa torre`);
    assert.ok(!a.nivells.claus, `${a.id} diferencies sense claus personatges`);
  } else {
    assert.fail(`${a.id} nivells.font desconegut: ${a.nivells.font}`);
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
const ombres = activitats.find(a => a.id === 'ombres');
assert.ok(ombres, 'ombres declaratiu obligatori');
assert.equal(ombres.familia, 'exploracio');
assert.equal(ombres.legacyRecordKey, 'jocs-ombres');
assert.equal(ombres.ubicacio.hotspot, 'lupa');
assert.equal(ombres.entrada.hotspotId, 'lupa');
assert.equal(ombres.finalitzacio.condicio, 'tercera_ombra_objectiu');
assert.equal(ombres.nivells.font, 'ombres');
assert.match(jocs, /jocsOmbres:/, 'ombres: escena jocsOmbres');
assert.match(jocs, /jocs-lupa-ombres/, 'ombres: entrada menú Lupa');
const dif = activitats.find(a => a.id === 'diferencies');
assert.ok(dif, 'diferencies declaratiu obligatori');
assert.equal(dif.legacyRecordKey, 'jocs-diferencies');
assert.equal(dif.finalitzacio.condicio, 'set_diferencies_objectiu');
assert.match(jocs, /jocsDiferencies:/, 'diferencies: escena');
assert.match(jocs, /jocs-lupa-diferencies/, 'diferencies: entrada menú Lupa');
assert.equal(dif.granAventura.validadaMissio, false);
assert.equal(activitats.length, 3, 'etapa 2: cartes + ombres + diferencies');
assert.deepEqual(cartes.nivells.claus.sort(), [...nivellIds].sort(), 'cartes claus = personatges.nivells');
assert.equal(cartes.nivells.claus.length, 4, 'cartes: quatre nivells');

console.log('OK: activitats —', activitats.length, 'activitat(s),', reg.familles.length, 'familles');