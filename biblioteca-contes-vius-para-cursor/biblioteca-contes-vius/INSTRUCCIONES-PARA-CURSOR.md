# ENCARGO PARA CURSOR — BIBLIOTECA DELS CONTES VIUS

## ANTES DE EMPEZAR

Este encargo se añade a la conversación de Cursor que ya conoce El nostre univers. **El repositorio LOCAL y sus cambios recientes son la fuente de verdad**; el paquete adjunto NO es una versión del repositorio. Inspecciona solo los archivos pertinentes. No reemplaces archivos existentes con los de versiones antiguas. Aplica AGENTS.md. Sin commit, sin push y sin dependencias nuevas.

Actúa como desarrollador técnico principal, con autonomía de implementación. Si encuentras una solución mejor que la sugerida, úsala si respeta alcance y compatibilidad. Si un requisito resulta imposible con los recursos suministrados, no lo simules ni proclames completo: informa qué falta.

## OBJETIVO CONCRETO

Crear dentro de **LLEGIM!** la experiencia **LA BIBLIOTECA DELS CONTES VIUS** que aparece en `recursos/prestatgeria-contes-vius.webp`: una **estantería ilustrada con siete portadas reales, integradas en la imagen, seleccionables sin marcos invasivos**, y un **lector de libro abierto** visualmente coherente con `recursos/exemple-pipa-doble-pagina.webp`.

**No sustituir ni modificar** las ilustraciones originales `imagenes/biblioteca.webp`, `imagenes/mapa.webp`, etc. La estantería será una escena adicional accesible desde el libro abierto o zona de libros de la biblioteca existente. Su retorno debe volver a LLEGIM!, no al inicio. Conserva los demás hotspots de LLEGIM!, incluida la aventura actual del libro mágico; si esa colisión requiere separar zonas, hazlo de forma localizada y mantén el acceso existente, sin eliminar historias.

## ARCHIVOS SUMINISTRADOS

- `recursos/prestatgeria-contes-vius.webp` — mural final de selección, **1672 × 941**. Los títulos y dibujos ya están pintados; no superponer portadas HTML duplicadas ni generar emojis como sustituto. Hay una errata artística en el cuarto título («LA NUVOL»); **el título correcto en datos e interfaz es «EL NÚVOL PERDUT DE NA BOIRA»**. No intentes arreglar esa errata mediante texto flotante encima; avisa de que requiere retoque de ilustración en una iteración de arte.
- `recursos/exemple-pipa-doble-pagina.webp` — **1536 × 1024**, muestra aprobada de apariencia de cuento abierto con papel, lomo, ilustraciones y tipografía. SOLO sirve como referencia y, si encaja, como muestra estática de Pipa. No consideres que sus textos son el guion de todas las dobles páginas.
- `recursos/prestatgeria-tres-contes-referencia.webp` — boceto visual anterior, no usar como nueva escena si ya se usa la estantería de siete cuentos.
- `contenido/contes.json` — **siete cuentos originales, ocho dobles páginas por cuento, 56 dobles páginas**. Incluye texto de izquierda/derecha, indicaciones artísticas e interacciones previstas. Los campos `ilustracioFinal` nulos significan literalmente **ilustraciones interiores no producidas**. Las indicaciones de ilustración son metadatos editoriales, **no texto visible**.

No incluir imágenes fotografiadas de libros comerciales, Disney o materiales familiares.

## EXPERIENCIA DE ESTANTERÍA

- Al tocar la zona de los cuentos de LLEGIM!, pasar a una **escena nueva de estantería** que muestre `prestatgeria-contes-vius.webp` a gran tamaño, íntegra, sin deformación ni cortes de portadas; respeta su relación 1672:941.
- Las **siete zonas de selección** serán transparentes, semánticas, teclado/táctil accesibles, coincidentes con cada portada (no con estantes vecinos), sin rectángulos luminosos ni animaciones desde esquinas.
- Mapa orientativo de **regiones** en coordenadas de la imagen, únicamente punto de partida; medir en el navegador y corregir si hiciera falta:
  - `sopar`: x 340–592, y 228–547
  - `pipa`: x 605–906, y 230–547
  - `bosc`: x 948–1216, y 230–547
  - `boira`: x 1267–1576, y 225–542
  - `troc`: x 460–750, y 587–885
  - `nus`: x 798–1088, y 587–886
  - `bruna`: x 1107–1455, y 586–887
- Con `img` + SVG superpuesto y MISMO `viewBox`, mismo sistema de escala (`preserveAspectRatio`), o equivalente robusto. Evitar coordenadas relativas a viewport para hotspots sobre imagen con letterboxing.
- Navegación visible pequeña: `← LLEGIM!`. Mantén fullscreen/ayuda si corresponden al diseño existente.
- No alterar `state.unlocked`, las claves `nostre-fase1-records` / `nostre-creacions-v3`, ni sobrescribir progreso del taller.

## EXPERIENCIA DE LIBRO ABIERTO

Al elegir una portada:
1. Transición muy breve de acercamiento; no animación aparatosa.
2. Mostrar un libro grande, visualmente tangible, en doble página, con borde de cubierta, grosor de papel, pliegue central y sombra en el lomo, sobre ambiente suave de biblioteca. En tablet horizontal debe ocupar la mayor parte del viewport sin recortar texto, con navegación discreta.
3. `← CONTES` vuelve a la estantería, conservando libro y página mientras no se cierre si resulta sencillo.
4. Botones grandes y discretos `‹` y `›`, con clic, tacto y teclado, avance y retroceso; indicación de progreso tipo `3 / 8` no gamificada; cuando se acaba, `TORNAM A LLEGIR` y `ALTRES CONTES`.
5. Catalán, **MAYÚSCULAS de palo**, tipografía clara y tamaño realmente legible en tablet; no emplear texto ornamental generado sobre imagen cuando el mismo texto ya está pintado y no puede modificarse. Priorizar HTML legible cuando se creen las ilustraciones definitivas sin texto incrustado.
6. El paso de página debe ser una transición visual ligera y de buen rendimiento. Respetar `prefers-reduced-motion`.
7. La biblioteca es lectura libre, sin pruebas obligatorias, puntuación ni temporizadores.

## IMPORTANTÍSIMO: LÍMITE REAL DEL MATERIAL GRÁFICO

**No existen en este paquete 56 ilustraciones interiores definitivas.** Por tanto, no debes decir que los siete cuentos están plenamente ilustrados. Tampoco debes inventar ilustraciones infantiles de baja calidad usando emojis, cajas de texto o SVG genéricos para simularlas. Puedes preparar el motor reutilizable completo y la estantería de siete libros, con los cuentos cargados desde JSON, pero debes distinguir claramente entre una página con imagen final y una página sin ella. Para páginas aún sin arte, usa una maqueta editorial sobria y explícitamente provisional, con el texto real; evita construir una experiencia visual inferior que pretenda ser definitiva. Si el proyecto exige únicamente experiencia final y sin maquetas, implementa estantería y deja el lector de los libros sin arte pendiente hasta recibir assets, informando el bloqueo.

La muestra real de Pipa puede usarse como **demostración de una única doble página**, sin repetirla en todo el cuento.

## MODELO DE DATOS Y AMPLIACIÓN

`contes.json` contiene cada libro con `id`, `titol`, `categoria`, `protagonista`, `doblesPagines[]`, `esquerra`, `dreta`, `direccioArtistica`, `interaccioProposada` e `ilustracioFinal`.

Implementa un único lector reutilizable, no siete escenas codificadas por separado. Nueva aventura = objeto JSON + portadas/ilustraciones, sin cambios estructurales. Carga JSON con `fetch` si el servidor local de Cursor y GitHub Pages lo soportan; rutas RELATIVAS, jamás rutas absolutas de Windows ni host `127.0.0.1` en el código. Si se requiere fallback file://, no es prioridad: la web se sirve por HTTP.

No introducir React, TypeScript, Tailwind, frameworks ni librerías externas. Usa CSS/JS nativos y módulos o funciones congruentes con la arquitectura existente. Por seguridad, interpolar texto de JSON como `textContent` o escapado. Nunca `innerHTML` con cadenas no verificadas.

## INTERACCIONES NARRATIVAS (PREPARAR SOPORTE, NO FINGIR ARTE)

La historia define 2–3 acciones opcionales por libro. El lector podrá asociar botones/zonas a transformaciones con imagen antes/después, sprites o capas, **cuando existan esos recursos**. El avance no debe bloquearse. Sin ilustraciones de estado final, no crear efectos falsos ni anunciar que ya funcionan.

## INTEGRACIÓN CON EL CÓDIGO REAL

Cursor ya identificó estas cadenas de envolturas entre fases:
- `hotspotF1` → `hotspot` en fase 2 → wrapper fase 3.
- `actionF1` → `action` en fase 2 → wrapper fase 3.
- `renderF1` → `render` en fase 2 → wrapper fase 3.

Comprobar cómo quedaron **después de las correcciones locales recientes**, pues este documento no incluye el repositorio actualizado. No recrear funciones ni romper enlaces actuales. Encapsular el lector y el estado de página en un archivo nuevo si permite aislarlo, enlazarlo sin pisar listeners existentes ni duplicar eventos. Respetar accesibilidad, visualización horizontal y aviso de giro del dispositivo.

## CRITERIOS DE ACEPTACIÓN

- La biblioteca original sigue intacta y abre la estantería adicional.
- Estantería muestra **las siete portadas exactamente como la referencia**, sin duplicarlas con HTML.
- Cada portada tiene una zona táctil funcional alineada en 16:9 y otros anchos horizontales.
- Se seleccionan siete cuentos distintos y se leen sus ocho dobles páginas de texto en orden, con retorno, adelante y atrás.
- El lector tiene aspecto de LIBRO REAL ABIERTO, no panel morado o ventana modal básica.
- Una muestra ilustrada de Pipa se ve de forma respetuosa sin hacerse pasar por el cuento entero.
- No se reemplaza arte inexistente por gráficos pobres ni se declaran terminadas las 56 ilustraciones.
- No se rompen puerta, llave, búho, escuela, conejo, monstruo, taller ni persistencia.
- Móvil vertical mantiene orientación sugerida y no desplaza hotspots; tablet horizontal prioritaria.
- Pruebas automáticas y revisión visual real en navegador, ambas diferenciadas en el informe.
- Sin commit, push, instalación ni publicación.

## ENTREGA FINAL BREVE

Archivos tocados; qué está realmente implementado; capturas o detalles de prueba visual; qué queda expresamente **pendiente de ilustraciones**; errores encontrados. No presentar una maqueta como producto final.

**EMPIZA SOLO CUANDO EL USUARIO TE LO INDIQUE EXPRESAMENTE.** Si este documento se adjunta para revisión, primero confirma comprensión sin editar archivos.
