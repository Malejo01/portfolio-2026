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
