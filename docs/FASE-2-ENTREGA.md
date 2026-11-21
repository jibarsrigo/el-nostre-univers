# EL NOSTRE UNIVERS — FASE 2 (sobre la Fase 1)

## Integración
Esta carpeta incluye íntegra la Fase 1 y añade Fase 2. Copiar los contenidos a la raíz del repositorio; no eliminar AGENTS.md ni README.md. Compatible con publicación estática en GitHub Pages.

## Contenido implementado
- Acceso a la escuela mágica desde el búho de la torre; ilustración original y tres zonas de exploración (sala, patio y jardín).
- Sala de encantamientos con tres estrellas que la niña toca para devolver la luz.
- El monstruo devorador de páginas, en las estanterías de la biblioteca; descubrimiento, búsqueda de tres fragmentos y reparación del libro.
- Conejo con cuatro estados ilustrados; recorrido de abrigo, alimento y agua.
- Nido con cuatro estados ilustrados: ramas, hojas y protección.
- Parejas: tres parejas con seis tarjetas, mezcla y vuelta al fallar.
- Palabras secretas: palabras fáciles en mayúsculas y sin límite de tiempo; errores con reacciones visuales.
- Búsqueda de cinco secretos del bosque.
- Campaña «La llum del bosc», con seis hallazgos en distintos espacios, registro de progreso y escena de celebración cuando se completa.
- Guardado local de logros clave, reutilizando el almacenamiento de Fase 1.

## Lo que no se declara completo
- Fase 3: taller de creación libre con lápiz, objetos persistentes y personalización amplia.
- Fase 4: pruebas de rendimiento y controles táctiles en la tableta real, correcciones de posiciones exactas por dispositivos, ilustraciones finales adicionales y accesibilidad profunda.
- Los interiores de la escuela y las escenas de rescate usan ilustraciones vectoriales y los fondos ilustrados existentes; están pendientes del pulido visual de Fase 4.

## Comprobaciones
- `node --check js/app.js`
- `node --check js/fase2.js`
- `node docs/checks_fase2.cjs`
- Navegador automatizado: no ejecutado, el entorno de ejecución bloquea las navegaciones de Chromium, incluso a localhost. Se requiere probar el juego en un navegador normal antes de dar la fase por validada visualmente.

## Decisiones vigentes
Un modo único; catalán y textos breves; sin locuciones de voz por ahora; sin frameworks ni dependencias; no sustituir el PDF maestro; no copiar personajes con derechos de autor.
