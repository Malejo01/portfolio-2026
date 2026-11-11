# Tanda P1 · Malejo: precios nuevos, 3 pagos sin interés y modales "Qué incluye"

Repo `Malejo01/portfolio-2026`, sitio de la agencia (`app/(agencia)`). Trabajá en loop, sin pedir permiso, hasta cerrar todo. Abrí un PR contra `main` y no lo mergees.

Fuente de verdad: `docs/agencia/precios-psicologia-2026-11-10.md`, en particular §3 (tabla), §2 (pagos), §4 (pantallas) y §5 (modal). Si algo de esta tanda contradice ese documento, gana el documento. Avisá la discrepancia en el PR.

Reglas del repo que no se tocan: CLAUDE.md completo.

* Rutas estáticas (`○`).
* Ids de planes fijos (R2): los nombres pueden cambiar, los ids nunca.
* Ningún hex en componentes.
* Copy en `content/agencia/`.
* Toda la aritmética en `lib/agencia/pricing.ts`.
* Test de glosario.
* `data-reveal` en lo animado.
* Framer Motion como única librería de animación.
* Nada de `components/agencia` en el portfolio.

## Fase 1 · Datos y aritmética

1. `docs/agencia/datos/precios.json`:
   * Aplicar todos los montos de §3: planes, combos (`list` = suma real por separado, `price` nuevo), mantenimiento pro 49.000, `rec` de mantenimiento pasa a `mantenimiento-basico`.
   * `landing-premium`: nombre "Página completa". `items`: todo lo de Google, textos escritos por mí, animaciones, 3 vueltas de correcciones. Sin asistente. Mismo id.
   * `alt` de `landing-profesional`: "$59.000 de entrada y $42.000 por mes durante 12 meses, con cambios chicos incluidos."
   * Campo nuevo por plan: `noIncluye: string[]`, con 2 a 4 ítems concretos (ver §5.4) en todos los planes y combos. Si no sabés algo con certeza, poné lo seguro (dirección web, costos de WhatsApp o de IA por uso, fotos) y listalo en el PR para que Mauro lo revise.
   * Campo nuevo por categoría: `visibles: string[]`, con los 3 ids que se muestran (§3, columna "Visible"). El resto va a "Otras opciones".
   * Campo nuevo por combo: `categorias: CategoryKey[]`, las pestañas donde aparece.
   * `pagos`: `{ "tres": [1/3,1/3,1/3], "calendarioTres": ["al aprobar la demo","al entregar","a los 30 días"], "topeTres": 600000, "dos": [0.5,0.5], "tarjetaMaxCuotas": 6 }`.
2. `content/agencia/pricing.ts`: tipos de los campos nuevos.
3. `lib/agencia/pricing.ts`:
   * `pagosDe(total): { dos: number[], tres: number[] | null, tarjeta: { total, cuotas: 6 } }`. `tres` es `null` si `total > pagos.topeTres` ($600.000). Si un tercio no da entero, el último pago absorbe la diferencia.
   * Helper `lineaDePagos(total)`: devuelve "o 3 pagos de $X sin interés" si entra en el tope, o "o 2 pagos de $X sin interés" si no. Es la única fuente de esa línea para tarjetas, modal, cotizador, `/demo` y chat.
   * El tope se aplica al total contratado (combo o cotización completa), no plan por plan.
   * `cotizar` y `comparar` suman `pagos` al resultado. `resumenCotizacion` agrega la línea "o 3 pagos de $X sin interés".
   * No aplica a la categoría `grandes` ni a montos solo mensuales (devuelve `null`).
4. Tests en `lib/agencia/pricing.test.ts`:
   * todo precio único de hasta $600.000 (no `grandes`, no `null`) es divisible por 3 en miles exactos (es la regla de diseño de precios);
   * `pagosDe(600000).tres` no es null; `pagosDe(600001).tres` es null; `cotizar` con dos planes que suman más del tope no ofrece 3 pagos;
   * `combo.list` es igual a la suma de sus `planIds`;
   * cada categoría tiene exactamente 3 `visibles`, que existen y que incluyen al `rec`;
   * todo plan y todo combo tiene `noIncluye` no vacío;
   * `pagosDe` da la suma exacta.

## Fase 2 · Copy y glosario

1. "Cuota" solo para partir el pago. Reemplazar "cuota mensual" por "por mes" o "servicio mensual" en `content/agencia/*`, `conocimiento.ts`, el prompt del chat, el blog y los sufijos. Sumar `"cuota mensual"` a las prohibidas de `lib/agencia/glosario.test.ts`.
2. Pagos en `conocimiento.ts` (pagos, FAQ `pagos`/`cuotas`/`sena`) y en `servicios.ts` (`pagos`): 2 pagos (50/50); 3 pagos sin interés por transferencia (⅓ al aprobar la demo, ⅓ al entregar, ⅓ a los 30 días), solo si el total es de hasta $600.000; tarjeta con Mercado Pago, +6%, hasta 6 cuotas; la seña se descuenta del primer pago; el código y la dirección web se transfieren con el último pago; proyectos a medida: por etapa, 50/50.
3. Mantener online: mostrar "$7.500 por mes, pagás el año junto". Calculado (90.000 / 12), no escrito a mano.
4. Ningún precio escrito a mano en la copy: todo sale del catálogo.

## Fase 3 · Componentes

1. Isla `components/agencia/client/PlanDialog.tsx`: `<dialog>` nativo, `showModal()`, cierre con Esc, botón ✕ y clic en el fondo; foco devuelto al disparador; scroll del body bloqueado; animación de entrada con `LazyMotion` + `m` (sin animación con `useReducedMotion`); variantes `plan` (§5) e `info` ("Formas de pago", "¿Cómo funciona la seña?", "Sumale extras", "Condiciones"); contenido como `children` desde el servidor siempre que se pueda.
2. `PlanCard`: nombre, para quién (`line-clamp-2`), plazo, total; `lineaDePagos(total)` con `text-acc-text`; por mes si corresponde; máximo 3 viñetas (`destacados` o las 3 primeras de `items`); "Lo quiero" y "Ver qué incluye" (sin JS: `<a href="/servicios/<cat>#<id>">`).
3. `ComboCard`: "Por separado $X" tachado, el precio, "Ahorrás $X" (y el % en chico), los 3 pagos, por mes y "Ver qué trae" (modal).
4. `PricingCatalog` (`/precios`): sin `MedioSwitch`; 3 tarjetas `visibles` y `<details>` "Ver otras opciones (N)"; combos filtrados por `categorias`; extras en modal `info`; letra chica en 1 línea y modal "Condiciones".
5. `/servicios/[slug]`: §4.2 en orden. Beneficios como chips; tarjetas en escalera y "¿Cuál me conviene?" (`conviene: { si: string; plan: string }[]`, 3 filas, `plan` es un id que el test verifica); otras opciones, combo de la solución, proyecto en 1 línea, franja de pagos con modal, FAQ de 3 y cierre. `grandes` mantiene sus pasos.
6. Home: §4.1. Chips de confianza; baldosas sin descripción con "Desde $X · 3 × $Y"; 3 pasos y modal de seña; equipo en 2 líneas. ≤ 3,5 pantallas en escritorio y ≤ 5,5 en celular (`docs/agencia/verificacion/r2/capturas.js`); actualizar CLAUDE.md.
7. Cotizador: total, 2 pagos, 3 pagos (si pasa el tope, "3 pagos: hasta $600.000") y la línea de tarjeta (+6%); el selector de medio se queda.
8. `/demo`: resumen del plan elegido (`?plan=`) con total y 3 pagos, y "La seña de $X se descuenta del primer pago".

## Fase 3 bis · Pedidos de Mauro del 11-11 (ganan sobre lo anterior si chocan)

**A. Categoría en `/precios`.** En celular sale el desplegable: grilla de 2 columnas con las 7 categorías (ícono + etiqueta corta), la elegida con fondo `acc` y texto `acc-ink`, el resto `card`, área táctil ≥ 44 px. En escritorio, pestañas con el mismo resaltado. Al tocar se actualizan planes, otras opciones y combos; título "Estás viendo: …"; en celular, scroll suave al inicio de los planes (sin scroll con `prefers-reduced-motion`). `?cat=` con `history.replaceState`, leído en el cliente. Enlace "Más sobre esta solución →" a `/servicios/<cat>`.

**B. Entrada desde la home.** Baldosas → `/precios?cat=<categoría>`. "Ver todos los precios →" pasa a `btn btn-s` de ancho completo en celular. "Precios" visible en el encabezado del celular. Título: "Elegí lo que necesita tu negocio".

**C. Extras.** Al modal "Sumale extras", una fila por extra (nombre a la izquierda, monto `whitespace-nowrap` a la derecha, separadas por borde). Verificación por JS a 320, 360, 390 y 412 px en las 7 categorías: sin rectángulos superpuestos ni overflow horizontal.

**D. Textos.** "Sin permanencia" → "lo das de baja cuando quieras, avisando 30 días antes" (salvo `legal.ts`); "permanencia" al glosario. `monthlySuffix` → " por mes (incluye soporte funcional)"; en mantenimiento, el ítem equivalente dice "Incluye soporte funcional".

**E. El auto, la reparación y la nafta.** `modeloDeCostos` en `conocimiento.ts`: sistema = auto (pago único), mantenimiento = taller (por mes), uso = nafta (IA y WhatsApp, lo cobran esas empresas, se cotiza aparte). Franja de 3 íconos en `/precios` y en cada `/servicios/[slug]`; en el modal de los planes con `usaServiciosDeTerceros`; FAQ `costos-de-uso` y `costos-aparte`; chat (conocimiento + regla + eval). No va en la home, sin montos. Glosario: ni "tokens" ni "API".

## Fase 4 · Chat de Malejo

1. `cotizar` y `comparar` incluyen `pagos`; la tarjeta `quote` muestra "3 pagos de $X sin interés" (en `cards.ts`, sin zod).
2. Prompt: dudas por precio → 3 pagos (hasta $600.000; arriba, 2 pagos o tarjeta en hasta 6 cuotas), después una opción más chica, nunca descuentos. "Para decir qué incluye o qué no, usá `items` y `noIncluye`; no inventes."
3. Catálogo del prompt con `noIncluye` y la línea de 3 pagos; el bloque con `cache_control` sin nada variable.
4. Evals: 5 casos nuevos ("¿se puede pagar en cuotas?", "¿la tienda que cobra sola se puede en 3 pagos?", "me parece caro la página de Google", "¿qué no incluye la página Esencial?" y el de costos de uso). Montos de los casos existentes y `objetivo()`.
5. `route.test.ts` y tests de herramientas con los montos nuevos.

## Fase 5 · Verificación (obligatoria antes del PR)

`npm run lint`, `npm test`, `npm run build` (todo `○`). Por JS a 1280 y 390 px en `/`, `/precios`, `/servicios/webs`, `/servicios/ia`, `/cotizador`, `/demo`: palabras, overflow, modal (foco, Esc, devolución), sin JS el ancla. Tabla antes/después en `docs/agencia/INFORME.md` § "P1". PR con resumen, tabla de precios, `noIncluye` para revisar y discrepancias.

## Decisiones tomadas al arrancar (11-11)

- `grandes` queda **exenta** de `visibles`: sigue mostrando sus pasos. El test de 3 visibles corre sobre las otras 6.
- Combos por pestaña: Página + catálogo → webs, tiendas · Página que atiende 24 h → webs, ia · Página + turnos → webs, turnos · Negocio ordenado → gestion. Combo único por solución: webs y tiendas → Página + catálogo, turnos → Página + turnos, ia → Página que atiende 24 h, gestion → Negocio ordenado, mant y grandes → ninguno.
- Sin JS, "Ver qué incluye" lleva a un `<details id="<id>">` cerrado en la tarjeta o en la fila de "Otras opciones" de `/servicios/<cat>`.
- Evals reales: requieren `ANTHROPIC_API_KEY` en el entorno; si la sesión no la tiene, corren con el modelo simulado y la corrida real queda para Mauro.
