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

En el portfolio, exactamente diez archivos son `"use client"`: los dos `error.tsx` —React lo
exige para un error boundary, y por eso su copy sale de `lib/content/errors`
y no del diccionario grande—, `ThemeProvider`, `motion/Reveal`,
`case-study/ArchitectureDiagram`, `case-study/FeedbackDiagram`,
`case-study/RetrievalDiagram`, `case-study/diagram-kit`, `ui/ThemeToggle`,
`ui/LocaleToggle`. Las islas del sitio de la agencia viven todas en
`components/agencia/client/` (ver **Sitio de la agencia**). Todo lo demás
corre en el servidor. Los wrappers de animación reciben el contenido como
`children` desde Server Components, así que **la copy nunca entra al bundle del
cliente**. Mantené esa propiedad al agregar componentes: si algo necesita estado,
empujá el `"use client"` lo más abajo posible en el árbol.

### Idioma: por ruta, no por cookie

El portfolio vive bajo **`/portfolio`** (español: `/portfolio`,
`/portfolio/casos/…`) y **`/portfolio/en`** (inglés). La raíz del dominio es
el sitio de la agencia Malejo (`app/(agencia)`, ver **Sitio de la agencia**);
el 307 temporal de `/` → `/portfolio` ya se quitó. Las URLs viejas
(`/casos/:slug`, `/en`, `/en/…`) redirigen con 308 a las nuevas: están en el
CV y en LinkedIn, no las borres.

El portfolio tiene **dos root layouts**, `app/(es)` y `app/(en)` (la agencia suma un tercero), y ningún `app/layout.tsx`
arriba — es la condición que pone Next para permitir varios, junto con que
cada árbol viva dentro de un grupo. Navegar entre árboles fuerza recarga completa,
que para un cambio de idioma es lo correcto.

- `lib/routes.ts` es **la única tabla de rutas**. De ahí salen los canonical,
  los hreflang, el sitemap y el destino del toggle. Agregar una página es
  sumar una fila. La copy escribe los enlaces **relativos al portfolio**
  (`/`, `/#casos`, `/casos/maestria`); `localized()` les pone el prefijo
  (`/portfolio` o `/portfolio/en`) y
  `swapLocale()` calcula la ruta espejo preservando dónde está el visitante.
- Los cuerpos de las páginas están en `components/pages/` y reciben `locale`.
  Los ocho archivos de `app/**/page.tsx` son cinco líneas cada uno.
- `lib/metadata.ts` arma la metadata de cada ruta. Los layouts no declaran
  `alternates` a propósito: si lo hicieran, una página que se olvide de
  sobreescribirlo heredaría el canonical del home en silencio. Las páginas
  de caso resuelven título y descripción por la tabla `CASE_META`, tipada
  contra `CaseRoute`: sumar un caso sin su fila ahí no compila.
- `proxy.ts` (Next 16 renombró `middleware.ts` → `proxy.ts`, y la función es
  `proxy`, no `middleware`) tiene matcher `["/portfolio"]` y una sola tarea: 307 a
  `/portfolio/en` si alguien llega al portfolio sin cookie de idioma y con el navegador en
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

El build tiene que mostrar `○` en `/portfolio`, `/portfolio/en`, las seis de casos y todas
las páginas de la agencia (`/`, `/precios`, `/servicios/*`, `/cotizador`, `/demo`, `/blog/*`, `/legal/*`). Cualquier
Dynamic API (`cookies()`, `headers()`) en un layout o page las devuelve a `ƒ`
y tira abajo el cacheo en CDN. Si necesitás algo por request, empujalo al
cliente o al proxy.

Las rutas `ƒ` que sí aparecen son los tres `[...notFound]` (raíz de la agencia,
`/portfolio/…` y `/portfolio/en/…`), que existen solo para llamar a
`notFound()`, y los route handlers de `/api/*` de la agencia.

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

## Sitio de la agencia

La raíz de `malejo.com.ar` es el sitio de la agencia Malejo: un **tercer root
layout**, `app/(agencia)`, al lado de `(es)` y `(en)`. La fuente de verdad del
diseño es `docs/agencia/DISENO.md` + `docs/agencia/referencia.html` + las
capturas de `docs/agencia/capturas-diseno/`; el índice y las fases están en
`docs/agencia/PROMPT.md` y lo hecho en `docs/agencia/INFORME.md`.

```bash
npm test            # Vitest: precios, chat (herramientas, ficha, prompt, ruta con modelo simulado)
npm run eval:chat   # evals del chat contra el modelo real (-- --url <base>, default localhost:3000)
npm run db:generate # drizzle-kit: genera migraciones en drizzle/ (no toca la base)
npm run db:migrate  # las aplica Mauro, con DATABASE_URL
```

- **Tokens propios** en `app/(agencia)/agencia.css` (`:root` claro, `.dark`
  oscuro, expuestos con `@theme inline`: `bg-surf`, `text-muted`,
  `border-border`, `text-acc-text`, `bg-ic-bg`, `shadow-card`…) y clases de
  forma definidas una vez (`card`, `card-big`, `lift`, `hi`, `btn btn-p`,
  `btn btn-s`, `btn-sm`, `lbl lbl-o`, `h`, `h2`, `tag`, `ic`, `lnk`, `chip`).
  Ningún hex en componentes. `@import "tailwindcss" source(none)` + `@source`
  limita el escaneo a los archivos de la agencia. `--ok-text` es el único
  token que no está en DISENO.md (contraste AA del badge "AHORRÁS").
- **Las invariantes del portfolio no aplican acá y viceversa.** La agencia
  usa sombras suaves, bordes de 1px y naranja `--acc`; el portfolio sigue
  sin `box-shadow` y con su verde. Nada de `components/agencia` entra a
  `app/(es)` ni a `app/(en)`.
- **Copy y datos** en `content/agencia/*.ts`, nunca en componentes. Los
  precios salen de `docs/agencia/datos/precios.json` vía
  `content/agencia/pricing.ts` (tipos) y toda la aritmética pasa por
  `lib/agencia/pricing.ts` (`fmt`, `conRecargo`, `cotizar`): `/precios`,
  `/servicios`, `/cotizador`, el blog y el agente usan la misma función. La
  seña sale de `SENA_MONTO` (`lib/agencia/config.ts`).
- **Ids fijos de planes (R2).** Cada plan, combo y extra tiene su `id`
  **escrito en `precios.json`** (el slug que tenía antes de renombrar). El
  nombre se puede cambiar; el id nunca: va en `/demo?plan=`, en los
  `<Precio id>`/`<Plan id>` del blog, en los `planIds` de los combos, en los
  tests y en las evals. Un id que deja de existir va a `aliases` del JSON
  (hoy `combo-web-turnos` → `combo-negocio-con-turnos`) y lo resuelven
  `getPlan`/`getCombo`/`cotizar`/`comparar` y `/demo`. La copy de la
  etiqueta de precio está en `etiquetasPrecio`; la lógica usa `tipo`.
- **Lenguaje simple (R2).** Nada de jerga en la copy: `lib/agencia/glosario.test.ts`
  recorre `content/agencia/` (salvo los legales) y el blog y falla con
  "Landing", "SEO", "hosting", "abono", "API", "n8n", "sprint",
  "Implementación" o "foto profesional". El glosario completo está en
  `docs/agencia/auditoria-ux-2026-11-08.md` §4.
- **Home corta (R2):** hero → "¿Qué necesitás?" → cómo trabajo → quién te va
  a atender → cierre; ≤ 3,5 pantallas en escritorio y ≤ 5,5 en celular (hoy
  3,43 y 5,49: medí con `docs/agencia/verificacion/r2/capturas.js` si
  cambiás la copy). El catálogo completo está en **`/precios`**; las
  soluciones (`/servicios/[slug]`, copy en `content/agencia/servicios.ts`)
  comparten plantilla. "El código es tuyo" solo en webs, tiendas, turnos y
  mantenimiento: nunca en gestión, IA ni proyectos a medida.
- **Islas `"use client"` de la agencia**, todas en `components/agencia/client/`:
  `ThemeToggle` (+ el hook `theme.ts`), `MobileMenu`, `SectionSpy`,
  `Typewriter`, `PricingCatalog`, `MedioSwitch`, `Cotizador`,
  `ProjectVideo`, `Reveal`, `DemoForm` (+ el hook `turnstile.ts`),
  `AbrirChat`, `MalejoLoader` y `MalejoWidget` (cargado con `next/dynamic`,
  `ssr: false`, cuando el navegador está libre o cuando alguien lo pide).
  FAQ y "Ver los otros planes" son `<details>`, sin JS. `PlanCard` no tiene
  estado y sirve en los dos lados.
- **Abrir el chat desde cualquier botón (R2):** la isla `AbrirChat` es un
  `<a>` a WhatsApp con el texto genérico (`WHATSAPP_TEXTO`) que, con JS,
  dispara el evento **`malejo:abrir`** (`lib/agencia/abrir-chat.ts`,
  `detail: { tema? }`, cancelable). `MalejoLoader` lo cancela para decir "lo
  atiendo yo", fuerza la carga del widget y lo abre; si hay `tema`, sale
  como primer mensaje. Si nadie lo cancela (sin loader o el chunk falló),
  el link sigue a WhatsApp. Malejo es la acción principal del sitio;
  WhatsApp, la secundaria; "Pedí tu demo", el paso siguiente.
- **Tema:** cookie `malejo-theme` (independiente de la del portfolio) y, sin
  cookie, **oscuro** — no sigue a `prefers-color-scheme`. Mismo patrón que
  el portfolio: script inline en el `<head>` del layout, respaldo para el 404
  en `components/agencia/client/theme.ts`, ningún Server Component lee la cookie.
- **Rutas estáticas:** todo `○`/`●` salvo los catch-all y `/api/*`. `?plan=`
  y `?cat=` se leen en el cliente para no volver dinámicas `/demo` ni la home.
- **404:** `app/(agencia)/[...notFound]` atrapa toda URL de la raíz sin ruta;
  el portfolio tiene `app/(es)/portfolio/[...notFound]` y
  `app/(en)/portfolio/en/[...notFound]`.
- **OG:** `/og` es un route handler estático (`app/(agencia)/og/route.tsx`),
  no un `opengraph-image.tsx`: en la raíz del grupo colisionaría con el del
  portfolio. Sitemap y robots (en `app/`) suman las rutas de
  `lib/agencia/routes.ts`.
- **Animación:** Framer Motion con `LazyMotion` + `m` en `Reveal` (bajó el
  TBT de la home en celular de 520 a ~210 ms). `data-reveal` en todo lo
  animado, igual que en el portfolio. No envuelvas una tarjeta `.lift` con
  `Reveal`: el `transform: none` inline le gana al `:hover`.
- **Chat de Malejo:** `app/(agencia)/api/chat/route.ts` (loop manual con
  streaming, `claude-haiku-5-5` por defecto, herramientas en
  `lib/agencia/chat/`). `guardar_contacto` **no guarda**: firma el pedido y
  la UI muestra la casilla; el único insert es `/api/contacto`, con
  `consent: true` y la firma HMAC. No existe ninguna herramienta ni endpoint
  que lea contactos; mantenelo así. Sin `ANTHROPIC_API_KEY`, mensaje fijo +
  WhatsApp. Detalle y decisiones de la tanda CHAT-R1 en `docs/agencia/INFORME.md`.
  - **Conocimiento** en `content/agencia/conocimiento.ts` (quién es Mauro,
    pagos, dominio, proyectos, FAQ): la misma fuente para el FAQ del sitio y
    el prompt. **El modelo nunca calcula precios**: `cotizar` (lo que se
    contrata junto, suma) y `comparar` (alternativas, nunca suma) pasan por
    `lib/agencia/pricing.ts`. Ninguna cotiza proyectos grandes (`grandes`).
  - **Herramientas:** `cotizar`, `comparar`, `anotar_ficha` (silenciosa),
    `mostrar_proyectos`, `pedir_demo`, `derivar_whatsapp`, `guardar_contacto`,
    y desde R3 `pedir_contacto` (formulario en el chat; firma un *ticket* con
    rubro y resumen, la persona escribe nombre y WhatsApp) y
    `sugerir_respuestas` (2–3 botones; silenciosa, no entra al historial).
  - **Contexto y memoria (R3):** el widget manda `pagina`
    (`location.pathname`); `chat/pagina.ts` la valida contra las rutas y va al
    bloque sin caché. La charla y la ficha viven en `sessionStorage`
    (`chat/sesion.ts`), solo en la pestaña; `/demo` las usa para completar
    el formulario. Nada de eso va a la base.
  - **"No inventes" (R3):** el prompt deriva a Mauro todo lo que no está en
    el catálogo ni en el conocimiento (funciones, fechas, valor de cuotas,
    medios de pago, sitios de terceros, marca blanca). Para responderlo, se
    agrega el dato a `conocimiento.ts`; la lista está en
    `docs/agencia/revision-r3.md` §2.3.
  - **Embudo (R3):** eventos de Vercel Analytics `cta_chat`, `chat_abierto`,
    `chat_mensaje`, `chat_tarjeta`, `chat_opcion`, `chat_clic`,
    `chat_contacto_guardado`. Solo conteos y tipos, nunca texto.
  - **Ficha:** lo que se aprende del cliente. La anota el modelo, el servidor
    la valida (`ficha-schema.ts`) y la emite como evento `ficha`; **vive solo
    en la memoria del widget**, que la reenvía con cada pedido. Nunca va a la
    base. El botón de WhatsApp del widget y `derivar_whatsapp` arman el
    mensaje con `mensajeWhatsApp(ficha, última cotización)`.
  - **Tarjetas:** tipos y firmas en `cards.ts` (módulos puros, sin zod, para
    no inflar la isla). El historial lleva una línea `[Tarjeta mostrada · …]`
    por tarjeta y el servidor no repite una `quote`/`compare`/`proyectos`
    cuya firma ya se mostró.
  - **Prompt:** `system` en dos bloques, el base (instrucciones +
    conocimiento + catálogo generados) con `cache_control` y la ficha al
    final sin caché. Nada variable (fechas, ficha) antes del corte.
  - **USD:** `lib/agencia/usd.ts` (dolarapi.com, respaldo `USD_ARS_FALLBACK`
    o `precios.json → usd.fallback`), solo servidor; `/api/dolar` para el
    cotizador en el cliente.
  - **Límites (R2, `limits.ts`):** `CHAT_BURST_LIMIT` (20 cada 10 min por
    IP hasheada, tabla `chat_burst`), `CHAT_DAILY_LIMIT_IP` (default 150) y
    `CHAT_DAILY_LIMIT_TOTAL` (default 1000); `0` = sin tope, vacío =
    default. `CHAT_TEST_TOKEN` + header `x-malejo-test` saltea solo los
    topes por IP (las evals lo mandan si la variable está). Si la base
    falla, **falla cerrado**: global en memoria con tope 100. El historial
    llega recortado a 12.000 caracteres (`recorte.ts`). `/demo` usa los
    mismos topes por IP, contados aparte. `CHAT_ALERT_THRESHOLD` (300): el
    cron avisa por Resend o `console.warn` si ayer se pasó. Timeout por
    ronda: `CHAT_ROUND_TIMEOUT_MS` (20 s).
  - **Origen y anti-bot (R2):** `/api/chat`, `/api/contacto` y la acción de
    `/demo` rechazan con 403 un `Origin` ajeno (`origenPermitido` en
    `security.ts`: dominio, `NEXT_PUBLIC_SITE_URL`, URLs de Vercel,
    `CHAT_ALLOWED_ORIGINS`; `localhost` fuera de producción). Turnstile (sin
    claves no se exige) y campo trampa en `/demo`.
  - **Pruebas sin clave:** `lib/agencia/chat/mock-anthropic.ts` imita la API
    con SSE; se apunta el SDK con `ANTHROPIC_BASE_URL` (lo usan
    `route.test.ts` y `evals/evals.test.ts`). **Evals reales:**
    `npm run eval:chat` corre los 41 casos de `lib/agencia/chat/evals/casos.ts`
    contra `/api/chat` y escribe `docs/agencia/evals/<fecha>.md`; objetivo
    38 de 41 (`objetivo()`: 22 de 24 proporcional). Gasta tokens: necesita
    la clave en el servidor.
- **Headers de seguridad (R2):** `next.config.ts` suma, **solo para la
  agencia** (`FUENTE_AGENCIA` excluye `/portfolio`), los de
  `lib/agencia/headers.ts`: `X-Frame-Options: DENY`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy` y una CSP en modo
  **report-only**. Si sumás un servicio externo (script, iframe, fetch),
  agregalo a la CSP antes de pasarla a modo estricto.

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

En un build de producción local, `localhost` no es un origen permitido para
el chat, `/api/contacto` ni `/demo` (S6): arrancalo con
`CHAT_ALLOWED_ORIGINS=http://localhost:3001 npx next start -p 3001`.
