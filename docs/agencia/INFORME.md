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

## Evals reales (11-11, contra el preview de la rama)

Corridas con `npm run eval:chat` contra el preview de Vercel, que tiene la clave del lado del servidor. El acceso se hizo con un link de acceso del preview (cookie en `EVAL_COOKIE`) y los pedidos se espaciaron con `EVAL_PAUSA_MS=31000`, porque sin `CHAT_TEST_TOKEN` rige el tope de ráfaga por IP. Hubo cuatro corridas con arreglos entre medio:

| Corrida | Commit | Pasan | Qué se arregló después |
|---|---|---|---|
| 1 · `evals/2026-11-11T2058.md` | `bfd7617` | 34 de 41 | `max_tokens` 800 → 4000: el pensamiento adaptativo de Haiku 5.5 cuenta dentro del techo y cortaba respuestas (vacías en M y R; sin `tool_use` en C y AF). Descuento → 3 pagos y derivar. Sin `sugerir_respuestas` ante insultos. Regex de Y y Z. |
| 2 · `evals/2026-11-11T2135.md` | `53bea70` | 35 de 41 | Texto + herramienta que solo muestra una tarjeta cierra el turno (la segunda ronda anunciaba el botón). No anunciar tarjetas. Nombrar los proyectos. No nombrar soluciones mientras pregunta. |
| 3 · `evals/2026-11-11T2209.md` | `3f17ab7` | 37 de 41 | Salvaguarda de derivación en el servidor (`chat/derivar.ts`): si promete derivar y no salió la tarjeta, la agrega. Recomendar directo si el pedido ya dice qué necesita. Regex de AJ y B. |
| 4 · `evals/2026-11-11T2244.md` | `eb5bb3e` | **38 de 41** ✅ | — |

Los 5 casos nuevos de P1 (AK a AO) pasan en las cuatro corridas. Entre corridas la variación es de ±2 casos, y las fallas de la última son menores y no se repiten: B (largo: 74 palabras), F ("lo ves antes de pagar el total" sin decir "demo") y Q (recomienda el catálogo y menciona la tienda como alternativa).

## Pasos manuales para Mauro
- Revisar los `noIncluye` (la lista está en el PR).
- Search Console: reindexar `/precios` y `/servicios/*` (cambiaron precios y estructura).
- El link de acceso del preview que se usó para las evals vence solo a las 23 h. El entorno `portfolio-2026` de Claude Code quedó con el host del preview de esta rama habilitado; se puede sacar en la configuración del entorno.

# Tanda P2 · "Soluciones" como armador, Malejo como asesor, seña escalonada y celular primero

Pedido en el documento único del 15-11 (D1 a D9). `npm test` (230 tests), `npm run lint` y `npm run build` en verde. `/soluciones` es `○`; `/servicios/[slug]` sigue `●`; `/precios`, `/cotizador` y `/servicios` son redirecciones 308. Verificación completa con `docs/agencia/verificacion/p2/verificar.js` contra un build de producción y el modelo simulado: **todo en orden** (`verificacion/p2/resultado.json`).

## Qué se hizo, por fase
1. **Rutas** (`lib/agencia/redirects.ts`, `next.config.ts`): 308 a `/soluciones` conservando la query; menú, pie, celular, blog, chat, rutas y sitemap actualizados (`/soluciones` con prioridad 0,9). Test nuevo: nada de `content/`, `components/agencia/`, `app/(agencia)` ni `lib/agencia` enlaza una ruta redirigida. `/servicios/[slug]` suma "Armalo con esto" → `/soluciones?cat=<slug>`.
2. **Lógica pura**: `lib/agencia/armado.ts` (sessionStorage + `malejo:armado`, `?a=` de ida y vuelta, tope de 12, sin catálogo para que lo use el widget) y en `pricing.ts` `clasificarId`, `validarArmado`, `armadoDeUrl` y `estimarArmado` (piso publicado; techo +15 % de lo fijo y +50 % de lo "desde", redondeado a miles; pagos sobre el piso). Márgenes en `precios.json → estimado`.
3. **Seña escalonada** (`precios.json → senas`, `senaPara`, `senaDelPiso`, `lineaDeSena`, `filasDeSena`, `escalaDeSena`, `SenaTabla`): reemplaza a `senaMonto()` en `/demo`, el FAQ, pagos, términos, el chat (`cotizar` devuelve `senaDeLaDemo` y la tarjeta muestra su seña) y el modal de la home. `/demo` lee `?a=` o `?plan=` y, arriba de $750.000, cambia a "Primero el plan por escrito". Links de pago por monto; sin link, alias y WhatsApp.
4. **El armador** (isla `Armador` + paneles del servidor `PanelArmado`): categorías en columna fija (escritorio), arriba (tableta) o en grilla con fila de chips fija al bajar (celular); planes en carrusel nativo con la recomendada primero; carrito con rango, pagos, mensual, seña y combo aplicado; vaciar con confirmación en línea; compartir; "Mandale tu armado a Mauro" con formulario, `/api/contacto` variante `armado` (solo ids, el servidor escribe el resumen, el mismo único insert) y pantalla de éxito con Cal.com y WhatsApp. Eventos: `soluciones_camino`, `armado_agregar`, `armado_quitar`, `armado_sugerencia_aceptada`, `armado_enviado`, `armado_agenda`, `armado_compartido`.
5. **Malejo asesor**: modo armado en `/soluciones` (reglas cacheadas en el prompt; "Armado actual" con rango, pagos y seña en el bloque sin caché), el armado viaja con cada pedido, la ficha suma `armadoIds` (el WhatsApp lleva el link al armado) y `sugerir_armado` muestra 1–3 ítems con "Agregar al armado": **nunca agrega sola**. 7 evals nuevas (AP–AV): 48 casos, objetivo 44.
5 bis. **Bienvenida**: el saludo es una burbuja con las 6 opciones adentro (las de modo armado en Soluciones), en gris cuando dejan de ser el último mensaje; el saludo no va al servidor; el pie queda con el campo y la privacidad; "Hablar con Mauro" pasa al encabezado; scroll al comienzo de cada mensaje nuevo.
6. **Home y mensaje**: "Software con IA para tu negocio." en el H1, el layout, el OG y el JSON-LD (`serviceType` con "Desarrollo de software" e "Inteligencia artificial para negocios"); baldosas a `/soluciones?cat=`; "Armá lo que necesitás →"; cómo trabajo en 3 pasos nuevos, el 2 con el modal de la seña.
6 bis. **Celular**: primera pantalla con Mauro (sprite que saluda, CSS `steps()`), "Hablar con Malejo" y "Armar mi solución" apilados y los chips; `BottomNav` (Inicio · Soluciones · Malejo · Contacto) en lugar de la burbuja; hojas con resorte (`Hoja`) para el armado y Contacto; Malejo en hoja a media pantalla que se agranda y pasa a completa con el teclado; barra del armado encima de la barra inferior y de la hoja de Malejo; miniatura que vuela al agregar y contador que rebota; compartir con `navigator.share` o portapapeles; vibración de 12 ms al agregar.

## Redirecciones

| Ruta vieja | Destino | Código | Query |
|---|---|---|---|
| `/precios` | `/soluciones` | 308 | se conserva (`?cat=ia` → `/soluciones?cat=ia`) |
| `/cotizador` | `/soluciones` | 308 | se conserva (`?a=…`) |
| `/servicios` (solo el índice) | `/soluciones` | 308 | se conserva |
| `/servicios/[slug]` | — | se queda (`●`) | — |

## Palabras y pantallas (`innerText` de `<main>`)

| Página | Palabras 390 px | Pantallas 390 × 844 | Palabras 1440 px | Pantallas 1440 × 900 |
|---|---|---|---|---|
| `/` | 299 | **4,64** (tope 5,5) | 312 | **3,29** (tope 3,5) |
| `/soluciones` | 416 | 3,74 | 453 | 3,63 |
| `/soluciones?cat=turnos` | 309 | 3,56 | 346 | 2,97 |
| `/servicios/webs` | 446 | 5,99 | 446 | 3,66 |
| `/servicios/ia` | 450 | 6,07 | 450 | 3,66 |
| `/servicios/grandes` | 364 | 4,86 | 364 | 2,95 |
| `/demo` | 301 | 2,96 | 301 | 1,55 |
| `/demo?a=landing-profesional,turnos-online` | 327 | 3,09 | 327 | 1,79 |
| `/demo?plan=sitio-pyme,pedidos-y-clientes` (plan escrito) | 355 | 3,36 | 355 | 1,89 |

Las soluciones siguen ≤ 450 palabras.

## Celular (Fase 6 bis, punto 8)
- **Primera pantalla de la home**, con la barra inferior: entra a 320 × 640, 360 × 740, 375 × 667, 390 × 844, 412 × 915 y 430 × 932 (a 390 × 844, los chips terminan en 526 px y la barra empieza en 788).
- **Overflow horizontal**: 0 en todas las páginas a 320, 360, 375, 390, 412, 430, 768, 1024 y 1280 px.
- **Solapes**: ninguno entre la barra inferior, la barra del armado, la fila de chips y la hoja de Malejo, en los 6 celulares; el relleno de los planes es mayor que la barra del armado; en 768, 1024 y 1280 las categorías, los planes y el carrito no se pisan.
- **Carrusel**: después de deslizar, termina centrado en una tarjeta (1 px). **Hojas**: la del armado y la de Contacto abren como modal, el foco entra, Esc cierra y el foco vuelve al disparador.
- **Bienvenida de Malejo**: entra sin scroll en la hoja a 360 × 740 (432 px), 390 × 844 (464 px) y 412 × 915 (503 px), con las 6 opciones.
- **Teclado abierto**: el cambio a pantalla completa con `visualViewport` no se puede simular en Chromium headless; queda para probar en el celular de Mauro (no se completó el modelo: se usaron 390 × 844 y 412 × 915).
- **Capturas** a 390 px (`verificacion/p2/`): primera pantalla de la home, `/soluciones` (entrada, categoría elegida, hoja del armado, Malejo a media pantalla) y la pantalla de éxito; y a 1280 px, home y `/soluciones`.

## Flujo completo (build local, modelo simulado)
Agregar y quitar; el combo Página + turnos se aplica solo al agregar sus partes; `?a=` en otra pestaña abre con "Te compartieron este armado"; "Ayudame a elegir" → "Doy servicios con turno" → tarjeta de `sugerir_armado` → "Agregar al armado" → el carrito lo marca "Sugerido por Malejo"; "Mandale tu armado a Mauro" manda solo ids (`consent`, `armado`, `nombre`, `whatsapp`, `ficha`) y aparece la pantalla de éxito. La respuesta de `/api/contacto` se simuló en el navegador porque el sandbox no tiene base: el endpoint real con el armado está cubierto por `route.test.ts` (503 sin base con un pedido válido, 400 sin casilla, con un WhatsApp inválido o con un armado vacío o inventado).

## Sin JS
`/soluciones` muestra las 7 categorías en `<details>`, 33 enlaces "Pedí tu demo" visibles y ningún "Agregar al armado"; el carrito y la barra inferior no aparecen, y en su lugar están "Escribime por WhatsApp" y "Contame qué necesitás".

## Rendimiento (Lighthouse 12.6 móvil, throttling por defecto, build de producción local)

Tres o cuatro corridas por página, en el mismo contenedor, contra esta rama y contra `main` (P1) construida al lado:

| Página | LCP | TBT | CLS |
|---|---|---|---|
| `/` (P2) | 4,31–4,35 s | 190–255 ms (mediana 228) | 0 |
| `/` (`main`) | 4,23–4,27 s | 149–201 ms | 0 |
| `/soluciones` (P2) | 2,79–3,47 s | 159–245 ms (mediana 221) | 0 |
| `/precios` (`main`) | 2,87–3,21 s | 148–237 ms | 0 |

- **TBT ≤ 250 ms y CLS ≤ 0,05: se cumplen** (mediana). Para llegar: el contenido de cada modal `PlanDialog` se monta recién al abrirlo (`/soluciones` tiene ~40 modales y su contenido eran miles de nodos que se parseaban e hidrataban sin verse; el HTML bajó de 701 a 608 kB frente a `/precios`) y el título de "¿Qué necesitás?" salió del `Reveal`, porque con la primera pantalla nueva asoma arriba del pliegue y era el LCP.
- **LCP ≤ 2,5 s: no se cumple en este contenedor, pero tampoco en `main`**: la home de `main` da 4,2 s y `/precios` 2,9 s con el mismo método. El 85–90 % es "render delay" del simulador sobre una máquina lenta (índice de CPU 1.200–2.100). Hay que medirlo en el preview de Vercel con PageSpeed Insights; R2 midió 93 de rendimiento en celular en otro entorno.
- **JS de la isla del armador**: 21,5 kB gzip (catálogo, `estimarArmado`, la isla y el carrusel) + 3,2 kB (`AgregarBoton` y `useArmado`) = **24,7 kB ≤ 35 kB**. React y Framer Motion son compartidos con el resto del sitio y no se cuentan. El widget de Malejo pesa 12,9 kB y sigue cargándose diferido.
- Ninguna animación hubo que sacar: todas son `transform` y `opacity`.

## Decisiones
1. **`armado.ts` sin catálogo.** El widget de Malejo lo importa y no tiene que cargar `precios.json`: la validación se inyecta (`clasificarId` en el armador, el servidor y `/demo`).
2. **`sugerir_armado` no se repite** con la misma firma (5.3). La eval AR ("Agregalo vos") pide explicar el botón y no decir que lo agregó; volver a mostrar la tarjeta no es obligatorio porque la sugerencia ya está en pantalla.
3. **En Soluciones de escritorio no va el sprite flotante**: pisaba el carrito antes de que quede fijo. Malejo se abre desde "Ayudame a elegir", el carrito ("Preguntale a Malejo") y el header.
4. **Hoja de Malejo con piso de 432 px** (`max(55dvh, 432px)`): a 360 × 740 el 55 % no alcanzaba para la bienvenida con sus 6 opciones.
5. **Outfit pasa a fuente variable**: con los pesos fijos, el build sin caché fallaba en Turbopack con el mismo error que ya estaba documentado para JetBrains Mono. Son unos 100 kB más de fuentes; si molesta en las mediciones de Vercel, se puede volver a los pesos fijos con caché de build.
6. **"Armar otra cosa"** después del éxito vuelve al carrito sin vaciarlo, por si la persona quiere ajustar algo.

## Evals reales (15-11, contra el preview de la rama)
`npm run eval:chat` contra el alias del preview de esta rama, con un link de acceso de Vercel (`EVAL_COOKIE`) y `EVAL_PAUSA_MS=31000` por el tope de ráfaga: **45 de 48** ✅ (objetivo 44). Informe: `evals/2026-11-15T2222.md`.

- Los 7 casos nuevos: pasan AP (sugiere el combo Página + turnos después de preguntar), AR ("Agregalo vos": explica el botón y no dice que agregó), AS ($50.000 para la tienda, que se descuenta), AT (plan por escrito y charla gratis, sin demo), AU (prioriza sin sumar todo) y AV (la opción "No sé qué necesito" pregunta el rubro, sugiere respuestas y no repite el saludo).
- Fallas: **AQ** da el rango exacto ($357.000 a $411.000), los 3 pagos, lo mensual, la seña y "el precio final lo cierra Mauro en la videollamada", pero cierra preguntando el rubro en vez de invitar a "Mandale tu armado a Mauro" (el prompt pide invitar "cuando el armado tiene sentido", y sin rubro todavía no lo tenía). **Q** y **S** son de P1 y menores: abre la tienda con otra opción y 63 palabras con tope de 60.

## Pasos manuales para Mauro
1. Crear en Mercado Pago links de $25.000 y $50.000 para la seña, y uno de $60.000 para el plan por escrito; cargarlos en Vercel como `NEXT_PUBLIC_SENA_URL_25000`, `NEXT_PUBLIC_SENA_URL_50000` y `NEXT_PUBLIC_PLAN_ESCRITO_URL`. Desactivar el link viejo de $20.000.
2. Después del deploy, borrar `SENA_MONTO` y `NEXT_PUBLIC_SENA_URL` de Vercel (ya no se leen).
3. Leer y aprobar la cláusula nueva de la seña en los términos (`/legal/terminos`, punto 2).
4. Search Console: reenviar el sitemap, pedir la indexación de `/soluciones`; `/precios` y `/cotizador` van a aparecer como "Página con redirección", y es lo esperado.
5. Opcional: `RESEND_API_KEY` y `MAURO_EMAIL` para recibir un mail con cada armado.
6. Medir con PageSpeed Insights en el preview (el LCP de este contenedor no es representativo; `main` da lo mismo).
7. El link de acceso del preview que se usó para las evals vence a las 23 h.
8. Probar en su celular: el teclado abierto en el chat y la vibración al agregar.

# Tanda P2.1 · Correcciones de Mauro sobre el preview de P2

Sobre la misma rama del PR #9, un commit por punto. `npm test` (231), `npm run lint` y `npm run build` en verde, con las mismas rutas `○`/`●` y las mismas 308. `verificacion/p2-1/verificar.js` y `verificacion/p2/verificar.js` (adaptado a "kit" y a la columna con pestañas): **todo en orden**.

## Qué se hizo
1. **Al cambiar de categoría, volver arriba.** El cambio lleva al título de la categoría con `scroll-margin-top` (header fijo y, en celular, la fila de chips; se descuenta el `scroll-padding-top` del `html`), suave o directo con movimiento reducido, sin moverse si el título ya se ve, y con el foco en el título. Verificado a 1280 y 390 px desde el fondo de la página, en las 7 categorías: el título queda a 106 px (escritorio) y 167 px (celular), sin taparse.
2. **"Proyectos a medida".** Línea de tiempo vertical (`GrandesLinea`): tarjetas a lo ancho con el número en un círculo, dos zonas que se apilan debajo de 640 px de columna (container query) y el precio como mucho del tamaño de `h2`, sin partir renglón. El plazo (⏱) va en la fila de "PASO N" o al lado del nombre con `flex-wrap`, también en `PlanCard` y en `/servicios/grandes`. A 390, 1024, 1280, 1536, 1920 y 2560 px: ningún badge fuera de su tarjeta, títulos de 1 o 2 renglones, precios en uno, sin overflow. La columna central mide como mucho ~565 px porque el sitio usa un contenedor de 1.240 px, así que las dos zonas se ven apiladas en todos los anchos.
3. **La columna derecha.** Panel fijo de 3 zonas con pestañas "Tu kit" | "Malejo": solo el cuerpo scrollea (barra fina), el pie con el estimado, los pagos, la seña y "Mandale tu kit a Mauro" queda fijo. El chat de Malejo se monta adentro con un portal (mismo widget, misma sesión) y en Soluciones no hay flotante desde 760 px. "Ayudame a elegir", "Preguntale a Malejo" y el header abren la pestaña; lo agregado desde una sugerencia marca "Tu kit" con un punto de novedad sin cambiar de pestaña. Con 8 ítems, a 1024, 1280, 1536 y 2560 px de ancho y 720, 900 y 1300 de alto: el pie se ve completo, el panel no scrollea entero y no hay flotante encima. En celular, la hoja del kit lleva el mismo pie fijo.
4. **"Armado" → "kit"** en toda la copy y en el chat (tabla del pedido). El código no se renombra. El glosario prohíbe "armado"; tres textos del catálogo pasaron a "listos", "estándar" y "creadas".
5. **El embudo del chat.** Entender (≤ 3 preguntas) → `sugerir_armado` para el kit → "Mandale tu kit a Mauro" y la videollamada → la demo. `pedir_demo` solo si la piden explícitamente (antes, una sugerencia en una línea) o si el kit ya se mandó (el armador lo marca y el widget lo avisa). Ante "¿cuánto me sale todo esto?", cierra con "¿Se lo mandás a Mauro así te arma la propuesta?". Después de las evals se sumó: nunca pedir que toquen «Agregar al kit» sin haber mostrado la tarjeta.

## Evals reales (16-11, contra el preview)
`evals/2026-11-16T0120.md`: **48 de 50** ✅ (objetivo 46 = el 44 de P2 más los 2 nuevos). Pasan AQ (ahora cierra con "¿Se lo mandás a Mauro…?"), AW (aula virtual desde la home: sugiere `plataforma-educativa-con-ia`, sin `pedir_demo`, nombra "tu kit") y AX ("quiero ver una demo ya": sugerencia en una línea y la demo). Fallas: **B**, donde Malejo pidió tocar «Agregar al kit» sin haber mostrado la tarjeta (arreglado en el prompt después de la corrida; la B ahora acepta la sugerencia como alternativa a cotizar) y no habló de cuotas ante "¿y con Mercado Pago?"; y **Q**, de P1 (abre la tienda con otra opción).

Re-corrida de control después del arreglo (`evals/2026-11-16T0201.md`, B, AQ, AW y AX): pasan B, AQ y AW. AX mostró la sugerencia para el kit y la demo, como se pide, pero sumó una segunda frase después de las tarjetas y llegó a 61 palabras (tope 60); en la corrida completa había pasado.

## Capturas
`verificacion/p2-1/`: `/soluciones` a 1280 y 2560 px en "Proyectos a medida" y con la pestaña Malejo abierta, y la hoja del kit a 390 px.

# Tanda P3-1 · Sistema de estilos, estilo Institucional y el personaje en 3 dibujos

Rama `p3-1-estilos` desde `main` (`f4aa244`), PR contra `main`. `npm run lint`, `npm test` (235, con el test de contraste nuevo) y `npm run build` en verde, con las mismas rutas `○`/`●` que en P2. `verificacion/p3-1/verificar.js`: **todo en orden**. `verificacion/p3-1/animaciones.py`: las 7 animaciones coinciden con sus GIF.

## Qué se hizo
1. **Sistema de estilos.** `content/agencia/estilos.ts` es la fuente única: Tech/IA (representa `ia`) e Institucional (`webs`) disponibles; Aula virtual y Tienda declaradas con `disponible: false` ("Próximamente"). El script inline del layout (`lib/agencia/estilo.ts → arrancar`) pone `data-estilo` y `data-dibujo` en `<html>` antes del primer pintado desde `localStorage`; sin nada guardado, **siempre Tech/IA y 16-bit**. Sin JS no hay atributo y vale el CSS de base. El respaldo del 404 llama a la misma función. Ningún Server Component lee nada: las rutas siguen `○`.
2. **Tokens por estilo.** `app/(agencia)/estilos.css` redefine los mismos tokens de `agencia.css` por `[data-estilo]` en claro y oscuro. Para que Institucional pudiera cambiar la forma sin tocar componentes, `agencia.css` pasó a tokens lo que estaba fijo: radios (`--r-card`, `--r-btn`… y `--r-max`, el tope de todas las utilidades `rounded-*`, que se renombraron a una escala con nombre: `rounded-14`, `rounded-22`…), la fuente, el peso y el color de los titulares, la fuente de etiquetas y botones, el borde del botón secundario, los 3 tonos, la franja, el pie, el isotipo y el botón de Malejo. **Tech queda igual** (verificado con capturas contra `main`).
3. **Institucional.** Source Serif 4 (variable, `preload: false`) en titulares y precios, Inter en el resto, radios de 4 px, bordes de 1 px, sin sombras salvo el panel del selector y la hoja del chat, la franja de 3 colores arriba y en el pie, la barra superior oscura, el menú a lo ancho con la "M" en un cuadrado, las tarjetas de categoría con borde superior de su tono, "Cómo trabajo" sobre los tintes, el pie oscuro. En Soluciones: categoría activa con borde izquierdo petróleo, contadores y "Recomendado" en terracota, la barra del kit en petróleo; en el chat, la bienvenida con borde petróleo y las 6 opciones con borde de su color; la hoja de Malejo al 64 %. Arranca en **claro** si la persona nunca eligió tema (`temaDeEntrada`).
4. **Selector** (`EstiloSelector`): pestaña vertical "Estilos" en el borde derecho desde 760 px y la paleta al lado del logo en el celular. Panel "Mirá la web en otro estilo" (`<dialog>`; hoja abajo en el celular) con las 4 miniaturas, la fila Personaje, "Sorprendeme" y "Volver al original". Cambia con `startViewTransition()` (sin transición con movimiento reducido). Analytics `estilo_cambiado { id }` y `personaje_cambiado { dibujo }`.
5. **Selector rápido de personaje:** el grupo "Personaje: Pixel · Chibi · Anime" debajo del ejemplo del hero (escritorio), el botón de flechas al lado de "Soy Mauro" (celular) y el avatar del encabezado del chat. Un dibujo elegido a mano manda: el shuffle bag solo corre si nunca se eligió.
6. **Heroes por estilo** (`components/agencia/home/estilos/<id>/Hero.tsx`): Tech es el de siempre; Institucional, la composición aprobada con la «Cooperativa del Valle» en una ventana de navegador (HTML y CSS, `aria-hidden`) y "Así se vería tu web institucional →" a `/soluciones?cat=webs`. Los dos conservan el H1, los 2 botones y los chips arriba del pliegue en el celular.
7. **El personaje en 3 dibujos.** `scripts/sprites/limpiar.py` verifica (lienzo, alfa binaria, ≤ 24 colores, pies alineados) y recorta el margen común sin reescalar; `animar.py` arma las tiras `idle` (respira 1 bloque y parpadea, por código), `saludo` y `festejo`, escribe `sprites.json` y genera las `@keyframes` (`sprites-animaciones.css`). Los PNG van con paleta exacta (sin cuantizar): pesan entre 2 y 50 kB. `npm run sprites` corre los dos. `<Sprite pose alto alt />` renderiza los 3 dibujos con el mismo alto de personaje y el CSS muestra el de `data-dibujo`. El idle corre solo a la vista (`SpritesVivos`, una sola isla) y nunca con movimiento reducido. El saludo sale al abrir el chat y la primera vez que se ve el hero en la sesión; el festejo, en la pantalla de éxito del kit. Poses por contexto: en espera `normal` (idle), escribiendo `pensando`, con tarjeta o en el éxito `ok`. Se borraron `malejo-saludo.png`, `.sprite-saludo`, `SpriteVivo` y los 3 PNG viejos (pasaron a `16bit/`).

## Verificación
- **Recorrido** (Tech e Institucional × claro/oscuro × 390 y 1280 px, en la home, `/soluciones`, `/servicios/webs`, `/demo`, el 404 y la home con el chat abierto; 48 combinaciones): sin overflow horizontal y **sin texto bajo AA** contra el fondo efectivo (el medidor se probó con un texto gris de 1,9:1 y lo detecta).
- **Primera pantalla del celular:** a 390 × 844 y 360 × 740, los 2 botones y los chips quedan arriba de la barra inferior en los dos estilos.
- **El personaje mide lo mismo** en los 3 dibujos: 176, 123 y 120 px de la cabeza a los pies en el hero de Institucional, el equipo y el flotante, iguales en 16-bit, chibi y anime (`dibujos-y-poses.png`).
- **Sin JS:** Tech/IA, 16-bit, el hero de Tech, sin la pestaña de estilos ni overflow.
- **Persistencia:** primera visita Tech + 16-bit + oscuro; elegir Institucional lo pone en claro y saca otro dibujo de la bolsa; recargar lo mantiene; elegir Anime en el selector rápido y volver a Tech mantiene Anime.
- **Animaciones** (`animaciones.json`): el idle del chibi coincide píxel a píxel con `chibi-idle.gif` (solo difiere la cuantización del GIF) y en tiempos; saludo y festejo de los 3 dibujos, en cuadros y tiempos. En el chibi, saludo y festejo muestran ~2 % de píxeles distintos porque el GIF de referencia está a la mitad del tamaño y el recorte arranca en un píxel impar; el cuadro que gana es el mismo. El saludo del chat se ve ~2 s y no se repite; con movimiento reducido no hay idle ni saludo.
- **Contraste de tokens:** `lib/agencia/estilos.test.ts` (Tech e Institucional, claro y oscuro).

## Rendimiento (Lighthouse 12.6 móvil, build de producción local, `main` construida al lado)
Criterio acordado con Mauro: TBT ≤ 250 ms y CLS ≤ 0,05 obligatorios; el LCP no puede empeorar más de un 10 % frente a `main` en la misma máquina (en este contenedor el LCP de `main` ya da 4,3 s; el número absoluto se mide con PageSpeed Insights en el preview). Institucional se mide con un perfil que ya tiene el estilo guardado.

Dos métodos, los dos en el mismo contenedor y contra `main` construida al lado:

**Lighthouse simulado** (el de siempre, throttling "Lantern"):

| Página | Corridas | LCP (mediana) | TBT (mediana) | CLS |
|---|---|---|---|---|
| `/` `main` | 6 | 4,33 s | 243 ms | 0 |
| `/` Tech | 3 | 4,32 s | 233 ms | 0–0,008 |
| `/` Institucional | 3 | 3,93 s | 79 ms | 0 |
| `/soluciones` `main` | 7 | 2,87 s | 289 ms | 0 |
| `/soluciones` Tech | 3 | 2,88 s | 210 ms | 0 |
| `/soluciones` Institucional | 3 | 3,38 s (**+18 %**) | 240 ms | 0 |

**Lighthouse con throttling real** (`--throttling-method=devtools`, 2 corridas): LCP de la home `main` 1,96 s, Tech 2,12 s (+8 %), Institucional 2,02 s (+3 %); de `/soluciones` `main` 1,80 s, Tech 1,86 s, Institucional 1,87 s (+4 %).

- **TBT ≤ 250 ms y CLS ≤ 0,05: se cumplen** (medianas del simulado).
- **LCP:** con throttling real, ningún caso empeora más de un 8 % frente a `main`. El simulado da +18 % en `/soluciones` Institucional porque suma al LCP la descarga de Source Serif, que se pide antes del primer pintado aunque, con `display: "optional"`, el navegador pinta el H1 con la serif de respaldo sin esperarla (el elemento LCP es el mismo H1 en `main` y en la rama; la diferencia está toda en el "render delay" simulado). Es un artefacto de la simulación, y además no afecta a PageSpeed Insights ni a Search Console: miden la primera visita, que siempre es Tech/IA. **Corrección:** la primera versión de este informe decía "+2 %" porque comparaba con una mediana de `main` inflada por corridas ruidosas (3,31 s); con 7 corridas, `main` da 2,87 s.
- **CLS:** la primera medición de Institucional dio **0,054** por el cambio de fuente del H1 (Source Serif sin precarga, y un respaldo sin métricas ajustadas porque Linux y Android no tienen Times New Roman). Se resolvió con `display: "optional"`. Como entonces la fuente que llega tarde no entra en esa vista, el selector la descarga antes de cambiar de estilo (decisión 8).
- El TBT de este contenedor varía mucho entre corridas (de 105 a 309 ms en la misma página): por eso las medianas.

## Decisiones
1. **Terracota y salvia un 5 % más oscuras para texto chico sobre su tinte** (`--tono-2-texto` y `--tono-3-texto`): con los de la ESPEC, "Ingresar →" y "Ver todas →" daban 4,3:1 y el test de contraste fallaba. Sobre blanco y en los íconos se usan los de la ESPEC tal cual.
2. **El isotipo queda fuera del test de contraste:** los logotipos están exentos y el naranja de Tech claro sobre `--bg` ya daba 2,9:1 en P2.
3. **El botón de Malejo de la barra inferior** muestra la cabeza del dibujo activo, como pide la tanda, sobre el color del estilo (terracota en Institucional, como la referencia). Hasta P2 tenía el isotipo, no la cabeza.
4. **La paleta del header en el celular:** al lado del logo, como pide la tanda (la referencia la pone al lado del ☰). Para que entre a 360 px, con JS el link "Soluciones" del header se oculta debajo de 420 px: la barra inferior ya lo tiene.
5. **El ejemplo de la Cooperativa en el celular** va debajo de los chips (la referencia del celular solo muestra la primera pantalla).
6. **Las familias de fuente de los tokens se declaran en `body`:** las variables de `next/font` viven ahí y, declaradas en `<html>`, se resolvían vacías (Tech perdía Outfit). Quedó anotado en `CLAUDE.md`.
7. **Las clases de las tiras se llaman `tira-*`**, no `sprite-saludo`, para que no quede ningún uso del nombre viejo.
8. **El selector descarga las fuentes del estilo antes de cambiar** (`estilos.ts → fuentes`, `document.fonts.load()` con tope de 1,5 s). Con `display: "optional"` y sin precarga, una fuente que se pide recién al pintar el estilo no entra en esa vista: el cambio en vivo a Institucional mostraba la serif de respaldo hasta recargar. Arreglado después de abrir el PR, antes de seguir con P3-2.

## Pendiente
- **Anime: activado** (es uno de los 3 dibujos del selector y de la bolsa).
- Medir con PageSpeed Insights en el preview de Vercel (ver Rendimiento).
- Accesorios por estilo y easter eggs: tandas siguientes.

## Capturas (`verificacion/p3-1/`)
- Heroes de los 2 estilos a 390 y 1280 px, en claro y oscuro (`<ancho>-home-<estilo>-<tema>.png`), y al lado las pantallas aprobadas renderizadas (`ref-F-*.png`); `lado-a-lado-*.png` las junta.
- `/soluciones` en Institucional a 1280 px y a 390 px con Malejo abierto; el selector a 1280 px; la home sin JS.
- `dibujos-y-poses.png`: los 3 dibujos × 3 poses, al mismo alto.

# Tanda P3-2 · Estilo Aula virtual («Pizarrón»)

Rama `p3-2-aula` desde `p3-1-estilos`, PR con base `p3-1-estilos`. `npm run lint`, `npm test` (237) y `npm run build` en verde, con las mismas rutas `○`/`●` que en P3-1. `verificacion/p3-2/verificar.js`: **todo en orden**.

## Qué se hizo
1. **El estilo.** `aula` disponible en `estilos.ts`: representa `ia` (`plataforma-educativa-con-ia`), arranca en **oscuro** si la persona no eligió tema y suma el campo `dibujoPorDefecto` (`"anime"`): el arranque y el selector lo usan solo si la persona nunca eligió dibujo a mano; los estilos sin el campo siguen con la bolsa de P3-1.
2. **Tokens** de `ESPEC.md` en `estilos.css`: pizarrón (oscuro, con la textura de dos manchas suaves) y pizarra blanca (claro). Forma por tokens: radio de 6 px, tarjetas con borde punteado de 2 px (`--borde-ancho`, `--borde-estilo`, nuevos y también en Tech e Institucional con su valor de siempre) y el marco (`--marco`) como franja de 14 px arriba, en las pestañas del kit y en la hoja de Malejo.
3. **Tipografía:** Caveat y Nunito con `next/font`, `preload: false` y `display: "optional"`, igual que Source Serif. Caveat en titulares, etiquetas, enlaces de texto, el saludo de Malejo, las categorías y las opciones del chat; Nunito en el cuerpo y los botones (`--fuente-cuerpo`, token nuevo). La cursiva nunca baja de 22 px (las etiquetas `.lbl` y los enlaces `.lnk` suben a 22 px en este estilo).
4. **Hero** «Instituto del Sol · Matemática I · Funciones» (avance, clases tildadas, asistente con IA), con "Así se vería tu aula virtual →" a `/soluciones?cat=ia`, el selector rápido en cursiva y el anime en la esquina.
5. **Garabatos** (`client/Garabato.tsx`): trazos SVG que se dibujan con `pathLength` una vez al entrar y quedan quietos con movimiento reducido. "f(idea) = idea + IA" con su subrayado, la flecha "¡mirá!", los subrayados de los títulos de sección (amarillo y rosa), "∑ clientes ✓", "demo en ≈ 72 h ★", la mancha de borrador (solo en oscuro) y, en Soluciones, el óvalo "¡recomendado!". Los textos van en `estilos.ts` y pasan el glosario.
6. **Soluciones y chat:** casilleros dibujados en las categorías (la activa tildada) con el contador entre paréntesis en rosa, planes punteados con título y precio en cursiva, pestañas sobre la madera, la barra del kit en amarillo, el saludo de Malejo en cursiva y las 6 opciones en recuadros punteados de los 3 colores. "Paso 1/2/3" en cursiva grande en "Cómo trabajo".
7. **Selector:** la miniatura de Aula (verde pizarrón con una línea amarilla y una rosa) deja de decir "Próximamente".

## Verificación
- **Recorrido** (Aula × claro/oscuro × 360, 390 y 1280 px, en la home, `/soluciones`, `/servicios/ia`, `/demo`, el 404 y el chat abierto; 36 combinaciones): sin overflow, sin texto bajo AA y **ningún garabato encima de texto, enlaces o botones** (se comparan las cajas del texto real, no la caja de bloque del título; el flotante y la barra inferior, que son `fixed`, no cuentan).
- **Primera pantalla del celular:** los 2 botones y los chips arriba de la barra inferior a 390 × 844 y 360 × 740.
- **Personaje:** entrar a Aula desde el selector sin haber elegido dibujo muestra el anime (y sigue después de recargar); elegir chibi, pasar a Tech y volver a Aula mantiene el chibi.
- **Tema:** sin tema elegido, oscuro; con el claro elegido, la pizarra blanca.
- **Fuentes:** al elegir Aula desde el selector, Caveat y Nunito ya están cargadas cuando se pinta.
- **Contraste de tokens:** `estilos.test.ts` suma Aula en los dos modos (amarillo sobre verde, verde sobre amarillo en los botones, los tres fibrones sobre blanco, el texto secundario) y las pestañas sobre el marco.

## Rendimiento (mismo método que P3-1)
| Página | LCP simulado (mediana de 3) | LCP con throttling real (2) | TBT (mediana) | CLS |
|---|---|---|---|---|
| `/` `main` | 4,33 s | 1,96 s | 243 ms | 0 |
| `/` Aula | 4,53 s (+5 %) | 2,08 s (+6 %) | 106 ms | 0 |
| `/soluciones` `main` | 2,87 s | 1,80 s | 289 ms | 0 |
| `/soluciones` Aula | 3,70 s (+29 %) | 1,81 s (+1 %) | 120 ms | 0 |

TBT y CLS se cumplen. El LCP simulado de `/soluciones` sube por el mismo artefacto que en Institucional (la simulación suma Caveat y Nunito, que el navegador no espera); con throttling real, Aula queda igual que `main`.

## Decisiones
1. **Garabatos de Soluciones con dos excepciones a "SVG con `pathLength`":** el óvalo "¡recomendado!" sí es un trazo animado, pero los casilleros de las categorías son CSS (son estado de la pestaña, no decoración) y no se dibujan al entrar.
2. **La flecha "¡mirá!" baja desde arriba al ejemplo** en lugar de cruzar el texto del hero como en la referencia: la tanda pide que ningún garabato tape texto.
3. **Fuentes sin precarga y `optional`:** una persona que llega a Aula por el selector ya las tiene descargadas; en la vista donde todavía no estén (por ejemplo, un link compartido abierto en otro dispositivo con Aula guardada sin caché), se ve la de respaldo y la siguiente ya usa Caveat.
4. **En la pizarra blanca el naranja de texto chico sobre su tinte va un 5 % más oscuro** (`--tono-2-texto: #b83d0b`): el de la ESPEC daba 4,4:1.

## Capturas (`verificacion/p3-2/`)
Home y `/soluciones` a 390 y 1280 px en claro y oscuro (a 390 con Malejo abierto), las pantallas aprobadas renderizadas (`ref-F-*.png`) y `lado-a-lado-*.png`.

# Tanda P3-3 · Estilo Tienda («Almacén de barrio»)

> **Para que decida Mauro (rendimiento de la home).** La tanda pide renderizar los heroes de todos los estilos disponibles y que el CSS muestre el activo. Con cuatro estilos, la home pesa más (HTML de 127 a 226 kB sin comprimir, la mitad es el payload de React que repite el marcado) y, medido contra `main` en el mismo contenedor, el LCP empeora más del 10 % acordado en estos casos:
> - **Visita tibia** (el camino real: a un estilo se llega por el selector, que ya descargó su hoja y sus fuentes), CPU 4× y red lenta: `main` 368 ms; Tech 428 ms (+16 %), Institucional 484 ms (+32 %), Aula 540 ms (+47 %), Tienda 532 ms (+45 %). En valor absoluto son 60 a 170 ms.
> - **Visita en frío ya en un estilo no original** (no pasa en una primera visita, que siempre es Tech): Tienda 2,33 s contra 1,94 s (+20 %), por su hoja y sus fuentes propias.
> - **Primera visita (Tech, en frío), que es lo que miden PageSpeed Insights y Search Console:** +4 % (2,03 s contra 1,94 s). Cumple.
>
> Lo que ya se hizo para bajarlo está en "Rendimiento". Si hace falta más, las salidas cambian la arquitectura y por eso no las tomé solo: (a) aceptar el costo; (b) mandar los heroes no activos como fragmentos que se cargan al elegir el estilo (la home deja de traer los cuatro, pero un estilo guardado mostraría un instante el hero de Tech, o haría falta una ruta por estilo); (c) sacar de la home el ejemplo de los estilos no activos y dejar solo el H1, los botones y el personaje en el HTML.

Rama `p3-3-tienda` desde `p3-2-aula`, PR con base `p3-2-aula`. `npm run lint`, `npm test` (239) y `npm run build` en verde, con las mismas rutas `○`/`●`. `verificacion/p3-3/verificar.js`: **todo en orden**. La verificación de P3-1 (Tech e Institucional) se volvió a correr sobre este build porque la tanda toca `Needs`, `PlanCard` y la carga del CSS: **todo en orden** también, igual que la de P3-2.

## Qué se hizo
1. **El estilo.** `tienda` disponible en `estilos.ts`: representa `tiendas`, bajada "Toma pedidos.", arranca en **claro** si nunca se eligió tema (el mismo `temaDeEntrada` que ya usaban Institucional y Aula) y `dibujoPorDefecto: "chibi"`. El dibujo pixelado se llama "16-bit" en Tienda y "Pixel" en el resto (`dibujos → nombrePor`; las dos versiones van en el HTML y el CSS muestra la del estilo).
2. **Tokens** de la ESPEC en claro y en «Noche cálida». `--acc` (fondo del botón) y `--acc-text` (texto, íconos y enlaces) ya estaban separados: en oscuro el botón sigue tomate y el texto va en la versión suave (`#F08A5D`, `#8CC9A6`, `#E3B45C`). Forma por tokens: tarjetas de 22 px y borde de 2 px, botones en píldora (`--r-btn: 999px`), sombra plana `0 6px 0` y `0 4px 0` como tokens de sombra, y el toldo (`--toldo-1`, `--toldo-2`, en 22 y 14 px de alto) como rayas con el borde de abajo redondeado.
3. **Tipografía:** Fredoka con `next/font`, `preload: false` y `display: "optional"` (Nunito ya estaba desde P3-2).
4. **Hero** con la barra verde, el toldo (se despliega una vez, `scaleY`), la "IA" en píldora mostaza rotada −3°, "Así se vería tu almacén →" a `/soluciones?cat=tiendas` y el selector rápido en píldoras ("16-bit · Chibi · Anime").
5. **«Almacén Doña Rosa»:** HTML y CSS con íconos SVG inline y la copy en `estilos.ts`; precios de mentira con `fmt()` y el total y la cantidad calculados con los mismos números ($8.300 y 2). Es una ilustración: `role="img"` con el texto alternativo y todo lo de adentro `aria-hidden`, sin botones ni nada tabulable. En el celular va debajo de los dos botones, con las categorías en pastillas.
6. **`EtiquetaPrecio`** (Server Component, sin estado): forma de etiqueta con agujero, chica (home y ejemplo) y grande (planes), `white-space: nowrap` y `max-width: 100%`, "Desde" arriba y aparte. Recibe el texto ya formateado. En Tech, Institucional y Aula es texto común. Se balancea una vez al entrar (−8° → 4° → 0°, 600 ms, escalonado de 60 ms); `SpritesVivos` le pone `data-visto` con un IntersectionObserver, sin envolver tarjetas `.lift`.
7. **Soluciones y chat:** categoría activa con borde tomate, sombra plana y contador; "El más pedido" como sticker tomate rotado 4°; pestañas sobre mostaza clara y la columna del kit con borde inferior troquelado; en el chat, el toldo arriba de la hoja, la burbuja con la punta arriba a la izquierda y las opciones en píldoras de los 3 colores; la barra del kit en tomate; "Cómo trabajo" sobre los tintes con el número en un círculo; "Cambiar" (dibujo) al lado de "Soy Mauro" en el celular.
8. **Selector:** la miniatura de Tienda (crema con rayas tomate y la etiqueta mostaza) deja de decir "Próximamente".

## Verificación
- **Recorrido** (Tienda × claro/oscuro × 360, 390 y 1280 px, en la home, `/soluciones`, `/soluciones?cat=tiendas`, `/servicios/tiendas`, `/demo`, el 404 y el chat abierto; 42 combinaciones): sin overflow, sin texto bajo AA y **ninguna etiqueta de precio más ancha que su tarjeta ni cortada**, "Desde $747.000" incluida.
- **Primera pantalla del celular:** los 2 botones y los chips arriba de la barra inferior a 390 × 844 y 360 × 740; el ejemplo queda abajo.
- **Personaje:** entrar a Tienda desde el selector sin haber elegido dibujo muestra el chibi; elegir anime, pasar a Tech y volver mantiene el anime. El selector rápido dice "16-bit".
- **Tema:** sin tema elegido, claro; con el oscuro elegido, Noche cálida.
- **Ejemplo:** 40 pulsaciones de Tab no entran nunca al almacén; tiene `aria-label` y su contenido es `aria-hidden`.
- **Fuentes:** al elegir Tienda desde el selector, Fredoka y Nunito ya están cargadas.
- **Contraste de tokens:** `estilos.test.ts` suma Tienda en los dos modos, incluidos blanco sobre tomate, verde y ocre (`--surf` sobre los tonos en claro), `#2B2118` sobre la mostaza, el texto secundario y los colores suaves sobre la superficie y los tintes oscuros.

## Rendimiento
**Hojas de estilo separadas (cambio de arquitectura de esta tanda).** Con los cuatro estilos en `estilos.css`, el CSS que bloquea el primer pintado pasó de 13 a 20 kB comprimido y la home de Tech daba +14 % de LCP contra `main` con throttling real (la hoja principal terminaba de bajar 210 ms después). Ahora `estilos.css` tiene solo lo común (5 kB sin comprimir) y cada estilo no original va en `public/agencia/estilos/<id>.css` (8 a 12 kB, unos 3-4 kB comprimidos), con un hash del contenido en la URL. El script inline escribe en el `<head>` solo la hoja del estilo activo; el layout las precarga con prioridad baja (si no, la del estilo activo se pedía recién al terminar la principal, porque un script inline espera a las hojas que tiene adelante) y el selector la descarga antes de cambiar. Además, las islas del selector reciben solo su copy (`selectorCopy`) y no los ejemplos de los heroes.

Lighthouse con throttling real (`devtools`), 4 corridas, home:

| | LCP (mediana) | frente a `main` |
|---|---|---|
| `main` | 1,94 s | — |
| Tech, antes de separar las hojas | 2,21 s | +14 % |
| Tech, con las hojas separadas | 2,03 s | **+4 %** |
| Tienda en frío, con las hojas separadas | 2,33 s | +20 % |

Lighthouse simulado (3 corridas, antes de separar las hojas): home de Tienda 4,52 s (`main` 4,33 s), `/soluciones` 3,54 s (`main` 2,87 s; el mismo artefacto de las fuentes que en P3-1 y P3-2). TBT ≤ 250 ms y CLS 0 en todas las corridas simuladas.

La medición con caché tibia y lo que queda por decidir están arriba de todo.


## Decisiones
1. **El tomate de texto va un 7 % más oscuro en claro** (`--acc-text: #b43c0b`): el `#C2410C` de la ESPEC da 4,3:1 sobre su tinte (por ejemplo, la pestaña activa del menú). El botón sigue `#C2410C`.
2. **En el celular, "Desde" sale de la etiqueta en las tarjetas de categorías:** con dos tarjetas por fila, "Desde $177.000 · …" no entraba y quedaba cortada. La línea de pagos va debajo, fuera de la etiqueta.
3. **El toldo se despliega con una animación CSS** (una vez, al cargar, sin JS de por medio) y no con Framer Motion: está arriba de todo y no hace falta esperar a que entre a la vista.
4. **La pestaña "Estilos" queda a la derecha**, como en P3-1, en tomate (la referencia la dibuja a la izquierda; la tanda pide "la del sistema de P3-1").
5. **Queda afuera, por ser composición nueva en componentes compartidos:** la franja de ícono arriba de cada plan y el título "TU PEDIDO A MAURO" del ticket. El ticket sí tiene el borde troquelado y el resto de la piel.
6. **El cierre "¿Lo charlamos?"** sigue siendo la tarjeta del sistema (con las preguntas frecuentes adentro) y no la banda verde de la referencia: pasarlo a banda cambiaba la estructura de la home.

## Capturas (`verificacion/p3-3/`)
Home y `/soluciones` a 390 y 1280 px en claro y oscuro (a 390 con Malejo abierto), las pantallas aprobadas renderizadas (`ref-F-*.png`) y `lado-a-lado-*.png`.

# Resumen de la cadena P3 (16-11)

| Tanda | PR | Rama → base |
|---|---|---|
| P3-1 · Sistema de estilos, Institucional y el personaje en 3 dibujos | [#10](https://github.com/Malejo01/portfolio-2026/pull/10) | `p3-1-estilos` → `main` |
| P3-2 · Aula virtual | [#11](https://github.com/Malejo01/portfolio-2026/pull/11) | `p3-2-aula` → `p3-1-estilos` |
| P3-3 · Tienda | [#12](https://github.com/Malejo01/portfolio-2026/pull/12) | `p3-3-tienda` → `p3-2-aula` |

Se mergean en orden. Al mergear uno y borrar su rama, GitHub pasa la base del siguiente a `main`. Correcciones hechas en una rama anterior después de pasar a la siguiente (con `git merge` hacia adelante, sin rebase): en P3-1, el selector descarga la fuente del estilo antes de cambiar y se corrigió su informe de rendimiento.

**Pendiente:**
- ~~Decidir el costo de rendimiento de la home~~ (decidido por Mauro el 16-11: se acepta; reglas nuevas en `CLAUDE.md` y en P3-3.1).
- Medir con PageSpeed Insights en el preview (en este contenedor el LCP absoluto no es representativo).
- Tienda: la franja de ícono arriba de cada plan y el "TU PEDIDO A MAURO" del ticket quedaron afuera (hechos en P3-3.1); el cierre como banda verde sigue pendiente (decisión 6 de P3-3).
- Accesorios por estilo, los otros cuatro estilos del plan y los easter eggs: tandas siguientes.

**Capturas para mirar** (cada carpeta tiene `lado-a-lado-*.png` con la pantalla aprobada al lado):
- `docs/agencia/verificacion/p3-1/`: heroes de Tech e Institucional a 390 y 1280 px en claro y oscuro, Soluciones, el selector, la home sin JS y `dibujos-y-poses.png`.
- `docs/agencia/verificacion/p3-2/`: Aula a 390 y 1280 px en claro y oscuro, home y Soluciones (a 390, con Malejo).
- `docs/agencia/verificacion/p3-3/`: Tienda a 390 y 1280 px en claro y oscuro, home y Soluciones (a 390, con Malejo).

# Tanda P3-3.1 · Cierre del sprint P3 (detalles de Tienda, personajes superpuestos y medición real)

Rama `p3-3-1-cierre` desde `main` (`d14cfc1`), PR contra `main`. `npm run lint`, `npm test` (239) y `npm run build` en verde, con la misma tabla de rutas que `main`.

## Qué se hizo
1. **Personajes superpuestos.** `verificacion/p3-3-1/superposicion.js` mide los 4 estilos × 768, 1024, 1280, 1440 y 1920 px × claro y oscuro, en la home con el chat cerrado, el aire entre el personaje del hero (el rectángulo que se ve, recortado por su recuadro) y el botón flotante de Malejo. Con la página arriba de todo, que es el peor caso: al bajar, el hero sube y se aleja del botón. En `main` chocaban **Tienda** (1024, 1280 y 1440 px: −59, −78 y 2 px de aire) y **Aula** (1024 y 1280 px: −67 y −47 px). Tech e Institucional tenían 60 px o más. En los dos estilos el personaje pasa a la **esquina inferior izquierda del ejemplo**, apoyado en su borde y asomando hacia el hueco entre columnas (abajo a la izquierda están el link "Así se vería…" y el selector rápido, así que no cuelga por debajo del ejemplo). Ahora hay 335 px de aire o más en todos los casos, y el script también comprueba que el personaje no tape texto, enlaces ni botones del hero. El botón del chat no se tocó.
2. **Franja con el ícono del plan (Tienda).** `precios.json` suma el campo opcional `icono` (`qr`, `whatsapp` y `bolsa` en los tres planes de `tiendas`; sin él, el ícono de la categoría). `PlanCard` lleva arriba una franja de 96 px con el ícono de 46 px sobre el tinte de la tarjeta. El tinte sale de la posición del plan en su categoría (1.º tomate, 2.º verde, 3.º ocre, como la referencia). La franja se muestra solo por token (`--plan-franja`: `flex` en `tienda.css`, `none` en lo común), es decorativa (`aria-hidden`) y "El más pedido" queda encima. Íconos nuevos en `icons.tsx`: `qr` y `bolsa`, con el trazo de `F-soluciones.html`.
3. **"Tu pedido a Mauro" (Tienda).** Arriba del primer ítem de Tu kit, en Fredoka de 14 px, mayúsculas por CSS, espaciado 0,1em y centrado. Se muestra por token (`--kit-titulo`). En los demás estilos es `display: none`, así que los lectores no lo leen. La copy va en `content/agencia/soluciones.ts → carrito.tituloTicket`.
4. **Speed Insights.** `@vercel/speed-insights` 2.0.0 con `<SpeedInsights />` **solo en el layout de la agencia**. La CSP report-only ya permitía su script y su endpoint (`/_vercel/speed-insights/*`, mismo origen; en desarrollo, `va.vercel-scripts.com`, que ya estaba): solo se actualizó el comentario de `headers.ts`. Se instaló con `--legacy-peer-deps` por un conflicto de peers opcionales (SvelteKit) que no afecta al sitio; `npm ci` y `npm install` con el lockfile nuevo instalan sin errores.
5. **La regla del presupuesto** de Mauro quedó en `CLAUDE.md`, en "Sitio de la agencia".

## Verificación
- **Sin cambios en los otros estilos.** `verificacion/p3-3-1/capturas.js` saca capturas deterministas de página completa: movimiento reducido, entradas forzadas a su estado final, videos en su póster, el flotante oculto y el resaltado del menú limpio. Toma la home y `/soluciones` en los 4 estilos, a 390 y 1280 px, en claro y oscuro. `comparar.py` las compara píxel a píxel contra `main`; el resultado está en `comparacion-con-main.txt`:
  - **Tech e Institucional:** las 16 capturas idénticas;
  - **Aula:** idéntica salvo la home a 1280 px, donde solo cambia el personaje que se movió (`diff-1280-home-aula-oscuro.png`);
  - **Tienda:** cambian la home a 1280 px (el personaje) y `/soluciones` (la franja y el título).

  Antes, dos corridas del mismo build de `main` dieron como mucho 43 píxeles de ruido de antialias en un caso.
- **Tienda**, con `verificacion/p3-3/verificar.js` sobre este build: todo en orden, con la franja incluida. Sin overflow, contraste AA, el ejemplo sin nada tabulable y ninguna etiqueta de precio más ancha que su tarjeta ("Desde $747.000" incluida). Capturas de `/soluciones` a 390 (con la hoja del kit abierta) y 1280 px en los dos modos, al lado de `F-soluciones.html` y `F-soluciones-celular.html`.
- **Superposición:** sin choques en los 4 estilos, los 5 anchos y los 2 temas (`superposicion.json`).

## Presupuesto (`verificacion/p3-3-1/presupuesto.txt`, contra `main` construida al lado)
| Regla | Medición | Resultado |
|---|---|---|
| Primera visita (Tech): LCP como mucho +10 % frente a `main` | Lighthouse con throttling real, 4 corridas: `main` 1,96 s, rama 2,06 s | **+5 %** ✅ |
| Estilo elegido: como mucho +200 ms, con caché tibia | CPU 4× y red lenta, 5 corridas. Frente a `main` en el mismo estilo: Tech +32 ms, Institucional 0, Aula −36 ms, Tienda −28 ms. Frente a `main` en Tech (424 ms): Institucional +88 ms, Aula +96 ms, Tienda +96 ms | ✅ |
| TBT ≤ 250 ms | Lighthouse simulado, medianas: home 178 ms (`main` 245), `/soluciones` 231 ms (`main` 213), `/soluciones` en Tienda 133 ms | ✅ |
| CLS ≤ 0,05 | 0 en todas las corridas | ✅ |

## Pasos manuales para Mauro
1. **Activar Speed Insights** en el panel de Vercel (proyecto → Speed Insights → Enable). Sin eso, `<SpeedInsights />` no manda datos.
2. Mirar el **LCP p75 en celular** en Speed Insights cuando junte datos. La arquitectura de los heroes se revisa solo si pasa de 2,5 s.

## Cierre del sprint P3
**En producción** (PR #10, #11 y #12 mergeados el 16-11, más esta tanda cuando se mergee):
- el sistema de estilos con Tech/IA (siempre el de entrada), Institucional, Aula virtual y Tienda, cada uno con su hero, su piel en todo el sitio, su tema de entrada y su hoja de CSS que se carga solo si está activo;
- el selector de estilos y el selector rápido de personaje;
- el personaje en 3 dibujos × 3 poses, con idle, saludo y festejo;
- en Tienda, `EtiquetaPrecio`, el ejemplo «Almacén Doña Rosa», la franja de los planes y el título del ticket;
- PageSpeed en celular después del merge: 100, LCP 1,1 s;
- Speed Insights listo para medir datos reales.

**Pendiente:**
- Activar Speed Insights (paso manual 1).
- **Garabatos de Aula con movimiento reducido:** el subrayado de un título que todavía no entró a la vista se dibuja al entrar, en vez de estar dibujado desde el principio. Pasa porque `useReducedMotion()` da `null` en el primer render. Es de P3-2; esta tanda no toca Aula.
- **Tienda:** el cierre "¿Lo charlamos?" sigue como la tarjeta del sistema y no como la banda verde de la referencia (decisión 6 de P3-3).
- Los otros cuatro estilos del plan (Personal, Gastronomía, Turismo, Salud), los accesorios por estilo y los easter eggs: tandas siguientes.

**Capturas para mirar** (`docs/agencia/verificacion/p3-3-1/`):
- `lado-a-lado-1280-soluciones-{claro,oscuro}.png` y `lado-a-lado-390-soluciones-{claro,oscuro}.png`: Tienda al lado de la referencia, con la franja y el título;
- `diff-1280-home-aula-oscuro.png` y `diff-1280-home-tienda-claro.png`: lo único que cambió en la home, en rojo;
- `superposicion.json` y `comparacion-con-main.txt`.

# Tanda P3-4 · Recorrido de bienvenida, tema por estilo y caras del personaje

Rama `p3-4-recorrido` desde `main` (`60f3910`), PR contra `main`. El pedido está en `docs/agencia/tanda-p3-4-recorrido-y-ajustes.md`. `npm run lint`, `npm test` (__TESTS__) y `npm run build` están en verde, con la misma tabla de rutas que `main`: todo `○`/`●` salvo los catch-all y `/api/*`.

## Qué se hizo
1. **Tema por estilo.**
   - Cada estilo arranca en su tema: Tech oscuro, Institucional claro, Aula oscuro y Tienda claro (`temaDeEntrada` en `estilos.ts`).
   - Recuerda solo lo que se cambie dentro de ese estilo, en `localStorage["malejo-tema-<estilo>"]`; la clave de otro estilo no cuenta.
   - La lógica es una sola función pura, `resolverTema()` (`lib/agencia/estilo.ts`). El script inline la recibe serializada y la usan también el respaldo del 404 y `elegirEstilo()`, que aplica el tema del destino dentro de la misma View Transition.
   - El toggle escribe la clave del estilo activo y ya no escribe la cookie.
   - La cookie vieja `malejo-theme` pasa una sola vez a `malejo-tema-tech` y se borra. La del portfolio (`theme`) no se toca.
   - 10 tests nuevos en `estilo.test.ts`: la función sola, `arrancar()` con un `document` simulado y el script serializado.
2. **Caras.**
   - `scripts/sprites/config.json` suma la caja `cara` de cada dibujo en el lienzo fuente, con las medidas del pedido, y `limpiar.py` la traduce al lienzo recortado en `sprites.json`. Los negativos son aire.
   - `<CaraMalejo tamano alto? forma pose? />` escala cada dibujo para que su cara llene el recuadro. Tiene el mismo marcado que `Sprite` (3 dibujos, `lazy`, `width`/`height` explícitos), así que el idle y `reproducir()` siguen andando.
   - Reemplaza al avatar del chat (40 y 32 px) y al botón de Malejo de la barra inferior (56 px).
   - **Auditoría de los `overflow-hidden` que recortaban un `Sprite`:**
     - el "Soy Mauro" del hero de Tech (56 × 64) pasa a `CaraMalejo` y sigue saludando al entrar;
     - el retrato de "Quién te va a atender" (80 × 96 y 96 × 112) también pasa a `CaraMalejo`;
     - los recuadros "Soy Mauro" de Institucional, Aula y Tienda en el celular (48–56 × 76) muestran el cuerpo entero apoyado por los pies: no son recortes y quedan igual;
     - el `overflow-hidden` del ejemplo de Institucional, del panel del kit y de la hoja del chat no contiene sprites recortados.
3. **Recorrido de bienvenida.**
   - **Pasos:** 3 (Hablá con Malejo, Armá tu kit, Probá otro estilo), con la copy en `content/agencia/recorrido.ts`.
   - **Objetivos:** los elementos reales con `data-recorrido`. Gana el visible con menor `data-recorrido-prioridad`: la barra inferior en el celular, el encabezado en escritorio y el hero entre 760 y 1023 px.
   - **Cuándo sale solo:** en la home, la primera vez, 4 s después de que el hero esté a la vista y con `requestIdleCallback`. No sale (y queda "saltado") si antes se abre el chat, se toca uno de los 3 botones, se abre el selector o se scrollea más allá del hero. Al terminar queda "visto" y al saltar, "saltado".
   - **"¿Cómo uso la página?":** está en el pie, en el menú del celular y al final del panel de estilos. Lo abre siempre, en cualquier página, sin tocar la marca, y es `.js-only`.
   - **Velo:** el token `--recorrido-velo`, por estilo y en claro y oscuro, es la sombra del hueco. El hueco deja 8 px de margen, toma el radio del objetivo y lleva un borde del color de acción. Una capa transparente encima de todo impide tocar la página, también el objetivo.
   - **Globito:** usa la tarjeta del estilo y `Sprite pose="ok"` de 72 px; en el paso 1 Malejo saluda una vez.
     - En escritorio va del lado con más espacio.
     - En el celular va arriba o abajo, a todo el ancho y sin pisar la barra inferior.
     - Se recalcula al girar, redimensionar y hacer scroll, y lleva el objetivo a la vista si hace falta.
     - Entre pasos se desliza 0,25 s; con movimiento reducido no hay transición.
   - **Accesibilidad:** `role="dialog"` con `aria-labelledby` y `aria-describedby`. El foco va a "Siguiente" y Tab no sale del globito. Esc salta y devuelve el foco. Una región `aria-live="polite"` anuncia "Paso 2 de 3: Armá tu kit".
   - **Rendimiento:** `RecorridoLoader` es liviano y va en el layout. `Recorrido` se baja con `next/dynamic` (`ssr: false`) recién cuando se abre.
   - **Analytics:** `recorrido_inicio` `{origen}`, `recorrido_paso` `{paso}` y `recorrido_fin` `{completo, paso}`.

## Verificación (`docs/agencia/verificacion/p3-4/`)
- **Tema** (`tema.js`, perfiles limpios como en incógnito): 22 de 22.
  - Institucional claro, Aula oscuro y Tienda claro, eligiéndolos y al recargar.
  - Institucional pasado a oscuro → Tech → vuelta: Institucional sigue oscuro y Tech no cambió. Al revés, Tech en claro no toca a Institucional.
  - Con la cookie vieja oscura: Tech oscuro e Institucional claro. Con la clara: Tech claro. En los dos casos la cookie se migra y se borra.
  - El 404 respeta todo esto, también en la primera visita con la cookie vieja.
- **Caras** (`caras.js`, `caras-lamina.py`): `cara-<dibujo>-<recorte>.png` y `caras-comparacion.png`, al lado de `caras-hoy-vs-propuesta.png`. Coincide con la propuesta.
- **Recorrido** (`recorrido.js`): 4 estilos × claro/oscuro × 360/390/768/1280, sin ninguna falla (`recorrido.json`).
  - Sale solo y los 3 pasos encuentran su objetivo, comprobado con lo que hay debajo del hueco.
  - El globito queda entero en la vista, sin tocar el hueco ni la barra inferior.
  - El foco está en "Siguiente".
  - El contraste mínimo de los textos del globito es 5,18 (Tienda); el resto va de 5,99 a 8,94.
  - Al terminar queda "visto" y al recargar no reaparece.
  - El enlace lo reabre sin tocar la marca, Tab no sale y Esc cierra y devuelve el foco al enlace.
  - Con el chat abierto antes, no sale en ningún ancho (marca "saltado").
  - Capturas: `recorrido-<estilo>-<tema>-<ancho>-<paso>.png` (el paso 1 en todas; los 3 pasos a 390 y 1280 px en el tema de entrada de cada estilo).

## Presupuesto (`verificacion/p3-4/presupuesto.txt`, contra `main` construida al lado)
__PRESUPUESTO__

## Decisiones
- **El velo es una sombra**, no un SVG con máscara. Una `box-shadow` de 200vmax alrededor del hueco anima posición, tamaño y radio con Framer sin recalcular un trazado, y el color sale de un token por estilo. Las invariantes del portfolio no aplican a la agencia, que ya usa sombras.
- **Entre 760 y 1023 px el paso 1 señala el "Hablar con Malejo" del hero.** En ese ancho el botón del encabezado está oculto (`lg:inline-flex`) y no hay barra inferior. Es lo único visible, y el recorrido solo sale en la home, donde el hero está.
- **Si un objetivo desaparece entre pasos** (por ejemplo, al girar el teléfono), ese paso se saltea al tocar "Siguiente". El contador sigue contando sobre los pasos que tenían objetivo al abrir.
- **El recorrido no sale si `localStorage` falla** (modo privado estricto): sin dónde guardar la marca, saldría en cada visita. El enlace lo abre igual.

## Pasos manuales para Mauro
1. **Revisar el texto legal.** La sección 7 de Privacidad ("Cookies y almacenamiento local") decía que el sitio guardaba la cookie `malejo-theme`, y eso ya no es así. Ahora dice que las páginas de Malejo no guardan cookies propias (la sección /portfolio guarda dos, idioma y tema) y enumera qué queda en el almacenamiento local (estilo, dibujo, tema de cada estilo y si se vio el recorrido) y en el de sesión (el chat y el kit). La fecha de actualización de Privacidad pasó al 16 de noviembre de 2026.
2. En Vercel Analytics, los eventos nuevos (`recorrido_inicio`, `recorrido_paso`, `recorrido_fin`) aparecen solos. Sirven para ver cuánta gente lo termina y en qué paso lo salta.
