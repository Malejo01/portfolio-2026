# Malejo · Precios y pantallas con psicología del consumidor (10-11)

Estado: **aprobada por Mauro el 10-11** (D1 tabla tal cual · D2 3 pagos solo hasta $600.000 · D3 Página completa sin IA · D4 ★ IA en el asistente web · D6 sin selector en /precios). Falta implementar. La tanda de implementación es `tanda-p1-malejo-precios-modales.md`.

## 0. Lo que se midió hoy en producción

| Pantalla | Palabras | Precios visibles |
|---|---|---|
| `/` (home) | 503 | 10 |
| `/precios` | 616 | 27 (más 4 combos y 6 extras con el selector de medio) |
| `/servicios/webs` | **886** | **31** |
| `/servicios/ia` | 727 | 17 |
| `/servicios/tiendas` · `gestion` | 574 · 571 | 13 · 13 |
| `/servicios/turnos` · `mant` · `grandes` | 472 · 439 · 403 | 10 · 8 · 3 |
| `/cotizador` | 364 | **48** |
| `/demo` | 243 | 9 |

Diagnóstico: el ruido no está en el largo de la home (ya se acortó en R2) sino en **la densidad de decisiones**. En `/servicios/webs` hay 31 montos y 6 planes, y cada tarjeta tiene 4 viñetas, plazo, una línea de "para quién", precio, cuota mensual y a veces una forma de pago alternativa. Una persona de un comercio chico tiene que comparar 6 planes con 4 variables cada uno. Eso es sobrecarga de opciones: frena la decisión y empuja a elegir lo más barato "por las dudas".

## 1. Principios que se aplican (y por qué)

1. **Tres opciones a la vista, nunca más** (ley de Hick, sobrecarga de opciones). Cada solución muestra 3 tarjetas; el resto queda en "Ver otras opciones".
2. **Bueno, mejor, completo, con el del medio destacado** (efecto compromiso). El salto de la primera a la segunda tiene que ser **chico** (×1,3 a ×1,45) para que subir parezca obvio. Hoy pasa lo contrario en webs: 180 → 320 es ×1,78. El cliente ve "casi el doble" y se queda con la Esencial, aunque a vos te cueste casi lo mismo hacer la segunda.
3. **El precio partido baja el dolor de pagar.** En Argentina, "3 cuotas sin interés" es el idioma natural de compra. Cada precio muestra el total y debajo "o 3 pagos de $X sin interés".
4. **Montos limpios.** Los precios se diseñan para que el tercio sea redondo y termine en 9 ($83.000, no $82.667). El total queda abajo de la centena: $249.000 se lee "doscientos y pico", no "doscientos cincuenta". Es el efecto del primer dígito.
5. **Ancla visible en los combos.** Se muestra "Por separado $498.000" tachado y el ahorro en pesos ("Ahorrás $81.000"), no solo el porcentaje.
6. **La tarjeta dice para qué sirve, el modal dice qué trae.** En la tarjeta van el resultado (nombre), para quién es, el precio con los pagos y como mucho 3 diferencias. El detalle completo, lo que no incluye y la letra chica van a un modal, a un clic.
7. **Lo mensual se reencuadra por mes.** "Mantener online: $90.000 por año" pasa a "**$7.500 por mes**, pagás el año junto".
8. **"Cuota" quiere decir una sola cosa.** Hoy "cuota mensual" (el servicio de cada mes) y "cuotas" (partir el pago) chocan. Lo mensual pasa a llamarse "**por mes**" o "**servicio mensual**", y "cuota" queda solo para partir el pago. Se suma "cuota mensual" al test del glosario.
9. **No se inventan señales sociales.** No va "el más elegido" sin datos: la etiqueta sigue siendo "Recomendado".

## 2. Formas de pago nuevas

Las tres opciones aparecen igual en todos lados: tarjeta, modal, chat y cotizador.

| Opción | Cómo | Dónde se muestra |
|---|---|---|
| **2 pagos sin interés** (transferencia) | 50% al aprobar la demo, 50% al entregar. Es el esquema actual. | Modal "Formas de pago" |
| **3 pagos sin interés** (transferencia) | ⅓ al aprobar la demo, ⅓ al entregar, ⅓ a los 30 días: justo cuando termina la garantía. **Solo si el total es de hasta $600.000.** | **En la tarjeta**: "o 3 pagos de $X sin interés". Arriba del tope: "o 2 pagos de $X sin interés" |
| **Tarjeta con Mercado Pago** | Hasta 6 cuotas, precio +6%. El interés de las cuotas lo pone Mercado Pago. | Modal "Formas de pago" y cotizador |

- La **seña de $20.000 se descuenta del primer pago**, igual que hoy.
- Por qué el tercer pago va a los 30 días: "pagás el último cuando ya viste que funciona". Es un argumento de venta y además baja el riesgo percibido.
- Cómo se cuida el riesgo de cobro: la transferencia del código y de la dirección web se hace con el último pago. La página está online desde la entrega.
- **Tope de $600.000 (D2)**: el tope se mira sobre el total de lo que se contrata, no plan por plan. Un combo o una cotización del cotizador de más de $600.000 va en 2 pagos o con tarjeta. Quedan afuera de los 3 pagos: Web que actualizás vos, Tienda que cobra sola, Sistema a tu medida, Aula virtual, Ordenar y filtrar con IA y el combo Negocio ordenado.
- **No aplica a proyectos a medida**: ahí se sigue pagando por etapa, 50% y 50%.
- El **selector Transferencia / Mercado Pago sale de `/precios`**: hoy cambia 31 montos y suma ruido. Queda en el cotizador y en el modal.

## 3. Tabla de precios nueva (ARS, todos por transferencia)

★ = recomendado. "3 pagos" es el monto de cada pago; en planes de más de $600.000 no se ofrece (se muestra el monto de 2 pagos).

### Que te encuentren (webs)
| Plan (id fijo) | Antes | **Ahora** | 3 pagos | Visible |
|---|---|---|---|---|
| Página Esencial (`landing-express`) | 180.000 | **177.000** | 59.000 | Sí |
| ★ Página para aparecer en Google (`landing-profesional`) | 320.000 | **249.000** | 83.000 | Sí |
| Página completa (`landing-premium`) | 480.000 | **357.000** | 119.000 | Sí |
| Web completa, hasta 5 páginas (`sitio-pyme`) | 650.000 | **597.000** | 199.000 | Otras opciones |
| Web que actualizás vos (`sitio-autoadministrable`) | 950.000 | **897.000** | 299.000 | Otras opciones |
| Renovación de tu web, desde (`renova-tu-web`) | 550.000 | **507.000** | 169.000 | Otras opciones |

- Escalera: ×1,41 y ×1,43 (antes ×1,78 y ×1,50).
- **Cambio de alcance en `landing-premium`**: pasa a ser "Página completa". Trae todo lo de Google, más textos escritos por mí, animaciones y 3 vueltas de correcciones, y **sin asistente**.
  - Por qué: hoy la "Página que responde sola" ($480.000) choca con el combo "Página que atiende 24 h" ($590.000), que trae un asistente de verdad, y además una IA sin servicio mensual no cubre lo que se gasta en uso.
  - Quien quiera que la página responda va al combo (ver §3.7).
- El precio de la Página completa se justifica con los extras: textos $60.000 + vuelta extra $25.000 + animaciones ≈ $108.000 de diferencia.
- La **forma alternativa de `landing-profesional`** (hoy $90.000 + $49.000 por mes × 12 = $678.000, que al lado de $249.000 queda mal) pasa a $59.000 de entrada + $42.000 por mes × 12, con cambios chicos incluidos (total $563.000, frente a $549.000 si lo comprás por separado). Va **solo en el modal**.

### Vender por internet (tiendas). El servicio mensual no cambia.
| Plan | Antes | **Ahora** | 3 pagos | Por mes | Visible |
|---|---|---|---|---|---|
| ★ Catálogo que arma el pedido por WhatsApp | 280.000 | **249.000** | 83.000 | 15.000 | Sí |
| Carta digital con QR | 120.000 | **117.000** | 39.000 | 12.000 | Sí |
| Tienda que cobra sola, desde | 750.000 | **747.000** | 249.000 | 35.000 | Sí |
| Guía de lugares con mapa | 450.000 | **447.000** | 149.000 | 25.000 | Otras opciones |

### Turnos y reservas
| Plan | Antes | **Ahora** | 3 pagos | Por mes |
|---|---|---|---|---|
| ★ Agenda de turnos online | 180.000 | **177.000** | 59.000 | 22.000 |
| Reservas con seña cobrada | 380.000 | **357.000** | 119.000 | 35.000 |
| Inscripciones con cupo | — | — | — | 15.000 |

### Ordenar tu negocio (gestión)
| Plan | Antes | **Ahora** | 3 pagos | Por mes | Visible |
|---|---|---|---|---|---|
| Tus números en una pantalla | 350.000 | **327.000** | 109.000 | 20.000 | Sí |
| Control de mercadería | 450.000 | **447.000** | 149.000 | 30.000 | Sí |
| ★ Pedidos y clientes en orden | 550.000 | **537.000** | 179.000 | 35.000 | Sí |
| Sistema a tu medida, desde | 900.000 | **897.000** | 299.000 | — | Otras opciones |

### Atender 24 h con IA
| Plan | Antes | **Ahora** | 3 pagos | Por mes | Visible |
|---|---|---|---|---|---|
| ★ Asistente que responde en tu web | 350.000 | **327.000** | 109.000 | 45.000 | Sí |
| Asistente en tu WhatsApp | 450.000 | **447.000** | 149.000 | 55.000 | Sí |
| Vendedor virtual | 600.000 | **597.000** | 199.000 | 65.000 | Sí |
| Tareas que se hacen solas, desde (por tarea) | 250.000 | **249.000** | 83.000 | — | Otras opciones |
| Aula virtual con IA, desde | 900.000 | **897.000** | 299.000 | — | Otras opciones |
| Ordenar y filtrar con IA, desde | 700.000 | **699.000** | 233.000 | — | Otras opciones |

Esta es una escalera real: web → WhatsApp → que venda (×1,37 y ×1,34). El ★ se queda en el asistente web (D4).

### Que siga funcionando (mantenimiento)
| Plan | Antes | **Ahora** | Cómo se muestra |
|---|---|---|---|
| Mantener online | 90.000/año | 90.000/año | **"$7.500 por mes"**, pagás el año junto |
| ★ Cambios chicos todos los meses | 25.000/mes (no ★) | 25.000/mes | **Pasa a recomendado** (es el del medio) |
| Cambios + informe mensual | 55.000/mes (★) | **49.000/mes** | Ancla de arriba |

### Combos (por separado, tachado → combo)
| Combo | Por separado | Antes | **Ahora** | 3 pagos | Ahorrás | Por mes |
|---|---|---|---|---|---|---|
| Página + catálogo por WhatsApp | 498.000 | 520.000 | **417.000** | 139.000 | $81.000 (16%) | 15.000 |
| Página que atiende 24 h | 576.000 | 590.000 | **489.000** | 163.000 | $87.000 (15%) | 45.000 |
| Página + turnos | 426.000 | 450.000 | **357.000** | 119.000 | $69.000 (16%) | 45.000 |
| Negocio ordenado | 1.461.000 | 1.350.000 | **1.257.000** | 419.000 | $204.000 (14%) | 75.000 |

"Página que atiende 24 h" a $489.000 es, en la práctica, el reemplazo honesto de la vieja "Página que responde sola" ($480.000): casi el mismo precio, pero con un asistente de verdad y su servicio mensual.

### Proyectos a medida: sin cambios de precio
- Charla gratis, plan escrito $60.000, etapas cotizadas y 10% mensual de mantenimiento.
- Opcional (D5): "**el plan escrito se descuenta si arrancás la primera etapa**". Baja la barrera de entrada y cuesta poco.

### Extras: sin cambios
Pasan al modal "Sumale" y al cotizador; ya no van en la grilla principal.

### Impacto
- **Ningún precio sube**, así que no se rompe la promesa de "vigentes hasta el 31/01/2027".
- La baja fuerte se concentra en el plan que más se vende: Google pasa de $320.000 a $249.000 (−22%).
- La apuesta es de **mezcla de ventas**. Hoy la escalera empuja a la Esencial ($180.000). Si de cada 10 clientes de webs 4 pasan de la Esencial a Google, el ticket promedio sube aunque baje la lista.
  - Ejemplo: 10 clientes, antes 7 Esencial y 3 Google = $2.220.000.
  - Después 3 Esencial, 6 Google y 1 completa = $2.382.000.
  - Son cuentas ilustrativas, no datos.

## 4. Jerarquía por pantalla

### 4.1 Home (`/`): de 503 a ~320 palabras
1. **Hero**
   - Queda igual: H1 tecleado, una línea de bajada y los 2 botones (Malejo primero).
   - Las 3 tarjetas de confianza pasan a **una fila de 3 chips** de 3 o 4 palabras cada uno: "Precios publicados · Demo antes de pagar · 3 pagos sin interés".
2. **¿Qué necesitás?**
   - Las 6 baldosas quedan con el problema y "Desde $177.000 · 3 × $59.000". Se saca la línea de descripción.
   - El clic va a la solución. "Preguntale a Malejo" queda como enlace chico.
3. **Cómo trabajo**
   - 5 pasos pasan a **3**: "Me contás → Ves tu demo en 72 h → Pagás en 2 o 3 veces".
   - La seña y el detalle van a un modal "¿Cómo funciona la seña?".
4. **Quién te va a atender**: 2 líneas y los 3 proyectos como miniaturas con nombre. Sin párrafo.
5. **Cierre**: título, 1 botón principal y 2 secundarios. FAQ de 3 preguntas cerradas, como ya está.

### 4.2 Soluciones (`/servicios/[slug]`): ≤ 450 palabras (webs hoy tiene 886)
1. H1 con el problema y una línea de "para quién".
2. **Las 3 tarjetas directo**, en escalera, con la del medio destacada. Los beneficios pasan a ser 3 chips arriba, no una sección.
3. **"¿Cuál me conviene?"**: 3 filas de "Si… → elegí…". Ejemplo: "Si recién arrancás → Esencial · Si querés que te encuentren cuando buscan tu rubro → Google · Si querés que la página venda por vos → Completa". Va después de las tarjetas.
4. "Ver otras opciones (3)", cerrado: lista compacta de nombre, precio y "Ver qué incluye".
5. El combo que corresponde a esa solución, uno solo: "¿Además vendés por WhatsApp? Juntalo y ahorrás $81.000".
6. Proyecto parecido: imagen y 1 línea.
7. **Formas de pago en una franja**: "2 pagos · 3 pagos sin interés · tarjeta hasta 6 cuotas" y "Ver detalle" (abre modal).
8. FAQ: de 6 a **3**, más "¿Otra duda? Preguntale a Malejo".
9. Cierre.

### 4.3 `/precios`: de 616 palabras y 27 precios a ~350 palabras y 9 precios por pestaña
- Sale el selector de medio de pago.
- Pestañas por necesidad, como ya está. **3 tarjetas por pestaña**, más "Ver otras opciones".
- Combos: **solo los que tocan esa pestaña**, no los 4 siempre.
- Extras: botón "Sumale extras" que abre un modal.
- La letra chica pasa a 1 línea y "Ver condiciones", que abre un modal.

### 4.4 `/cotizador`: de 48 montos a 1 total
- Cada ítem muestra su precio chico.
- El bloque de total muestra **el total, 2 pagos de X y 3 pagos de X**, y "con tarjeta: hasta 6 cuotas de X" (con el +6%).
- El selector de medio se queda acá, porque es el lugar de los números.

### 4.5 `/demo`
Resumen del plan elegido con total y 3 pagos, y "La seña de $20.000 se descuenta del primer pago". Nada más.

### 4.6 Chat de Malejo
- `cotizar` y `comparar` devuelven también `pagos: { dos, tres, tarjeta }`.
- La tarjeta del chat muestra el total y "3 pagos de X".
- Regla nueva en el prompt: si la persona duda por el precio, ofrecé primero los 3 pagos sin interés, después un plan más chico, y nunca descuentos (como ya está: los descuentos se derivan a Mauro).
- `conocimiento.ts`: se actualizan los textos de pagos y cuotas, y la FAQ "¿Se puede pagar en cuotas?" arranca con los 3 pagos sin interés por transferencia.
- Las evals suman 2 casos: "¿se puede en cuotas?" y "es caro para mí".

## 5. El modal de plan (especificación)

**Disparador**: en cada tarjeta, el botón de texto "Ver qué incluye", que no compite con "Lo quiero". Sin JavaScript es un enlace a `/servicios/<cat>#<id>`, donde está el detalle completo dentro de un `<details>`.

**Contenido, en este orden:**
1. Nombre, para quién, plazo.
2. Precio total, **3 pagos de X sin interés**, y "o 2 pagos · o tarjeta hasta 6 cuotas" en una línea.
3. **Qué incluye**: lista completa (`items`).
4. **Qué no incluye**: lista nueva `noIncluye`. Siempre concreta, por ejemplo:
   - "Tu dirección web (.com.ar, la paga NIC.ar)";
   - "Fotos profesionales";
   - "Lo que cobra WhatsApp por mensaje";
   - "Lo que cobra la inteligencia artificial por uso";
   - "Más de N secciones".
5. **Después del primer año**: qué pasa y cuánto sale, de `category.note` o un campo por plan.
6. Forma alternativa de pago, si existe (`alt`).
7. Botones: **"Lo quiero"** (principal, `/demo?plan=`) y "Preguntale a Malejo" (abre el chat con `tema` = el plan).

**Implementación**
- `<dialog>` nativo con contenido renderizado en el servidor o en la isla de catálogo. Una isla mínima `PlanDialog` hace `showModal()` y cierra con Esc o con clic afuera.
- Foco atrapado, porque lo da el `<dialog>` nativo, y foco devuelto al disparador al cerrar.
- Animación con Framer Motion (`m` + `LazyMotion`, `data-reveal` no aplica porque arranca cerrado), respetando `useReducedMotion`.
- URL sin cambios, para que las rutas sigan estáticas. Opcional: `#plan-<id>` con `history.replaceState` para compartir.
- Mismo modal para los combos, con "Qué trae" (los planes que suma), "Ahorrás $X" y "Por mes".
- Modales chicos, con el mismo componente: "Formas de pago", "¿Cómo funciona la seña?", "Sumale extras" y "Condiciones".

## 6. Decisiones (respondidas el 10-11)

| # | Decisión | Propuesta |
|---|---|---|
| D1 | Tabla de precios §3 | ✅ Aprobada tal cual |
| D2 | 3 pagos sin interés: ⅓ demo, ⅓ entrega, ⅓ a 30 días | ✅ Sí, **solo con total de hasta $600.000** |
| D3 | `landing-premium` pasa a "Página completa" sin asistente | ✅ Sí |
| D4 | ★ de IA | ✅ Se queda en el asistente web |
| D5 | El plan escrito de proyectos grandes se descuenta de la 1.ª etapa | Sin responder: no entra en P1 |
| D6 | Sacar el selector Transferencia/MP de `/precios` | ✅ Entra en P1 |

## 7. Sumado el 11-11 (pedidos de Mauro, detalle en la tanda P1, Fase 3 bis)
- `/precios` en celular: grilla de botones con las 7 categorías a la vista, la elegida resaltada; abajo se actualizan planes y combos. Sale el desplegable negro.
- Las baldosas de la home abren `/precios` con la categoría elegida; "Ver todos los precios" pasa a botón grande y "Precios" queda visible en el encabezado del celular.
- Extras: lista de una fila por extra dentro de un modal, para que no se solapen.
- Título: "Elegí lo que necesita tu negocio".
- "Sin permanencia" pasa a "lo das de baja cuando quieras, avisando 30 días antes".
- Lo mensual dice "incluye soporte funcional".
- Auto, taller y nafta: el sistema se compra una vez, el mantenimiento se paga por mes, y el uso de IA y WhatsApp lo cobran esas empresas aparte. Va en una franja en `/precios` y soluciones, en el modal de los planes con IA o WhatsApp, en las preguntas frecuentes y en el chat. Sin montos orientativos.
