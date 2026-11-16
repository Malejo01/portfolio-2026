# Tanda P3-2 · Malejo: estilo Aula virtual («Pizarrón»)

**Requisito para empezar: P3-1 terminada**, ya sea mergeada en `main` o con su PR abierto y su fase de verificación aprobada si se corre en cadena. P3-1 trae el sistema de estilos, el selector, Institucional, los 3 dibujos y el selector rápido de personaje. Si P3-1 no está terminada, esperá.

- Repo `Malejo01/portfolio-2026`, sitio de la agencia (`app/(agencia)`).
- Trabajá en loop, con un commit por fase y **sin pedir permiso**.
- Abrí **un solo PR** y no lo mergees. Corriendo en cadena: rama `p3-2-aula` creada desde `p3-1-estilos` y PR con base `p3-1-estilos` (ver `00-LEEME-ORDEN.md`). Si P3-1 ya está mergeada, la rama sale de `main` y el PR va contra `main`.
- Rigen todas las reglas de `CLAUDE.md`:
  - rutas estáticas `○`;
  - ningún hex en componentes;
  - copy en `content/agencia/`;
  - `data-reveal`;
  - Framer Motion con `LazyMotion` + `m`;
  - islas en `components/agencia/client/`;
  - el portfolio no se toca.
- **Esta tanda solo suma un estilo. No toques el sistema salvo para lo que diga acá.**

## Adjuntos (zip `p3-2-adjuntos.zip`)
- `referencia-aula/`: las 5 pantallas aprobadas (`.html`) y `ESPEC.md`. Guardalas en `docs/agencia/estilos/aula/`.
- `sprites/`: los mismos sprites base de P3-1, solo para que las pantallas se vean. No los vuelvas a copiar si ya están en el repo.

## Fase 1 · El estilo
1. **`content/agencia/estilos.ts`:** `aula` pasa a `disponible: true`, representa la categoría `ia` (`plataforma-educativa-con-ia`), y el nombre en el selector es "Aula virtual". Suma el campo opcional **`dibujoPorDefecto`** al tipo de estilo; en `aula` vale **`"anime"`**.
   - Si la persona nunca eligió un dibujo a mano, al entrar a Aula se ve el anime.
   - Si ya eligió uno con el selector rápido, manda su elección, como en P3-1.
   - Los estilos sin `dibujoPorDefecto` siguen con el shuffle de P3-1.
2. **Tokens en `estilos.css`:** `[data-estilo="aula"]` en claro (pizarra blanca) y en `.dark` (pizarrón verde), con los valores exactos de `ESPEC.md`.
   - **Excepción a P3-1:** este estilo arranca en **oscuro** si la persona no eligió tema. Cambiar a Aula con el tema sin elegir pone `dark`. Si la persona eligió tema alguna vez, se respeta su elección.
   - **Agregados al test de contraste:** amarillo sobre verde, texto verde sobre amarillo (botones), los tres fibrones sobre blanco y el texto secundario en los dos modos.
3. **Tipografía:** Caveat (600/700) con `next/font` y `preload: false`. Es la única familia nueva; Nunito ya existe o se suma igual, si no está.
4. **Forma por tokens:**
   - radio de 6 px;
   - tarjetas con borde punteado de 2 px (token de estilo de borde, no un `if` en el componente);
   - el marco de madera como token de color del borde superior del layout y de los paneles del kit y de Malejo.

## Fase 2 · Hero y garabatos
1. **`components/agencia/home/estilos/aula/Hero.tsx`:** composición exacta de `F-home-oscuro.html` y `F-home-claro.html`.
   - Lleva el ejemplo «Instituto del Sol · Matemática I · Funciones» (avance, clases y asistente con IA), hecho con HTML y CSS, y la línea "Así se vería tu aula virtual →" hacia `/soluciones?cat=ia`.
   - Lleva el selector rápido de personaje, en cursiva.
2. **Garabatos:** SVG decorativos (`aria-hidden`), que se dibujan con `pathLength` al entrar (`once: true`, `data-reveal`) y se quedan quietos con movimiento reducido:
   - "f(idea) = idea + IA";
   - la flecha "¡mirá!";
   - los subrayados de los títulos de sección;
   - "∑ clientes ✓";
   - "demo en ≈ 72 h ★";
   - la mancha de borrador (solo en oscuro);
   - en Soluciones, el óvalo "¡recomendado!" y los casilleros dibujados.

   Los garabatos con texto ("¡mirá!", "∑ clientes ✓", "demo en ≈ 72 h ★") van en `content/agencia/estilos.ts` y pasan el test de glosario.
3. **Cursiva:** Caveat en titulares, etiquetas, precios, enlaces de texto ("ver qué incluye →", "quitar", "+ sumale extras") y el mensaje de bienvenida de Malejo. **Nunito** en párrafos, listas, la línea de pagos y los botones principales.
   - Tamaño mínimo de la cursiva: 22 px. Si algo en cursiva queda más chico, va en Nunito.

## Fase 3 · Soluciones, chat y celular
1. **Soluciones**, según `F-soluciones.html`. Es solo piel, sin cambiar la estructura de P2:
   - la lista de categorías con casilleros dibujados;
   - los planes punteados con título y precio en cursiva;
   - el recomendado con el óvalo;
   - la columna Tu kit | Malejo con las pestañas sobre la madera y el estimado en cursiva amarilla.
2. **Chat de Malejo y hoja del celular**, según `F-soluciones-celular.html`: borde superior de madera, mensaje en cursiva y opciones en recuadros punteados de los 3 colores. En el celular, la barra del kit va en amarillo.
3. **Home en celular**, según `F-home-celular.html`: el botón para cambiar de dibujo al lado de "Soy Mauro".
4. **Selector de estilos:** la miniatura de Aula deja de decir "Próximamente". Miniatura: verde pizarrón con una línea amarilla y una rosa.

## Fase 4 · Verificación (antes del PR)
- `npm run lint`, `npm test` y `npm run build`, con las mismas rutas que en P3-1.
- **Aula × claro/oscuro × 360, 390 y 1280 px**, en home, `/soluciones`, una solución, `/demo`, el 404 y el chat abierto:
  - sin overflow;
  - contraste AA contra el fondo efectivo;
  - primera pantalla del celular con los dos botones;
  - ningún garabato tapa texto ni botones (`getBoundingClientRect`).
- **Personaje:**
  - entrar a Aula sin haber elegido dibujo muestra el anime;
  - elegir chibi y volver a Aula mantiene el chibi.
- **Tema:** entrar a Aula sin tema elegido lo muestra en oscuro; con el tema claro elegido, en pizarra blanca.
- **Presupuesto de P2:** TBT ≤ 250 ms, LCP ≤ 2,5 s y CLS ≤ 0,05, con Caveat incluida.
- **Capturas** a 390 y 1280 px en los dos modos, al lado de las pantallas de `docs/agencia/estilos/aula/`, guardadas en `docs/agencia/verificacion/p3-2/`.
- Sección "P3-2" en `docs/agencia/INFORME.md`.
