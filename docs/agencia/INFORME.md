# Informe · sitio de la agencia Malejo

Implementación de `docs/agencia/PROMPT.md`, fases F1 a F7, sobre `main` con los
PR #1 (portfolio a `/portfolio`) y #2 (este handoff) ya mergeados. Todo
compila (`next build`), pasa `npm run lint` y `npm test` (26 tests), y las
rutas de la agencia son estáticas salvo los catch-all y `/api/*`.

Las capturas propias de cada fase están en `docs/agencia/verificacion/<fase>/`.

## Qué se hizo, por fase

### F1 · Base
- Tercer root layout `app/(agencia)`: fuentes Outfit/Inter/JetBrains Mono,
  script de tema (cookie `malejo-theme`, oscuro por defecto), Vercel Analytics,
  metadata y favicon de la agencia.
- `agencia.css` con los tokens de DISENO.md §2 tal cual, `@theme inline` y las
  clases de forma (`card`, `card-big`, `lift`, `hi`, `btn-p`, `btn-s`…).
- `MalejoMark`, menú en píldora sticky, explorador lateral de celular (foco
  atrapado, `Escape`, scroll bloqueado, cierra al tocar un link), pie.
- `/legal/terminos`, `/legal/cambios`, `/legal/privacidad` (Ley 25.326).
- 404 propio de la agencia; el portfolio conserva los suyos en español e inglés.
- Imagen OG estática en `/og`, `.env.example`, sección en `CLAUDE.md`.

### F2 · Home
- Hero bento con marca de agua y H1 tecleado (por palabras, semilla fija,
  cursor que sigue a la letra y titila pegado a "IA."; frase completa sin JS o
  con reducir movimiento).
- Servicios con "Desde" calculado del catálogo; "Ver precios →" abre la pestaña.
- Cómo trabajo con `SENA_MONTO`; catálogo de precios completo (medio de pago,
  6 pestañas con teclado, planes, combos, extras, nota legal); proyectos con MP4
  sobre póster; Sobre mí y FAQ con `<details>`; cierre con WhatsApp y agenda.
- Entrada al scroll M1, link activo del menú según la sección visible,
  JSON-LD `ProfessionalService`. Se quitó el 307 de `/` → `/portfolio`.

### F3 · Precios, `/servicios` y `/cotizador`
- `content/agencia/pricing.ts` tipado desde `precios.json` con `id` estable.
- `lib/agencia/pricing.ts`: `fmt`, `conRecargo`, `cotizar`, `precioDePlan`.
  Única lógica de precios. Tests con Vitest (`npm test`).
- `/servicios` y `/servicios/[slug]` (6, estáticas) con JSON-LD `Service` +
  `Offer`; `/cotizador` con salida a `/demo` o WhatsApp.

### F4 · Malejo
- Sprite-botón, toast del portfolio y chat con streaming, tarjetas y chips;
  hoja completa en celular. Se carga con `next/dynamic` cuando el navegador
  está libre.
- `/api/chat`: loop manual con streaming, `claude-haiku-5-5`, `max_tokens` 600,
  historial recortado, herramientas validadas con zod, system prompt con el
  catálogo generado. Fallback fijo sin `ANTHROPIC_API_KEY`.
- Consentimiento firmado (HMAC) e insert solo en `/api/contacto`; topes por IP y
  globales; Neon + Drizzle (`leads`, `briefs`, `chat_usage`); migración
  generada en `drizzle/`; cron de limpieza en `vercel.json`.

### F5 · Demo
- `/demo`: brief con Server Action y zod (base y/o email con Resend, o
  WhatsApp si no hay ninguno), seña (link, alias o WhatsApp) y agenda (Cal.com
  embebido o WhatsApp). Errores accesibles.

### F6 · Blog
- `/blog` y `/blog/[slug]` en MDX estático, RSS en `/blog/rss.xml`. Primer post
  "Cómo cotizo…" con precios citados desde el catálogo (`<Precio>`, `<Combo>`).

### F7 · QA
- Sitemap y robots con las rutas de la agencia y del portfolio; canonical en
  cada página.
- Responsive: sin overflow horizontal en 9 rutas × 390/768/1024/1440 px × dos
  modos. Un `h1` por página, foco visible, skip link.
- Contraste AA de todos los pares de texto en los dos modos (ver decisión 7).
- Lighthouse local (Chromium headless, fuentes simuladas del sandbox):

| Ruta | Modo | Perf. | Acces. | Buenas prácticas | SEO |
|---|---|---|---|---|---|
| `/` | celular | 93 | 100 | 96 | 100 |
| `/` | escritorio | 100 | 100 | 96 | 100 |
| `/servicios` | celular | 95 | 100 | 96 | 100 |
| `/servicios` | escritorio | 100 | 100 | 96 | 100 |
| `/demo` | celular | 96 | 100 | 96 | 100 |
| `/demo` | escritorio | 100 | 100 | 96 | 100 |

  "Buenas prácticas" 96 es solo el 404 de `/_vercel/insights/script.js`, que
  existe únicamente en Vercel. La home en celular estaba en 84; subió al pasar
  `Reveal` a `LazyMotion` (TBT 520 → ~210 ms) y sacar la entrada al scroll de
  las tarjetas del hero. Conviene repetir la medición en la vista previa de
  Vercel, con las fuentes reales.

## Cómo se verificó el chat sin clave
No hay `ANTHROPIC_API_KEY` en el sandbox. El loop se probó punta a punta contra
un servidor SSE local que imita la API (`ANTHROPIC_BASE_URL=http://localhost:4010`):
el modelo simulado pide `cotizar({ planIds: ["combo-web-turnos"] })`, la ruta
ejecuta la herramienta con `cotizar()` y devuelve la tarjeta "Combo Web + Turnos
· $450.000 + $45.000/mes"; después streamea el texto final. También se probó el
fallback sin clave, el rechazo de `/api/contacto` sin consentimiento o con firma
falsa, y los tests de herramientas (firma, vencimiento, teléfonos AR). **Falta
probarlo con el modelo real**: es lo primero a revisar en la vista previa.

## Pendiente
- ⚠️ **Mauro aplica `npm run db:migrate`** con `DATABASE_URL` de Neon. La
  migración está en `drizzle/0000_inicial.sql`, commiteada y sin aplicar.
- Cargar en Vercel: `ANTHROPIC_API_KEY`, `MALEJO_SALT`, `DATABASE_URL`,
  `CRON_SECRET`, `NEXT_PUBLIC_SENA_URL` y `NEXT_PUBLIC_SITE_URL`; opcionales
  `RESEND_API_KEY`/`EMAIL_FROM`/`EMAIL_TO`, `TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY`,
  `NEXT_PUBLIC_CALCOM_URL`, `SENA_ALIAS`. Las páginas son estáticas: después de
  cargar o cambiar una variable hay que redeployar.
- Foto profesional del bloque "Sobre mí" (hoy el placeholder punteado).
- Completar los `[PLACEHOLDERS]` de los legales e inscribir la base en la AAIP.
- Probar el chat con el modelo real (tono, uso de herramientas, largo).

## Decisiones para Mauro

1. **Ramas y PRs.** La sesión solo permite pushear a
   `claude/compassionate-ride-ypvfbj`, así que las siete fases van en esa rama
   con un commit por fase (`feat(agencia): F1 …` a `F7`) y un solo PR, en vez
   de las ramas apiladas `agencia/f1-base` … `agencia/f7-qa`. Si las querés
   separadas, cada commit es una fase entera y se pueden cortar en ramas.
2. **Monto de la seña.** `referencia.html` y la captura del chat dicen
   $35.000; DISENO.md y PROMPT.md dicen que sale de `SENA_MONTO` con default
   $20.000. Ganó DISENO.md: el sitio muestra $20.000 hasta que cargues otra.
3. **"Portfolio EN" del menú.** PROMPT.md lo manda a `/portfolio`; el pie
   ("Portfolio (EN)") y el toast van a `/portfolio/en`. Con `/portfolio`, un
   visitante con el navegador en español ve el portfolio en español aunque el
   chip diga EN. Recomiendo `/portfolio/en` también en el menú (una línea en
   `content/agencia/site.ts`).
4. **Link activo del menú.** Sigue a la sección visible. Arriba de todo (en el
   hero) no hay ninguno activo; la captura `01-menu-*.png` muestra "Servicios"
   porque la referencia es estática.
5. **Respuestas 2 a 6 del FAQ.** La referencia solo trae la primera. Las otras
   están escritas con datos del catálogo y de la política de cambios
   (`content/agencia/home.ts`). Revisalas.
6. **Textos legales.** Son un borrador razonable, no asesoramiento legal.
   Quedan marcados: `[CUIT]`, `[DOMICILIO]`, `[EMAIL DE CONTACTO]`, qué pasa con
   la seña si después de ver la demo no contratan, límite de responsabilidad y
   jurisdicción, transferencia internacional de datos (Vercel, Neon, Anthropic,
   Resend) e inscripción en la AAIP. Conviene que un abogado los revise.
7. **Un token nuevo: `--ok-text`.** El verde `--ok` de modo claro (#16A34A)
   da 3,0:1 sobre el fondo del badge "AHORRÁS X%" (texto de 10 px), y DISENO.md
   §9 pide AA. En claro el badge usa #166534 (6,5:1); en oscuro sigue `--ok`.
   Los ✓ de las tarjetas siguen con `--ok` (son íconos: alcanza 3:1).
8. **Tarjetas del hero sin entrada al scroll.** En la referencia tienen la
   animación; en el sitio aparecen quietas porque están arriba del pliegue y
   arrancar ocultas hasta hidratar bajaba la performance en celular.
9. **Videos de proyectos.** Salen del servidor sin `autoplay` y con
   `preload="none"`; una isla los reproduce cuando entran en pantalla y los pausa
   al salir. Visualmente es lo mismo que `autoplay`, sin descargar los cuatro
   MP4 al cargar, y con reducir movimiento (o sin JS) queda el póster.
10. **Póster y video de Tuki.** Se ve "Tu Asesor de la Muni" dentro de la
    captura. La copy no nombra al cliente (cumple §5), pero la regla del
    portfolio pide recortar capturas que identifiquen al municipio. Conviene
    regenerar `public/agencia/proyectos/tuki.{jpg,mp4}` sin esa línea.
11. **Link de MaestrIA.** La agencia usa `maestria-edu.vercel.app` (PROMPT.md);
    `lib/links.ts` del portfolio sigue con `v0-malejo-math-app.vercel.app`. No
    toqué el portfolio; si la URL nueva es la buena, cambiala ahí también.
12. **Explorador de celular.** Sin la línea "Estilo: Moderno" (no hay estilos en
    v1). Ítems: Inicio, Servicios, Precios, Proyectos, Cómo trabajo, Blog,
    Sobre mí y Portfolio EN; la captura era de una ronda anterior ("Servicios y
    precios", "Productos"). En celular el botón de tema vive solo en el
    explorador ("Modo oscuro/claro").
13. **Combos.** Lo único que no está en `precios.json` es qué planes reemplaza
    cada combo (`COMBO_PARTS` en `content/agencia/pricing.ts`); un test verifica
    que la suma de lista coincida. "Quiero este combo" lleva a
    `/demo?plan=combo-<nombre>` y `cotizar()` aplica un combo sola si están todas
    sus partes.
14. **Qué es "total" en `cotizar()`.** Total del primer año: implementación +
    12 abonos + pagos anuales (la renovación). Con Mercado Pago el recargo y el
    redondeo se aplican ítem por ítem, así el total es la suma de lo que se ve.
15. **Modelo y esfuerzo del chat.** `claude-haiku-5-5` (configurable con
    `MALEJO_MODEL`), `max_tokens` 600 y `effort: "low"`: Haiku 5.5 piensa de
    forma adaptativa y el pensamiento cuenta contra los 600 tokens. Si las
    respuestas salen cortadas, subí `max_tokens` o probá `medium`.
16. **Consentimiento.** `guardar_contacto` no guarda nada: firma el pedido y la
    UI muestra la casilla. El único insert es `POST /api/contacto`, que exige la
    casilla, la firma (vence a la hora y no admite datos editados) y Turnstile si
    está configurado. `leads` y `briefs` tienen una columna extra, `convertido`:
    marcala a mano cuando alguien contrata para que el cron no lo borre a los
    12 meses.
17. **Turnstile.** La clave pública se lee de `TURNSTILE_SITE_KEY` en el
    servidor y se pasa a la isla, así no hace falta una variable `NEXT_PUBLIC_`.
18. **`CRON_SECRET`.** No estaba en la lista de variables: Vercel la usa para
    autenticar el cron (`/api/cron/limpieza`, todos los días 06:17 UTC).
19. **Brief sin base ni email.** No se pierde: el éxito ofrece mandarlo por
    WhatsApp con el texto armado.
20. **Dónde se editan los precios.** En `docs/agencia/datos/precios.json` (el
    archivo del handoff); `content/agencia/pricing.ts` lo importa y lo tipa.
21. **Vitest 3.2.4.** Las versiones 4 y 5 piden `@types/node` 22+ y el repo usa
    la 20; no quise tocar los tipos del portfolio por esto.
22. **Footer.** "Servicios" va a `/servicios` (la página) y "Cotizador" a
    `/cotizador`; en la referencia eran anclas de la home.

---

# Tanda CHAT-R1 · refinamiento del asistente Malejo

Implementación de la tanda CHAT-R1 (pruebas en producción del 8-11-2026,
fallas F1 a F12). Un commit por fase (`feat(chat): R1-Fn …`) en la rama
`claude/compassionate-ride-ypvfbj`, reiniciada desde `main` porque el PR
anterior de esta rama (#3) ya estaba mergeado. `npm test` (94 tests),
`npm run lint` y `npm run build` en verde; todas las rutas de la agencia y
del portfolio siguen en `○`/`●` salvo los catch-all y `/api/*` (se sumó
`ƒ /api/dolar`).

## Qué se hizo, por fase

### F1 · Base de conocimiento única
- `content/agencia/conocimiento.ts`: quién es Mauro (de la copy existente),
  proceso, pagos, dominio, propiedad, tecnología, mantenimiento, garantía,
  tiempo de respuesta, los cuatro proyectos (Tuki sin nombrar al cliente) y
  un FAQ de 16 preguntas de 40 palabras como máximo que cubre todo F12.
- El FAQ de la home y el de `/servicios/[slug]` eligen preguntas **por id**
  desde ahí; el prompt genera su bloque de conocimiento con
  `lib/agencia/chat/knowledge.ts`. `{SENA}` se completa en el servidor.

### F2 · Precios: dominio, USD y proyectos grandes
- `precios.json`: categoría `grandes` (consultoría sin cargo, diagnóstico
  escrito, sprint `impl: null` "se cotiza con el diagnóstico" y
  mantenimiento con `mantenimientoPct: 0.10`), dominios `.com.ar` y `.com`
  como extras anuales con `precio: null` y `usd.fallback`.
- `cotizar()` soporta ítems a cotizar y un tipo de cambio opcional;
  `comparar()` nuevo (filas, sin total); `aUsd()` y `fmtUsd()`.
- `lib/agencia/usd.ts` (dolarapi.com, 3 s, cache de un día, respaldo) y
  `GET /api/dolar`: el cotizador muestra "≈ USD … al dólar oficial del día"
  leyendo esa ruta en el cliente, así `/cotizador` sigue estático.
- El catálogo del prompt suma las alternativas por abono (`alt`), el
  recomendado de cada categoría y los proyectos grandes.

### F3 · Herramientas
- `cotizar` (lo que se contrata junto), `comparar` (alternativas, tarjeta
  nueva), `anotar_ficha` (silenciosa, zod, truncado, evento `ficha`),
  `mostrar_proyectos` (tarjeta con los proyectos y el portfolio),
  `pedir_demo`, `derivar_whatsapp` (mensaje desde la ficha + última
  cotización) y `guardar_contacto` (rubro y resumen desde la ficha).
- Guardas del servidor: ninguna herramienta cotiza, compara ni ofrece demo
  de un proyecto grande; una tarjeta `quote`/`compare`/`proyectos` con la
  misma firma (ids, extras, medio y moneda) que una ya mostrada no se emite.
- Módulos puros para el widget, sin zod: `cards.ts`, `ficha.ts`,
  `history.ts`, `whatsapp.ts`. La validación vive en `ficha-schema.ts`.

### F4 · Historial con memoria de tarjetas
- El widget agrega una línea `[Tarjeta mostrada · …]` por tarjeta a cada
  mensaje del asistente y manda `ficha` y `shownCards`; el servidor los
  valida con tope de tamaño. Sigue el recorte a 20 turnos y nada se guarda.
- Además (fix de la misma fase): el widget muestra texto y tarjetas en el
  orden en que llegan; antes la frase posterior a una herramienta quedaba
  arriba de su tarjeta.

### F5 · Prompt reescrito
- Identidad → objetivo → estilo → flujo de venta → objeciones → proyectos
  grandes → cuándo derivar → herramientas y tarjetas → límites →
  conocimiento → catálogo, y al final "Lo que ya sabés del cliente".
- `system` como array: el bloque base con `cache_control: ephemeral`
  (≈ 6,5 k tokens con las herramientas; el mínimo cacheable de Haiku 5.5 es
  512) y la ficha en un bloque posterior sin caché.

### F6 · Botón de WhatsApp con la ficha
- Ícono propio (trazo, `currentColor`) en el encabezado, con `aria-label` y
  tooltip. `mensajeWhatsApp(ficha, últimaCotización)` arma el formato
  pedido, omite líneas vacías y corta en 1.000 caracteres; lo usan el
  ícono, la chip, la tarjeta de `derivar_whatsapp` y todos los fallbacks.

### F7 · Límites
- `CHAT_DAILY_LIMIT_IP` vacío o `0` = sin límite (default);
  `CHAT_DAILY_LIMIT_TOTAL` default 1000, `0` = sin límite.

### F8 · Proyectos grandes en el sitio
- Pestaña nueva en precios (home y `/servicios/grandes`, estática y en el
  sitemap) con los tres pasos, la línea de mantenimiento y "Agendá la
  consultoría" (Cal.com o WhatsApp). Capturas en
  `docs/agencia/verificacion/chat-r1/grandes-*.png`.
- Legales: seña, 50/50, cuotas, dominio, baja del mantenimiento y
  proyectos grandes.

### F9 · Robustez
- Timeout por ronda (`CHAT_ROUND_TIMEOUT_MS`, 20 s) junto con la señal del
  pedido, un reintento del SDK y `maxDuration = 60`. Error, timeout, sin
  clave o límite diario: mensaje fijo + WhatsApp con la ficha.
- Una herramienta que tira vuelve como `is_error`. Logs sin datos personales.

### F10 · Evals
- Unitarios y de ruta con modelo simulado (`lib/agencia/chat/mock-anthropic.ts`
  + `ANTHROPIC_BASE_URL`): cotizar vs comparar, USD, `impl: null`,
  `mensajeWhatsApp`, merge de ficha, dedup, límites, zod, prompt; texto →
  herramienta → texto, evento `ficha`, dedup, input inválido, error y timeout.
- `npm run eval:chat -- --url <base>`: los 24 casos de
  `lib/agencia/chat/evals/casos.ts` como conversaciones reales, con
  aserciones deterministas, y el informe en `docs/agencia/evals/<fecha>.md`.

## Resultado de los evals

**No se corrieron contra el modelo real**: el sandbox no tiene
`ANTHROPIC_API_KEY` (y no llega a dolarapi.com ni a nic.ar). Lo que sí se
verificó:
- El loop completo contra el modelo simulado, en tests y con `next start`
  (capturas del widget en `docs/agencia/verificacion/chat-r1/widget-*.png`).
- Que las aserciones detectan las fallas reales: un caso A con la tarjeta
  que suma alternativas y "/demo?plan=…" falla por las dos razones.
- Que `npm run eval:chat` corre y escribe el informe (contra un servidor sin
  clave avisa que todas las respuestas son el fallback).

Corre después del deploy: ver los pasos para Mauro.

## Tanda CHAT-R1 · Decisiones

1. **El 10% de mantenimiento.** "Con un 10% de mantenimiento mensual estaría"
   se interpretó como **10% mensual del valor de implementación, solo para
   proyectos grandes y sistemas a medida**. Básico ($25.000) y Pro
   ($55.000) no cambian. Está en un solo lugar: `mantenimientoPct` del plan
   "Mantenimiento de proyectos grandes" en `precios.json`; el prompt, la
   pestaña de precios y los legales leen de ahí.
2. **Pagos unificados a 50/50.** La decisión de Mauro choca con dos textos
   anteriores: "Proyectos desde $450.000: 3 pagos sin recargo" (pie de
   precios, términos y DISENO.md §4) y "40/30/30" (nota de Sistemas de
   gestión y términos). Ganó la decisión: 50% al aprobar la demo y 50% en la
   entrega; los sistemas desde $900.000 "arrancan con un diagnóstico y se
   desarrollan por etapas". DISENO.md no se tocó (es el handoff).
3. **Dominio sin precio.** nic.ar no responde desde el sandbox: los dos
   extras quedan con `precio: null` y "según tarifa vigente de NIC.ar" (o
   "del registrador" para `.com`). El agente lo dice así, sin número. Para
   publicar un monto, cargalo en `precio` y listo: todo lo demás lo toma.
4. **Dólar.** dolarapi.com tampoco responde desde el sandbox. Respaldo:
   `USD_ARS_FALLBACK` y, si no está, `usd.fallback` de `precios.json`, que
   quedó en **1500 como valor provisorio**: actualizalo. Redondeo: a la
   decena, como pide la tanda, **salvo abajo de USD 100, a la unidad** (un
   abono de $23.300 son USD 16, no 20). Es una línea en `aUsd()`.
5. **Cuándo la tarjeta muestra dólares.** `cotizar` y `comparar` tienen un
   parámetro `moneda` (`ars` | `usd`); la tarjeta suma "≈ USD" solo con
   `usd`, que el prompt reserva para cuando lo piden, escriben desde afuera o
   en otro idioma. La moneda es parte de la firma de deduplicación.
6. **Diagnóstico escrito.** Pasó de extra a plan de `grandes` (mismo id
   `diagnostico-escrito`, mismos $60.000, sin duplicar). Sale de los chips
   de extras de la home; el cotizador lo muestra en "Proyectos grandes" y
   `cotizar()` lo sigue aceptando si llega como extra.
7. **Una herramienta más: `mostrar_proyectos`.** La tanda pide que el agente
   nombre los proyectos (F5) y que nunca escriba URLs; sin una tarjeta, la
   persona no tendría cómo abrirlos. Es de solo lectura (conocimiento) y no
   se repite.
8. **`guardar_contacto`.** El contrato con la UI y con `/api/contacto` no
   cambió (`ContactPayload` y firma iguales). En la herramienta, rubro y
   resumen pasaron a opcionales y se completan desde la ficha; si faltan los
   dos, devuelve error y el modelo pregunta.
9. **Guardas de proyectos grandes en el servidor.** Además del prompt,
   `cotizar`, `comparar` y `pedir_demo` rechazan ids de `grandes` con la
   indicación del camino consultoría → diagnóstico → sprint.
10. **`max_tokens` 600 → 800, `effort: "low"` igual.** Con `anotar_ficha` el
    modelo suele pedir dos herramientas en la misma ronda. Sin evals reales
    no hay evidencia para subir el esfuerzo; revisalo con el informe.
11. **La ficha vive solo en la memoria del widget.** Se pierde al recargar;
    no se usa `localStorage` para mantener "no guarda tu conversación".
12. **Tiempo de respuesta.** "En 24 h te paso una propuesta" (cierre de la
    home) y "te escribo en menos de 24 h hábiles" (éxito de `/demo`) pasaron
    a "hasta 2 días hábiles", como la decisión de Mauro.
13. **Proyectos grandes fuera de la grilla de servicios.** La grilla 3×2 de
    la home es del diseño aprobado: la categoría nueva tiene pestaña en
    precios, página propia y un bloque en `/servicios`, no una séptima
    tarjeta.
14. **`tsx` como devDependency** para `npm run eval:chat` (TypeScript con
    los alias `@/`). Al instalarlo, `package-lock.json` se regeneró: el de
    `main` no tenía `@anthropic-ai/sdk`, `drizzle-orm`, `vitest` ni otras
    dependencias de la agencia (estaba desincronizado con `package.json`).
15. **Factura.** Los términos dicen "por ahora no emito factura; si la
    necesitás, consultalo antes de contratar".

## Pendiente

- Correr los evals con el modelo real e iterar el prompt hasta 22 de 24.
- Precio del dominio y valor real del dólar de respaldo (decisiones 3 y 4).
- Lo pendiente de las tandas anteriores sigue igual (migración de la base,
  foto, `[PLACEHOLDERS]` legales, AAIP).

## Pasos manuales para Mauro

1. **Variables en Vercel.** Si `CHAT_DAILY_LIMIT_IP` está cargada (antes el
   default era 30), borrala o ponela en `0` para la etapa de pruebas.
   Opcionales: `CHAT_DAILY_LIMIT_TOTAL` (default 1000), `USD_ARS_FALLBACK`,
   `CHAT_ROUND_TIMEOUT_MS`. Redeploy después.
2. **Límite mensual del workspace de Anthropic** (Console → Limits): es el
   tope real de gasto ahora que no hay límite por IP.
3. **Evals con el modelo real**, en local con la clave:
   `CHAT_DAILY_LIMIT_TOTAL=0 npm run dev` y, en otra terminal,
   `npm run eval:chat` (o `npm run eval:chat -- --url <vista previa>`).
   Revisá `docs/agencia/evals/<fecha>.md`; si pasan menos de 22, el detalle
   de cada caso dice qué aserción falló. `--solo A,I` corre algunos.
4. **Actualizá `usd.fallback`** en `precios.json` con el oficial del día y,
   si querés publicar un monto, el `precio` de los dominios.
5. **Confirmá las decisiones 1 (10%) y 2 (50/50)**: si alguna era distinta,
   es una línea en `precios.json` o en `conocimiento.ts`.

---

# Tanda R2 · home corta, lenguaje simple, Malejo como asesor y seguridad

Implementación del prompt de la tanda R2 sobre la auditoría UX del 8-11
(`docs/agencia/auditoria-ux-2026-11-08.md`, sumada desde la rama
`fix/chat-texto-duplicado`). Rama `claude/compassionate-ride-ypvfbj`,
reiniciada desde `main` (el PR #5 de esta rama ya estaba mergeado y `main`
ya tenía el PR #6). Un commit por fase (`feat(agencia): R2-Fn …`).
`npm test` (137 tests), `npm run lint` y `npm run build` en verde: todas las
rutas de la agencia y del portfolio en `○`/`●` salvo los catch-all y
`/api/*`; la página nueva `/precios` sale `○`. El portfolio no cambió.

## Qué se hizo, por fase

### F1 · Ids fijos, nombres nuevos y glosario
- `precios.json`: `id` explícito en **cada** plan, combo y extra, con el
  valor que tenía `slugify(nombre)`. `content/agencia/pricing.ts` usa el id
  del JSON; los combos traen sus `planIds` en el JSON (antes, `COMBO_PARTS`
  por nombre). Tests: falta de id, ids repetidos, ids viejos que siguen
  existiendo, combos que apuntan a planes reales.
- Nombres de planes, combos y categorías de la auditoría §5, con
  `paraQuien` (debajo del nombre en `PlanCard` y en `comparar`).
- **"Combo Web + Turnos" se eliminó** y quedó el combo "Página + turnos"
  (`combo-negocio-con-turnos`). El id viejo es un **alias** (`aliases` en el
  JSON, `resolverId()`): `getCombo`, `cotizar`, `comparar` y `/demo?plan=`
  lo resuelven. En Turnos, el recomendado pasa a ser "Agenda de turnos
  online" y la nota de la categoría invita al combo.
- Glosario §4.1–4.3 en `content/agencia/*`, el blog (con `<Plan id>` para
  citar nombres vigentes), `conocimiento.ts`, `cotizador.ts`, `demo.ts` y los
  legales (con paréntesis explicativos). La etiqueta de precio salió de
  `lib/agencia/pricing.ts` a `content/agencia/pricing.ts`
  (`etiquetasPrecio`, `resumenCopy`); `precioDePlan` devuelve un `tipo` para
  la lógica y la copy no se compara nunca.
- "El código es tuyo": solo en webs, catálogos, tiendas, turnos y
  mantenimiento (FAQ `codigo`: "¿De quién es la página?"). En gestión, IA y
  proyectos a medida: FAQ `codigo-medida` ("se define en la propuesta
  escrita"), y lo mismo en `conocimiento.propiedad`, el prompt y los
  Términos §6. Un test verifica que ninguna FAQ de esas tres soluciones lo afirme.
- Pagos: 50/50 en todo; en proyectos a medida, plan escrito por adelantado
  y cada etapa 50% al arrancarla y 50% al entregarla (catálogo, FAQ,
  conocimiento, prompt, herramienta y Términos §3). "Pagos por hito" y
  "Pagás sprint por sprint" ya no existen. La opción por cuotas de la
  página para aparecer en Google ("$90.000 de entrada y $49.000 por mes")
  pasó a "Otras formas de pago", fuera de la tarjeta.
- Diagnóstico: "Charla gratis (20 min)" y "Plan del proyecto por escrito ($60.000)".
- Test de glosario (`lib/agencia/glosario.test.ts`): recorre toda la copy de
  `content/agencia/` salvo los legales, el catálogo y el blog, y falla con
  "Landing", "SEO", "hosting", "abono", "API", "n8n", "sprint",
  "Implementación", "micro-apps", "AI Developer", "brief" o "foto profesional".

### F2 · Home corta y `/precios`
- Home: hero (título y tecleo iguales; etiqueta "Mauro Lizárraga · Salta,
  Argentina"; "micro-apps" → "sistemas"; "Contame qué necesitás" abre el
  chat, WhatsApp secundario; las 3 tarjetas son garantías) → "¿Qué
  necesitás?" (6 baldosas `card lift`, 2 columnas en celular, cada una a
  `/servicios/[slug]` y con "Preguntale a Malejo") → Cómo trabajo en 5 pasos
  con el 50/50 (una sola tarjeta en celular) → "Quién te va a atender"
  (sprite o foto + 3 proyectos por problema, sin etiquetas de stack, con
  "Se parece a: <plan>") → cierre con el chat primario, WhatsApp y
  videollamada y 3 preguntas en `<details>`. Se borraron `About`,
  `Projects`, `Services`, el FAQ largo y `ServiceLink`.
- `/precios` (estática): el `PricingCatalog`. En celular, `<select>` en vez
  de pestañas. En la home quedó `id="precios"` junto a "Ver todos los
  precios →"; `#servicios`, `#proyectos`, `#sobre-mi` y `#faq` siguen vivos.
- Menú: Soluciones · Precios · Cómo trabajo · Proyectos · Blog + "Hablá con
  Malejo". `SectionSpy` marca el ítem de cada página (Precios ya no se
  marca en `/servicios` ni en `/cotizador`). En celular, WhatsApp 44×44 al
  lado del ☰. El portfolio sale del menú y va al pie como "Mi CV (en inglés)".
- `/servicios/[slug]` con plantilla única (§6.2): H1 con el problema, para
  quién es, 3 beneficios, el recomendado junto a sus combos, "Ver los otros
  N planes" en `<details>`, proyecto parecido, cómo se paga, FAQ propio y
  cierre (chat, demo, WhatsApp). Proyectos a medida: pasos en vez de planes,
  FAQ propio (pagos por etapa, plan escrito, plazos, 10%), sin "la página es
  tuya", sin el FAQ del primer año y sin cotizador. `/servicios/mant` aclara
  el 10% de los proyectos a medida. Títulos SEO por problema; slugs iguales.
- La foto: `components/agencia/home/Team.tsx` usa
  `public/agencia/marca/mauro.jpg` si existe (se resuelve en el build con
  `existsSync`, la home sigue `○`); si no, solo el sprite.
- `DISENO.md` describe lo vigente (orden, menú, hero, baldosas, pasos,
  "Quién te va a atender", cierre, pie, `/precios`, flotante, celular) y
  `referencia.html` ya no dice "3 pagos sin recargo".

### F3 · Malejo como asesor principal
- Evento `malejo:abrir` (`lib/agencia/abrir-chat.ts`). La isla `AbrirChat`
  es un `<a>` a WhatsApp con el texto genérico que, con JS, dispara el
  evento **cancelable**; `MalejoLoader` lo cancela ("lo atiendo yo"), fuerza
  la carga del widget si todavía no cargó y se lo pasa como `pedido`: el
  widget se abre y, si hay tema, lo manda como primer mensaje. Si el chunk
  del widget falla, el loader deja de cancelar y el botón sigue a WhatsApp.
- Saludo nuevo y chips por problema hasta el primer mensaje; "Hablar con
  Mauro" (WhatsApp con la ficha) siempre. Toast del portfolio apagado.
- En celular, el botón flotante es solo la cabeza del sprite (56×64, medido).
- Prompt: rol de asesor (hasta 2 preguntas de a una, una sola
  recomendación con su porqué, después cotizar y el paso siguiente),
  vocabulario simple, propiedad del código acotada y reglas para Q, K, F,
  C, B y T. `cotizar` devuelve `pagoUnico`/`cuotaMensual` y un recordatorio
  de costos por uso cuando hay WhatsApp o IA.
- Evals: casos nuevos **Y** (veterinaria sin saber qué le conviene), **Z**
  (propiedad del código en gestión), **AA** (abierto desde "Que saquen turno
  solos") y los de abuso **AB–AD** (F4). Objetivo proporcional: 28 de 30.

### F4 · Seguridad
- **S1** `CHAT_BURST_LIMIT` (20 cada 10 min por IP hasheada, tabla
  `chat_burst`), `CHAT_DAILY_LIMIT_IP` con default 150 y `CHAT_TEST_TOKEN`
  (header `x-malejo-test`, comparación en tiempo constante) que saltea solo
  los topes por IP. Migración `drizzle/0001_rafaga_chat.sql`, **sin aplicar**.
  Al llegar al tope: mensaje amable + WhatsApp con la ficha.
- **S7** Si la base falla, el global cae a un contador en memoria con tope 100.
- **S8** Historial recortado a 12.000 caracteres conservando el último mensaje.
- **S6** 403 con `Origin` ajeno en `/api/chat`, `/api/contacto` y la acción
  de `/demo` (dominio, `NEXT_PUBLIC_SITE_URL`, URLs de Vercel del despliegue
  y `CHAT_ALLOWED_ORIGINS`; `localhost` fuera de producción).
- **S4/S5** Turnstile también en `/demo` (sin claves no se exige), campo
  trampa `sitio_web` y los topes por IP en la acción (contados aparte del chat).
- **S9** El cron avisa si ayer el chat pasó `CHAT_ALERT_THRESHOLD` (300):
  email con Resend o `console.warn` sin datos personales.
- **S10** Headers en `next.config.ts` solo para la agencia
  (`lib/agencia/headers.ts`): `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `nosniff` y CSP **report-only**. Verificado con
  `curl`: `/portfolio` y `/portfolio/en` no los llevan. Navegando `/`,
  `/precios`, `/demo`, `/servicios/ia`, `/cotizador` y el blog no aparece
  ninguna violación de la CSP en consola.
- **S11** Tres evals de abuso (juego de rol, insulto, ensayo de 2000 palabras).

### F5 · Celular y accesibilidad
- 44 px de área táctil en links de tarjetas, pie, logo, medio de pago,
  chips del cotizador, "Lo quiero", CTA de proyectos a medida y la fila de
  la casilla de `/demo` (auditado con Playwright a 390 px).
- "IA." y el cursor en `--acc-text` en modo claro (5,6:1). No contradice
  DISENO.md: §2 ya decía "texto naranja sobre fondo: `--acc-text`, nunca `--acc`".
- `/cotizador` arranca con "¿Qué necesitás?" y abre solo esa categoría; las
  demás en `<details>`; en celular el total queda fijo abajo.
- Sin overflow horizontal en 360, 390 y 1440 px en las 15 páginas revisadas.

### F6 · Verificación visual
Capturas de página completa en `docs/agencia/verificacion/r2/` (escritorio
1440 y celular 390, con `data-reveal` en su estado final y los videos en el
póster), más el "antes" del commit auditado (`ea4ee29`, armado con
`next build --webpack` porque Turbopack no acepta un `node_modules`
enlazado). Script: `docs/agencia/verificacion/r2/capturas.js`. Fuentes
reales (Google Fonts respondió). El texto de `main` de cada página revisada
no tiene jerga; en el "antes" aparecían Landing, SEO, hosting, abono,
sprint y "FOTO PROFESIONAL".

## Mediciones (Playwright, fuentes reales)

"Pantallas" = alto total / alto del viewport (1440 × 900 y 390 × 844).

| Ruta | Antes, escritorio | Después, escritorio | Antes, celular | Después, celular |
|---|---:|---:|---:|---:|
| `/` | 7.126 px · **7,9** | 3.086 px · **3,4** | 13.359 px · **15,8** | 4.634 px · **5,5** |
| `/precios` | (en la home) | 2.646 · 2,9 | (en la home) | 6.056 · 7,2 |
| `/servicios` | 1.650 · 1,8 | 1.457 · 1,6 | 3.577 · 4,2 | 2.140 · 2,5 |
| `/servicios/webs` | 3.050 · 3,4 | 3.373 · 3,7 | 6.106 · 7,2 | 4.992 · 5,9 |
| `/servicios/grandes` | 2.108 · 2,3 | 3.055 · 3,4 | 3.401 · 4,0 | 4.620 · 5,5 |
| `/cotizador` | 3.318 · 3,7 | 1.897 · 2,1 | 6.127 · 7,3 | 3.055 · 3,6 |
| `/demo` | 1.383 · 1,5 | 1.431 · 1,6 | 2.402 · 2,8 | 2.298 · 2,7 |

Objetivo de la home: ≤ 3,5 en escritorio y ≤ 5,5 en celular → **cumplido**
(3,43 y 5,49). El margen en celular es chico: cualquier línea más en la
home lo pasa; medilo de nuevo con el script si cambia la copy. Las páginas
de solución crecen en escritorio porque ahora tienen beneficios, proyecto
parecido, cómo se paga y cierre (antes era el catálogo y el FAQ de pagos);
el resto de las soluciones mide entre 3,1 y 3,7 en escritorio y entre 4,2 y
6,0 en celular.

## Evals

No corrieron contra el modelo real: el entorno de la tanda no tiene
`ANTHROPIC_API_KEY`. Los 30 casos (24 + Y, Z, AA, AB, AC, AD) y sus
aserciones están cubiertos por los tests con el modelo simulado. **Correr
después del deploy** (paso manual 6).

## Tanda R2 · Decisiones

1. **Rama.** El PR #5 de esta rama estaba mergeado: la rama se reinició
   desde `main` (que ya tenía el PR #6) y se mergeó `fix/chat-texto-duplicado`
   por el commit de la auditoría, que no estaba en `main`.
2. **Recomendado de Turnos.** Al borrar "Combo Web + Turnos" (era el
   recomendado), el recomendado pasa a "Agenda de turnos online" y la nota
   de la categoría dice "¿No tenés página? Mirá el combo Página + turnos".
3. **Nombres que no están en la auditoría.** "Mantenimiento mensual del
   proyecto" (sin el 10% en el nombre, para no duplicar el número de
   `mantenimientoPct`) y los extras ("Te escribo los textos", "Blog de
   novedades", "Página en dos idiomas", "Vuelta de correcciones extra",
   "Tu dirección web .com.ar (por año)").
4. **Gestión e IA.** Siguen con 50/50 (no son "proyectos grandes" para el
   pago), pero sin "la página es tuya": la propiedad se define en la
   propuesta, como en grandes. "Sistema a tu medida" lleva el 50/50 en sus ítems.
5. **Precios en las soluciones, en transferencia.** Las páginas de solución
   son HTML del servidor sin el selector de Mercado Pago (está en
   `/precios`); "Cómo se paga" dice el +6% y las cuotas.
6. **Las 3 garantías del hero** son una lista (`<ul>`) y no tarjetas `lift`:
   no son links.
7. **Chips del chat.** Los 7 de problema solo hasta el primer mensaje;
   después queda "Hablar con Mauro", para no ocupar la ventana.
8. **Abiertos desde una baldosa**, los temas van en primera persona
   ("Quiero que mis clientes saquen turno solos").
9. **Fallback del botón del chat.** Sin temporizador ni ventanas
   emergentes: el evento es cancelable y el `href` del botón es WhatsApp.
10. **Origen en un build local de producción.** `next start` corre en
    modo producción y `localhost` no está permitido ahí: para probar el
    chat o `/demo` local, `CHAT_ALLOWED_ORIGINS=http://localhost:3005`.
11. **Topes del formulario.** Usan los mismos topes por IP del chat
    (ráfaga y diario), contados aparte (`demo:<hash>`) y fuera del global.
    Un pedido con el campo trampa recibe "listo" y no se guarda ni se avisa.
12. **Evals de abuso en F3.** Se sumaron junto con Y, Z y AA (un solo cambio
    de `casos.ts`); son los de S11.
13. **Capturas en JPEG** (calidad 70) para no sumar 20 MB al repo.

## Pasos manuales para Mauro

1. **Aplicar la migración** `drizzle/0001_rafaga_chat.sql` (tabla
   `chat_burst`): `DATABASE_URL=… npm run db:migrate`. Sin ella, el tope
   por ráfaga falla y el chat cuenta en memoria con tope global 100 (falla
   cerrado): aplicala antes o junto con el deploy.
2. **Límite de gasto mensual y alertas** en el workspace de Anthropic
   (Console → Settings → Limits): tope mensual y aviso por email al 50% y al 80%.
3. **Claves de Turnstile**: Cloudflare → Turnstile → Add widget, dominio
   `malejo.com.ar` (y `www`), modo "Managed". Cargá `TURNSTILE_SITE_KEY` y
   `TURNSTILE_SECRET_KEY` en Vercel y redeploy. Se exige en el chat (casilla
   de contacto) y en `/demo`.
4. **Firewall de Vercel** (Project → Firewall → Configure → New rule):
   path `/api/chat` **o** `/api/contacto`, rate limit **30 pedidos por
   minuto por IP**, acción **429**. Activá también **Bot Protection**
   (Firewall → Bot Management) en modo "Challenge".
5. **Variables nuevas en Vercel**: `CHAT_TEST_TOKEN` (`openssl rand -hex 24`),
   y si querés cambiar los defaults `CHAT_BURST_LIMIT` (20),
   `CHAT_DAILY_LIMIT_IP` (150; si quedó en `0` de la etapa de pruebas,
   borrala para tomar el default) y `CHAT_ALERT_THRESHOLD` (300). Para la
   alerta por email: `RESEND_API_KEY` y `EMAIL_TO`. Redeploy después.
6. **Evals con el modelo real** después del deploy:
   `CHAT_TEST_TOKEN=<el mismo> npm run eval:chat -- --url https://malejo.com.ar`.
   Objetivo: 28 de 30. Revisá `docs/agencia/evals/<fecha>.md`.
7. **La foto**: subí `public/agencia/marca/mauro.jpg` (cuadrada, ≥ 320 px)
   y redeploy; la home la toma sola.
8. **Search Console**: pedí reindexar `/`, `/precios` y `/servicios/*`
   (cambiaron títulos y nombres de planes).

---

# Tanda R3 · revisión como usuario y el agente como vendedor

Pedido de Mauro (9-11, noche): recorrer el sitio como cliente, probar muchas conversaciones con Malejo, armar un plan y ejecutarlo en loop. Sigue en el mismo PR (#7), con commits `R3-n`. El detalle (hallazgos, simulación, lo que solo Mauro puede responder y el plan para vender el asesor) está en **`docs/agencia/revision-r3.md`**. `npm test` (152 tests), `npm run lint` y `npm run build` en verde. Todas las rutas siguen `○`/`●`. La home mide 3,43 pantallas en escritorio y 5,46 en celular.

**Sin clave de Anthropic en el entorno** (y sin permiso para leer las variables del proyecto en Vercel), las conversaciones se probaron con una simulación de 22 charlas (`docs/agencia/evals/2026-11-09-simulacion.md`) y con el modelo simulado de los tests. Las evals reales siguen pendientes: 36 casos, objetivo 33.

## Qué se hizo
- **R3-1** Contexto de página en el prompt (validado contra las rutas), la charla persiste en `sessionStorage` con "Empezar de nuevo", y eventos de Vercel Analytics del embudo, sin datos personales.
- **R3-2** Respuestas sugeridas (`sugerir_respuestas`) y formulario de contacto en el chat (`pedir_contacto`, con ticket firmado, que también acepta `/api/contacto`). Prompt con "No inventes" (funciones, fechas, cuotas, medios de pago, terceros, marca blanca, memoria). Renovación sin seña. Privacidad coherente. `cotizar` con aviso de costos por uso correcto, otra forma de pago y regla de cuotas. Evals AE–AJ.
- **R3-3** `/demo` se completa con la ficha del chat y ofrece avisar por WhatsApp al enviar. Beneficios compactos en celular. Título "Soy Mauro, detrás de Malejo.". Combos con el mismo sufijo de cuota.

## Decisiones
1. **Simulación como sustituto, con aviso.** No es Haiku en producción; las fallas que encontró se convirtieron en reglas y en evals reales (AE–AJ) para confirmarlas con el modelo.
2. **Descuentos:** se mantuvo "opción accesible + derivar en el mismo turno", porque es lo que pide la eval C de producción. La simulación sugería derivar solo si insiste.
3. **`pedir_contacto` firma solo el rubro y el resumen**; el nombre y el WhatsApp los escribe la persona. Se mantiene que el modelo no puede guardar nada y que no existe ningún endpoint que lea contactos.
4. **El precio "desde" del catálogo** se puede decir sin herramienta; las sumas, los totales y las combinaciones siguen saliendo de `cotizar`.
5. **Eventos de Analytics:** solo conteos y tipos, nunca texto. En el plan Hobby de Vercel no se registran.

## Pasos manuales nuevos para Mauro
- Responder las 9 preguntas de `revision-r3.md` §2.3 (cada una saca una derivación).
- Correr las evals reales: `CHAT_TEST_TOKEN=… npm run eval:chat -- --url <vista previa o producción>` (36 casos, objetivo 33).
- Si querés ver el embudo: plan Pro de Vercel (eventos personalizados).


---

# Tanda P1 · precios nuevos, 3 pagos sin interés y modales "Qué incluye"

Fuente de verdad: `docs/agencia/precios-psicologia-2026-11-10.md` (§2 pagos, §3 tabla, §4 pantallas, §5 modal); pedido en `docs/agencia/tanda-p1-malejo-precios-modales.md`, con las decisiones tomadas al arrancar al final. `npm test` (184 tests), `npm run lint` y `npm run build` en verde. Todas las rutas de la agencia siguen `○`/`●`.

## Qué se hizo
- **Datos** (`precios.json`): la tabla §3 completa; combos con `list` = suma real por separado; mantenimiento pro a $49.000 y el recomendado pasa a "Cambios chicos"; `landing-premium` pasa a "Página completa" (sin asistente, mismo id). Campos nuevos: `noIncluye` (todos), `destacados`, `enUnaLinea`, `usaServiciosDeTerceros`, `visibles` por categoría, `categorias` por combo y `pagos`.
- **Aritmética** (`lib/agencia/pricing.ts`): `pagosDe`, `lineaDePagos` (la única fuente de "o 3 pagos de $X sin interés"), `pagosCortos`, `desdeDeCategoria`, `mensualDeAnual`/`anualPorMes` y los pagos dentro de `cotizar` y `comparar`. El tope de $600.000 se mira sobre el total contratado, sin `grandes` ni montos solo mensuales.
- **Copy**: "por mes" o "servicio mensual" en vez de "cuota mensual"; "lo das de baja cuando quieras, avisando 30 días antes"; "incluye soporte funcional"; el auto, el taller y la nafta en `conocimiento.modeloDeCostos`, con `fraseDeCosto()`. Glosario: suma "cuota mensual", "permanencia" y "tokens".
- **Componentes**: `PlanDialog` (isla con `<dialog>` nativo y `LazyMotion`), `PlanDetalle`/`ComboDetalle`, `InfoPagos` (franja y modal de formas de pago, franja de costos, extras y condiciones), `DemoResumen` (isla que cotiza `?plan=` en `/demo`). `PricingCatalog` queda como isla que solo elige la categoría: los paneles los arma el servidor.
- **Pantallas**: home (§4.1 y Fase 3 bis B), `/precios` (§4.3 y Fase 3 bis A y C), `/servicios/[slug]` (§4.2), cotizador (§4.4), `/demo` (§4.5) y "Precios" en el encabezado del celular.
- **Chat**: `cotizar` devuelve `formasDePago` y la tarjeta `quote` muestra la línea de pagos; `comparar` trae la línea de cada opción. En el prompt: 3 pagos ante dudas por el precio (nunca descuentos), "Incluye"/"No incluye" del catálogo y la regla de la nafta. Evals: O pasa a pedir los 3 pagos, más 5 nuevas (AK–AO): 41 casos, objetivo 38.

## Antes y después

Medido con `docs/agencia/verificacion/p1/verificar.js` contra builds de producción (`main` en 3002, esta rama en 3001). Palabras y precios visibles = `innerText` de `<main>`, sin header ni footer. Por eso no coinciden con los números de §0, que se midieron en producción con otro método. Resultado completo en `verificacion/p1/resultado.json`.

| Pantalla | Palabras 1280 px | Palabras 390 px | Precios visibles |
|---|---|---|---|
| `/` | 479 → **287** | 479 → **287** | 8 → 11 |
| `/precios` (pestaña webs) | 699 → **422** | 702 → **407** | 27 → 21 |
| `/precios?cat=tiendas` | 554 → 346 | 557 → 331 | 26 → 14 |
| `/precios?cat=turnos` | 474 → 315 | 477 → 300 | 23 → 12 |
| `/precios?cat=gestion` | 552 → 355 | 555 → 340 | 26 → 14 |
| `/precios?cat=ia` | 650 → 358 | 653 → 343 | 27 → 14 |
| `/precios?cat=mant` | 470 → 263 | 473 → 248 | 22 → 3 |
| `/precios?cat=grandes` | 461 → 263 | 464 → 248 | 19 → 1 |
| `/servicios/webs` | 467 → **443** | 467 → 443 | 11 → 12 |
| `/servicios/ia` | 490 → 447 | 490 → 447 | 9 → 15 |
| `/servicios/tiendas` | 401 → 450 | 401 → 450 | 6 → 15 |
| `/servicios/gestion` | 402 → 450 | 402 → 450 | 7 → 15 |
| `/servicios/turnos` | 347 → 393 | 347 → 393 | 6 → 13 |
| `/servicios/mant` | 318 → 366 | 318 → 366 | 3 → 3 |
| `/servicios/grandes` | 379 → 361 | 379 → 361 | 3 → 2 |
| `/cotizador` (vacío) | 190 → 192 | 190 → 192 | 6 → 6 |
| `/demo?plan=landing-profesional` | 304 → 330 | 304 → 330 | 8 → 11 |

- **Home**: 3,43 → **3,16** pantallas en escritorio y 5,46 → **4,64** en celular (mismo método que `r2/capturas.js`: 1440×900 y 390×844).
- **Soluciones**: todas ≤ 450 palabras. Algunas suben respecto de `main` porque antes los otros planes estaban cerrados en un `<details>` y ahora van 3 tarjetas a la vista, "¿Cuál me conviene?", el combo y las franjas de pagos y de costos. Los precios visibles suben por la línea de los 3 pagos, que acompaña a cada total.
- **`/precios`**: la pestaña webs queda en 422 (objetivo ~350) porque, por la decisión A, muestra 3 combos. Las demás quedan entre 263 y 358.
- **Overflow horizontal**: 0 en todas las páginas, a 1280 y a 390.
- **Modal** (`/`, `/precios`, `/servicios/webs`, `/servicios/ia`, a 1280 y a 390): abre como modal, el foco entra y en 30 Tab no sale a la página, el scroll queda bloqueado, cierra con Esc y con clic en el fondo, y el foco vuelve al disparador. 8 de 8.
- **Sin JS**: los 30 "Ver qué incluye"/"Ver qué trae" de `/precios` llevan a `/servicios/<cat>#<id>`, donde el `<details>` se abre solo y el detalle queda en pantalla. El modal de la seña de la home cae en un `<details>` visible.
- **Fase 3 bis C**: a 320, 360, 390 y 412 px, en las 7 categorías, sin rectángulos superpuestos en la grilla de categorías ni en las tarjetas, y nada del panel sale del ancho. El modal de extras, fila por fila, tampoco se pisa. 32 de 32.

## Decisiones
1. **Panel del servidor, isla mínima.** `/precios` renderiza las 7 pestañas en el servidor y la isla solo cambia el `hidden`: el contenido de los modales llega como `children` y la copy no entra al bundle.
2. **`enUnaLinea`.** La tarjeta pide "para quién" en una línea. El `paraQuien` completo se queda en el modal y en el chat, que lo usa para recomendar.
3. **La animación del modal no remonta el contenido.** Un `key` nuevo destruía el botón que `showModal()` había enfocado (lo detectó la verificación).
4. **`/demo` cotiza en el cliente.** Así un `?plan=a,b` del cotizador o del chat da el mismo total que en el resto del sitio, y la ruta sigue estática.
5. **Cuota de tarjeta redondeada a $100**, como el recargo: es orientativa, porque el interés lo pone Mercado Pago.

## Pasos manuales para Mauro
- Revisar los `noIncluye` (la lista está en el PR).
- Correr las evals reales con la clave: `npm run eval:chat -- --url <vista previa>` (41 casos, objetivo 38).
- Search Console: reindexar `/precios` y `/servicios/*` (cambiaron precios y estructura).
