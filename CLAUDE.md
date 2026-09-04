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

El diseño visual está aprobado y **no se reinterpreta**. Los archivos
originales (`design-system.md` y el HTML standalone) ya no están disponibles
en la máquina, así que la fuente de verdad es lo que quedó en el código:

- `app/globals.css` — tokens de color, tipografía, escala 1.25 y spacing fluido.
  Los comentarios `design-system.md §N` señalan de qué sección salió cada uno.
- La sección **Invariantes del sistema de diseño** de este archivo.
- Las composiciones existentes: las tres cards de `CaseStudies.tsx` y las tres
  páginas de caso en `components/pages/`.

Si un pedido contradice esas reglas, las reglas ganan; avisá la discrepancia en
vez de resolverla en silencio. No se agregan tokens nuevos sin una razón que
no se pueda cubrir con los existentes.

## Arquitectura

### Server Components por defecto

Exactamente diez archivos son `"use client"`: los dos `error.tsx` —React lo
exige para un error boundary, y por eso su copy sale de `lib/content/errors`
y no del diccionario grande—, `ThemeProvider`, `motion/Reveal`,
`case-study/ArchitectureDiagram`, `case-study/FeedbackDiagram`,
`case-study/RetrievalDiagram`, `case-study/diagram-kit`, `ui/ThemeToggle`,
`ui/LocaleToggle`. Todo lo demás
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
  Los ocho archivos de `app/**/page.tsx` son cinco líneas cada uno.
- `lib/metadata.ts` arma la metadata de cada ruta. Los layouts no declaran
  `alternates` a propósito: si lo hicieran, una página que se olvide de
  sobreescribirlo heredaría el canonical del home en silencio. Las páginas
  de caso resuelven título y descripción por la tabla `CASE_META`, tipada
  contra `CaseRoute`: sumar un caso sin su fila ahí no compila.
- `proxy.ts` (Next 16 renombró `middleware.ts` → `proxy.ts`, y la función es
  `proxy`, no `middleware`) tiene matcher `["/"]` y una sola tarea: 307 a
  `/en` si alguien llega a la raíz sin cookie de idioma y con el navegador en
  inglés. Con cookie presente no hace nada.
- `lib/content/{es,en}.ts` implementan el mismo tipo `Content` de `lib/types.ts`.
  **Agregar copy es cambiar tres archivos**: el tipo y las dos traducciones. El
  tipo es lo que fuerza que no se desincronicen.

### Tema: solo el script inline

La fuente de verdad es la clase `dark` en `<html>`, y **la escribe el script
inline** de `SiteDocument` — las dos ramas, la cookie si existe y
`prefers-color-scheme` si no. `ThemeProvider` la lee con
`useSyncExternalStore`, no con `useState`.

Una sola excepción, y está documentada en los dos archivos: en un 404 o un
error boundary Next monta el layout en el cliente y el script viaja como
dato, no como etiqueta, así que no corre. `ThemeProvider` lo replica en un
layout effect **solo si `<html>` no tiene la clase `js`**. Por la misma razón
el `<html>` no lleva `className` como prop de React —las variables de fuente
van en `<body>`—: si lo llevara, ese render en cliente borraría `js` y
`dark`. El aviso de consola "Encountered a script tag" en desarrollo al caer
en un 404 es el síntoma esperado de ese camino, no un bug, y `next/script`
con `beforeInteractive` no lo resuelve: en App Router encola el inline y lo
ejecuta después del primer paint.

Ningún Server Component lee la cookie del tema. Eso no es un detalle: era la
segunda llamada a `cookies()` del root layout y, junto con el locale, lo que
volvía dinámicas las tres rutas del sitio.

### Las rutas son estáticas — mantenelas así

El build tiene que mostrar `○` en `/`, `/en` y las seis de casos. Cualquier
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

Las variables del bloque `@theme inline` **solo se emiten al CSS si alguna
utilidad las usa**. En CSS escrito a mano no uses `var(--font-*)` ni
`var(--text-*)`: usá `@apply` con la utilidad, que inserta el valor resuelto.
La regla `body` de `globals.css` es el precedente: con `var(--font-body)` el
cuerpo caía a la fuente del sistema y Public Sans se cargaba sin usarse.

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
  parametrizado por data a propósito: Tuki va sobre `paper` con aside de rol
  —lo que distingue al caso es el liderazgo, no el stack—, Qué Pinta Salta
  lleva aside de stack sobre `paper-2`, MaestrIA va sobre `paper` con barra
  de encabezado y sin aside. El orden de la home es cronológico inverso.
- **Tuki no nombra al cliente.** El contrato no está firmado: la copy dice
  "un municipio de capital provincial" y "el cliente institucional", sin
  logos ni identidad visual de ellos. El CTA es "Ver prototipo", no "Ver en
  producción". El demo presentado al cliente no se enlaza nunca, y las
  capturas se recortan si muestran una URL o un nombre del municipio: la
  tercera captura del caso es solo el bloque de fuentes por eso.

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

Los tres diagramas (`case-study/ArchitectureDiagram.tsx`,
`case-study/FeedbackDiagram.tsx` y `case-study/RetrievalDiagram.tsx`)
comparten `diagram-kit.tsx`: paleta resuelta por superficie (`paper` /
`panel`), envoltura de figura con leyenda y el cableado de motion. La
**geometría no se comparte** — los offsets de texto están ajustados a mano
por nodo y una fórmula común los correría. Los anchos de texto se verifican
en el browser con `getComputedTextLength()` contra el `rect` de cada nodo,
en los dos idiomas y las dos orientaciones; la horizontal solo mide con un
viewport de 760px o más, abajo de eso está en `display: none` y devuelve 0.

Las capturas de producto de Qué Pinta Salta y MaestrIA comparten todo:
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
entorno — no lo reportes como bug del código. Las capturas de pantalla salen
negras al scrollear y las imágenes en lazy no cargan, por lo mismo. Lo que sí
se puede medir por JS: overflow horizontal, contraste calculado contra el fondo
efectivo, fuentes cargadas (`document.fonts`) y ejes variables, anchos de texto
de los diagramas, y los toggles de tema e idioma.

`.claude/launch.json` (ignorado por git) define el servidor `dev` para el
panel con `autoPort: true`, porque el puerto 3000 suele estar ocupado por un
`next dev` que dejó abierto Mauro. Si ese servidor es el de este repo, sirve
la rama que esté checkouteada, con HMR.

Para probar el camino del 404 y de los error boundaries usá un build de
producción en otro puerto —`npm run build` y después `npx next start -p 3001`—
porque en desarrollo ese camino tiene un aviso de consola propio y un ciclo
de refetch que no existe en producción. Matá el proceso al terminar.
