# EL NOSTRE UNIVERS — Fases 1, 2, 3 i 4

Web estàtica en català per a jugar a la tablet, sense dependències, servidor, registre ni serveis de pagament.

## Per provar-la
Obre `index.html` en un navegador. En ordinador: doble clic sobre el fitxer. A la tablet, recomanem publicar el projecte a GitHub Pages per evitar restriccions d'accés als fitxers locals.

## Per publicar-la
Copia `index.html`, `css/`, `js/` i `imagenes/` a l'arrel del repositori `el-nostre-univers` i fes **Commit i Push** a `main`. Conserva `README.md` i `AGENTS.md` que ja tens al repositori. GitHub Pages publicarà la web després del desplegament.

## Per comprovar la fase 4
Les correccions i els resultats de proves es documenten a `docs/FASE-4-CONTROL.md`. En un ordinador amb Node.js: `node tests/fase4-regression.cjs`.

## Privadesa
No hi ha dades personals de la menor dins dels arxius. Les criatures, objectes i dibuixos es desen al navegador de la tablet (`localStorage`) i no se sincronitzen entre dispositius. Buidar les dades del navegador pot esborrar-los: no ho facis sense exportar els dibuixos que vulguis conservar.

El PDF mestre original no s'inclou ni s'ha alterat. Aquesta entrega acumula les fases prèvies, sense barrejar ZIP antics.
