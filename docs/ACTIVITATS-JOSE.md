# Registre d'activitats

Fitxer declarativo: `data/activitats.json`.  
El catàleg (`data/cataleg.json`) descriu **recursos**; aquest registre descriu **activitats** jugables.

## Pilots contracte comú

| `id` | `legacyRecordKey` | Finalització real | Recompensa torre |
|------|-------------------|-------------------|------------------|
| `cartes` | `pairs` | Darrera parella | Cada partida guanyada |
| `ombres` | `jocs-ombres` | 3a ombra del nivell | Només nivell 4 |
| `diferencies` | `jocs-diferencies` | 7a dif. de la 3a ronda (lliure) | Sessió lliure completa (3 rondes) |

Missió futura (sense motor): una ronda, 7 diferències, un fons — `ambit: ronda`, sense `remember`.

- Runtime: `js/activitats.js` — `activitatCompleta`, `nostre-activitats-sessions-v1`.
- Fallback legacy: `pairs`, `jocs-ombres`, `jocs-diferencies`.
- LA GRAN AVENTURA: `candidataMissio` / `validadaMissio` (sempre `false` fins motor real).

## Comprovar

```bash
node docs/checks_activitats.cjs
node docs/checks_fase2.cjs
```

Suite: `node docs/checks.cjs` i `docs/checks_*.cjs`.

## Afegir una activitat

1. Entrada a `activitats.json` amb `id` estable.
2. `entrada` coherent amb hotspots.
3. Finalització real separada de celebració.
4. `sessionId` + `activitatCompleta` + dedupe + fallback.
5. Integració des de l'origen (HOJA §2.2).

**Principis:** Univers viu · Simplicitat màgica · Coherència visual · Integració des de l'origen.