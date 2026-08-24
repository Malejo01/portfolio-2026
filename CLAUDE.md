# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Comandos

```bash
npm run dev      # servidor de desarrollo (Turbopack)
npm run build    # build de producción — corre TypeScript, es el typecheck real
npm run lint     # eslint (eslint-config-next); falla el build en CI si hay errores
```

No hay tests ni framework de testing en el proyecto. `npm run build` es la única
verificación automatizada: compila, corre TypeScript y prerenderiza las rutas.

Toda la copy del sitio está en español con acentos. **No edites archivos con
`Set-Content`/`Get-Content` de PowerShell 5.1**: lee UTF-8 como ANSI y produce
mojibake silencioso (`semánticos` → `semÃ¡nticos`). Usá las herramientas de
edición de archivos.

## Fuente de verdad del diseño

El diseño visual está aprobado y **no se reinterpreta**. Vive un nivel arriba del
repo:

- `../design-system.md` — paleta, tipografía, escala, spacing, reglas de composición
- `../portfolio-mauro-lizarraga-standalone.html` — el archivo real; el HTML está
  embebido como string JSON escapado en la línea 382, no es legible directamente

Si un pedido contradice el design system, el design system gana; avisá la
discrepancia en vez de resolverla en silencio.

## Arquitectura

### Server Components por defecto

Exactamente nueve archivos son `"use client"`: los dos `error.tsx` —React lo
exige para un error boundary, y por eso su copy sale de `lib/content/errors`
y no del diccionario grande—, `ThemeProvider`, `motion/Reveal`,
`case-study/ArchitectureDiagram`, `case-study/FeedbackDiagram`,
`case-study/diagram-kit`, `ui/ThemeToggle`, `ui/LocaleToggle`. Todo lo demás
corre en el servidor. Los wrappers de animación reciben el contenido como
`children` desde Server Components, así que **la copy nunca entra al bundle del
cliente**. Mantené esa propiedad al agregar componentes: si algo necesita estado,
empujá el `"use client"` lo más abajo posible en el árbol.

### Idioma: por ruta, no por cookie

El español vive sin prefijo (`/`, `/casos/…`) y el inglés bajo `/en`. Hay
**dos root layouts**, `app/(es)` y `app/(en)`, y ningún `app/layout.tsx`
arriba — es la condición que pone Next para permitir varios, junto con que
`/` viva dentro de un grupo. Navegar entre árboles fuerza recarga completa,
que para un cambio de idioma es lo correcto.

- `lib/routes.ts` es **la única tabla de rutas**. De ahí salen los canonical,
  los hreflang, el sitemap y el destino del toggle. Agregar una página es
  sumar una fila; `localized()` mueve un href al árbol que toque y
  `swapLocale()` calcula la ruta espejo preservando dónde está el visitante.
- Los cuerpos de las páginas están en `components/pages/` y reciben `locale`.
  Los seis archivos de `app/**/page.tsx` son cinco líneas cada uno.
- `lib/metadata.ts` arma la metadata de cada ruta. Los layouts no declaran
  `alternates` a propósito: si lo hicieran, una página que se olvide de
  sobreescribirlo heredaría el canonical del home en silencio.
- `proxy.ts` (Next 16 renombró `middleware.ts` → `proxy.ts`, y la función es
  `proxy`, no `middleware`) tiene matcher `["/"]` y una sola tarea: 307 a
  `/en` si alguien llega a la raíz sin cookie de idioma y con el navegador en
  inglés. Con cookie presente no hace nada.
- `lib/content/{es,en}.ts` implementan el mismo tipo `Content` de `lib/types.ts`.
  **Agregar copy es cambiar tres archivos**: el tipo y las dos traducciones. El
  tipo es lo que fuerza que no se desincronicen.

### Tema: solo el script inline

La fuente de verdad es la clase `dark` en `<html>`, y **la escribe únicamente
el script inline** de `SiteDocument` — las dos ramas, la cookie si existe y
`prefers-color-scheme` si no. `ThemeProvider` la lee con
`useSyncExternalStore`, no con `useState`.

Ningún Server Component lee la cookie del tema. Eso no es un detalle: era la
segunda llamada a `cookies()` del root layout y, junto con el locale, lo que
volvía dinámicas las tres rutas del sitio.

### Las rutas son estáticas — mantenelas así

El build tiene que mostrar `○` en `/`, `/en` y las cuatro de casos. Cualquier
Dynamic API (`cookies()`, `headers()`) en un layout o page las devuelve a `ƒ`
y tira abajo el cacheo en CDN. Si necesitás algo por request, empujalo al
cliente o al proxy.

Las dos rutas `ƒ` que sí aparecen son los `[...notFound]` de cada árbol, que
existen solo para llamar a `notFound()`.

### Tokens: CSS vars → utilidades de Tailwind

`app/globals.css` define los tokens como custom properties en `:root` y `.dark`,
y los expone a Tailwind con `@theme inline`. **Nunca escribas un hex en un
componente** — usá las utilidades nombradas:

- Color: `paper`, `paper-2`, `panel`, `panel-2`, `panel-ink`, `panel-soft`,
  `panel-hair`, `ink`, `ink-soft`, `hair`, `accent`, `accent-hover`,
  `accent-fill`, `accent-ink`, `accent-panel`
- Texto: `text-meta`, `text-body`, `text-lead`, `text-sub`, `text-title`,
  `text-display`, `text-hero`, `text-decision`, `text-formula`
- Spacing fluido (todos `clamp()`): `gutter`, `section`, `card`, `panel`,
  `aside`, `diagram`, `gap-main`, `row`, `block`, `lede`, `cta`
- Utilidades propias: `hairline` (borde de 0.5px) y `opsz-14/18/24/36/48/60/72`
  para el eje óptico variable de Bricolage Grotesque

Los tokens de modo oscuro se resuelven solos vía CSS. **Ningún componente debe
ramificar por tema en JS.** Lo que sí varía es la superficie: los componentes de
`ui/` toman un prop `onPanel` porque los fondos oscuros (`panel`) necesitan el
acento en otra luminosidad para mantener AA.

### Invariantes del sistema de diseño

Romperlas es un bug visual, aunque compile:

- **Ninguna `box-shadow` en todo el sitio.** La jerarquía se construye con
  superficie (`paper` / `paper-2` / `panel`) y hairlines de 0.5px.
- **El único borde de 1px** es la caja "Compuerta" del diagrama y la línea de
  cierre del bloque de decisión. El grosor *es* el énfasis; no lo diluyas.
- **El acento verde aparece solo en dos situaciones**: "acá interviene el modelo"
  y "acá está la acción principal". Nunca decorativo.
- Máximo dos fondos por vista, con `panel` reservado a tres momentos: hero,
  caso MaestrIA y contacto.
- Cada caso de estudio tiene composición propia. `CaseStudies.tsx` no está
  parametrizado por data a propósito: Qué Pinta Salta lleva aside de stack sobre
  `paper-2`, MaestrIA va sobre `paper` con barra de encabezado y sin aside.

### Animación

Framer Motion es la única librería. Dos contratos no obvios:

**1. Todo elemento animado necesita `data-reveal`.** Framer Motion serializa el
estado inicial (`opacity: 0`, `stroke-dasharray`) en el HTML del servidor. El
script de `<head>` marca `<html class="js">`, y `globals.css` tiene una regla
`html:not(.js) [data-reveal]` que devuelve todo a su estado final si el script no
corrió. Sin el atributo, un visitante sin JS ve ese elemento en blanco.

**2. `viewport.amount` tiene un límite duro.** Framer Motion lo pasa sin clamp
como `threshold` del IntersectionObserver (ver
`node_modules/framer-motion/dist/es/motion/features/viewport/index.mjs`). Un
elemento más alto que `1 / amount` viewports **nunca intersecta y queda invisible
para siempre**. `lib/motion.ts` usa `0.2` (límite: 5 viewports) por eso. Si
agregás un bloque muy alto, verificá el margen antes de subir ese valor.

Reglas del diseño: `once: true`, `useReducedMotion()` salta al estado final, y un
solo momento orquestado — el diagrama de arquitectura.

Los dos diagramas (`case-study/ArchitectureDiagram.tsx` y
`case-study/FeedbackDiagram.tsx`) comparten `diagram-kit.tsx`: paleta resuelta
por superficie (`paper` / `panel`), envoltura de figura con leyenda y el
cableado de motion. La **geometría no se comparte** — los offsets de texto
están ajustados a mano por nodo y una fórmula común los correría.

Las capturas de producto de los dos casos sí comparten todo:
`case-study/CaseShots.tsx` resuelve marco por superficie, tope de render y el
ancla al archivo original. Es Server Component: recibe los `Reveal*` como
envoltura pero los alt llegan desde la copy del servidor. Cada captura es un
enlace al PNG a propósito — en un teléfono no hay composición que las haga
leíbles y el zoom nativo del navegador es la salida sin JavaScript. El porqué
completo, con los números, está en el propio archivo.

El diagrama (`case-study/ArchitectureDiagram.tsx`) **no recibe props de data**.
Los nodos son fijos y semánticos: el layout de los dos carriles es parte del
argumento del caso, no un detalle de render. Se renderizan las dos orientaciones
(horizontal ≥760px, vertical abajo) y CSS elige cuál se ve; el `viewBox` reserva
la altura, por eso no hay CLS. Sumar una fuente = editar el SVG.

### Enlaces externos

`lib/links.ts` es el único lugar donde viven. **String vacío significa "todavía no
hay URL"** y los componentes filtran esas entradas en vez de renderizar un
`href="#"` tabulable que no lleva a ningún lado. Al agregar un CTA, seguí ese
patrón.

## Verificación

El panel del browser suele estar oculto en estas sesiones, y ahí la página queda
suspendida: **cero frames de `requestAnimationFrame` y cero callbacks de
IntersectionObserver**. Las animaciones son imposibles de verificar en ese
entorno — no lo reportes como bug del código. Lo que sí se puede medir por JS:
overflow horizontal, contraste calculado contra el fondo efectivo, fuentes y ejes
variables, y los toggles de tema e idioma.
