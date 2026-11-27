# Registre d'activitats (etapa 2)

Fitxer declarativo: `data/activitats.json`.  
El catàleg (`data/cataleg.json`) descriu **recursos**; aquest registre descriu **activitats** jugables.

## PR A (actual)

- **`cartes`** (`legacyRecordKey`: `pairs`, família `memoria`).
- **`ombres`** (`legacyRecordKey`: `jocs-ombres`, família `exploracio`): entrada torre → hotspot **`lupa`** (LA LUPA MÀGICA → menú → Ombres). `nivells.font`: `ombres` — 3 cerques de sessió (`cerquesPerPartida`, `midesSiluetes`), **no** claus `personatges`. Finalització declarativa: `tercera_ombra_objectiu` (runtime pendent Fase B).
- Clau tècnica de famílies: **`familles`** (sense accent). Cada activitat usa **`familia`** (id dins `familles`).
- LA GRAN AVENTURA: `granAventura.candidataMissio` / `validadaMissio` (només declaratiu; sense UI).

## Comprovar

```bash
node docs/checks_activitats.cjs
```

Amb la suite habitual:

```bash
node docs/checks.cjs
node docs/checks_cataleg.cjs
node docs/checks_fase2.cjs
node docs/checks_fase3.cjs
node docs/checks_jocs.cjs
node docs/checks_persistencia.cjs
```

## Afegir una activitat (futur, una cada vegada)

1. Entrada nova a `activitats.json` amb `id` estable.
2. `ubicacio.sala`: `torre` | `biblioteca` | `taller` | `mapa` (nom català).
3. `entrada.place`: `tower` | `library` | `workshop` | `map` (codi del joc; ha de correspondre a la sala).
4. `entrada.hotspotId`: ha d'existir als hotspots d'aquella sala (`js/app.js` + `js/fase2.js`).
5. Si `nivells.font` és `personatges`, cada clau de `nivells.claus` ha d'existir a `data/personatges.json` → `nivells[].id`. Si és `ombres`, validar `cerquesPerPartida` i `midesSiluetes` (sense `claus`).
6. PR petita + `checks_activitats.cjs` verd + tablet Jose abans de la següent.

## PR B (runtime Cartes)

- `js/activitats.js` — `activitatCompleta`, clau `nostre-activitats-sessions-v1` (màx. 24 ids per activitat).
- `fase2.js`: `setupPairs` → `sessionId`; darrera parella → `activitatCompleta('cartes',…)`; `end-pairs` només torre.
- Proves: `node docs/checks_activitats_runtime.cjs` (via `checks_fase2.cjs`).
- Comprovar **records** i **creacions** (`checks_persistencia.cjs`).