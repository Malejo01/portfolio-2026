# Sitio de la agencia Malejo · handoff de diseño (estilo Moderno v1.1)

Este documento y `referencia.html` son **la fuente de verdad** para construir la home de la agencia en `app/(agencia)`. El diseño está aprobado: se implementa tal cual, sin reinterpretarlo. Si algo de acá choca con una regla del repo, avisá la discrepancia en vez de resolverla en silencio.

> **Tanda R2 (9-11-2026).** Mauro aprobó la home corta de la auditoría (`auditoria-ux-2026-11-08.md` §6). Este documento ya describe **lo vigente**: orden de la home, menú, hero, "¿Qué necesitás?", "Cómo trabajo" en 5 pasos, "Quién te va a atender", cierre, pie, `/precios` y el flotante sin toast. La piel visual (tokens, forma, tipografía, movimiento) no cambió. `referencia.html` sigue sirviendo para medidas y piezas, pero **su orden de secciones y su copy son históricos**: ante una diferencia, gana este documento.

| Archivo | Qué es |
|---|---|
| `docs/agencia/capturas-diseno/*.png` | **39 capturas** de cada sección y estado, en oscuro y claro (índice en `PROMPT.md` §2). |
| `docs/agencia/PROMPT.md` | El prompt para el agente que construye el sitio, fase por fase. |
| `docs/agencia/referencia.html` | La home completa renderizada en estático (modo oscuro, pestaña "Webs", chat cerrado). Abrila en el navegador y copiá medidas, textos y estructura de ahí. |
| `docs/agencia/datos/precios.json` | Catálogo completo: 6 categorías, planes, combos y extras, en números (sin formatear). |
| `docs/agencia/capturas/*.webp` | Capturas animadas usadas por la referencia. En el sitio van los MP4 de `public/agencia/proyectos/`. |
| `public/agencia/` | Assets finales: `sprites/` (pixel art 360×820, se muestra a 54×123 con `image-rendering: pixelated`), `proyectos/` (MP4 + póster JPG), `marca/` (isotipo y app icon en SVG). |

Diseño original (canvas, con todas las rondas): «Malejo — Home estilo Moderno» en Claude Design, tablero `Home-Moderno-v1-1`. Decisiones por ronda: `claude/malejo-moderno-decisiones.md` en el proyecto de Claude.

---

## 1. Dónde va en el repo

```
app/(agencia)/                 root layout NUEVO (tercer árbol, como (es) y (en))
  layout.tsx                   <html lang="es">, fuentes, script de tema, analytics
  agencia.css                  tokens de abajo + @theme inline para Tailwind
  page.tsx                     home (5 líneas, como las demás)
components/agencia/            Server Components de las secciones
components/agencia/client/     las únicas islas "use client" (ver §6)
content/agencia/               copy y datos tipados (pricing.ts sale de datos/precios.json)
lib/agencia/pricing.ts         fmt(), recargo de Mercado Pago, cotizar()
```

- El sistema de diseño de la agencia es **independiente del portfolio**. Las invariantes del portfolio (verde `#43613C`, sin `box-shadow`, hairlines de 0,5 px) **no aplican** acá: la agencia usa sombras suaves (estilo F2). Y al revés: nada de la agencia entra a `app/(es)` ni a `app/(en)`.
- Mismo patrón que el resto del repo: Server Components por defecto, copy en el servidor, rutas estáticas (`○`), tokens como variables CSS expuestas con `@theme inline` y **ningún hex en componentes**.

## 2. Tokens (`app/(agencia)/agencia.css`)

Oscuro es el modo por defecto. La clase `dark` en `<html>` la escribe un script inline en el `<head>` (cookie `malejo-theme` y, si no hay, **oscuro**; no se usa `prefers-color-scheme` para el default).

```css
:root {                         /* claro */
  --bg: #F7F6F3;  --surf: #FFFFFF;  --surf-2: #F1EFEA;
  --border: #E4E2DC;  --border-2: #D6D3CB;  --border-h: #C9C5BB;  --hl: #E4E2DC;
  --text: #121318;  --muted: #565A64;
  --acc: #FF5A1F;  --acc-ink: #0A0B0F;  --acc-text: #B23A0C;  --ic-bg: #FFE6DA;  --ok: #16A34A;
  --user-text: #7A2A0B;
  --shadow: 0 14px 32px rgba(18,19,24,.07);  --shadow-h: 0 20px 40px rgba(18,19,24,.11);
  --hi-b: #FFB899;  --hi-t: #FF8A5C;  --hi-s: 0 20px 48px rgba(255,90,31,.16);
  --mid-bg: rgba(255,90,31,.06);
  --mock-bg: radial-gradient(120% 90% at 80% 0%, #FFE6DA 0%, #F1EFEA 60%);
  --nav-bg: rgba(247,246,243,.8);
}
.dark {                         /* oscuro (default) */
  --bg: #0A0B0F;  --surf: #12141A;  --surf-2: #171A21;
  --border: #23262F;  --border-2: #2E323C;  --border-h: #3A3F4B;  --hl: #343844;
  --text: #EDEDEF;  --muted: #A1A6AF;
  --acc-text: #FF8A5C;  --ic-bg: #2A1810;  --ok: #3DDC84;  --user-text: #FFD9C8;
  --shadow: 0 18px 40px rgba(0,0,0,.45);  --shadow-h: 0 24px 48px rgba(0,0,0,.55);
  --hi-b: #5A2A16;  --hi-t: #8A3A18;  --hi-s: 0 24px 56px rgba(255,90,31,.16), 0 18px 40px rgba(0,0,0,.5);
  --mock-bg: radial-gradient(120% 90% at 80% 0%, #1E1410 0%, #0E1014 60%);
  --nav-bg: rgba(10,11,15,.72);
}
```
- Botón naranja: fondo `--acc`, texto `--acc-ink` en los dos modos (contraste AA).
- Texto naranja sobre fondo (etiquetas, links): `--acc-text`, nunca `--acc`.

### Forma (F2 · relieve suave)
| Pieza | Radio | Borde | Sombra |
|---|---|---|---|
| Bloque grande (hero, tabla, cierre, proyecto destacado) | 28 px | 1 px `--border`, borde superior `--hl` | `--shadow` |
| Tarjeta | 22 px | igual | `--shadow` |
| Tarjeta al pasar (`.lift`) | — | `--border-h` | `--shadow-h` + `translateY(-4px)`, 200 ms |
| Destacada (`.hi`: plan recomendado, cotización, combo central, cierre) | — | `--hi-b`, superior `--hi-t` | `--hi-s` |
| Botón / menú / pestañas | 16 px (botón chico 14 px) | primario sin borde; secundario 1 px `--border-2` | primario `0 8px 24px rgba(255,90,31,.28)`; al tocar `translateY(2px)` y `0 2px 8px …` |
| Ícono | 12 px, caja 44×44, fondo `--ic-bg`, trazo `--acc-text` | — | — |

## 3. Tipografía
`next/font/google`: **Outfit** 600/700/800 (títulos y logotipo) · **Inter** 400–700 (texto y botones) · **JetBrains Mono** 500/600 (etiquetas).

| Uso | Fuente | Tamaño | Notas |
|---|---|---|---|
| H1 hero | Outfit 800 | 68 px / 1.02 | tracking −0,03em, dos líneas: "Webs y apps" / "potenciadas con **IA.**" |
| H2 de sección | Outfit 800 | 40 px / 1.05 | tracking −0,02em |
| Título de tarjeta | Outfit 800 | 20–24 px | |
| Precio | Outfit 800 | 34 px (plan) · 28 px (combo) | |
| Párrafo | Inter 400 | 15–19 px / 1.5–1.6 | color `--muted` |
| Etiqueta (`.lbl`) | JetBrains Mono 500 | 12 px (10–11 en tarjetas) | MAYÚSCULAS, tracking 0,08em; `.lbl.o` = `--acc-text` |

## 4. Layout
- Contenedor: `max-width: 1240px`, padding lateral 32 px. Secciones: `padding-top: 96px`; cierre con `padding-bottom: 96px`.
- Orden de la home (R2): **Menú → Hero → ¿Qué necesitás? → Cómo trabajo → Quién te va a atender → Cierre (con 3 preguntas) → Pie** + flotante (sprite y chat). Objetivo medido: ≤ 3,5 pantallas en escritorio (1440 × 900) y ≤ 5,5 en celular (390 × 844).
- Secciones: `padding-top` 64 px (56 en celular); cierre con `padding-bottom` 80 px.
- El catálogo completo (pestañas, combos, extras, medio de pago) vive en **`/precios`**, no en la home. La home deja un ancla `id="precios"` junto a "Ver todos los precios →" para no romper los `/#precios` compartidos.

### Menú (sticky)
`header` sticky arriba, padding 16 px 0, fondo `--nav-bg` con `backdrop-filter: blur(12px)`. Adentro, una tarjeta-píldora (radio 18, padding 8/8/8/22): isotipo naranja 30 px + "Malejo" (Outfit 800, 22 px) · links **Soluciones** (`/servicios`) · **Precios** (`/precios`) · Cómo trabajo · Proyectos · Blog (el activo con fondo `--ic-bg` y texto `--acc-text`; cada página marca el suyo) · botón de tema 44×44 (sol en oscuro, luna en claro) · **"Hablá con Malejo"** (botón chico, abre el chat). El portfolio **no** va en el menú: está en el pie como "Mi CV (en inglés)".
- En celular: logo · botón de WhatsApp 44×44 · ☰.
- El botón **"Estilo"** de la referencia **no va en v1** (vuelve cuando existan Sobrio, Brillante y Didáctico).

### Hero
Grilla `2fr 1fr`, gap 20, alto mínimo 560.
- Izquierda: bloque grande, padding 56, contenido centrado vertical, gap 24. Marca de agua: isotipo de 420 px en `right:-90px; bottom:-120px`, color `--acc`, opacidad .07, trazo 3,2, `pointer-events:none`.
  - Etiqueta: "Mauro Lizárraga · Salta, Argentina".
  - H1 tecleado (§7), **sin cambios**: "Webs y apps potenciadas con **IA.**".
  - Bajada: "Webs, sistemas y asistentes con IA para tu negocio. Listos en días, con precios publicados." (19 px, máx. 28em).
  - Botones: "Contame qué necesitás" (primario, **abre el chat de Malejo**; sin JS, WhatsApp) y "Escribime por WhatsApp" (secundario).
- Derecha: 3 tarjetas-garantía apiladas (gap 16), con ✓ en caja `.ic`: "Precios publicados" · "Ves tu demo antes de pagar el total" · "50% al aprobar, 50% al recibir". En celular van en lista (no en carrusel), compactas. Alto mínimo del bloque: 480 px.

### ¿Qué necesitás? (antes "Servicios")
Etiqueta "¿Qué necesitás?" + H2 "Elegí lo que le pasa a tu negocio". **6 baldosas** `card lift` (3 columnas en escritorio, **2 en celular**, gap 20/12): ícono · el problema como título (link a `/servicios/[slug]` que cubre toda la tarjeta) · una línea · pie con borde superior: "Desde **$…** →" y el link chico "Preguntale a Malejo" (abre el chat con ese tema). Sin lista de ítems. Debajo: "¿Algo más grande? Proyectos a medida →" y "Ver todos los precios →". Las mismas baldosas arman `/servicios`.

### Cómo trabajo
H2 "Primero ves tu demo, después decidís" + bajada sobre la seña. **5 pasos** numerados: Me contás (charla gratis) · Seña de $X (se descuenta) · Demo en 72 h · La vemos juntos (20 min) · **50% y 50%**. En escritorio, 5 tarjetas en fila; en celular, **una sola tarjeta** con la lista numerada. Debajo, "Pedí tu demo →". **El monto de la seña sale de configuración** (`SENA_MONTO`, hoy $20.000), nunca escrito en la copy.

### Precios (estilo catálogo) — página `/precios`
- Desde R2 vive en `/precios` (H1), no en la home.
- Encabezado a dos columnas: H2 "Todo con precio publicado" + bajada; a la derecha, **selector de medio de pago** (`role="radiogroup"`): "Transferencia" | "Mercado Pago +6%". El activo va en naranja con halo; cambiarlo **recalcula todos los precios** (×1,06, redondeado a $100).
- **Pestañas** (`role="tablist"`) dentro de una tarjeta con padding 6 y radio 20, con nombre de problema: Que te encuentren · Vender por internet · Turnos y reservas · Ordenar tu negocio · Atender 24 h con IA · Que siga funcionando · Proyectos a medida. Activa: fondo `--ic-bg`, texto `--acc-text`. **En celular** (< 640 px) las pestañas se reemplazan por un `<select>` nativo: las 7 no entraban y no se notaba que había más.
- Debajo, la introducción de la categoría (`intro`) y la grilla de planes (3 columnas, gap 20). Tarjeta de plan (padding 26, gap 16):
  - Badge "RECOMENDADO" (píldora naranja arriba a la izquierda, `top:-12px`) solo en el plan con `rec`. Ese plan usa la variante `.hi` y su botón es primario.
  - Nombre (20 px) + chip de plazo "⏱ 5 a 7 días" y, debajo, **"para quién es"** en 13 px gris.
  - Etiqueta "Pago único" / "Desde" / "Cuota mensual" · precio 34 px · unidad ("por cada tarea automatizada", "/mes"; "pago único" no se repite). Si tiene cuota: "+ **$X** por mes (incluye que siga funcionando)". La "otra forma de pago" (`alt`) **ya no va en la tarjeta**.
  - Ítems con ✓ · al pie, la prueba ("● Como en Tuki") y el botón "Lo quiero" (44 px de alto).
- Nota de la categoría (`note`) en 13 px y, si hay, "Otras formas de pago" debajo.
- **Combos**: etiqueta + H3 "Juntá soluciones y ahorrá" · 4 tarjetas (el segundo en `.hi`): badge verde "AHORRÁS X%" arriba a la derecha, nombre, para quién es, qué incluye, precio de lista tachado, precio del combo, cuota mensual y "Quiero este combo".
- **Extras**: tarjeta con la etiqueta "Extras" y chips "Nombre **$precio**".
- Pie legal en 13 px: vigencia, primer año online y garantía incluidos, **50% al aprobar la demo y 50% en la entrega** (ya no hay "3 pagos sin recargo"), lo que cobran WhatsApp y el servicio de IA aparte, link "¿No ves lo tuyo? Contame qué necesitás".
- Datos: `docs/agencia/datos/precios.json` → `content/agencia/pricing.ts` tipado. **Un solo origen**: la sección de precios, `/servicios/[slug]`, el cotizador y el agente Malejo leen de ahí.

### Quién te va a atender (une Proyectos y Sobre mí)
Conserva los `id` `#proyectos` y `#sobre-mi`. Etiqueta con isotipo de 18 px "Quién te va a atender". Grilla `1fr 2.1fr` (una columna en celular):
1. Bloque grande: **foto** de Mauro (si existe `public/agencia/marca/mauro.jpg`, se resuelve en el build) o, mientras no esté, **solo el sprite** "bolsillos" en una caja `--ic-bg` de radio 22 — **sin el recuadro punteado ni "Foto profesional"**. H2 "Soy Mauro, y te atiendo yo." y dos líneas (profe de matemática; Accenture y negocios de Salta). El H2 viejo "De profe de matemática a AI Developer." y la historia en `<details>` salieron.
2. "Proyectos propios que ya están funcionando": 3 tarjetas `card lift` (Qué Pinta Salta, Tuki, AfinIA Jobs) con la captura (relación 960/439, MP4 sobre póster; el video no suma alto), el nombre como etiqueta, **el problema que resuelve** como título y "Se parece a: <plan>" con link a la solución. **Sin etiquetas de tecnología.** En celular, carrusel horizontal. Debajo, "Ver más proyectos →" a `/portfolio#casos`.

### Cierre, FAQ y pie
- **FAQ**: el FAQ largo salió de la home. Cada solución tiene el suyo (máx. 920 px, tarjetas, la primera abierta, signo +/− en caja de 32 px con fondo `--ic-bg`). En la home quedan 3 preguntas compactas dentro del cierre (cerradas, en fila de 3 en escritorio).
- **Cierre**: bloque grande `.hi` con fondo `radial-gradient(80% 120% at 100% 0%, var(--ic-bg) 0%, var(--surf) 55%)`, grilla `1.4fr 1fr`: isotipo de 48 px (oculto en celular), etiqueta "Empecemos", H2 52 px "¿Lo charlamos?", bajada; a la derecha **"Contame qué necesitás"** (primario, 56 px de alto, abre el chat), "Escribime por WhatsApp" y "Agendá una videollamada" (secundarios). Debajo, a todo el ancho, las 3 preguntas.
- **Pie**: borde superior, grilla `1.4fr repeat(3, 1fr)` (2 columnas en celular): isotipo + "Malejo" y "Desarrollado y gestionado por Mauro Lizárraga · Salta, Argentina." · Agencia (Soluciones, Precios, Cotizador, Proyectos, Blog) · Mauro (Quién soy, **Mi CV (en inglés)**) · Legal (Términos y política de cambios, Privacidad y datos personales). Links de 44 px de alto en celular.

### Página de cada solución (`/servicios/[slug]`)
Plantilla única (auditoría §6.2): volver · etiqueta de la categoría · H1 con el problema · bajada · "Para quién es" · 3 beneficios en tarjetas con ✓ · **"Lo que te recomiendo"**: el plan recomendado (`.hi`) junto a los combos que lo incluyen y "Ver los otros N planes" en `<details>` (sin JS) · un proyecto parecido (póster + problema + qué demuestra) · "Cómo se paga" (50/50, Mercado Pago, cuota mensual, lo que se paga aparte, otras formas de pago) · preguntas propias · cierre `.hi` con el chat (primario), "Pedí tu demo" y WhatsApp. En **Proyectos a medida**: los 3 pasos en vez de planes, pago por etapas, sin demo de 72 h, sin cotizador y sin "la página es tuya".

## 5. Flotante: sprite, toast y chat de Malejo
Contenedor `position: fixed; right: 28px; bottom: 0; z-index: 60`, flex alineado abajo, gap 12.
- **Sprite = botón** (`aria-label="Abrir chat con Malejo"`, `aria-expanded`): etiqueta naranja "CHAT" (mono 10 px, pasa a "CERRAR" con el chat abierto) sobre el pixel art de 54×123. Pose **ok** cerrado; **pensando** con el chat abierto mientras responde. Respira 1 px cada 3 s.
- **En celular** (< 640 px) el botón es compacto: **solo la cabeza del sprite** en una caja de 56 × 64 con fondo `--ic-bg`, radio 18 y borde `--border`, a 12 px del borde inferior y derecho, para no tapar tarjetas (auditoría P1-7).
- **Malejo es el asesor principal** (R2): cualquier botón "Contame qué necesitás", "Hablá con Malejo" o "Preguntale a Malejo" abre el chat con el evento `malejo:abrir` (con un tema opcional, que sale ya enviado). Sin JS o si el widget no carga, esos botones son links a WhatsApp.
- **Toast del portfolio: apagado en el sitio de la agencia** (R2). El portfolio está en el pie como "Mi CV (en inglés)".
- **Ventana de chat** (`role="dialog"`), 380×600, radio 24, al lado del sprite, entra con `opacity` + `scale .96→1` en 220 ms desde abajo a la derecha:
  - Encabezado: avatar 40 px (sprite recortado sobre `--ic-bg`), "Malejo" + punto verde, "Responde al instante · Lo supervisa Mauro", ✕.
  - Mensajes: bot con burbuja `--surf-2` y borde (radio 16/16/16/6) y avatar 32 px; usuario con fondo `--ic-bg` y texto `--user-text` (radio 16/16/6/16). Las respuestas de herramientas son tarjetas `.hi` (cotización: etiqueta, nombre, precio, abono, botón "Pedir demo con seña de $X").
  - Saludo: "Hola, soy Malejo, el asistente de Mauro. Contame qué te pasa en tu negocio y te digo qué te conviene y cuánto sale."
  - Abajo: **chips por problema** mientras no hay mensajes del usuario (Que me encuentren en Google · Vender por WhatsApp o internet · Que saquen turno solos · Ordenar stock y pedidos · Responder las 24 h · No sé qué necesito · Hablar con Mauro); después queda solo "Hablar con Mauro" (WhatsApp con la ficha). Campo hundido + botón enviar 44×44 y el aviso "Si me dejás tu nombre y WhatsApp, los uso solo para contactarte. Privacidad".
  - En celular: hoja a pantalla completa.

## 6. Islas cliente (lo único con `"use client"`)
| Componente | Por qué |
|---|---|
| `ThemeToggle` | cambia la clase `dark` y la cookie |
| `Typewriter` | anima el H1 |
| `PricingCatalog` | pestaña activa + medio de pago (los datos llegan como props desde el servidor) |
| `AbrirChat` | botón que abre el chat (`malejo:abrir`); sin JS es un link a WhatsApp |
| `MalejoWidget` | sprite y chat; se carga con `next/dynamic` (`ssr: false`) cuando el navegador está libre, o antes si alguien pide abrirlo |
| `Reveal` | entrada al scroll |
FAQ e historia: `<details>`, sin JS.

## 7. Movimiento (M1)
| Qué | Cómo |
|---|---|
| Entrada al scroll | `opacity 0→1`, `y 12→0`, 400 ms, `easeOut`, `staggerChildren: .06`, `viewport={{ once: true, amount: 0.2 }}`. Todo lo animado lleva `data-reveal` (regla del repo). |
| Tarjeta al pasar | `y −4` + sombra `--shadow-h`, 200 ms (CSS) |
| Botón al tocar | `y +2`, 120 ms (`:active` o `whileTap`) |
| Chat | `opacity` + `scale .96→1`, 220 ms, origen abajo a la derecha |
| **H1 tecleado** | Una vez al cargar. Va **por palabras** (cada palabra en un `inline-block` con `white-space: nowrap`, separadas por `margin-right: .24em`; así no se pierden los espacios). Dentro de cada palabra, cada letra aparece entera a su tiempo: 30–72 ms por letra con ritmo irregular (aleatorio con semilla fija), +60 ms en comas y puntos, +40 ms entre palabras, +180 ms entre líneas, arranca a los 0,5 s (~2,4 s en total). El **cursor naranja `▍`** sigue a la última letra visible mientras escribe (sólido) y al terminar queda dentro de la última palabra, pegado a "IA.", titilando (0,9 s, `steps(1)`). `aria-label` con la frase completa y las letras `aria-hidden`. |
| Reducir movimiento | `useReducedMotion()`: todo aparece en su estado final, H1 completo y sin cursor, videos en póster |

## 8. Celular (no hay diseño aparte: adaptar con estas reglas)
- `< 1024px`: hero en una columna (las 3 garantías debajo, en lista), baldosas y planes en 2 columnas, combos en 2.
- `< 640px`: las baldosas de "¿Qué necesitás?" **siguen en 2 columnas**; lo demás en 1 columna; pestañas de precios → `<select>`; H1 a 44 px; padding de bloques 20–24.
- Menú: botón hamburguesa → **menú lateral** (título "Menú"): panel desde la izquierda con la lista de secciones con "▸", la activa en naranja, y "Hablá con Malejo" abajo. Al lado del ☰, un botón de WhatsApp de 44 × 44.
- Chat: hoja completa; el botón compacto (cabeza del sprite) se mantiene abajo a la derecha.

## 9. Accesibilidad
Pestañas con `role="tab"`/`aria-selected` y flechas del teclado; medio de pago con `role="radiogroup"`/`aria-checked`; chat con `role="dialog"`, foco al abrir y `Escape` para cerrar; foco visible `outline: 2px solid var(--acc-text); outline-offset: 3px`; alt descriptivo en capturas y sprites; objetivos táctiles de 44 px; contraste AA en los dos modos.

## 10. Diferencias entre el canvas y el sitio real
- En el canvas la página scrollea dentro de una ventana de 900 px para simular el flotante; en el sitio es `position: fixed` y la página scrollea normal.
- La entrada al scroll del canvas usa `animation-timeline: view()` y el toast un keyframe; en el sitio van con Framer Motion y temporizadores.
- La referencia muestra solo la pestaña "Webs" y el chat cerrado; el resto de los estados está descripto acá.
