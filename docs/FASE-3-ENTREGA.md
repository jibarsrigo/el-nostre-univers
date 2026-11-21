# El nostre univers — fase 3, entrega acumulativa

La fase 3 continúa íntegramente la estructura de las fases 1 y 2. No es necesario copiar ni fusionar carpetas anteriores.

## Taller creativo implementado

- Crear una criatura desde un dibujo SVG dinámico: especie, orejas/cuernos, alas, cola, decoraciones y color. Los cambios se ven al momento. Nombre libre (hasta 22 caracteres).
- Inventar un objeto de magia: varita, escudo o cristal, con color y poder de iluminar, proteger o curar. Dibujo dinámico, nombre y guardado.
- Cuaderno para dibujar con el dedo o el lápiz de la tablet: ocho colores, pincel, goma, deshacer y borrar; guardado como imagen JPEG local.
- Galería integrada en la caja del taller, con vista de las creaciones, edición de criaturas y objetos, y posibilidad de borrar. Máximo 12 creaciones para limitar almacenamiento.
- Una criatura guardada aparece de nuevo en la escuela y en la celebración. Los objetos mágicos pueden utilizarse en la escuela y en las historias de cuidar, proteger e iluminar, modificando visualmente la escena posterior.

## Dónde pulsar (según la imagen del taller)

- Criatura del centro → creador de criaturas.
- Pinturas a la izquierda → cuaderno de dibujo.
- Estrellas y objetos en las estanterías superiores → objetos mágicos.
- Cofre/caja de la derecha → galería de creaciones.

Los botones anteriores de fase 2 en otros escenarios siguen disponibles. El taller no presenta tres menús redundantes para poner nombres.

## Datos y privacidad

Las creaciones permanecen solamente en el navegador, en localStorage. No se suben a GitHub, no se envían a servidores y no aparecen en otros dispositivos automáticamente. Borrar los datos del navegador puede eliminar dibujos y creaciones. En GitHub Pages, los dibujos de una cuenta permanecen en ese dispositivo y origen web.

## Comprobaciones

`node --check js/app.js` y equivalentes para fases 2 y 3; `node docs/checks_fase3.cjs` (15 comprobaciones de flujo y estructura). La prueba visual automatizada con Chromium quedó bloqueada por restricciones del entorno, y las pruebas en la tablet corresponden a la fase 4. No se afirma que estén superadas.
