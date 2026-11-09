# Auditoría UX/UI y copy · malejo.com.ar (sitio de la agencia)

Fecha: 8/11/2026 · Rama `main` (commit `ea4ee29`) · Auditoría sin cambios en el repo.

**Cómo se midió.** El build con Turbopack falló porque no había acceso a Google Fonts. Para resolverlo se hizo `next build --webpack` con `NEXT_FONT_GOOGLE_MOCKED_RESPONSES=/tmp/fontmock/mock.js`, un mock que reemplaza Outfit, Inter y JetBrains por Poppins, Inter y DejaVu Sans Mono, que están instaladas en el sistema. Después se levantó `next start -p 3005`. Las capturas salieron de Playwright con Chrome headless, en tema oscuro (el default) y con CSS inyectado que fuerza `[data-reveal]` a su estado final. El resultado del build fue el esperado: todas las páginas de la agencia salen `○`/`●`, y solo los catch-all y `/api/*` salen `ƒ`. **Las alturas pueden variar ±3 % con las fuentes reales**, porque Poppins no tiene exactamente las mismas métricas que Outfit. El servidor quedó apagado y el repo sigue limpio (`git status` vacío).

Las capturas están en `/home/claude/ux-review/capturas/` y las mediciones crudas en `/home/claude/ux-review/mediciones.json`.

---

## 1. Resumen ejecutivo

1. **La home mide 7,9 pantallas en escritorio y 16,1 en celular.** El objetivo es ≤ 5 y ≤ 8. Tres bloques se llevan el 65 % de la altura en celular: Precios (5,4 pantallas), Servicios (2,9) y Proyectos (2,1). El catálogo de precios entero vive en la home: 7 pestañas, 30 planes, 4 combos, 8 extras y un selector de medio de pago. Con la pestaña "Webs", que es la que se abre por defecto, hay **18 precios distintos a la vista al mismo tiempo** (`desktop-home-sec-precios.png`, `mobile-home-sec-precios.png`).
2. **El sitio le habla a un desarrollador y no a un dueño de negocio.** Lo primero que se lee es "AI DEVELOPER · ARGENTINA Y LATAM" y después el H1 "Webs y apps potenciadas con IA." (`desktop-home-pliegue.png`). Los planes se llaman "Landing Express/Profesional/Premium" y "Sitio autoadministrable". Las tarjetas dicen "SEO local", "Analytics", "hosting", "SSL", "backups", "panel", "abono", "API oficial de Meta", "Redirecciones 301", "Hecha con n8n", "Sprint", "Arquitectura propuesta" y "Cita fuentes". En la sección 4 hay más de 60 reemplazos, cada uno con su archivo:línea.
3. **No hay una acción principal clara.** Solo en la home compiten **10 acciones distintas**: "Pedí tu demo" (que pide una seña de $20.000), "Lo quiero" ×6, "Quiero este combo" ×4, "Escribime por WhatsApp", "Agendá una videollamada", "¿No ves lo tuyo? Pedí una cotización", "Ver todo en el portfolio", "Abrir AfinIA Jobs", el chat de Malejo y el aviso "¿Querés ver mi portfolio? … En inglés". Ese aviso tapa precios en el celular y manda al cliente a un CV en inglés (`mobile-home-precios-con-widget.png`).
4. **Hay contradicciones con las decisiones nuevas en `/servicios/grandes`** (`desktop-servicios-grandes.png`):
   - Muestra el FAQ "¿De quién es el código? → Tuyo.".
   - Muestra "¿Qué pasa después del primer año?", que habla de las webs.
   - El pie dice "Webs: 12 meses de hosting…".
   - El link "Sumar extras en el cotizador" lleva a un cotizador que no tiene proyectos grandes.
   - Siguen textos de pago que no son 50/50: "Pagos por hito" y "Pagás sprint por sprint".
   - El 50/50 solo aparece en letra de 13 px al pie y en el FAQ, nunca en "Cómo trabajo".
5. **La confianza flojea justo donde importa.** En "Quién está detrás" se ve en producción un recuadro vacío que dice "FOTO PROFESIONAL" (`desktop-home-sec-sobre-mi.png`). Los cuatro proyectos son productos propios, ninguno es de una pyme, y sus etiquetas ("NEXT.JS", "POSTGRESQL", "NEON", "EDTECH") no le dicen nada a una veterinaria. "Diagnóstico" significa tres cosas distintas: 20 minutos gratis, 30 minutos gratis o $60.000 por escrito.

**Qué propongo.** Una home de ~3 pantallas en escritorio y ~5 en celular:

> hero de resultado → "¿Qué necesitás?" (6 problemas) → cómo trabajo + 50/50 → prueba social con Mauro → cierre

Los precios completos pasan a las páginas de cada solución, que ya existen y son estáticas, más una página `/precios` con el catálogo completo para quien quiera comparar todo.

---

## 2. Mediciones

Viewport de escritorio: 1440 × 900. Viewport de celular: 390 × 844. "Pantallas" = altura total / alto del viewport.

### 2.1 Altura total por página

| Ruta | Escritorio (px) | Pantallas | Celular (px) | Pantallas | Capturas |
|---|---:|---:|---:|---:|---|
| `/` | 7.152 | **7,9** | 13.551 | **16,1** | `desktop-home.png`, `mobile-home.png` |
| `/servicios` | 1.648 | 1,8 | 3.637 | 4,3 | `*-servicios.png` |
| `/servicios/webs` | 3.076 | 3,4 | 6.128 | 7,3 | `*-servicios-webs.png` |
| `/servicios/tiendas` | 2.881 | 3,2 | 4.237 | 5,0 | `*-servicios-tiendas.png` |
| `/servicios/turnos` | 2.889 | 3,2 | 4.161 | 4,9 | `*-servicios-turnos.png` |
| `/servicios/gestion` | 2.833 | 3,1 | 4.215 | 5,0 | `*-servicios-gestion.png` |
| `/servicios/ia` | 2.887 | 3,2 | 5.353 | 6,3 | `*-servicios-ia.png` |
| `/servicios/mant` | 1.994 | 2,2 | 3.259 | 3,9 | `*-servicios-mant.png` |
| `/servicios/grandes` | 2.106 | 2,3 | 3.423 | 4,1 | `*-servicios-grandes.png` |
| `/cotizador` | 3.393 | 3,8 | 6.147 | **7,3** | `*-cotizador.png` |
| `/demo` | 1.381 | 1,5 | 2.396 | 2,8 | `*-demo.png` |
| `/blog` | 910 | 1,0 | 1.242 | 1,5 | `*-blog.png` |

### 2.2 Secciones de la home

| # | Sección (`id`) | Escritorio (px) | Pantallas | Celular (px) | Pantallas | % del total en celular | Captura |
|---|---|---:|---:|---:|---:|---:|---|
| – | Menú (sticky) | 94 | 0,1 | 94 | 0,1 | 1 % | – |
| 1 | Hero (`inicio`) | 576 | 0,6 | 732 | 0,9 | 5 % | `*-home-sec-inicio.png` |
| 2 | Servicios (`servicios`) | 916 | 1,0 | 2.461 | 2,9 | 18 % | `*-home-sec-servicios.png` |
| 3 | Cómo trabajo (`como-trabajo`) | 417 | 0,5 | 935 | 1,1 | 7 % | `*-home-sec-como-trabajo.png` |
| 4 | Precios (`precios`) | **1.851** | **2,1** | **4.553** | **5,4** | **34 %** | `*-home-sec-precios.png` |
| 5 | Proyectos (`proyectos`) | 1.264 | 1,4 | 1.797 | 2,1 | 13 % | `*-home-sec-proyectos.png` |
| 6 | Sobre mí (`sobre-mi`) | 486 | 0,5 | 847 | 1,0 | 6 % | `*-home-sec-sobre-mi.png` |
| 7 | FAQ (`faq`) | 774 | 0,9 | 880 | 1,0 | 6 % | `*-home-sec-faq.png` |
| 8 | Cierre (`contacto`) | 536 | 0,6 | 703 | 0,8 | 5 % | `*-home-sec-contacto.png` |
| – | Pie | 238 | 0,3 | 550 | 0,7 | 4 % | – |

### 2.3 Otros datos medidos

- **Elementos accionables en la home:** 28 en total entre `a.btn`, `button.btn` y `a.lnk`. Hay 5 botones con estilo primario visibles a la vez, con tres destinos distintos: demo, WhatsApp y AfinIA.
- **Overflow horizontal:** ninguno en ninguna página, en ningún tamaño.
- **Imágenes sin `alt`:** 0.
- **Contraste de los tokens** (`app/(agencia)/agencia.css`):

  | Combinación | Modo claro | Modo oscuro |
  |---|---:|---:|
  | `--muted` sobre fondo / tarjeta | 6,4 / 6,9 : 1 | 8,0 / 7,5 : 1 |
  | `--acc-text` sobre fondo | 5,6 : 1 | 8,5 : 1 |
  | Botón primario (`--acc-ink` sobre `--acc`) | 6,3 : 1 | – |

  Todo pasa AA. La única excepción es el naranja puro (`--acc`) usado como texto, en el "IA." del H1 y en el cursor del typewriter: en modo claro da **2,9 : 1**, apenas por debajo del 3 : 1 que pide el texto grande.
- **Áreas táctiles de menos de 44 px en celular:**

  | Elemento | Tamaño |
  |---|---|
  | "Ver precios →" de cada servicio | 99 × 21 px |
  | Links del pie | 17 px de alto |
  | "¿No ves lo tuyo? Pedí una cotización" | 20 px de alto |
  | "Ver todo en el portfolio →" | 23 px de alto |
  | Checkbox de consentimiento en `/demo` | 18 × 18 px |
  | Selector de medio de pago | 40 px de alto |
  | Botones "Lo quiero" | 42 px de alto |

- **Botón del chat en celular:** mide 54 × 150 px y está fijo abajo a la derecha. Tapa el borde derecho de las tarjetas del hero y de los planes (`mobile-home-pliegue.png`, `mobile-home-precios-con-widget.png`).

---

## 3. Inventario de la home

Las secciones se listan en orden (`components/agencia/home/HomePage.tsx`, orden de DISENO.md §4).

| # | Sección | Objetivo | Altura (escritorio / celular) | ¿Imprescindible en la home? | Destino propuesto |
|---|---|---|---|---|---|
| 1 | **Hero.** Etiqueta "AI Developer · Argentina y LATAM", H1 tecleado "Webs y apps potenciadas con IA.", bajada, "Pedí tu demo" / "Ver servicios" y 3 tarjetas ("Webs que venden", "Apps a tu medida", "IA que atiende por vos") | Decir qué hace Malejo y llevar a la acción | 576 / 732 | **Sí**, pero con otra copy: resultado en lugar de tecnología | Se queda. Las 3 tarjetas pasan a decir "por qué confiar" (precio publicado, demo antes de pagar, 50/50) |
| 2 | **Servicios.** 6 tarjetas con 3 ítems cada una, "Desde $X" y "Ver precios →" | Mostrar el menú de soluciones | 916 / 2.461 | **Sí, como selector corto** ("¿Qué necesitás?"). Hoy en el celular son 6 tarjetas apiladas de casi media pantalla cada una | Se queda, compacto: 6 baldosas con problema + "Desde" + flecha a `/servicios/[slug]`. Los 18 ítems pasan a cada página |
| 3 | **Cómo trabajo.** 4 pasos: idea → seña → demo 72 h → videollamada | Bajar el riesgo percibido | 417 / 935 | **Sí.** Es el mejor argumento del sitio. Le falta el paso de pago 50/50 | Se queda, con un paso 5 "Pagás 50% al aprobar, 50% al recibir". En celular, una sola tarjeta con los pasos numerados |
| 4 | **Precios.** Selector de medio de pago, 7 pestañas, planes, nota, 4 combos, 8 extras y pie legal | Transparencia de precios | **1.851 / 4.553** | **No.** Es la principal causa de "la página es muy larga" | A `/servicios/[slug]` (cada uno con sus planes) y a una nueva `/precios` con el catálogo completo. En la home queda una línea: "Todos los precios están publicados → Ver precios" |
| 5 | **Proyectos.** AfinIA Jobs grande, QPS y Tuki chicos, MaestrIA ancho, todos con video | Prueba social | 1.264 / 1.797 | **Parcial.** Hace falta prueba, pero no cuatro videos con etiquetas técnicas | Una franja con 2 o 3 casos contados como "qué problema resuelve", sin stack, y "Ver más proyectos" al portfolio o a una página `/proyectos` |
| 6 | **Sobre mí.** Foto placeholder + sprite, título "De profe de matemática a AI Developer.", historia en `<details>` | Confianza en la persona | 486 / 847 | **Sí, reducido** y unido a la prueba social: foto real + 2 líneas | Fusionar con #5 en "Quién te va a atender". La historia larga va a `/portfolio` o a `/sobre-mi` |
| 7 | **FAQ.** 6 preguntas: plazos, cambios, pagos, primer año, código, Malejo | Sacar objeciones | 774 / 880 | **No.** Las respuestas dependen del servicio y ya hay un FAQ en cada `/servicios/[slug]` | A cada página de solución (3 o 4 preguntas específicas) y a `/preguntas` si se quiere una página completa. En la home, 3 preguntas como mucho dentro del cierre |
| 8 | **Cierre.** "¿Lo charlamos?", "Escribime por WhatsApp" (primario), "Agendá una videollamada" y "O preguntale a Malejo" | Conversión | 536 / 703 | **Sí** | Se queda |

---

## 4. Glosario de reemplazos

Ubicaciones: `precios.json` = `docs/agencia/datos/precios.json`; el resto, salvo que diga otra cosa, está en `content/agencia/`.

### 4.1 Hero, servicios y marco del sitio

| Término / texto actual | Reemplazo propuesto | Dónde aparece |
|---|---|---|
| "AI Developer · Argentina y LATAM" | "Mauro Lizárraga · Salta, Argentina" | home.ts:53 |
| "Webs y apps potenciadas con IA." (H1) | "Que te encuentren, te escriban y reserven solos." o "Más clientes, menos mensajes sin responder." | home.ts:55-59 |
| "Webs, micro-apps y asistentes con IA para tu negocio." | "Páginas web, turnos online, catálogos y asistentes que responden por vos." | home.ts:60, site.ts:26 |
| "Landing pages y sitios rápidos para tu negocio." | "Una página para que te encuentren en Google y te escriban por WhatsApp." | home.ts:64 |
| "Turnos, reservas y paneles fáciles de usar." | "Tus clientes sacan turno solos y vos ves la agenda en el celular." | home.ts:65 |
| "Landings y sitios rápidos, con SEO local y botón de WhatsApp." | "Tu página web, preparada para aparecer en Google cuando buscan tu rubro en tu ciudad, con botón de WhatsApp." | home.ts:81 |
| "12 meses de hosting incluidos" | "El primer año online incluido, sin pagar nada más" | home.ts:82 |
| "Menú QR, catálogo con pedidos por WhatsApp o tienda con Mercado Pago." | "Mostrá tus productos con precio y recibí los pedidos armados por WhatsApp, o cobrá online." | home.ts:90 |
| "Panel para cargar productos" | "Cargás y cambiás productos vos, desde el celular" | home.ts:91 |
| "Panel de horarios" | "Ves y cambiás tus horarios desde el celular" | home.ts:100 |
| " + abono" (sufijo del "Desde") | " + cuota mensual" | home.ts:101, home.ts:110 |
| "Stock con QR" | "Control de mercadería escaneando con el celular" | home.ts:109 |
| "Tablero de ventas" | "Tus ventas del mes en una sola pantalla" | home.ts:109, precios.json:293 |
| "Cita fuentes reales" | "Responde solo con la información de tu negocio, no inventa" | home.ts:118 |
| "Hosting, backups y cambios incluidos para que no te preocupes." | "Tu página siempre funcionando, con copia de seguridad y alguien que te hace los cambios." | home.ts:126 |
| "Reporte mensual (Pro)" | "Informe mensual de visitas y consultas" | home.ts:127 |
| "brief" ("Completás un brief corto") | "un formulario corto" | home.ts:139, conocimiento.ts:61 |
| "Enviar brief", "Recibí tu brief", "No pude guardar tu brief" | "Enviar mi consulta", "Recibí tu consulta", "No pude guardar tu consulta" | demo.ts:24, :29, :31 |
| "diagnóstico gratis de 20 minutos" / "Diagnóstico gratis de 30 minutos" | "charla gratis de 20 minutos" (un solo nombre y una sola duración) | home.ts:139, precios.json:330 |
| "Producto propio · beta" / "· en desarrollo" | "Proyecto propio · en prueba" / "· en construcción" | home.ts:182, :212 |
| Etiquetas "Next.js", "IA", "PostgreSQL", "Neon", "EdTech" | Rubro y resultado: "Empleo · ordena avisos solo", "Educación · arma evaluaciones" (o sin etiquetas) | home.ts:184, :215 |
| "De profe de matemática a AI Developer." | "De profe de matemática a desarrollador: explico simple y entrego rápido." (texto fijado en DISENO.md §4, línea 132: hay que actualizar el doc) | home.ts:225 |
| "desarrollador full-stack en Accenture, en plataformas internas y chatbots con IA" | "desarrollador en Accenture, armando sistemas internos y asistentes con IA para una multinacional" | home.ts:229, conocimiento.ts:59 |
| "Explorador · Malejo" (título del menú del celular) | "Menú" | site.ts:49 |
| "Portfolio EN" en el menú principal | Sacarlo del menú y dejarlo en el pie como "Mi CV (en inglés)" | site.ts:38, :59 |
| "Seis tipos de proyecto, todos con precio publicado. Entrá a cada uno para ver los planes y los combos." | "Elegí lo que necesita tu negocio y mirá cuánto sale." | servicios.ts:17 |

### 4.2 Precios, planes y cotizador

| Término / texto actual | Reemplazo propuesto | Dónde aparece |
|---|---|---|
| "Implementación" (etiqueta sobre cada precio) | "Pago único" o "Lo pagás una vez" | lib/agencia/pricing.ts:246 (copy fuera de `content/`), cotizador.ts:12 |
| "Abono" / "Abono mensual" / "/mes de servicio" | "Cuota mensual" / "por mes (incluye que siga funcionando)" | lib/agencia/pricing.ts:246, cotizador.ts:13, home.ts:157 |
| "Implementación + 12 meses de abono." | "Pago único + 12 cuotas mensuales." | cotizador.ts:16 |
| "valor de implementación" (mantenimiento de proyectos grandes) | "del precio del proyecto" | home.ts:169, precios.json:556 |
| "Pago único. Incluye 12 meses de hosting, 30 días de garantía y el código es tuyo." | "Pagás una sola vez. Incluye el primer año online, 30 días de garantía, y la página es tuya." | precios.json:6 |
| "Desde el mes 13: renovación de $90.000/año o un plan de mantenimiento." | "Desde el segundo año: $90.000 por año para que siga online, o un plan con cambios incluidos." | precios.json:7 |
| "Plantilla adaptada a tu marca" | "Diseño base con tus colores y tu logo" | precios.json:18 |
| "Hasta 4 secciones" | "Lo esencial: quién sos, qué ofrecés, dónde estás y cómo escribirte" | precios.json:19 |
| "1 ronda de revisión" / "2 rondas…" / "3 rondas…" | "1 vuelta de correcciones" / "2 vueltas…" / "3 vueltas…" | precios.json:21, :38, :71, :87 |
| "SEO local y alta en Google Business" | "Aparecés en Google y en Google Maps cuando buscan tu rubro cerca" | precios.json:36 |
| "Analytics" | "Sabés cuánta gente visita tu página y de dónde llega" | precios.json:37 |
| "Formulario con respuesta automática" | "Quien te escribe recibe respuesta al instante" | precios.json:55 |
| "Asistente IA de preguntas frecuentes" | "Un asistente que responde las preguntas de siempre" | precios.json:54 |
| "Todo lo de Premium, sin IA" | "Todo lo de la página anterior, en varias páginas (sin asistente)" | precios.json:70 |
| "Sitio Pyme + panel propio" | "La web completa, y los textos y las fotos los cambiás vos" | precios.json:85 |
| "Rediseño o migración desde WordPress" | "Renovamos tu página actual, aunque esté hecha en WordPress, Wix u otra" | precios.json:101 |
| "Redirecciones 301: no perdés Google" | "No perdés el lugar que ya tenés en Google" | precios.json:102 |
| "O por abono: $90.000 de entrada + $49.000/mes (12 meses, con mantenimiento)." | Sacarlo de la tarjeta y moverlo a "Otras formas de pago" | precios.json:41 |
| "El abono cubre hosting, panel y soporte." | "La cuota mensual cubre que siga online, que puedas cargar productos y que te ayude si algo falla." | precios.json:114 |
| "Panel para cargar productos y stock" / "Panel de turnos y horarios" | "Cargás productos y stock desde el celular" / "Ves la agenda del día desde el celular" | precios.json:143, :199 |
| "Tus clientes reservan solos y vos ves todo en un panel." | "…y vos ves la agenda desde el celular." | precios.json:185 |
| "Los recordatorios por WhatsApp usan la API oficial de Meta: su costo por mensaje va aparte." | "Los recordatorios salen por WhatsApp oficial: WhatsApp cobra aparte unos centavos por mensaje." | precios.json:186 |
| "Fichas con filtros y mapa" / "Carga automática desde tus fuentes" / "Modo claro y oscuro" | "Cada lugar con su ficha y su ubicación en el mapa" / "Se actualiza sola" / (sacar) | precios.json:157-159 |
| "Relevamiento y propuesta por escrito" | "Miro cómo trabajás hoy y te paso por escrito qué haría" | precios.json:317 |
| "Roles: dueño y empleados" | "Cada empleado ve solo lo que le toca" | precios.json:318 |
| "Pagos por hito" | "50% al aprobar la demo y 50% al entregar" (ver la sección 8) | precios.json:319 |
| "Conecta planillas o Mercado Pago" | "Toma los datos de tus planillas o de Mercado Pago" | precios.json:302 |
| "IA acotada a tu negocio: responde con tu información, cita fuentes…" | "…responde con la información de tu negocio, dice de dónde la sacó…" | precios.json:329 |
| "Los costos del modelo de IA y de Meta van a cargo del cliente." | "Lo que cobran por uso WhatsApp y el servicio de inteligencia artificial lo pagás aparte, según cuánto se use." | precios.json:330, home.ts:163 |
| "Cita las fuentes" | "Dice de dónde sacó cada respuesta" | precios.json:342 |
| "Guarda contactos con consentimiento" | "Te deja anotados a los interesados (si ellos aceptan)" | precios.json:343 |
| "WhatsApp Business oficial" | "Con el WhatsApp de tu negocio" | precios.json:357 |
| "por flujo" | "por cada tarea automatizada" | precios.json:385 |
| "Hecha con n8n" | (sacar) → "No tenés que tocar nada" | precios.json:391 |
| "Hosting, SSL y backups" | "Tu página online y segura, con copia de seguridad" | precios.json:445 |
| "Gestión del dominio" | "Me ocupo de tu dirección web (tunegocio.com.ar)" | precios.json:446 |
| "Cambio menor: hasta 30 minutos sin tocar la estructura." | "Cambio chico: un texto, una foto, un precio o un horario (hasta 30 minutos)." | precios.json:434, conocimiento.ts:125 |
| "Reporte mensual y SEO local" | "Informe mensual y ajustes para que Google te muestre más" | precios.json:478 |
| "Marketplaces, apps a medida o sistemas complejos… por sprints." | "Apps o sistemas grandes, a medida: primero charlamos, después te paso un plan por escrito y lo construimos por etapas de 2 semanas." | precios.json:489, servicios.ts:23, :52 |
| "Relevamiento y alcance" / "Arquitectura propuesta" / "Estimación por etapas" | "Qué hay que hacer y qué no" / "Cómo se va a construir, explicado simple" / "Cuánto sale cada etapa" | precios.json:517-519 |
| "Alcance cerrado por sprint" / "Pagás sprint por sprint" | "Cada etapa tiene objetivos fijos" / "Pagás etapa por etapa" (ajustar al 50/50, ver la sección 8) | precios.json:533, :535 |
| "Hosting, backups y monitoreo" | "Lo mantengo online, vigilado y con copia de seguridad" | precios.json:550 |
| "Dominio .com.ar (NIC.ar, por año)" | "Tu dirección web .com.ar (por año)" | precios.json:618 |

### 4.3 FAQ, blog y textos legales

| Término / texto actual | Reemplazo propuesto | Dónde aparece |
|---|---|---|
| "No usamos WordPress: trabajamos con Next.js…" / pregunta "¿Usan WordPress?" | Pregunta: "¿Con qué hacen la página?" Respuesta: "Con tecnología propia, más rápida y segura que las plantillas: no se cae por un plugin ni hay que actualizarla." | conocimiento.ts:74, :169-170 |
| "hosting, SSL, backups y dominio" (FAQ del primer año) | "que siga online y segura, con copia de seguridad y tu dirección web" | conocimiento.ts:76, :150 |
| "Una landing está lista en 3 a 10 días hábiles" | "Una página web está lista en 3 a 10 días hábiles" | conocimiento.ts:120 |
| "los mensajes de la API oficial de WhatsApp (los cobra Meta)" / "el consumo del modelo de IA" | "lo que cobra WhatsApp por cada mensaje automático" / "lo que cobra el servicio de inteligencia artificial por uso" | blog/como-cotizo.mdx:20-21 |
| "Una Landing Express … una Landing Profesional" | Los nombres nuevos (sección 5) | blog/como-cotizo.mdx:12 |

Los textos legales (`legal.ts`) pueden conservar los términos técnicos ("hosting", "SSL", "API"), pero conviene agregar un paréntesis la primera vez que aparece cada uno: legal.ts:45 y :81.

---

## 5. Nombres de planes propuestos

> **Antes de renombrar:** el `id` de cada plan sale de `slugify(name)` (`content/agencia/pricing.ts:121`). Cambiar el nombre rompe varias cosas: `/demo?plan=`, `COMBO_PARTS` (pricing.ts:145-150), los `<Precio id>` del blog, los tests y las evals del chat. **Primero hay que agregar un `"id"` explícito a cada plan en `precios.json`, con el valor actual**, y recién después cambiar los nombres (ver la sección 9).

### 5.1 Planes

| Categoría actual → nueva | Plan actual | Nombre propuesto | Para quién es |
|---|---|---|---|
| Webs → **Que te encuentren** | Landing Express | Página Esencial | Recién arrancás o necesitás estar en internet ya: una página con lo básico y tu WhatsApp, en 3 días. |
| | Landing Profesional ★ | Página para aparecer en Google | Querés que te encuentren cuando buscan "veterinaria en Salta" y que te escriban directo. |
| | Landing Premium | Página que responde sola | Te preguntan siempre lo mismo y querés que la página conteste y te deje los interesados. |
| | Sitio Pyme | Web completa (hasta 5 páginas) | Ofrecés varios servicios o sedes y cada uno necesita su página (clínicas, inmobiliarias, agencias de viaje). |
| | Sitio autoadministrable | Web que actualizás vos | Cambiás precios, fotos o novedades seguido y no querés depender de nadie. |
| | Renová tu web | Renovación de tu web actual | Ya tenés una web vieja, lenta o que no se ve bien en el celular, y no querés perder Google. |
| Catálogos y tiendas → **Vender por internet** | Menú digital QR | Carta digital con QR | Bares, restós y cafés que cambian precios seguido. |
| | Catálogo con pedidos por WhatsApp ★ | Catálogo que arma el pedido por WhatsApp | Vendés por WhatsApp o Instagram y estás cansado de pasar fotos y precios uno por uno. |
| | Directorio o guía con mapa | Guía de lugares con mapa | Cámaras, turismo o eventos: muchos lugares para mostrar, actualizados solos. |
| | Tienda online con Mercado Pago | Tienda que cobra sola | Querés vender y cobrar online, con envío o retiro, sin comisión por venta para mí. |
| Turnos y reservas → **Turnos y reservas** | Turnos online | Agenda de turnos online | Peluquerías, consultorios, estética: dejá de dar turnos por WhatsApp. |
| | Combo Web + Turnos ★ | Página + agenda de turnos | Igual que el anterior, pero todavía no tenés página. *Duplica al combo "Negocio con turnos": mismo precio ($450.000 + $45.000/mes). Unificar.* |
| | Reservas con seña | Reservas con seña cobrada | Canchas, cabañas o clases: que el que reserva pague la seña y no te deje plantado. |
| | Inscripciones a eventos y salidas | Inscripciones con cupo | Talleres, salidas grupales y eventos con lugares limitados. |
| Sistemas de gestión → **Ordenar tu negocio** | Control de stock con QR | Control de mercadería | Comercios o depósitos que pierden la cuenta de lo que entra y sale. |
| | Pedidos y clientes ★ | Pedidos y clientes en orden | Tomás pedidos por varios lados y se te pierden o se atrasan. |
| | Tablero de ventas | Tus números en una pantalla | Querés saber cuánto vendiste sin abrir tres planillas. |
| | Sistema a medida | Sistema a tu medida | Tu forma de trabajar no entra en nada estándar. *Desde $900.000: según la nota de la categoría (precios.json:258) ya es "proyecto grande". Aclarar si lleva 10 % de mantenimiento y si se muestra "la página es tuya".* |
| IA y automatización → **Atender 24 h con IA** | Asistente IA para tu web ★ | Asistente que responde en tu web | Te preguntan precios, horarios o requisitos a cualquier hora. |
| | Asistente por WhatsApp | Asistente en tu WhatsApp | Te escriben más de lo que podés contestar y perdés clientes por demorar. |
| | Agente de ventas | Vendedor virtual | Querés que cotice, agende y haga el seguimiento por vos. |
| | Automatización | Tareas que se hacen solas | Copiás datos de un lado a otro todos los días (formularios, planillas, mails). |
| | Plataforma educativa con IA | Aula virtual con IA | Institutos y docentes que quieren evaluaciones y seguimiento por alumno. |
| | Clasificador con IA | Ordenar y filtrar con IA | Recibís muchos CVs, pedidos o consultas y hoy los leés uno por uno. |
| Mantenimiento → **Que siga funcionando** | Renovación | Mantener online (por año) | Tu web está bien y solo querés que siga andando, segura. |
| | Mantenimiento Básico | Cambios chicos todos los meses | Cada tanto cambiás un precio, una foto o un horario. |
| | Mantenimiento Pro ★ | Cambios + informe mensual | Tu web es tu vidriera principal y querés mejorarla mes a mes. |
| Proyectos grandes → **Proyectos a medida** | Consultoría inicial | Primera charla (gratis) | Tenés una idea grande y no sabés por dónde empezar ni cuánto puede salir. |
| | Diagnóstico escrito | Plan del proyecto por escrito | Querés saber qué hay que hacer, cómo y cuánto sale cada etapa antes de decidir. |
| | Sprint con demo | Etapa de 2 semanas con avance funcionando | Ya tenés el plan y querés construir por partes, viendo algo funcionando cada 2 semanas. |
| | Mantenimiento de proyectos grandes | Mantenimiento mensual (10 % del proyecto) | Tu sistema ya está andando y necesitás que siga funcionando y con ajustes. |

### 5.2 Combos

| Combo actual | Nombre propuesto | Para quién es |
|---|---|---|
| Arranque | Página + catálogo por WhatsApp | Empezás a vender en serio por WhatsApp |
| Atención 24 h | Página que atiende 24 h | Muchas consultas fuera de horario |
| Negocio con turnos | Página + turnos | Servicios con agenda (consultorios, peluquerías) |
| Pyme digital | Negocio ordenado | Pyme que quiere web, pedidos y atención en un solo paquete |

---

## 6. Arquitectura propuesta y wireframe

### 6.1 Criterio

- **La home elige y no compara.** Responde tres preguntas: "¿me sirve?", "¿confío?" y "¿qué hago ahora?". Comparar planes es el trabajo de la página de cada solución.
- **Se navega por problema.** Evalué la sugerencia de Mauro ("que me encuentren", "vender online", "dar turnos", "ordenar mi negocio", "atender 24 h con IA") y la recomiendo. Le sumo "que mi web siga funcionando" (mantenimiento) y un link secundario a "algo más grande".
- **Páginas y no pestañas para el selector principal.** Las páginas `/servicios/[slug]` ya existen, son estáticas (`●`) y suman SEO por problema. Unas pestañas dentro de la home necesitarían una isla cliente y esconderían contenido a Google. Las pestañas tienen sentido **dentro** de `/precios`, donde ya existen.
- **Una sola acción principal:** "Contame qué necesitás" (WhatsApp, o el chat de Malejo con chips por problema). "Pedí tu demo", que pide una seña de $20.000, queda como segundo paso en cada solución y en "Cómo trabajo". Es una recomendación: conviene medirla con Vercel Analytics, comparando los clics a WhatsApp contra los envíos de `/demo`.

### 6.2 Mapa del sitio propuesto

```
/                               Home corta (≤ 3,5 pantallas en escritorio)
├─ /servicios                   "¿Qué necesitás?": las 6 soluciones + proyectos a medida
│   ├─ /servicios/webs          H1 "Que te encuentren en Google"         (mismo slug)
│   ├─ /servicios/tiendas       H1 "Vender por WhatsApp o por internet"
│   ├─ /servicios/turnos        H1 "Que tus clientes saquen turno solos"
│   ├─ /servicios/gestion       H1 "Ordenar stock, pedidos y clientes"
│   ├─ /servicios/ia            H1 "Responder las 24 h sin estar pegado al celular"
│   ├─ /servicios/mant          H1 "Que tu web siga funcionando"
│   └─ /servicios/grandes       H1 "Proyectos a medida" (sin "la página es tuya", 10 % mensual)
├─ /precios            NUEVA    Catálogo completo actual (pestañas, combos, extras); reemplaza /#precios
├─ /cotizador                   Igual, agrupado por necesidad (P2)
├─ /demo                        Igual, con copy simplificada
├─ /proyectos         OPCIONAL  Casos contados por problema (o seguir enlazando a /portfolio)
├─ /blog, /blog/*
└─ /legal/*

Menú:    Soluciones · Precios · Cómo trabajo · Proyectos · Blog        [Escribime]
Celular: logo · [WhatsApp] · ☰
Pie:     … · "Mi CV (en inglés)" (sale del menú principal y del aviso flotante)
```

Cada página de solución usa la misma plantilla:

1. H1 con el problema y una línea de "Para quién es".
2. Tres beneficios en lenguaje simple.
3. **El plan recomendado destacado**, y debajo "Ver los otros N planes" (los demás planes en un `<details>` o en grilla, sin JS).
4. Un ejemplo o proyecto parecido ("Como Tuki").
5. Cómo se paga: 50/50, cuotas y lo que se paga aparte.
6. Tres o cuatro preguntas propias de esa solución.
7. Cierre con WhatsApp + "Pedí tu demo".

### 6.3 Wireframe de la home nueva (escritorio)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [M] Malejo   Soluciones  Precios  Cómo trabajo  Proyectos  Blog  [☀] [Escribime] │
├────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ ┌────────────────────────┐ │
│ │ MAURO LIZÁRRAGA · SALTA, ARGENTINA            │ │ ✓ Precios publicados    │ │
│ │ Que te encuentren,                            │ │   Sabés cuánto sale     │ │
│ │ te escriban y reserven solos.                 │ │   antes de hablar.      │ │
│ │ Páginas web, turnos online, catálogos y       │ ├────────────────────────┤ │
│ │ asistentes que responden por vos.             │ │ ✓ Ves tu demo antes     │ │
│ │                                               │ │   de pagar el total.    │ │
│ │ [ Contame qué necesitás ]  ( Ver soluciones ) │ ├────────────────────────┤ │
│ │                                               │ │ ✓ 50% al aprobar,       │ │
│ └─────────────────────────────────────────────┘ │   50% al recibir.       │ │
│                                                  └────────────────────────┘ │
│  ≈ 600 px                                                                   │
├────────────────────────────────────────────────────────────────────────────┤
│ ¿QUÉ NECESITÁS?                                                             │
│ Elegí lo que le pasa a tu negocio                                           │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐              │
│ │ 🔍 Que me         │ │ 🛒 Vender por     │ │ 📅 Que saquen     │              │
│ │ encuentren en    │ │ WhatsApp o       │ │ turno solos      │              │
│ │ Google           │ │ internet         │ │                  │              │
│ │ Desde $180.000 → │ │ Desde $120.000 → │ │ Desde $180.000 → │              │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘              │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐              │
│ │ 📦 Ordenar stock, │ │ 🤖 Responder las  │ │ 🔧 Que mi web     │              │
│ │ pedidos y        │ │ 24 h con IA      │ │ siga funcionando │              │
│ │ clientes         │ │                  │ │                  │              │
│ │ Desde $350.000 → │ │ Desde $250.000 → │ │ Desde $25.000/mes→│              │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘              │
│ ¿Algo más grande? Proyectos a medida →    ·   Ver todos los precios →        │
│  ≈ 560 px                                                                   │
├────────────────────────────────────────────────────────────────────────────┤
│ CÓMO TRABAJO · Primero ves tu demo, después decidís                         │
│ ① Me contás   ② Seña $20.000   ③ Demo en 72 h   ④ La vemos   ⑤ 50% / 50%     │
│   (charla        (se descuenta)   con tu marca     juntos       al aprobar /   │
│    gratis)                                         20 min       al recibir     │
│  ≈ 380 px                                                                   │
├────────────────────────────────────────────────────────────────────────────┤
│ QUIÉN TE VA A ATENDER                                                       │
│ ┌────────┐ Soy Mauro. Fui profe de matemática: explico simple.              │
│ │ FOTO   │ Trabajé en Accenture y hoy hago sistemas para negocios de Salta. │
│ └────────┘                                                                   │
│ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐        │
│ │ [captura]           │ │ [captura]           │ │ [captura]           │        │
│ │ Agenda cultural que │ │ Asistente que       │ │ (1er caso de pyme   │        │
│ │ se carga sola       │ │ responde trámites   │ │  cuando exista)     │        │
│ │ → como "Guía con    │ │ → como "Asistente   │ │                     │        │
│ │   mapa"             │ │   en tu web"        │ │                     │        │
│ └────────────────────┘ └────────────────────┘ └────────────────────┘        │
│                                         Ver más proyectos →                  │
│  ≈ 620 px                                                                   │
├────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ ¿Lo charlamos?                               [ 💬 Escribime por WhatsApp ] │ │
│ │ Contame qué necesitás y en 2 días hábiles    ( Agendá una videollamada )  │ │
│ │ te paso precio y plazo.                       O preguntale a Malejo ↘      │ │
│ │ ▸ ¿Cuánto tarda?  ▸ ¿Cómo pago?  ▸ ¿Qué pasa después del primer año?      │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│  ≈ 520 px                                                                   │
├────────────────────────────────────────────────────────────────────────────┤
│ Pie (≈ 240 px)                                                              │
└────────────────────────────────────────────────────────────────────────────┘
Total estimado: ~3.000 px ≈ 3,3 pantallas en escritorio (antes 7,9).
```

### 6.4 La misma home en celular

```
┌──────────────────────────┐
│ [M] Malejo   [WA] [☰]    │  el header suma un acceso a WhatsApp (hoy en celular no hay CTA)
├──────────────────────────┤
│ MAURO · SALTA            │
│ Que te encuentren,       │
│ te escriban y            │
│ reserven solos.          │
│ [Contame qué necesitás]  │
│ (Ver soluciones)         │
│ ✓ Precios publicados     │  las 3 garantías en una lista, no en un carrusel horizontal
│ ✓ Demo antes de pagar    │
│ ✓ 50% / 50%              │  ≈ 760 px
├──────────────────────────┤
│ ¿Qué necesitás?          │
│ ┌──────────┐┌──────────┐ │  grilla de 2 columnas, baldosas de ~150 px
│ │Que me    ││Vender    │ │  (hoy son 6 tarjetas de ~400 px apiladas)
│ │encuentren││online    │ │
│ └──────────┘└──────────┘ │
│ ┌──────────┐┌──────────┐ │
│ │Turnos    ││Ordenar   │ │
│ └──────────┘└──────────┘ │
│ ┌──────────┐┌──────────┐ │
│ │IA 24 h   ││Mantener  │ │
│ └──────────┘└──────────┘ │
│ Algo más grande →        │  ≈ 720 px
├──────────────────────────┤
│ Cómo trabajo (lista      │
│ numerada en 1 tarjeta)   │  ≈ 560 px
├──────────────────────────┤
│ Quién te va a atender    │
│ foto + 2 líneas          │
│ 2 casos (carrusel)       │  ≈ 900 px
├──────────────────────────┤
│ ¿Lo charlamos? [WA]      │  ≈ 650 px
├──────────────────────────┤
│ Pie compacto (acordeón)  │  ≈ 400 px
└──────────────────────────┘
Total estimado: ~4.100 px ≈ 4,9 pantallas en celular (antes 16,1).
```

---

## 7. Lista priorizada de mejoras

Esfuerzo: S = menos de medio día · M = 1 a 2 días · L = más de 2 días.

### P0 · Resuelve el feedback y las contradicciones de negocio

| # | Problema | Propuesta | Archivos | Esf. |
|---|---|---|---|---|
| P0-1 | La home mide 7,9 / 16,1 pantallas y Precios sola ocupa 2,1 / 5,4 (`desktop-home-sec-precios.png`). | Sacar `<Pricing />` de la home y crear `/precios` (estática) con el `PricingCatalog` actual. En la home, una línea "Ver todos los precios →". Llevar el menú y el pie de `/#precios` a `/precios`. | `components/agencia/home/HomePage.tsx`, nuevo `app/(agencia)/precios/page.tsx`, `content/agencia/site.ts:34,53,71`, `lib/agencia/routes.ts`, `components/agencia/client/SectionSpy.tsx:15-16`, `components/agencia/client/ServiceLink.tsx` | M |
| P0-2 | Las tarjetas de Servicios (6 × 3 ítems) ocupan 2,9 pantallas en celular y hablan de tecnología. | Convertirlas en el selector "¿Qué necesitás?": título = problema, una línea, "Desde", flecha a `/servicios/[slug]`. Sin lista de ítems. Grilla de 2 columnas en celular. | `content/agencia/home.ts:70-131`, `components/agencia/home/Services.tsx` | M |
| P0-3 | Hero centrado en tecnología: "AI Developer", "Webs y apps potenciadas con IA.", "micro-apps". | Copy de resultado (sección 4.1). Las 3 tarjetas pasan a decir por qué confiar: precio publicado, demo antes de pagar, 50/50. | `content/agencia/home.ts:52-67`, `site.ts:24-26` | S |
| P0-4 | Jerga en planes e ítems: "Landing", "SEO", "Analytics", "hosting", "panel", "abono", "API", "n8n"… | Aplicar el glosario (sección 4) y los nombres de la sección 5, **después** de agregar `id` estable en `precios.json`. | `docs/agencia/datos/precios.json`, `content/agencia/pricing.ts:105-150`, `lib/agencia/pricing.ts:246`, `cotizador.ts`, `conocimiento.ts` | M |
| P0-5 | `/servicios/grandes` muestra "¿De quién es el código? → Tuyo.", el FAQ de webs del primer año, el pie "Webs: 12 meses de hosting…" y "Sumar extras en el cotizador" (`desktop-servicios-grandes.png`). | FAQ propio de grandes: cómo se paga cada etapa, 10 % de mantenimiento, plazos, qué incluye el plan escrito. Pie específico, sin el link al cotizador. | `app/(agencia)/servicios/[slug]/page.tsx:107-121`, `content/agencia/servicios.ts:41`, `conocimiento.ts` (nuevas entradas de FAQ) | S |
| P0-6 | El 50/50 solo aparece en el pie de 13 px y en el FAQ. "Cómo trabajo" termina en la videollamada. Sigue "Pagos por hito". | Paso 5 en "Cómo trabajo": "50% al aprobar la demo, 50% al recibirlo". Ítem 3 de "Sistema a medida" → 50/50. Definir qué pasa en grandes (ver la sección 8). | `content/agencia/home.ts:133-144`, `precios.json:319`, `:535`, `legal.ts:66` | S |
| P0-7 | Recuadro "FOTO PROFESIONAL" vacío en producción (`desktop-home-sec-sobre-mi.png`). | Subir la foto real o, hasta tenerla, mostrar solo el sprite sin el recuadro punteado. | `components/agencia/home/About.tsx`, `content/agencia/home.ts:234` | S |
| P0-8 | El aviso "¿Querés ver mi portfolio? … En inglés" aparece a los 2 s, tapa los precios en celular y saca al cliente hacia un CV en inglés. | Desactivarlo en el sitio de la agencia, o mostrarlo solo en `/portfolio`. **Está especificado en DISENO.md §5 (línea 140): requiere el OK de Mauro y actualizar el doc.** | `components/agencia/client/MalejoWidget.tsx:46-84,165-193`, `content/agencia/malejo.ts:8-14`, `docs/agencia/DISENO.md:140` | S |

### P1 · Conversión, confianza y celular

| # | Problema | Propuesta | Archivos | Esf. |
|---|---|---|---|---|
| P1-1 | Diez acciones compiten en la home y el CTA principal pide una seña de $20.000 en el primer contacto. | Primario único: "Contame qué necesitás" (WhatsApp o chat). "Pedí tu demo" pasa a secundario en el hero y en el menú, y a principal dentro de cada solución. Medir clics. | `home.ts:61-62`, `site.ts:40`, `Header.tsx:57` | S |
| P1-2 | En celular el header no tiene CTA: "Pedí tu demo" está oculto con `hidden lg:inline-flex`. | Botón compacto de WhatsApp (44 × 44) al lado del ☰. | `components/agencia/Header.tsx:55-58` | S |
| P1-3 | Proyectos: 4 productos propios con etiquetas de stack, ninguna pyme. "Productos propios y trabajos para clientes" promete clientes que no se ven. | Contar cada proyecto como "qué problema resuelve → a qué plan se parece" (`conocimiento.ts` ya tiene `demuestra` y `parecido`). Sacar las etiquetas técnicas. Bajada honesta: "Proyectos propios que ya están funcionando". Sumar el primer caso pyme apenas exista. | `home.ts:174-221`, `Projects.tsx` | S |
| P1-4 | "Diagnóstico" significa tres cosas: "diagnóstico gratis de 20 minutos" (home.ts:139), "Diagnóstico gratis de 30 minutos" (precios.json:330) y "Diagnóstico escrito $60.000" (precios.json:509). | "Charla gratis (20 min)" para todo lo gratuito y "Plan del proyecto por escrito" para el pago. Una sola duración. | `home.ts:139`, `precios.json:330,493,509`, `servicios.ts:53`, `lib/agencia/chat/prompt.ts:69`, `tools.ts:227` | S |
| P1-5 | Plan "Combo Web + Turnos" ($450.000 + $45.000/mes) y combo "Negocio con turnos" ($450.000 + $45.000/mes): lo mismo dos veces. | Dejar uno solo, el combo, y en Turnos mostrar "¿No tenés página? Mirá el combo". | `precios.json:205-218,578-582` | S |
| P1-6 | Las pestañas de precios en celular se desplazan de costado con la barra oculta: solo se ven 2,5 de las 7 y no se nota que hay más (`mobile-home-precios-con-widget.png`). | En `/precios` (celular): `<select>` o lista de chips en 2 filas. Dentro de cada solución no hacen falta pestañas. | `components/agencia/client/PricingCatalog.tsx:154-185` | S |
| P1-7 | El botón del chat (54 × 150 px) tapa el borde derecho de tarjetas y botones en celular (`mobile-home-pliegue.png`). | En celular, versión compacta (solo la cabeza del sprite, ~56 × 64) o margen inferior seguro en el último bloque. Validar contra DISENO.md §5. | `components/agencia/client/MalejoWidget.tsx` | M |
| P1-8 | El chat arranca con los chips "Hablar por WhatsApp", "Ver otros planes" (sin haber visto ninguno) y "Ver portfolio" (`mobile-chat-abierto.png`). | Chips por problema: "Quiero que me encuentren en Google", "Quiero dar turnos online", "Quiero vender por WhatsApp", "Hablar con Mauro". | `content/agencia/malejo.ts:28-33`, `MalejoWidget.tsx` | S |
| P1-9 | Menú: "Servicios" lleva a `/#servicios` y no a `/servicios`. "Precios" se marca activo en `/servicios` y en `/cotizador` (`desktop-servicios.png`, `desktop-cotizador.png`). "Portfolio EN" está en el menú principal. | "Soluciones" → `/servicios`, "Precios" → `/precios`. Cada página marca su propio item. El portfolio pasa al pie. | `content/agencia/site.ts:32-59`, `SectionSpy.tsx:13-17` | S |
| P1-10 | Áreas táctiles chicas: "Ver precios →" 99 × 21, links del pie de 17 px, checkbox de 18 px en `/demo`. | `min-h-11` en `.lnk` dentro de tarjetas, `py-3` en los links del pie, checkbox con label de 44 px de alto. | `agencia.css` (`.lnk`), `Footer.tsx`, `DemoForm.tsx` | S |
| P1-11 | FAQ de la home: 6 preguntas genéricas, y "¿De quién es el código?" sin aclarar que no aplica a proyectos grandes. | Sacar el FAQ de la home (3 links en el cierre). FAQ por solución. Respuesta de "codigo" acotada a webs y planes. | `home.ts:238-243`, `conocimiento.ts:157-161` | S |

### P2 · Pulido

| # | Problema | Propuesta | Archivos | Esf. |
|---|---|---|---|---|
| P2-1 | El cotizador muestra 30 tarjetas de una vez: 7,3 pantallas en celular (`mobile-cotizador.png`). | Empezar por "¿Qué necesitás?" y abrir solo esa categoría. Las demás en `<details>`. En celular, el resumen fijo abajo. | `components/agencia/client/Cotizador.tsx`, `cotizador.ts` | M |
| P2-2 | En la tarjeta recomendada de Webs aparece un tercer esquema de pago: "O por abono: $90.000 de entrada + $49.000/mes". | Moverlo a "Otras formas de pago" dentro de `/servicios/webs`. | `precios.json:41`, `PlanCard.tsx:48` | S |
| P2-3 | Títulos SEO técnicos, por ejemplo "Webs que venden: precios". | "Página web para tu negocio en Salta: precios", "Turnos online para tu negocio: precios", etc. | `app/(agencia)/servicios/[slug]/page.tsx:25`, `servicios.ts:13-14` | S |
| P2-4 | El "IA." en naranja puro da 2,9 : 1 en modo claro (texto grande, umbral 3 : 1). | Usar `text-acc-text` para la palabra resaltada en modo claro, o aceptar el desvío (es un token de DISENO.md). | `components/agencia/client/Typewriter.tsx`, `agencia.css:493` | S |
| P2-5 | La etiqueta de precio ("Implementación", "Abono", "Desde") está escrita en `lib/`, contra la regla de "copy en `content/`". | Moverla a `content/agencia/pricing.ts` o `home.ts`. | `lib/agencia/pricing.ts:246` | S |
| P2-6 | Entradas por rubro: el público piensa en "soy veterinaria", no en "turnos". | Chips "Soy de: clínica · veterinaria · peluquería · inmobiliaria · comercio · turismo" debajo del selector, que llevan a la solución con la copy del rubro. Más adelante, páginas de rubro para SEO local. | nuevo contenido | L |
| P2-7 | DISENO.md y referencia.html siguen diciendo "3 pagos sin recargo" y fijan textos que esta propuesta cambia. | Actualizar el handoff para que nadie reintroduzca lo viejo "por fidelidad". | `docs/agencia/DISENO.md:121,132,140`, `docs/agencia/referencia.html:279` | S |

---

## 8. Textos viejos a reemplazar

### 8.1 Esquema de pago 50/50

Lo que ya está bien: home.ts:163 (pie de precios), conocimiento.ts:61 (`proceso`), :66 (`pagos`), :130 (FAQ "¿Cómo pago?") y legal.ts:65.

Lo que todavía hay que corregir:

| Texto | Ubicación | Qué hacer |
|---|---|---|
| "Pagos por hito" (Sistema a medida) | precios.json:319 | → "50% al aprobar la demo y 50% al entregar" |
| "Pagás sprint por sprint" | precios.json:535 | Definir con Mauro si cada etapa de un proyecto grande se paga 50/50 (al aprobar el plan de la etapa / al entregarla). Hoy contradice la regla general. |
| "Proyectos grandes: cada sprint se paga según la cotización del diagnóstico." | legal.ts:66 | Igual que el anterior |
| "O por abono: $90.000 de entrada + $49.000/mes (12 meses…)" | precios.json:41 | No es 3 pagos ni 40/30/30, pero es un tercer esquema que convive con el 50/50. Confirmar si sigue vigente. |
| "Proyectos desde $450.000: 3 pagos sin recargo por transferencia" | docs/agencia/referencia.html:279 | El sitio en vivo no lo usa, pero es "fuente de verdad del diseño": actualizarlo |
| "3 pagos sin recargo desde $450.000" | docs/agencia/DISENO.md:121 | Ídem |
| Mención histórica de "3 pagos" y "40/30/30" | docs/agencia/INFORME.md:307-308 | Es historial: se puede dejar |

No encontré "40/30/30" ni "3 pagos" en la copy publicada (`content/`, `app/`, `components/`, `lib/`).

### 8.2 "El código es tuyo"

**Debe ocultarse o acotarse en proyectos grandes:**

| Dónde | Ubicación | Situación |
|---|---|---|
| FAQ "¿De quién es el código? → Tuyo." en **`/servicios/grandes`** | servicios.ts:41 (`faqPagos` incluye `"codigo"`) → conocimiento.ts:157-161 | Visible hoy en `desktop-servicios-grandes.png` y `mobile-servicios-grandes.png`. **Es el caso más grave.** |
| Conocimiento del chat (`propiedad`): "El código y el dominio son del cliente una vez pagado el total…" | conocimiento.ts:73, que entra al prompt vía `lib/agencia/chat/knowledge.ts:19` | Sin distinguir por tipo de proyecto, Malejo puede afirmarlo para un proyecto grande. Agregar "en webs y planes del catálogo; en proyectos grandes se define en el plan escrito". Sumar un caso en `lib/agencia/chat/evals/casos.ts` (hay uno parecido en :127, "WordPress, dominio y propiedad"). |
| Términos §6: "El código del proyecto es tuyo una vez pagado el total." | legal.ts:87-89 | Genérico: necesita una salvedad para proyectos grandes |
| FAQ de la home con "codigo" | home.ts:242 | Genérico. Acotar la respuesta a webs, o sacar el FAQ de la home (P1-11) |
| `/servicios/gestion`, `/servicios/ia` y demás páginas de servicio | servicios.ts:41 | El mismo FAQ "codigo" aparece en todas. Incluye "Sistema a medida", "Plataforma educativa con IA" y "Clasificador con IA" (desde $700.000 a $900.000), que son proyectos grandes en la práctica: confirmar con Mauro. |

**Puede quedar (webs y pymes):**

| Dónde | Ubicación |
|---|---|
| Tarjeta "Webs que venden" | home.ts:82 |
| Intro de la categoría Webs | precios.json:6 |
| Post del blog | blog/como-cotizo.mdx:18 |
| Referencia de diseño | docs/agencia/referencia.html:132, :172 |

### 8.3 Mantenimiento del 10 % en proyectos grandes

Ya está aplicado en precios.json:556-557, home.ts:169, legal.ts:46 y lib/agencia/chat/prompt.ts:36 (con su test en prompt.test.ts:25).

Falta aclararlo en `/servicios/mant`. Hoy solo muestra los planes pyme (Renovación, Básico, Pro). Sumar una línea: "¿Tenés un proyecto grande? Su mantenimiento es el 10% mensual del precio del proyecto →".

---

## 9. Riesgos

### 9.1 SEO

- **Mantener los slugs `/servicios/[slug]`.** Ya están en el sitemap y tienen JSON-LD `Service`/`Offer`. Si se quieren URLs nuevas (`/soluciones/…`), van con 308 en `next.config.ts`, como se hizo con `/casos/:slug`.
- **Cambiar los nombres de los planes cambia el JSON-LD.** El `name` de cada `Offer` (servicios/[slug]/page.tsx:50-66) y el `knowsAbout` de la home (HomePage.tsx:36) toman los nombres nuevos. Eso está bien, pero conviene pedir reindexación en Search Console.
- **Achicar la home le saca texto con palabras clave.** Se compensa con títulos y H1 por problema en cada solución (P2-3) y con la página nueva `/precios`. La home sigue enlazando a todas.
- **`/#precios` está enlazado desde el menú, el pie y probablemente desde redes.** Al moverlo, dejar en la home un `id="precios"` con un link a `/precios`, o un redirect del lado del cliente. Un fragmento no se puede redirigir desde el servidor.

### 9.2 Las rutas tienen que seguir estáticas

- `/precios` y cualquier página nueva tienen que salir `○` en el build.
- El selector "¿Qué necesitás?" tiene que ser **links**: sin estado ni `searchParams` en el servidor.
- Si se agrega una vista previa interactiva del plan, va como isla en `components/agencia/client/`, y `?cat=` / `?plan=` se siguen leyendo en el cliente (CLAUDE.md, "Rutas estáticas").
- Sumar la ruta en `lib/agencia/routes.ts` (sitemap).

### 9.3 Ids de planes

- `id = slugify(name)` (pricing.ts:121). Renombrar sin agregar antes un `id` explícito rompe:
  - `/demo?plan=…` (enlaces ya compartidos por WhatsApp o en el chat);
  - `COMBO_PARTS` (pricing.ts:145-150);
  - `<Precio id="landing-express">` y `<Combo id=…>` en el blog;
  - `getPlan("renovacion")` y `getPlan("mantenimiento-basico")` en conocimiento.ts:54-55;
  - los tests de Vitest y las evals del chat.
- Correr `npm test` después del cambio. También hay tests que validan textos: FAQ ≤ 40 palabras y prompt.test.ts:25.

### 9.4 Invariantes de CLAUDE.md y DISENO.md

- **El diseño visual no se reinterpreta**: tokens de `agencia.css`, sombras suaves, bordes de 1 px, naranja `--acc`, clases `card`/`lift`/`btn`. Esta propuesta reorganiza contenido y jerarquía con las mismas piezas: las baldosas del selector son `card lift` y el resto reutiliza Hero, Steps, Cta y PlanCard.
- **Discrepancias con el handoff que requieren el OK de Mauro y actualizar DISENO.md:**
  - el orden de la home (§4);
  - la "grilla de 3×2 de la home" (servicios.ts:44-45);
  - el H2 fijo "De profe de matemática a AI Developer." (§4, línea 132);
  - el aviso del portfolio (§5, línea 140);
  - el pie legal (§4, línea 121);
  - los nombres de las pestañas (§4, línea 112).
- **Copy solo en `content/agencia/*.ts`.** Ningún hex en componentes. `data-reveal` en todo lo animado. No envolver una tarjeta `.lift` con `Reveal`. `viewport.amount = 0.2`: ningún bloque animado puede medir más de 5 pantallas; hoy Precios mide 5,4 en celular, aunque ahí solo se anima el encabezado.
- **Islas cliente:** si el selector o el cotizador nuevo necesitan estado, van en `components/agencia/client/` y se suman a la lista de CLAUDE.md.
- **Chat:** cualquier cambio de copy de pagos, propiedad o diagnóstico tiene que reflejarse en `conocimiento.ts`, que es la fuente única del FAQ y del prompt. Ninguna herramienta cotiza proyectos grandes: mantenerlo. Las evals reales (`npm run eval:chat`) gastan tokens; correrlas al final.
- **Nada de `components/agencia` entra en `app/(es)` ni en `app/(en)`.** El portfolio no se toca.
