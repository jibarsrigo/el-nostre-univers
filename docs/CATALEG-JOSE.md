# Afegir un recurs al catàleg (etapa 1)

1. Integrar el fitxer al repo (Cursor + PR autoritzada).
2. Si Jose **aprova l'art**, afegir una entrada a `data/aprovacions-art.json` amb `id`, `fitxer` exacte i `versioFitxer`.
3. Executar: `node docs/build-cataleg.cjs`
4. Comprovar: `node docs/checks_cataleg.cjs`

Guio de conte aprovat **no** equival a il·lustració aprovada al catàleg.

`actiu: true` es manté encara que `estatArt` sigui `pendent`.