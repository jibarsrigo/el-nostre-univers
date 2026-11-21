# EL NOSTRE UNIVERS — FASE 4: CONTROL I CORRECCIONS

Data: 21 de novembre de 2026. Base: lliurament conjunt de les fases 1, 2 i 3.

## Correccions efectives

- **Zones interactives:** revisats els 4 escenaris i les seves coordenades. Eliminades 4 col·lisions significatives de zones (biblioteca: escala/monstre; torre: telescopi/bola, mapa/cofre i mussol/escola; taller: estrelles/capsa). El mussol és l'entrada única a l'escola.
- **Descobribilitat:** els espais mostren estrelles discretes a les zones interactives, que no intercepten els tocs ni oculten els controls. S'elimina la dependència exclusiva del *hover*.
- **Coherència de la història:** la porta diminuta només s'obre amb la clau. Si falta la clau, hi ha un camí directe a la torre per cercar-la. No es pot evitar aquesta condició pulsant el botó següent.
- **Llegibilitat:** el joc de paraules mostra una pista en forma d'imatge (gat, sol, bosc, drac, etc.) i el teclat tàctil té tecles més grans.
- **Joc de parelles:** baralla uniformement les cartes mitjançant Fisher–Yates, en lloc d'ordenar-les aleatòriament amb `sort`.
- **Navegació del taller:** en sortir del taller creatiu s'elimina l'historial antic, perquè «tornar» no reobri pantalles que ja s'han abandonat.
- **Ambientació:** es manté el fons contextual de la biblioteca en el llibre i del mapa en la porta secreta, encara que s'hi arribi des d'un altre lloc.

## Proves automatitzades executades

Des de la carpeta principal:

```bash
node tests/fase4-regression.cjs
node docs/checks.cjs
node docs/checks_fase2.cjs
node docs/checks_fase3.cjs
node --check js/app.js
node --check js/fase2.js
node --check js/fase3.js
```

Resultats:
- **245 comprovacions de regressió superades**: pantalles, escenes, etapes, coordenades i col·lisions, fitxers, itineraris, tres jocs i desament simulat.
- Proves anteriors de fases 2 i 3 superades.
- 5 imatges panoràmiques WebP verificades a 1672 × 941 píxels, mateixa proporció que el sistema de zones tàctils SVG.
- Sintaxi de tot el JavaScript correcta.

## Comprovacions que continuen pendents (no ocultar)

El navegador Chromium està instal·lat, però l'entorn impedeix navegar tant a `file://` com al servidor HTTP local amb `ERR_BLOCKED_BY_ADMINISTRATOR`. **Per això NO s'ha pogut realitzar una prova visual automatitzada completa ni la prova tàctil real de la Lenovo.**

Abans de considerar el producte verificat en dispositiu:

1. Obrir la web a la Lenovo en horitzontal i vertical. Comprovar que els punts de toc coincideixen visualment amb el dibuix.
2. Passar per les quatre localitzacions i tots els accessos, inclosa la porta diminuta amb i sense clau.
3. Jugar a les parelles, encertar i fallar una paraula, reparar el llibre, cuidar el conill, protegir el niu i completar els sis descobriments de la gran aventura.
4. Dibuixar amb llapis, desfer, guardar, tancar i tornar a obrir per comprovar que la creació es conserva.
5. Comprovar l'entrada i sortida de pantalla completa, els botons de tornar i l'accessibilitat dels controls en un navegador tàctil.
6. Fer una revisió lingüística final de tots els textos en català i les variants dialectals triades.

## Veredicte de la fase 4

**Corregit i provat a nivell de codi; validació visual i tàctil pendent.** No s'ha de presentar com a videojoc perfectament verificat en tablet fins a superar les proves manuals anteriors.

Aquesta fase millora el comportament i la coherència de les fases 1–3. **No substitueix les il·lustracions secundàries per art cinematogràfic nou**, que seria un treball artístic independent.
