# Tanda P3-1 · Malejo: sistema de estilos, estilo Institucional y el personaje en 3 dibujos

**Requisito para empezar: P2 + P2.1 mergeadas en `main` (PR #9, ya mergeado el 16-11).** Si no lo están, esperá: esta tanda se apoya en la barra inferior, el armador ("Tu kit") y la hoja de Malejo de P2. En la copy visible se dice **"kit"**, nunca "armado".

Repo `Malejo01/portfolio-2026`, sitio de la agencia (`app/(agencia)`).
- Trabajá en loop, por fases, con un commit por fase y **sin pedir permiso**.
- Abrí **un solo PR** contra `main`, desde la rama `p3-1-estilos`, y no lo mergees. Si corrés las tandas en cadena, seguí la regla de ramas de `00-LEEME-ORDEN.md`.
- Las reglas de `CLAUDE.md` siguen todas vigentes: rutas estáticas `○`, ningún hex en componentes, copy en `content/agencia/`, `data-reveal`, Framer Motion con `LazyMotion` + `m`, y las islas en `components/agencia/client/`. **El portfolio (`/portfolio`) no se toca.**
- Plan general de referencia: `plan-p3-estilos-sprites-easter-eggs.md` (adjunto; todavía no está en el repo: guardalo en `docs/agencia/`). **Esta tanda es solo la primera parte; lo que no está acá no se hace.**

## Alcance (lo que entra y lo que no)

Mauro decidió publicar los estilos **de a uno**. Esta tanda deja el **sistema completo** y suma **un solo estilo nuevo: Institucional**. Aula virtual y Tienda llegan en tandas siguientes, cada una con su lienzo aprobado, y solo agregan filas, tokens y un hero.

| Entra | No entra (queda para tandas siguientes) |
|---|---|
| Sistema de estilos: tokens por `[data-estilo]`, selector, script inline, test de contraste | Aula virtual y Tienda (en el selector aparecen como **"Próximamente"**, deshabilitadas) |
| **Tech/IA** (el actual, **siempre el de entrada**) e **Institucional**, con el diseño aprobado en `docs/agencia/estilos/institucional/` (adjunto a esta sesión) | Los otros estilos del plan (Personal, Gastronomía, Turismo, Salud, Noticias) |
| En Institucional cambian colores, tipografías, formas y el hero de la home; Soluciones, el chat y el resto de las páginas solo cambian de piel | Cambiar el acomodo de las secciones de Tech/IA |
| Personaje en **3 dibujos** (pixel 16-bit, chibi y anime) y un **selector rápido de personaje** | Accesorios por estilo y easter eggs |
| **3 poses por dibujo** (normal, pensando y ok) más el **idle animado por código** (respira y parpadea); **saludo y festejo** dibujados por Mauro (adjuntos, ver la Fase 3) | Otras animaciones dibujadas |

## Fase 1 · Sistema de estilos
1. `content/agencia/estilos.ts` es la fuente única. Por estilo: `id` (`tech` | `institucional`; `aula` y `tienda` declarados con `disponible: false`), `nombre`, `categoria` (la key de la categoría que representa), `fraseHero` y `ejemploHero`, más la miniatura del selector.
   - Tech representa `ia` e Institucional, `webs`.
   - Aula (`ia`, con `plataforma-educativa-con-ia`) y Tienda (`tiendas`) quedan declarados para las tandas siguientes.
2. **Script inline en el `<head>` del layout de la agencia,** con el mismo patrón del tema y sin leer cookies en el servidor:
   - lee `localStorage["malejo-estilo"]`;
   - si no existe, usa **`tech`** (decisión de Mauro del 16-11: el original siempre es el de entrada; nada de azar en la primera visita);
   - pone `data-estilo` en `<html>` antes del primer pintado;
   - maneja también `data-dibujo` (ver la Fase 3);
   - sin JS, el CSS por defecto es Tech/IA;
   - las rutas siguen `○`;
   - respaldo en el 404 y en los error boundaries, igual que con el tema (ver `theme.ts`).
3. **`app/(agencia)/estilos.css`:** los mismos nombres de tokens de `agencia.css`, redefinidos por `[data-estilo="…"]` y `[data-estilo="…"].dark`. Cada estilo tiene claro y oscuro, y el toggle de tema sigue funcionando.
   - **Ningún componente ramifica por estilo en JS.** Si un componente necesita algo distinto, va como token (radio, grosor de borde, sombra, fuente de títulos).
   - Si hace falta un token nuevo, se suma a Tech e Institucional, y queda anotado para los estilos que vienen.
4. **Identidad de Institucional: está cerrada, no la reinterpretes.** Seguí `docs/agencia/estilos/institucional/ESPEC.md` y las 6 pantallas `.html` de esa carpeta: home claro, home oscuro, home celular, Soluciones, Soluciones en celular con Malejo y el selector.
   - **Tipografía:** Source Serif 4 en titulares y precios, Inter en el resto. Es la única familia nueva y va con `next/font`, `preload: false`.
   - **Forma:** radios de 4 px, bordes de 1 px y la franja de 3 colores.
   - **Tokens:** los de la especificación, en claro y oscuro. En oscuro los colores son más suaves, a pedido de Mauro.
   - **Copia la composición, no el código:** las pantallas usan estilos inline y van traducidas a los tokens y componentes del sitio.
5. **Test de contraste:** `lib/agencia/estilos.test.ts` lee los tokens de Tech/IA e Institucional en claro y oscuro y verifica AA (4,5:1 en texto, 3:1 en texto grande e íconos) en todos los pares que usan los componentes. Si alguno no llega, falla.

## Fase 2 · Selector y home
1. **Isla `EstiloSelector`** (diseño en `F-selector.html`):
   - **Escritorio:** pestaña vertical "Estilos" en el borde derecho, a media altura.
   - **Celular:** ícono 🎨 en el header, al lado del logo. La barra inferior de P2 no se toca.
   - **Panel "Mirá la web en otro estilo"** (en celular, una hoja):
     - las 4 miniaturas (Tech/IA, Institucional, y Aula virtual y Tienda como "Próximamente", deshabilitadas);
     - la fila **Personaje** (Pixel · Chibi · Anime);
     - "Sorprendeme", que alterna entre los estilos disponibles;
     - "Volver al original", que vuelve a Tech/IA.
   - **Al elegir:** se guarda en `localStorage`, se actualiza `data-estilo` y se usa `document.startViewTransition()` si existe. Con movimiento reducido, sin transición.
   - **Analytics:** `estilo_cambiado` (`{ id }`) y `personaje_cambiado` (`{ dibujo }`).
2. **Selector rápido de personaje (pedido de Mauro):** además del panel, hay un acceso directo junto al personaje.
   - **Escritorio:** debajo del ejemplo del hero, el grupo "Personaje: Pixel · Chibi · Anime" (`role="group"`, botones con `aria-pressed`).
   - **Celular:** un botón con ícono de flechas circulares al lado del "Soy Mauro", que pasa al dibujo siguiente.
   - **En el chat de Malejo:** tocar el avatar del encabezado también pasa al dibujo siguiente.
   - **Guardado:** la elección va a `localStorage["malejo-dibujo"]`. Si la persona eligió uno, **ese dibujo manda**: el cambio al azar del dibujo al cambiar de estilo (punto 5 de la Fase 3) solo corre si nunca eligió.
   - **El cambio** es un fundido corto (sin fundido con movimiento reducido) y vale para todo el sitio: hero, equipo, chat y botón de Malejo.
3. **Hero por estilo:** `components/agencia/home/estilos/<id>/Hero.tsx`, como Server Components.
   - Se renderizan los heroes de los estilos disponibles (Tech e Institucional) y el CSS muestra solo el de `[data-estilo]`. Los demás llevan `display: none` y sus imágenes, `loading="lazy"`.
   - **Todos conservan lo de P2:** H1 "Software con IA para tu negocio.", los dos botones ("Hablar con Malejo" y "Armar mi kit") y los chips de confianza, dentro de la primera pantalla del celular.
   - Cada uno suma **un ejemplo visual de su categoría** hecho con HTML y CSS (no capturas) y la línea **"Así se vería tu web de <categoría> →"** hacia `/soluciones?cat=<categoría>`:
     - Institucional: la «Cooperativa del Valle» dentro de una ventana de navegador, exactamente como en `F-home-claro.html`;
     - Tech: el que hay hoy.
   - Copy en `content/agencia/estilos.ts`, que pasa el test de glosario.
4. Las demás páginas solo cambian de piel. Recorré `/soluciones`, una solución, `/demo`, el blog, los legales, el 404 y el chat en Tech e Institucional (claro y oscuro), y corregí lo que no se lea.

## Fase 3 · El personaje en 3 dibujos y 3 poses
Poses: `normal` (hoy `malejo-bolsillos.png`), `pensando` y `ok`.

1. **Estructura:** `public/agencia/sprites/<dibujo>/<pose>.png`, con `dibujo` = `16bit` | `chibi` | `anime`, más `public/agencia/sprites/sprites.json` con el tamaño lógico y la escala de cada dibujo.
   - Hoy hay 4 PNG en `public/agencia/sprites/`: `malejo-bolsillos`, `malejo-pensando`, `malejo-ok` y `malejo-saludo` (la tira de 2 cuadros que anima `SpriteVivo` con `.sprite-saludo` en `agencia.css`). Los tres primeros pasan a `16bit/normal.png`, `16bit/pensando.png` y `16bit/ok.png`. Son idénticos a los del zip (verificado el 16-11). Actualizá todos los usos: `MalejoWidget`, `Team.tsx`, la home y el 404.
   - `malejo-saludo.png` y la animación `.sprite-saludo` se reemplazan por el saludo nuevo (ver el punto 3). Borralos cuando nada los use.
2. **Los 3 dibujos vienen en el zip:** `sprites/<dibujo>/{normal,pensando,ok}.png`. Chibi y anime los dibujó Mauro con Antigravity (15-11); el 16-bit es el actual del sitio.
   - Guardalos tal cual en `docs/agencia/sprites/fuente/<dibujo>/`.
   - Ya vienen limpios: 15 colores, fondo transparente sin semitransparencias, el mismo lienzo en las 3 poses y los pies en la última fila. Los lienzos son anime 384×768 y chibi 512×681.
   - `scripts/sprites/limpiar.py` solo verifica (mismo lienzo, alfa binaria, ≤ 24 colores, pies alineados), recorta el margen transparente común a las 3 poses y copia el resultado a `public/agencia/sprites/<dibujo>/<pose>.png`. **No reescala ni cuantiza:** no siguen una grilla exacta, y reescalarlos los ensucia.
   - **El chibi derivado por script del 16-bit ya no se usa.** No crees `chibi.py`.
3. **Animación idle por código (sin imágenes nuevas)**, en `scripts/sprites/animar.py`, que genera una tira de frames por dibujo (`public/agencia/sprites/<dibujo>/idle.png`) y su entrada en `sprites.json`:
   - **Respirar:** el tronco y la cabeza (todo lo que está arriba de la fila donde empieza el jean, menos 2 bloques) bajan 1 bloque y vuelven. Tamaño de bloque: 16-bit 10 px, chibi 4 px, anime 3 px. Va en `sprites.json`.
   - **Parpadear:** dentro de cada lente, los píxeles que no son piel ni el marco (anillo de 2 bloques) se pintan con el color de piel, y se dibuja una línea curva oscura de 1 bloque. Las cajas de los ojos van a mano en `sprites.json`:
     - chibi: `[161,257,222,307]` y `[285,257,350,307]`;
     - anime y 16-bit: medilas sobre el PNG con el mismo criterio.
   - **Secuencia:** normal, abajo, abajo, normal, normal, parpadeo, normal (450, 450, 450, 450, 900, 110 y 1400 ms).
   - **En el sitio:** CSS `steps()` sobre la tira, con `image-rendering: pixelated`. Se pausa fuera de la pantalla (IntersectionObserver liviano o `content-visibility`) y **con `prefers-reduced-motion` se ve la pose normal quieta**.
   - **Referencia aprobada por Mauro:** `docs/agencia/sprites/referencia/chibi-idle.gif` (adjunto). El de la tanda tiene que verse igual.
   - **Las poses `pensando` y `ok` siguen quietas en esta tanda.**
   - **Saludo y festejo (dibujados, adjuntos en `malejo-animaciones/`).** Mauro los generó con Antigravity el 16-11 y ya están revisados:
     - mismo lienzo que las poses base;
     - alfa binaria;
     - pies y cabeza en la misma posición que `normal` (diferencia ≤ 2 px).

     Guardalos en `docs/agencia/sprites/malejo-animaciones/<dibujo>/`. `animar.py` arma con ellos dos tiras más por dibujo, `saludo.png` y `festejo.png`, con sus tiempos en `sprites.json`:
     - **saludo:** normal 300 ms, a 220, b 220, a 220, b 220, a 220 y normal 700. **Sin cuadros intermedios ni mezcla de transparencias:** en pixel art una mezcla deja fantasmas. Se cambia de cuadro y listo.
     - **festejo:** normal 250 ms; festejo 2 bloques más arriba, 120 ms; festejo en su lugar, 900 ms; normal 600 ms.
     - **Referencias aprobadas:** `malejo-animaciones/<dibujo>/{saludo,festejo}-referencia.gif`. Tienen fondo gris solo para verlas; en el sitio van transparentes. Guardalas al lado de los PNG.
     - **Cuándo se reproducen (una vez cada uno, nunca en bucle):**
       - el saludo, al abrir el chat y en la primera visita al hero (marcalo en `sessionStorage`);
       - el festejo, en la pantalla de éxito del kit.

       Con `prefers-reduced-motion`, ninguno se reproduce y se ve la pose que corresponde quieta (`normal` u `ok`).
     - **Reemplazá `SpriteVivo`** (`.sprite-saludo`, hoy en bucle cada 5,2 s) por el saludo nuevo del dibujo activo. Dejá un solo mecanismo de animación de sprites, no dos.
4. **Componente `<Sprite dibujo pose />`** (Server Component):
   - `<img>` con `image-rendering: pixelated`, `width` y `height` explícitos (sin CLS) y alt desde la copy;
   - un mismo tamaño en pantalla para los 3 dibujos: se ajusta la escala y se apoya por los pies;
   - `npm run sprites` corre los dos scripts.
5. **Qué dibujo se ve:**
   - en la primera visita `data-dibujo` es `16bit`; **cada vez que la persona cambia el estilo** pasa al siguiente de un shuffle bag (`localStorage["malejo-dibujo-bolsa"]`);
   - se renderizan los dibujos activos y el CSS muestra el de `[data-dibujo]`, como con los heroes. Así no hay JS para elegir la imagen;
   - el cambio de dibujo acompaña la View Transition del estilo.
6. **Poses según el contexto.** `normal` usa el idle animado; entre poses, un fundido corto:
   - hero, equipo y Malejo en espera: `normal` (idle animado);
   - Malejo mientras escribe: `pensando`;
   - Malejo cuando muestra una tarjeta o sugerencia, y la pantalla de éxito del kit: `ok`;
   - el botón de Malejo de la barra inferior usa la cabeza del dibujo activo, como hoy.

## Fase 4 · Verificación (obligatoria antes del PR)
- `npm run lint`, `npm test` y `npm run build`, con todas las rutas en el mismo estado que en P2.
- Para **Tech e Institucional × claro/oscuro × 390 y 1280 px**, en home, `/soluciones`, una solución, `/demo`, el 404 y el chat abierto:
  - sin overflow horizontal;
  - contraste calculado contra el fondo efectivo;
  - primera pantalla del celular con los 2 botones;
  - el personaje con el mismo tamaño en pantalla en los 3 dibujos.
- Sin JS: la página se ve en Tech/IA, en 16-bit, y es completamente usable.
- Primera visita (`localStorage` vacío): siempre Tech/IA y dibujo 16-bit. Elegir Institucional y volver a entrar mantiene la elección; elegir un dibujo con el selector rápido lo mantiene aunque se cambie de estilo.
- Presupuesto de P2 en los dos estilos: TBT ≤ 250 ms, LCP ≤ 2,5 s y CLS ≤ 0,05.
- Capturas de los 2 heroes a 390 y 1280 px, comparadas lado a lado con las pantallas de `docs/agencia/estilos/institucional/`, y de los 3 dibujos × 3 poses lado a lado, en `docs/agencia/verificacion/p3-1/`.
- **Animaciones:** las tiras `idle`, `saludo` y `festejo` de los 3 dibujos coinciden con los GIF de referencia, cuadro por cuadro y en tiempos. El saludo y el festejo se reproducen una sola vez, y con movimiento reducido no se mueve nada. No queda ningún uso de `malejo-saludo.png` ni de `.sprite-saludo`.
- Informe en `docs/agencia/INFORME.md`, sección "P3-1", con lo que queda pendiente (anime activado o no).

## Archivos adjuntos a esta sesión (zip `p3-1-adjuntos.zip`)
- `referencia-institucional/`: las 6 pantallas aprobadas (`.html`) y `ESPEC.md`. Guardalas en `docs/agencia/estilos/institucional/`.
- `sprites/16bit|chibi|anime/{normal,pensando,ok}.png`: los sprites base. Guardalos en `docs/agencia/sprites/fuente/<dibujo>/`.
- `sprites/chibi-idle-referencia.gif`: la referencia aprobada del idle. Guardala en `docs/agencia/sprites/referencia/`.
- `malejo-animaciones/<dibujo>/{saludo-a,saludo-b,festejo}.png` más los GIF `saludo-referencia` y `festejo-referencia`. Guardalos en `docs/agencia/sprites/malejo-animaciones/<dibujo>/`.
- `plan-p3-estilos-sprites-easter-eggs.md`: el plan general. Guardalo en `docs/agencia/`.
