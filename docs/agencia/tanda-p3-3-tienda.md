# Tanda P3-3 · Malejo: estilo Tienda («Almacén de barrio»)

**Requisito para empezar: P3-2 terminada**, ya sea mergeada en `main` o con su PR abierto y su fase de verificación aprobada si se corre en cadena. Esta tanda usa `dibujoPorDefecto` y el mecanismo de "tema de entrada por estilo", que llegan con P3-2. Si P3-2 no está terminada, esperá.

- Repo `Malejo01/portfolio-2026`, sitio de la agencia (`app/(agencia)`).
- Trabajá en loop, con un commit por fase y **sin pedir permiso**.
- Abrí **un solo PR** y no lo mergees. Corriendo en cadena: rama `p3-3-tienda` creada desde `p3-2-aula` y PR con base `p3-2-aula` (ver `00-LEEME-ORDEN.md`). Si P3-2 ya está mergeada, la rama sale de `main` y el PR va contra `main`.
- Rigen todas las reglas de `CLAUDE.md`:
  - rutas estáticas `○`;
  - ningún hex en componentes;
  - copy en `content/agencia/`;
  - `data-reveal`;
  - Framer Motion con `LazyMotion` + `m`;
  - islas en `components/agencia/client/`;
  - precios solo por `lib/agencia/pricing.ts`;
  - el portfolio no se toca.
- **Esta tanda solo suma un estilo.** No toques el sistema salvo para lo que diga acá.

## Adjuntos (zip `p3-3-adjuntos.zip`)
- `referencia-tienda/`: las 7 pantallas aprobadas (`.html`) y `ESPEC.md`. Guardalas en `docs/agencia/estilos/tienda/`. La identidad está cerrada: no la reinterpretes.
- `sprites/`: los sprites base, solo para que las pantallas se vean. No los copies si ya están en el repo.

## Fase 1 · El estilo
1. **`content/agencia/estilos.ts`:** `tienda` pasa a `disponible: true` y representa la categoría `tiendas`.
   - Nombre en el selector: "Tienda". Bajada: "Toma pedidos".
   - `dibujoPorDefecto: "chibi"`. Igual que en Aula, si la persona ya eligió un dibujo a mano, manda su elección.
2. **Tokens en `estilos.css`:** `[data-estilo="tienda"]` (claro) y `[data-estilo="tienda"].dark` (N1 · Noche cálida), con los valores exactos de `ESPEC.md`.
   - En oscuro, los **botones** usan los mismos tomate y verde que en claro. El **texto, los íconos y los enlaces** de color usan las versiones suaves (`#F08A5D`, `#8CC9A6`, `#E3B45C`). Si hoy un mismo token sirve de fondo de botón y de color de texto, separalo en dos (por ejemplo `--acc` y `--acc-text`) en vez de resolverlo con un `if`.
   - **Tema de entrada (al revés que Aula):** Tienda arranca en **claro** si la persona no eligió tema. Si eligió tema alguna vez, se respeta. Usá el mismo mecanismo que P3-2 dejó para Aula; no lo dupliques. Si en P3-2 quedó como un caso especial de Aula, generalizalo a un campo `temaDeEntrada?: "claro" | "oscuro"` en `estilos.ts` (Aula `"oscuro"`, Tienda `"claro"`).
   - **Agregados al test de contraste:**
     - blanco sobre tomate, verde y ocre;
     - `#2B2118` sobre la mostaza de la etiqueta;
     - el texto secundario en los dos modos;
     - los tres colores suaves sobre la superficie y los tintes oscuros.
3. **Tipografía:** Fredoka (600/700) con `next/font` y `preload: false`. Es la única familia nueva (Nunito ya está desde P3-2).
4. **Forma por tokens, no por `if` en los componentes:**
   - radios: 22 px en tarjetas y 999 px en botones;
   - borde de 2 px;
   - la sombra plana sin desenfoque (`0 6px 0` en tarjetas y `0 4px 0` en botones), como token de sombra del estilo;
   - el patrón del toldo, como token (`background` de rayas), en sus dos tamaños.

## Fase 2 · Hero, ejemplo y piezas propias
1. **`components/agencia/home/estilos/tienda/Hero.tsx`:** la composición de `F-home-claro.html` y `F-home-oscuro.html`.
   - Lleva el toldo debajo de la barra superior, la "IA" en píldora mostaza y el selector rápido "Personaje: 16-bit · Chibi · Anime".
   - Lleva la línea **"Así se vería tu almacén →"** hacia `/soluciones?cat=tiendas`.
2. **Ejemplo «Almacén Doña Rosa»:** hecho con HTML y CSS (los íconos, como SVG inline), con la copy en `content/agencia/estilos.ts`.
   - Los precios del ejemplo son de mentira y se escriben con `fmt()`.
   - El total se calcula con los mismos números del ejemplo, no se escribe a mano.
   - Es una **ilustración**: `aria-hidden="true"`, con un texto alternativo para lectores ("Ejemplo: un almacén que recibe pedidos por WhatsApp"). No tiene botones reales ni elementos tabulables.
   - En el celular va **debajo de los dos botones del hero**, con la composición de `F-pedido-celular.html` (categorías, productos y la barra "Ver pedido"). La primera pantalla sigue mostrando los dos botones.
3. **Componente `EtiquetaPrecio`** (Server Component, sin estado):
   - forma de etiqueta con agujero;
   - tamaño chico (home) y grande (Soluciones);
   - `white-space: nowrap` y `max-width: 100%`;
   - "Desde" va arriba, aparte.

   Lo usan las tarjetas de categorías, los planes y el ejemplo. Recibe el texto ya formateado: no calcula nada.
4. **Movimiento** (`once: true`, `data-reveal`, quieto con movimiento reducido):
   - el toldo se despliega (`scaleY`);
   - las etiquetas de precio se balancean al entrar (−8° → 4° → 0°, con escalonado de 60 ms).

   No envuelvas una tarjeta `.lift` con `Reveal`: animá la etiqueta, no la tarjeta.

## Fase 3 · Soluciones, chat y celular
1. **Soluciones**, según `F-soluciones.html`. Es solo piel, sin cambiar la estructura de P2:
   - las categorías con ícono entintado, y la activa con borde tomate y contador;
   - los planes con la franja de ícono, `EtiquetaPrecio` grande y "El más pedido" como sticker rotado;
   - la columna Tu kit | Malejo con las pestañas sobre mostaza clara y el ticket troquelado ("Tu pedido a Mauro", líneas punteadas y borde inferior de semicírculos).
2. **Chat de Malejo y hoja del celular**, según `F-soluciones-celular.html`:
   - el toldo como borde superior de la hoja y el chibi;
   - la burbuja con la esquina superior izquierda en punta;
   - las opciones en píldoras con borde de los 3 colores;
   - la barra del kit en tomate.
3. **Home en celular**, según `F-home-celular.html`: el botón "Cambiar" (dibujo) al lado de "Soy Mauro".
4. **Selector de estilos:** la miniatura de Tienda deja de decir "Próximamente". Miniatura: crema con rayas tomate y una etiqueta mostaza. Ver `F-selector.html`.

## Fase 4 · Verificación (antes del PR)
- `npm run lint`, `npm test` y `npm run build`, con las mismas rutas que en P3-1.
- **Tienda × claro/oscuro × 360, 390 y 1280 px**, en home, `/soluciones`, una solución, `/demo`, el 404 y el chat abierto:
  - sin overflow;
  - contraste AA contra el fondo efectivo;
  - primera pantalla del celular con los dos botones;
  - ninguna `EtiquetaPrecio` más ancha que su tarjeta (`getBoundingClientRect`), incluida "Desde $747.000".
- **Personaje:**
  - entrar a Tienda sin haber elegido dibujo muestra el chibi;
  - elegir anime y volver a Tienda mantiene el anime.
- **Tema:** entrar a Tienda sin tema elegido lo muestra en claro; con el oscuro elegido, en Noche cálida.
- **Ejemplo:** no tiene ningún elemento tabulable dentro (recorré con Tab), y el lector de pantalla anuncia solo el texto alternativo.
- **Presupuesto de P2:** TBT ≤ 250 ms, LCP ≤ 2,5 s y CLS ≤ 0,05, con Fredoka incluida.
- **Capturas** a 390 y 1280 px en los dos modos, al lado de las pantallas de `docs/agencia/estilos/tienda/`, guardadas en `docs/agencia/verificacion/p3-3/`.
- Sección "P3-3" en `docs/agencia/INFORME.md`.
