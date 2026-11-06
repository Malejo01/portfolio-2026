# Prompt · construir el sitio de la agencia Malejo en malejo.com.ar

> Pegá este archivo completo como primer mensaje de un agente de Claude Code en la nube, sobre el repo `Malejo01/portfolio-2026`. Está pensado para que trabaje solo, de forma asíncrona, fase por fase, y deje un PR por fase.

---

## 0. Tu rol y la regla de oro

Sos el desarrollador que implementa el sitio de la agencia **Malejo** (la marca de servicios de Mauro Lizárraga, AI Developer en Salta) en la raíz de `malejo.com.ar`, dentro de este repo. El portfolio actual ya se mudó a `/portfolio` y `/portfolio/en` (PR #1) y **no se toca**.

**Regla de oro: el diseño ya está aprobado. Construí exactamente lo que muestran las imágenes y los archivos de `docs/agencia/`. No reinterpretes, no "mejores", no cambies textos, colores, medidas, orden ni comportamiento.** Si algo no está definido, elegí lo más coherente con las capturas y dejalo anotado en la sección "Decisiones para Mauro" del PR. Si algo de las capturas choca con `DISENO.md`, **gana `DISENO.md`** (es más nuevo y explícito); si choca con una regla del repo, avisalo en el PR en vez de resolverlo en silencio.

Antes de escribir código, leé en este orden:
1. `CLAUDE.md` y `AGENTS.md` del repo (Next.js 16: `proxy.ts` en vez de `middleware.ts`, varias root layouts, rutas estáticas, `data-reveal`, etc.). Leé la guía correspondiente en `node_modules/next/dist/docs/` antes de usar una API.
2. `docs/agencia/DISENO.md` completo: tokens, forma, tipografía, cada sección, el flotante de Malejo, islas cliente, movimiento, celular y accesibilidad.
3. Todas las imágenes de `docs/agencia/capturas-diseno/` (índice en §2).
4. `docs/agencia/referencia.html`: abrilo en el navegador. Es la home renderizada desde el diseño aprobado: copiá de ahí los **textos exactos**, la estructura y los valores CSS.
5. `docs/agencia/datos/precios.json`: el catálogo completo.

## 1. Punto de partida

- Base: `main` con los PR **#1** (`feat/portfolio-a-subruta`, portfolio a `/portfolio`) y **#2** (`docs/agencia-handoff`, este handoff) mergeados. Si cuando arranques no están mergeados, creá tu primera rama desde `feat/portfolio-a-subruta` y mergeale `docs/agencia-handoff`; avisalo en el PR.
- Ramas: `agencia/f1-base`, `agencia/f2-home`, `agencia/f3-servicios`, `agencia/f4-malejo`, `agencia/f5-demo`, `agencia/f6-blog`, `agencia/f7-qa`. Cada una sale de la anterior (apilada) y abre un PR hacia `main` (o hacia la rama anterior si esa todavía no se mergeó; decilo en la descripción).
- Commits en español, chicos y descriptivos. PRs en español con: qué se hizo, capturas que se respetaron (nombres de archivo), cómo se verificó, variables nuevas, y **"Decisiones para Mauro"** al final.
- **Nunca** pidas, pegues ni commitees secretos. Las claves las carga Mauro en Vercel. Usá solo `process.env.*` y documentá cada variable en `.env.example`.

### Build en el sandbox
El sandbox no llega a `fonts.googleapis.com`. Para compilar localmente:
```bash
cat > /tmp/font-mock.js <<'EOF'
module.exports = new Proxy({}, { get: (_, url) => {
  const fam = decodeURIComponent(String(url).match(/family=([^:&]+)/)?.[1] || 'Mock').replace(/\+/g, ' ');
  return `@font-face { font-family: '${fam}'; font-style: normal; font-weight: 400; font-display: swap; src: url(https://fonts.gstatic.com/s/mock/v1/mock.woff2) format('woff2'); }`;
}});
EOF
NEXT_FONT_GOOGLE_MOCKED_RESPONSES=/tmp/font-mock.js npx next build --webpack
```
En Vercel compila normal con Turbopack; no cambies `next.config.ts` por esto. `npm run lint` tiene que pasar.

### Comparación visual
Para comparar tu página con las capturas: `npx next start -p 3001` y un Chrome headless (`/usr/bin/google-chrome` con Playwright si está disponible) a **1440×900**, `deviceScaleFactor: 1`, modo oscuro. Sacá la misma captura que la de referencia (por sección, con `locator.screenshot()`) y comparalas a ojo lado a lado. Adjuntá tus capturas en `docs/agencia/verificacion/<fase>/` del PR. Diferencias aceptables: antialiasing y la fuente real vs la del sandbox.

## 2. Índice de imágenes (`docs/agencia/capturas-diseno/`)

Todas a 1440 px de ancho (salvo celular, 390 px). Sufijo `-oscuro` = modo por defecto; `-claro` = modo claro.

| Archivo | Qué muestra | Fase |
|---|---|---|
| `00-home-completa-oscuro.png` / `-claro.png` | La home entera de arriba a abajo | F2 (guía general) |
| `01-menu-oscuro.png` / `-claro.png` | Menú en píldora (sin el botón "Estilo": no va en v1) | F1 |
| `02-hero-oscuro.png` / `-claro.png` | Hero bento con la marca de agua del isotipo | F2 |
| `02-hero-tecleo-a.png`, `-b.png`, `-c.png` | El H1 escribiéndose: a ~1,1 s y ~1,9 s de cargar, y terminado con el cursor `▍` pegado a "IA." | F2 |
| `03-servicios-oscuro.png` / `-claro.png` | 6 tarjetas de servicio en 3×2 | F2 |
| `03-servicios-hover-tarjeta.png` | Estado al pasar el mouse por la 2.ª tarjeta (se eleva 4 px) | F2 |
| `04-como-trabajo-oscuro.png` / `-claro.png` | 4 pasos | F2 |
| `05-precios-oscuro.png` / `-claro.png` | Catálogo: selector de pago, pestañas, pestaña **Webs**, combos, extras y nota legal | F2/F3 |
| `05-precios-pestana-tiendas.png`, `-turnos.png`, `-gestion.png`, `-ia.png`, `-mant.png` | Cada una de las otras 5 pestañas | F2/F3 |
| `05-precios-mercadopago.png` | Con "Mercado Pago +6%" activo (todos los precios ×1,06 redondeados a $100) | F2/F3 |
| `06-proyectos-oscuro.png` / `-claro.png` | AfinIA Jobs (grande), Qué Pinta Salta y Tuki (chicos), MaestrIA (a todo el ancho). En las capturas se ve el póster; en el sitio son videos en loop | F2 |
| `07-sobre-mi-oscuro.png` / `-claro.png` / `-historia-abierta.png` | Bloque "Quién está detrás", cerrado y con la historia desplegada | F2 |
| `08-faq-oscuro.png` / `-claro.png` | Acordeón con la 1.ª pregunta abierta | F2 |
| `09-cierre-oscuro.png` / `-claro.png` | "¿Lo charlamos?" | F2 |
| `10-pie-oscuro.png` / `-claro.png` | Pie de página | F1 |
| `11-flotante-toast.png` | Sprite con la etiqueta CHAT y el toast "¿Querés ver mi portfolio?" | F4 |
| `11-flotante-chat-abierto.png` / `-claro.png` | Ventana del chat con una conversación y una tarjeta de cotización; sprite en pose "pensando" y etiqueta CERRAR | F4 |
| `11-flotante-chat-en-pagina.png` | El chat abierto sobre la página, en contexto | F4 |
| `12-celular-menu-cerrado.png` / `-abierto.png` | Estructura del menú de celular (explorador lateral). **Ojo:** son de una ronda anterior; tomá la estructura y el comportamiento, pero colores, fuentes y radios van con los tokens finales de `DISENO.md` | F1 |

Otros archivos:
- `docs/agencia/capturas/*.webp`: las capturas animadas de cada proyecto (para ver el movimiento).
- `public/agencia/proyectos/<proyecto>.mp4` + `.jpg` (póster): lo que va en el sitio.
- `public/agencia/sprites/malejo-{ok,pensando,bolsillos}.png`: pixel art a 360×820; se muestra a **54×123** con `image-rendering: pixelated`.
- `public/agencia/marca/*.svg`: isotipo y app icon. El componente `MalejoMark` (SVG con `currentColor`) está en `DISENO.md` y en `referencia.html`.

---

## 3. Fases, secciones y componentes

Cada fase termina con: build y lint verdes, comparación visual contra las capturas de esa fase, PR abierto. No arranques la siguiente fase sin abrir el PR de la anterior.

### F1 · Base del sitio de la agencia (`agencia/f1-base`)
**Objetivo:** el tercer árbol `app/(agencia)` con su layout, tokens, tema, menú, pie y páginas legales, sin romper el portfolio.

1. **Root layout `app/(agencia)/layout.tsx`**
   - `<html lang="es">` sin `className` como prop (mismo motivo que en `SiteDocument`), script inline de tema en el `<head>`: lee la cookie `malejo-theme`; si no hay, **oscuro**. Marca también `html.js`.
   - Fuentes con `next/font/google`: Outfit (600, 700, 800), Inter (400–700), JetBrains Mono (500, 600). Variables en `<body>`.
   - `@vercel/analytics` (agregá la dependencia).
   - Metadata propia de la agencia (título "Malejo · Webs y apps potenciadas con IA", descripción con la bajada del hero, `metadataBase`, OG). Favicon: `public/agencia/marca/malejo-app-icon-dark.svg`.
2. **`app/(agencia)/agencia.css`**: los tokens de `DISENO.md` §2 tal cual (`:root` claro y `.dark` oscuro) + `@theme inline` para exponerlos como utilidades de Tailwind (`bg-surf`, `text-muted`, `border-border`, `shadow-card`, etc.). Ningún hex en componentes. Clases utilitarias de forma (`card`, `card-big`, `lift`, `hi`, `btn-p`, `btn-s`) definidas una vez.
3. **`components/agencia/MalejoMark.tsx`** (Server Component, SVG con `currentColor`, prop `size`).
4. **Menú** (`01-menu-*.png`): header sticky con `backdrop-filter`, píldora con isotipo naranja + "Malejo", links (Servicios · Precios · Proyectos · Cómo trabajo · Blog · Portfolio + chip EN → `/portfolio`), `ThemeToggle` (isla cliente: cambia `dark` en `<html>` y la cookie) y "Pedí tu demo" → `/demo`. **Sin botón "Estilo".** El link activo según la sección visible puede quedar para F2.
5. **Menú de celular** (`12-celular-*.png`, `DISENO.md` §8): debajo de 1024 px, botón hamburguesa que abre el explorador lateral (panel desde la izquierda, título "EXPLORADOR · MALEJO", lista con "▸", ítem activo en naranja con fondo `--ic-bg`, separador, "Portfolio" con chip EN, botón "Pedí tu demo" abajo y la línea "Modo oscuro/claro"). Cierra con ✕, `Escape` y al tocar un link; bloquea el scroll del fondo; foco atrapado.
6. **Pie** (`10-pie-*.png`).
7. **Legales**: `/legal/terminos`, `/legal/cambios` (política de cambios: rondas de revisión, cambio menor ≤30 min, mayor se cotiza, garantía 30 días, $10.000 cada 30 min fuera de plan), `/legal/privacidad` (Ley 25.326: responsable, finalidad única de contactar, datos: nombre, WhatsApp, rubro y resumen; retención 12 meses; derechos de acceso, rectificación y supresión con email de contacto `[EMAIL DE CONTACTO]`; mención de inscripción en la AAIP como pendiente). Texto simple con el layout de la agencia; los `[PLACEHOLDERS]` se dejan marcados.
8. **404 de la agencia**: mové el catch-all `app/(es)/[...notFound]` a `app/(agencia)/[...notFound]` con un `not-found.tsx` propio (mismo estilo, links a `/` y `/portfolio`). Verificá que `/portfolio/loquesea` siga dando el 404 del portfolio (agregá `app/(es)/portfolio/[...notFound]` si hace falta) y `/portfolio/en/loquesea` el del inglés.
9. **`CLAUDE.md`**: sumá una sección "Sitio de la agencia" (tercer root layout, tokens propios, que las invariantes del portfolio no aplican ahí y viceversa, lista de islas `"use client"` de la agencia) y actualizá la lista de archivos `"use client"`.
- **Aceptación:** `/legal/*` y una home provisoria (menú + pie) se ven como las capturas en oscuro y claro; el portfolio queda idéntico; todas las rutas `○` salvo los catch-all; el 307 de `/` → `/portfolio` de `next.config.ts` **sigue** hasta F2.

### F2 · Home completa (`agencia/f2-home`)
**Objetivo:** `app/(agencia)/page.tsx` igual a `00-home-completa-*.png`. Copy en `content/agencia/*.ts` tipado (nunca en componentes).

Componentes (Server salvo que diga isla):
1. **`Hero`** (`02-hero-*.png`): grilla `2fr 1fr`, bloque grande con marca de agua del isotipo (420 px, `right:-90px; bottom:-120px`, opacidad .07), etiqueta, H1, bajada original ("Webs, micro-apps y asistentes con IA para tu negocio. Listos en días, con precios publicados."), dos botones; a la derecha 3 tarjetas (Web, Apps, IA).
2. **`Typewriter`** (isla, `02-hero-tecleo-*.png`, `DISENO.md` §7): H1 "Webs y apps" / "potenciadas con **IA.**". Por **palabras** (cada palabra `inline-block` + `white-space: nowrap`, separación `margin-right: .24em`), letras que aparecen enteras con delays de 30–72 ms (aleatorio con semilla fija), +60 ms en puntuación, +40 ms entre palabras, +180 ms entre líneas, arranque a 0,5 s. **Cursor `▍` naranja**: mientras escribe va justo después de la última letra visible (en `02-hero-tecleo-b.png` aparece al final de la línea por una limitación del prototipo en CSS: en el sitio tiene que seguir a la letra) y, al terminar, queda dentro de la última palabra, pegado a "IA.", titilando. `aria-label` con la frase y letras `aria-hidden`. SSR: el HTML del servidor tiene la frase completa (sin JS se lee entera); con reducir movimiento, sin animación y sin cursor.
3. **`Services`** (`03-servicios-*.png`): 6 tarjetas 3×2 (Webs que venden · Catálogos y tiendas · Turnos y reservas · Sistemas para el día a día · IA que atiende por vos · Mantenimiento), cada una con ícono, etiqueta, título, descripción, 3 ítems ✓, "Desde $…" y **"Ver precios →"** que scrollea a `#precios` y **abre esa pestaña** (`ServiceLink`, isla mínima; por ejemplo `#precios?cat=ia` o un evento que escucha `PricingCatalog`). Hover según `03-servicios-hover-tarjeta.png`.
4. **`Steps`** (`04-como-trabajo-*.png`): 4 pasos. El monto de la seña sale de `SENA_MONTO` (default 20000) formateado; nunca escrito a mano.
5. **`PricingCatalog`** (isla; datos como props desde el servidor; `05-precios-*.png`): selector Transferencia / Mercado Pago +6% (`role="radiogroup"`), 6 pestañas (`role="tablist"`, flechas del teclado), intro, grilla de planes (badge RECOMENDADO, variante `hi`, chip de plazo, etiqueta Implementación/Desde/Abono, precio, unidad, abono, `alt`, ítems ✓, prueba "● Como en …", botón "Lo quiero" → `/demo?plan=<id>`), nota de la categoría, **combos** (badge verde "AHORRÁS X%", lista tachada, precio, abono, "Quiero este combo"), **extras** en chips y la nota legal. Comparalo pestaña por pestaña con las 6 capturas y con `05-precios-mercadopago.png`. Por ahora leé los datos de un `content/agencia/pricing.ts` generado desde `precios.json` (F3 lo formaliza).
6. **`Projects`** (`06-proyectos-*.png`): AfinIA Jobs grande a la izquierda, Qué Pinta Salta y Tuki apilados a la derecha, MaestrIA a todo el ancho. Capturas como `<video autoplay muted loop playsinline preload="none" poster=…>` con `public/agencia/proyectos/*.mp4`; con reducir movimiento, solo el póster. Links: afiniajobs.com.ar, quepintasalta.com.ar, tuki-salta.vercel.app, maestria-edu.vercel.app (centralizalos en `lib/links.ts` o en un `content/agencia/links.ts`). "Ver todo en el portfolio →" → `/portfolio#casos`.
7. **`About`** (`07-sobre-mi-*.png`): placeholder de foto + sprite "bolsillos", historia con `<details>`.
8. **`Faq`** (`08-faq-*.png`): 6 preguntas, la primera abierta, con `<details name="faq">` (exclusivo) o una isla mínima.
9. **`Cta`** (`09-cierre-*.png`): "Escribime por WhatsApp" → `https://wa.me/${NEXT_PUBLIC_WHATSAPP}?text=…` (default `5493875813233`); "Agendá una videollamada" → `NEXT_PUBLIC_CALCOM_URL` si existe, si no WhatsApp con texto "Quiero agendar una videollamada".
10. **`Reveal`** (isla): entrada al scroll M1 (§7 de `DISENO.md`), con `data-reveal` en cada elemento animado.
11. **SEO**: JSON-LD `ProfessionalService` (nombre Malejo, Salta, Argentina, área LATAM, `priceRange`), metadata y OG de la home.
12. **Quitá el 307 de `/` → `/portfolio`** de `next.config.ts` (la agencia ya tiene home). Actualizá `CLAUDE.md`.
- **Aceptación:** cada sección comparada con su captura en oscuro y claro, a 1440 px; sin overflow horizontal a 1440, 1024, 768 y 390 px; el resto del comportamiento de celular según `DISENO.md` §8.

### F3 · Datos de precios y `/servicios` (`agencia/f3-servicios`)
1. `content/agencia/pricing.ts`: tipos (`Category`, `Plan`, `Combo`, `Extra`) y datos de `precios.json` con un `id` estable por plan (slug del nombre).
2. `lib/agencia/pricing.ts`: `fmt()` en es-AR, `conRecargo(n, medio)` (+6 % MP, redondeo a $100), `cotizar({ planIds, extras, medio })` → `{ items, implementacion, abonoMensual, total }`. **Única lógica de precios**: la usan la home, `/servicios`, `/cotizador` y el agente.
3. Tests con **Vitest** solo para `lib/agencia/pricing.ts` (agregá el script `test`): redondeos, recargo, combos, planes "desde" y "solo abono".
4. `/servicios` (índice con las 6 categorías, reutiliza las tarjetas de servicio) y `/servicios/[slug]` (estático con `generateStaticParams`; reutiliza el bloque de planes de `PricingCatalog` filtrado a esa categoría + combos relacionados + FAQ de pagos). JSON-LD `Service` + `Offer` por plan.
5. `/cotizador` (isla): elegí planes y extras, medio de pago, ves el total con `cotizar()`, y terminás en "Pedí tu demo" o "Mandame esto por WhatsApp" (resumen precargado). Usá los mismos componentes visuales del catálogo (tarjetas, chips, segmentado).
- **Aceptación:** tests verdes; `/servicios/*` estáticas; los precios de la home, `/servicios` y el cotizador salen de la misma función.

### F4 · Malejo: sprite, toast y chat con IA (`agencia/f4-malejo`)
**UI** (`11-flotante-*.png`, `DISENO.md` §5), isla `MalejoWidget` cargada con `next/dynamic` (`ssr: false`) cuando el navegador está libre:
1. Sprite-botón fijo abajo a la derecha (54×123, etiqueta CHAT/CERRAR, respira 1 px cada 3 s; pose ok → pensando mientras responde).
2. Toast del portfolio: aparece a los 2 s, se va a los 10 s con la barra de tiempo, ✕, una vez por sesión (`sessionStorage`); si la visita viene con `?ref=cv` o de LinkedIn (`document.referrer`), se muestra igual. No aparece con el chat abierto. "Ver portfolio →" a `/portfolio/en`.
3. Ventana de chat 380×600 (`role="dialog"`, foco al abrir, `Escape` cierra), mensajes con streaming, indicador de escritura, tarjetas de herramientas (cotización con precio + "Pedir demo con seña de $X"), chips (Hablar por WhatsApp · Ver otros planes · Ver portfolio), campo + enviar, aviso de privacidad. En celular: hoja a pantalla completa.
4. Consentimiento: cuando el agente propone guardar el contacto, la UI muestra una casilla "Acepto que Mauro me contacte por WhatsApp" + link a `/legal/privacidad`. Sin casilla marcada, no se guarda nada.

**Backend** `app/(agencia)/api/chat/route.ts` (Node runtime, streaming):
1. `@anthropic-ai/sdk`, modelo Claude Haiku (configurable con `MALEJO_MODEL`), `max_tokens` ≤ 600, historial recortado a los últimos ~20 turnos.
2. System prompt corto en voseo (tono de la home: cercano y directo), con el catálogo **generado desde `content/agencia/pricing.ts`** (nunca precios escritos a mano). Reglas: solo habla de los servicios de Malejo; para cualquier precio usa la herramienta `cotizar`; no promete plazos fuera del catálogo; si no sabe, deriva a WhatsApp; no pide datos sensibles.
3. Herramientas (zod en el servidor):
   - `cotizar({ planIds, extras?, medio? })` → `lib/agencia/pricing.ts`
   - `pedir_demo({ planId? })` → devuelve el link a `/demo` (y a Cal.com si existe)
   - `derivar_whatsapp({ resumen })` → link `wa.me` con el resumen
   - `guardar_contacto({ nombre, whatsapp, rubro, resumen })` → **solo insert** en Neon, y **solo** si el request trae `consent: true` firmado por la UI (verificado en el servidor; el modelo no puede activarlo). Regex de teléfono AR. **No hay ninguna herramienta que lea contactos.**
4. Sin `ANTHROPIC_API_KEY`: la ruta responde un mensaje fijo ("Ahora no puedo responder, escribime por WhatsApp") con el botón de WhatsApp; la UI no se rompe.
5. Abuso y costos: tope por IP (hash SHA-256 con sal `MALEJO_SALT`) y global por día en la tabla `chat_usage` (`CHAT_DAILY_LIMIT_IP`, `CHAT_DAILY_LIMIT_TOTAL`); Turnstile invisible antes de `guardar_contacto` si existe `TURNSTILE_SECRET_KEY`; logs sin datos personales; no se guardan transcripciones (solo el resumen del lead).

**Base de datos** (Neon + Drizzle, `lib/db/`): `leads(id, created_at, nombre, whatsapp, rubro, resumen, origen, consent_at, ip_hash)`, `briefs(...)` (para F5), `chat_usage(dia, ip_hash, mensajes)`. Migraciones con `drizzle-kit generate` **commiteadas pero no aplicadas**: dejá en el PR "⚠️ Mauro aplica `npm run db:migrate`". Un cron de Vercel (`vercel.json`) que borre leads no convertidos de más de 12 meses.
- **Aceptación:** con la clave y la base cargadas, cotizar "una landing para mi veterinaria con turnos" devuelve el Combo Web + Turnos con el precio de `cotizar()`; sin clave, el fallback; ningún dato se guarda sin la casilla; build verde.

### F5 · Demo con seña (`agencia/f5-demo`)
`/demo` con el layout y los componentes de la agencia: (1) brief corto (nombre, contacto, rubro, qué necesitás, plan elegido si viene `?plan=`, presupuesto) con Server Action → tabla `briefs` + aviso por email con Resend si hay `RESEND_API_KEY` (si no, solo base); (2) pago de la seña: botón a `NEXT_PUBLIC_SENA_URL` con el monto de `SENA_MONTO` ("se descuenta del total"); si la variable falta, alias de transferencia `SENA_ALIAS` o WhatsApp; (3) agenda: embed de Cal.com si existe `NEXT_PUBLIC_CALCOM_URL`, si no WhatsApp. Estado de éxito claro. Validación con zod y mensajes de error accesibles.

### F6 · Blog (`agencia/f6-blog`)
`/blog` y `/blog/[slug]` en MDX (`@next/mdx` o lectura de `content/agencia/blog/*.mdx` con `generateStaticParams`), estáticos, con el estilo de la agencia (tarjetas `card`, tipografía de `DISENO.md`). Frontmatter: título, fecha, resumen, etiquetas (avances de proyectos / novedades de IA). Un primer post corto: "Cómo cotizo: precios publicados y sin letra chica" usando datos de `pricing.ts`. RSS opcional.

### F7 · QA y cierre (`agencia/f7-qa`)
1. Lighthouse en `/`, `/servicios`, `/demo` (móvil y escritorio): performance ≥ 90, accesibilidad ≥ 95, SEO ≥ 95. Video `preload="none"`, imágenes con tamaño, el widget fuera del primer render.
2. Accesibilidad: teclado completo (menú, explorador, pestañas, selector, chat), contraste AA en los dos modos, foco visible, `prefers-reduced-motion`.
3. Responsive: 390, 768, 1024, 1440 px sin overflow; capturas en `docs/agencia/verificacion/f7/`.
4. Sitemap y robots con las rutas de la agencia + las del portfolio; canonical de cada página.
5. `docs/agencia/INFORME.md`: qué se hizo por fase, qué quedó pendiente y la lista consolidada de "Decisiones para Mauro".

---

## 4. Variables de entorno (documentalas en `.env.example`, nunca valores reales)
| Variable | Uso | Valor por defecto / nota |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP` | `wa.me` | `5493875813233` |
| `NEXT_PUBLIC_CALCOM_URL` | Agenda | vacío (Mauro todavía no tiene cuenta) → WhatsApp |
| `NEXT_PUBLIC_SENA_URL` | Link de pago de la seña | lo carga Mauro en Vercel |
| `SENA_MONTO` | Monto de la seña | `20000` |
| `SENA_ALIAS` | Alias para transferencia | opcional |
| `ANTHROPIC_API_KEY` | Chat de Malejo | **la carga Mauro en Vercel**; nunca en el repo |
| `MALEJO_MODEL` | Modelo del chat | Claude Haiku |
| `MALEJO_SALT` | Hash de IP | lo genera Mauro |
| `CHAT_DAILY_LIMIT_IP` / `CHAT_DAILY_LIMIT_TOTAL` | Topes | `30` / `500` |
| `DATABASE_URL` | Neon | lo carga Mauro |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO` | Aviso de briefs | opcional |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Anti-spam | opcional |

## 5. Lo que NO tenés que hacer
- No toques el diseño ni la copy del portfolio (`app/(es)`, `app/(en)`, `components/{sections,pages,case-study,ui,layout}`), salvo lo indicado en F1 para el 404.
- No agregues el botón "Estilo" ni otros estilos (Sobrio, Brillante, Didáctico): vienen después.
- No uses otra librería de animación que Framer Motion, ni otra de estilos que Tailwind v4.
- No vuelvas dinámicas las páginas (`cookies()`/`headers()` en layouts o pages).
- No inventes precios, plazos ni textos: todo sale de `precios.json`, `referencia.html` y `DISENO.md`.
- No menciones a la Municipalidad ni a otros bots municipales en la copy de Tuki: es "Asistente de trámites que responde con fuentes oficiales. Concebido en NOA Innova 2026."
- No apliques migraciones en producción ni crees recursos pagos.

## 6. Cómo reportar
En cada PR: resumen, lista de capturas de referencia respetadas, capturas propias en `docs/agencia/verificacion/<fase>/`, cómo probarlo en la vista previa de Vercel (links exactos, oscuro y claro, celular y escritorio), variables nuevas y **"Decisiones para Mauro"**. Si te bloqueás (falta una variable, una decisión de diseño no cubierta), dejá la parte bloqueada con fallback, anotala y seguí con la fase siguiente.
