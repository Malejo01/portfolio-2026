# Sitio de la agencia Malejo · handoff de diseño (estilo Moderno v1.1)

Este documento y `referencia.html` son **la fuente de verdad** para construir la home de la agencia en `app/(agencia)`. El diseño está aprobado: se implementa tal cual, sin reinterpretarlo. Si algo de acá choca con una regla del repo, avisá la discrepancia en vez de resolverla en silencio.

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
- Orden de la home: **Menú → Hero → Servicios → Cómo trabajo → Precios → Proyectos → Sobre mí → FAQ → Cierre → Pie** + flotante (sprite, toast y chat).

### Menú (sticky)
`header` sticky arriba, padding 16 px 0, fondo `--nav-bg` con `backdrop-filter: blur(12px)`. Adentro, una tarjeta-píldora (radio 18, padding 8/8/8/22): isotipo naranja 30 px + "Malejo" (Outfit 800, 22 px) · links (Servicios activo con fondo `--ic-bg` y texto `--acc-text`, Precios, Proyectos, Cómo trabajo, Blog, Portfolio + chip "EN") · botón de tema 44×44 (sol en oscuro, luna en claro) · "Pedí tu demo" (botón chico).
- El botón **"Estilo"** de la referencia **no va en v1** (vuelve cuando existan Sobrio, Brillante y Didáctico).

### Hero
Grilla `2fr 1fr`, gap 20, alto mínimo 560.
- Izquierda: bloque grande, padding 56, contenido centrado vertical, gap 24. Marca de agua: isotipo de 420 px en `right:-90px; bottom:-120px`, color `--acc`, opacidad .07, trazo 3,2, `pointer-events:none`.
  - Etiqueta: "AI Developer · Argentina y LATAM".
  - H1 tecleado (§7).
  - Bajada: "Webs, micro-apps y asistentes con IA para tu negocio. Listos en días, con precios publicados." (19 px, máx. 28em).
  - Botones: "Pedí tu demo" (primario) y "Ver servicios" (secundario).
- Derecha: 3 tarjetas apiladas (gap 16): ícono + etiqueta mono, título 21 px y una línea. Web · "Webs que venden" · Apps · "Apps a tu medida" · IA · "IA que atiende por vos".

### Servicios
Etiqueta "Servicios" + H2 "Qué hago por tu negocio". Grilla de 3 columnas × 2 filas, gap 20. Cada tarjeta (padding 26): ícono + etiqueta · título 24 · descripción · 3 ítems con ✓ verde (`--ok`) · pie con borde superior: "Desde **$…**" y link "Ver precios →", que lleva a `#precios` **y abre la pestaña de esa categoría**. Textos y precios en `referencia.html`.

### Cómo trabajo
H2 "Primero ves tu demo, después decidís" + bajada sobre la seña. 4 tarjetas: Paso 1 Contame tu idea · Paso 2 Seña · Paso 3 Demo en 72 h · Paso 4 Videollamada. **El monto de la seña sale de configuración** (`SENA_MONTO`, hoy $20.000), nunca escrito en la copy.

### Precios (estilo catálogo)
- Encabezado a dos columnas: H2 "Todo con precio publicado" + bajada; a la derecha, **selector de medio de pago** (`role="radiogroup"`): "Transferencia" | "Mercado Pago +6%". El activo va en naranja con halo; cambiarlo **recalcula todos los precios** (×1,06, redondeado a $100).
- **Pestañas** (`role="tablist"`) dentro de una tarjeta con padding 6 y radio 20: Webs · Catálogos y tiendas · Turnos y reservas · Sistemas de gestión · IA y automatización · Mantenimiento. Activa: fondo `--ic-bg`, texto `--acc-text`.
- Debajo, la introducción de la categoría (`intro`) y la grilla de planes (3 columnas, gap 20). Tarjeta de plan (padding 26, gap 16):
  - Badge "RECOMENDADO" (píldora naranja arriba a la izquierda, `top:-12px`) solo en el plan con `rec`. Ese plan usa la variante `.hi` y su botón es primario.
  - Nombre (20 px) + chip de plazo "⏱ 5 a 7 días".
  - Etiqueta "Implementación" / "Desde" / "Abono" · precio 34 px · unidad ("pago único", "por flujo", "/mes"). Si tiene abono: "+ **$X**/mes de servicio". Si tiene `alt`, una línea gris.
  - Ítems con ✓ · al pie, la prueba ("● Como en Tuki") y el botón "Lo quiero".
- Nota de la categoría (`note`) en 13 px.
- **Combos**: etiqueta + H3 "Juntá servicios y ahorrá" · 4 tarjetas (el segundo en `.hi`): badge verde "AHORRÁS X%" arriba a la derecha, nombre, qué incluye, precio de lista tachado, precio del combo, abono y "Quiero este combo".
- **Extras**: tarjeta con la etiqueta "Extras" y chips "Nombre **$precio**".
- Pie legal en 13 px: vigencia, 12 meses de hosting, 3 pagos sin recargo desde $450.000, costos de Meta e IA aparte, link "¿No ves lo tuyo? Pedí una cotización".
- Datos: `docs/agencia/datos/precios.json` → `content/agencia/pricing.ts` tipado. **Un solo origen**: la sección de precios, `/servicios/[slug]`, el cotizador y el agente Malejo leen de ahí.

### Proyectos
Encabezado con "Ver todo en el portfolio →" a la derecha. Grilla `1.35fr 1fr`, gap 20:
1. **AfinIA Jobs** (izquierda, bloque grande): captura (relación 960/439, radio 20, `object-fit: cover`, `object-position: top`) y debajo etiqueta "Producto propio · beta", título 32, descripción, tags y botón cuadrado 48 px con flecha (link a afiniajobs.com.ar).
2. Derecha, dos tarjetas apiladas: **Qué Pinta Salta** (Web + app) y **Tuki** (Web + app, "Concebido en NOA Innova 2026").
3. **MaestrIA** a todo el ancho (`grid-column: 1 / -1`): captura a la izquierda (`1.35fr`) y texto a la derecha con "Producto propio · en desarrollo", título, descripción, tags y "Ver MaestrIA →".
- En el sitio las capturas son `<video autoplay muted loop playsinline preload="none" poster="/agencia/proyectos/<x>.jpg">` con `/agencia/proyectos/<x>.mp4`. Con reducir movimiento: solo el póster.

### Sobre mí, FAQ, cierre y pie
- **Sobre mí**: bloque grande, grilla `260px 1fr`. Foto profesional (placeholder punteado hasta tenerla) con el sprite "bolsillos" asomando abajo a la derecha. Etiqueta con isotipo de 18 px, H2 "De profe de matemática a AI Developer.", párrafo y "Leer la historia completa" (con `<details>`, sin JS).
- **FAQ**: máx. 920 px, 6 preguntas en tarjetas; la primera abierta. Signo +/− en caja de 32 px con fondo `--ic-bg`.
- **Cierre**: bloque grande `.hi` con fondo `radial-gradient(80% 120% at 100% 0%, var(--ic-bg) 0%, var(--surf) 55%)`, grilla `1.4fr 1fr`: isotipo de 56 px, etiqueta "Empecemos", H2 52 px "¿Lo charlamos?", bajada; a la derecha "Escribime por WhatsApp" (primario, 56 px de alto), "Agendá una videollamada" y "O preguntale a Malejo, abajo a la derecha."
- **Pie**: borde superior, grilla `1.4fr repeat(3, 1fr)`: isotipo + "Malejo" y "Desarrollado y gestionado por Mauro Lizárraga · Salta, Argentina." · Agencia (Servicios, Precios, Cotizador, Proyectos, Blog) · Mauro (Portfolio (EN), Mi historia) · Legal (Términos y política de cambios, Privacidad y datos personales).

## 5. Flotante: sprite, toast y chat de Malejo
Contenedor `position: fixed; right: 28px; bottom: 0; z-index: 60`, flex alineado abajo, gap 12.
- **Sprite = botón** (`aria-label="Abrir chat con Malejo"`, `aria-expanded`): etiqueta naranja "CHAT" (mono 10 px, pasa a "CERRAR" con el chat abierto) sobre el pixel art de 54×123. Pose **ok** cerrado; **pensando** con el chat abierto mientras responde. Respira 1 px cada 3 s.
- **Toast del portfolio** (`role="status"`), 280 px, radio 18: "¿Querés ver mi portfolio?" · "Proyectos, stack y experiencia. En inglés." · "Ver portfolio →" (a `/portfolio/en`) · botón ✕ · barra de tiempo naranja de 3 px. Aparece a los **2 s**, se va solo a los **10 s**, no vuelve en la sesión (`sessionStorage`) y no se muestra con el chat abierto.
- **Ventana de chat** (`role="dialog"`), 380×600, radio 24, al lado del sprite, entra con `opacity` + `scale .96→1` en 220 ms desde abajo a la derecha:
  - Encabezado: avatar 40 px (sprite recortado sobre `--ic-bg`), "Malejo" + punto verde, "Responde al instante · Lo supervisa Mauro", ✕.
  - Mensajes: bot con burbuja `--surf-2` y borde (radio 16/16/16/6) y avatar 32 px; usuario con fondo `--ic-bg` y texto `--user-text` (radio 16/16/6/16). Las respuestas de herramientas son tarjetas `.hi` (cotización: etiqueta, nombre, precio, abono, botón "Pedir demo con seña de $X").
  - Abajo: chips (Hablar por WhatsApp · Ver otros planes · Ver portfolio), campo hundido + botón enviar 44×44 y el aviso "Si me dejás tu nombre y WhatsApp, los uso solo para contactarte. Privacidad".
  - En celular: hoja a pantalla completa.

## 6. Islas cliente (lo único con `"use client"`)
| Componente | Por qué |
|---|---|
| `ThemeToggle` | cambia la clase `dark` y la cookie |
| `Typewriter` | anima el H1 |
| `PricingCatalog` | pestaña activa + medio de pago (los datos llegan como props desde el servidor) |
| `ServiceLink` | "Ver precios" que abre la pestaña (comparte estado con `PricingCatalog` por `?cat=` en el hash o un store mínimo) |
| `MalejoWidget` | sprite, toast y chat; se carga con `next/dynamic` (`ssr: false`) cuando el navegador está libre |
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
- `< 1024px`: hero en una columna (las 3 tarjetas debajo, en fila con scroll horizontal), servicios y planes en 2 columnas, combos en 2.
- `< 640px`: todo en 1 columna; pestañas de precios con scroll horizontal; H1 a 44 px; padding de bloques 28.
- Menú: botón hamburguesa → **explorador lateral** (aprobado en la ronda 3): panel desde la izquierda con la lista de secciones con "▸", la activa en naranja, "Portfolio EN" y "Pedí tu demo" abajo.
- Chat: hoja completa; sprite y toast se mantienen abajo a la derecha.

## 9. Accesibilidad
Pestañas con `role="tab"`/`aria-selected` y flechas del teclado; medio de pago con `role="radiogroup"`/`aria-checked`; chat con `role="dialog"`, foco al abrir y `Escape` para cerrar; foco visible `outline: 2px solid var(--acc-text); outline-offset: 3px`; alt descriptivo en capturas y sprites; objetivos táctiles de 44 px; contraste AA en los dos modos.

## 10. Diferencias entre el canvas y el sitio real
- En el canvas la página scrollea dentro de una ventana de 900 px para simular el flotante; en el sitio es `position: fixed` y la página scrollea normal.
- La entrada al scroll del canvas usa `animation-timeline: view()` y el toast un keyframe; en el sitio van con Framer Motion y temporizadores.
- La referencia muestra solo la pestaña "Webs" y el chat cerrado; el resto de los estados está descripto acá.
