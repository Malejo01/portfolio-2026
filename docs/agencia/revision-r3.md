# Revisión R3 · el sitio y Malejo vistos como cliente

Fecha: 9/11/2026 · Rama `claude/compassionate-ride-ypvfbj` (PR #7, sin mergear).

Recorrí el sitio como lo haría el dueño de un negocio de Salta que llega desde Google o Instagram, en celular (390 × 844) y en escritorio (1440 × 900). Usé el build de producción local, con los textos y las fuentes reales, y anoté qué lo frena y qué le falta para escribir.

**Límite de esta revisión.** Este entorno no tiene `ANTHROPIC_API_KEY`, así que no pude hablar con Malejo usando el modelo real. Para el agente hice dos cosas:

1. Una **simulación** de 22 conversaciones: otro agente hace de cliente y de Malejo, con el prompt y las herramientas reales. Sirve para encontrar huecos del prompt, pero no es Haiku en producción.
2. Pruebas automáticas con el modelo simulado de los tests.

Las evals reales (`npm run eval:chat`) siguen pendientes y son el primer paso de mañana (ver "Pasos manuales").

---

## 1. El sitio, como usuario

### Lo que ya funciona
- **Se entiende qué hace y cuánto sale** en la primera pantalla y media. En celular, las 6 baldosas con "Desde $…" responden "¿me sirve?" y "¿cuánto?" sin leer nada largo.
- **Hay una sola acción clara**: "Contame qué necesitás" abre el chat. Si el chat falla, el botón es WhatsApp.
- **El 50/50 y la demo antes de pagar** aparecen tres veces (garantías, pasos y "Cómo se paga"), y eso baja el miedo a la seña.
- **Las páginas de solución** responden en orden lo que se pregunta un cliente: ¿es para mí? → ¿qué gano? → ¿qué me conviene? → ¿se hizo antes? → ¿cómo pago? → dudas → ¿cómo sigo?

### Lo que todavía frena (para la próxima tanda)
Ordenado por impacto en ventas. Lo marcado con 🧑 necesita algo que solo Mauro puede dar.

| # | Qué ve el usuario | Por qué frena | Propuesta | Esfuerzo |
|---|---|---|---|---|
| U1 🧑 | No hay **ni un cliente real**: los 3 proyectos son propios. | Un dueño de pyme busca "alguien como yo" que ya contrató. | Primer caso pyme (aunque sea a precio de costo) con captura, una frase del dueño y el resultado ("dejé de dar turnos por WhatsApp"). Lugar: la tarjeta de proyecto parecido de cada solución y la franja de la home. | M |
| U2 🧑 | No hay **reseñas** (Google, Instagram). | Es la prueba social más barata. | Ficha de Google Business de Malejo, pedir 3–5 reseñas y mostrar la nota + 2 citas en el cierre. | S |
| U3 🧑 | Falta la **foto** de Mauro. | "Soy Mauro, y te atiendo yo" con un sprite no termina de dar confianza. | Subir `public/agencia/marca/mauro.jpg`: la home ya la toma sola. | S |
| U4 ✅ | "Soy Mauro, **y te atiendo yo**", pero el primer contacto es un bot. | Contradicción chica que un cliente desconfiado nota. | **Hecho en R3:** "Soy Mauro, detrás de Malejo." | S |
| U5 | El hero no tiene **ningún número**. | "Precios publicados" sin un precio a la vista pide fe. | Agregar "Páginas desde $180.000" (que salga del catálogo) debajo de la bajada. | S · ojo: suma ~30 px y la home en celular está en 5,46 de 5,5 pantallas; hay que sacar algo a cambio |
| U6 ✅ | En `/servicios/*` los **3 beneficios** ocupaban ~230 px en celular, antes del precio. | El precio quedaba en la 2.ª pantalla. | **Hecho en R3:** en celular son una lista compacta; desde `sm`, tarjetas. | S |
| U7 | `/precios` en celular mide **7,2 pantallas**. | Sigue siendo la página más larga. | Plegar "Ver los otros planes" como en las soluciones; mostrar el recomendado de cada categoría y el resto en `<details>`. | M |
| U9 🧑 | El blog tiene **un solo post**. | Para buscar en Google ("cuánto sale una página web en Salta") hace falta más. | 1 post por mes sobre las preguntas reales del chat (ver §3: los temas salen solos de los eventos). | M |
| U10 ✅ | Después de enviar `/demo` no había forma de **avisar por WhatsApp**. | El cliente no sabe si llegó. | **Hecho en R3:** "Avisale a Mauro por WhatsApp" con el resumen. | S |
| U11 | `/cotizador` y `/precios` se pisan. | Dos caminos para lo mismo confunden. | Llevar el cotizador a "Armá tu combo" dentro de `/precios`, o sacarlo del menú y del pie y dejarlo solo en las soluciones. | M |

Ya resuelto en esta tanda (R3), además de U4, U6 y U10: `/demo` arranca con lo que la persona ya le contó a Malejo, la charla sobrevive a una recarga y los combos muestran la cuota mensual igual que los planes. Un falso positivo: el botón flotante tapaba el "+" de las preguntas del cierre en una captura, pero con scroll siempre queda libre (después está el pie).

---

## 2. Malejo, como vendedor

### 2.1 Qué se probó y qué salió

Hice 22 charlas simuladas con clientes reales posibles: odontóloga, parrilla, ropa por Instagram, "no sé qué necesito", alguien que compara con un freelancer más barato, presupuesto bajo, un pedido de factura, un cliente en inglés, una web en WordPress, "lo necesito para el viernes", una app tipo Rappi, alguien que deja nombre y teléfono en medio de la charla, "quiero hablar con una persona", privacidad, una baldosa de turnos, "ayer hablé con vos", un sitio hecho por otro, una agencia que pide marca blanca, un troll, el pago de la seña y un descuento por pagar en efectivo. Las transcripciones están en `docs/agencia/evals/2026-11-09-simulacion.md`.

**Antes de R3: 8 pasan, 5 en riesgo, 9 fallan.** Los fallos no fueron de tono ni de largo. Fueron de **inventar** o de **no tener con qué responder**:

| Falla | Ejemplo | Arreglo en R3 |
|---|---|---|
| Prometer funciones que el plan no dice | "Sí, el paciente elige la obra social" | Sección "No inventes": lo confirma Mauro y se deriva (eval **AJ**) |
| Confirmar fechas imposibles | "Llegamos para el viernes" | No confirma: cuenta el camino real y deriva (eval **AE**) |
| Hacer cuentas | "6 cuotas de $31.800" | No calcula cuotas; `cotizar` lo recuerda (eval **AH**) |
| Pedir seña donde el plan promete demo sin cargo | Renovar una web en WordPress | Regla y texto de `/demo` (eval **AG**) |
| Contradicción de privacidad | "Mauro supervisa" contra "no guarda tu conversación" | Copy coherente y proveedor nombrado (eval **AI**) |
| Precio de cliente final a una agencia | Marca blanca | No cotiza: deriva (eval **AF**) |
| Avisar costos por uso que no existen | Combo con catálogo por WhatsApp | `cotizar` solo avisa con IA o turnos (test) |
| Perder el contacto | Deja el teléfono sin decir el rubro → error | `guardar_contacto` completa en vez de fallar (test) |
| Pedir los datos por chat | "Pasame tu nombre y tu WhatsApp" | **Formulario dentro del chat** (`pedir_contacto`) |

### 2.2 Lo nuevo del agente en R3
- **Contexto de página.** Malejo sabe si la persona escribe desde `/servicios/turnos`, `/precios` o el cotizador. Se valida contra las rutas reales.
- **Respuestas sugeridas.** Al cerrar con una pregunta previsible, agrega 2 o 3 botones ("Sí, ya tengo página" / "Todavía no"). Bajan la fricción en el celular.
- **Formulario de contacto en el chat.** Nombre, WhatsApp y casilla, con un ticket firmado por el servidor. El modelo sigue sin poder guardar nada por su cuenta.
- **Memoria de la pestaña.** La charla no se pierde al recargar ni al ir a `/demo`, y `/demo` arranca completado con lo que ya se contó. Se agregó "Empezar de nuevo".
- **Embudo medido** (ver §3).
- **"Este chat es un ejemplo del Vendedor virtual".** Cada charla funciona también como demo del producto.

### 2.3 Lo que solo Mauro puede responder (y hoy obliga a derivar)

Cada respuesta es una línea en `content/agencia/conocimiento.ts` o en `precios.json`, y saca una derivación a WhatsApp.

1. **Cómo se paga la seña**: alias o link de Mercado Pago, y si lleva el 6%.
2. **Efectivo**: ¿se acepta? ¿tiene algún precio distinto?
3. **Plazo total realista** de punta a punta y si hay **entrega urgente** (con qué recargo).
4. **Mantener sitios hechos por otros** (Wix, WordPress): ¿sí o no?, ¿y a qué precio?
5. **Marca blanca y agencias**: ¿se ofrece?, ¿con qué precio de socio?
6. **Integraciones de los turnos** (Google Calendar, obra social, señas por Mercado Pago).
7. **Qué extras van con qué plan** (por ejemplo, ¿la carta QR en dos idiomas?).
8. **Factura**: la falta de factura hace perder clientes formales. ¿Cuándo va a estar?
9. **Agenda real en Cal.com** (`NEXT_PUBLIC_CALCOM_URL`): convierte "te escribo en 2 días" en "elegí un horario ahora".

---

## 2.4 Plan para vender el asesor (próximas tandas)

El objetivo es que Malejo sea **la demo del producto** y que el mismo motor se instale en el sitio de un cliente cambiando solo su configuración.

**Tanda R4 · medir de verdad (con la clave)**
1. Correr las evals reales (36 casos, objetivo 33) y ajustar el prompt hasta pasar.
2. Sumar un **juez** opcional (otro modelo que puntúa tono, claridad y si recomendó una sola cosa) a las aserciones con regex, para lo que la regex no ve.
3. Mirar dos semanas del embudo en Vercel Analytics y fijar metas: qué porcentaje de las charlas llega a cotización y cuántas a contacto o demo.

**Tanda R5 · separar el motor de la marca ("kit de asesor")**
- `lib/asesor/`: el motor. Incluye el loop con streaming, las herramientas genéricas (`cotizar`, `comparar`, `anotar_ficha`, `pedir_contacto`, `derivar`, `sugerir_respuestas`), los límites, el origen, la ficha, la sesión y los eventos.
- `config/<cliente>.ts`: lo propio de cada cliente. Persona y tono, catálogo (el formato de `precios.json`), conocimiento y FAQ, reglas de "no inventes", canal de derivación (WhatsApp o email), colores del widget y eventos.
- Malejo pasa a ser `config/malejo.ts`. Un segundo cliente de prueba (por ejemplo, la veterinaria del primer caso pyme) valida que el motor no tenga nada de Malejo adentro.
- Las evals se parametrizan por configuración: cada cliente trae sus casos.

**Tanda R6 · producto vendible**
- **Panel mínimo** para el dueño: editar el FAQ y los precios sin tocar código (una tabla en Postgres con caché). Ver métricas del embudo y descargar los contactos (con autenticación: hoy, a propósito, no hay ningún endpoint que lea contactos).
- **Canal WhatsApp** (WhatsApp Business oficial) con el mismo motor: es lo que más piden las pymes.
- **Precio del producto**: el "Vendedor virtual" del catálogo ($600.000 + $65.000/mes) ya existe. Falta definir el costo de IA incluido por mes y el excedente.

**Riesgos a cuidar al vender:** el costo por uso de la IA (tope mensual por cliente y alertas como las de R2), la privacidad (no guardar charlas como regla del producto, que hoy es un argumento de venta) y no prometer funciones que el cliente final no tiene. La sección "No inventes" es la base de esto último.

---

## 3. Medir para mejorar

Desde R3, Vercel Analytics recibe estos eventos, sin datos personales:

| Evento | Cuándo | Para qué |
|---|---|---|
| `cta_chat` | Un botón "Contame qué necesitás", "Hablá con Malejo" o "Preguntale a Malejo" (página, si tenía tema, si abrió el chat o WhatsApp) | Qué botones traen gente |
| `chat_abierto` | Se abre el chat (flotante, botón o baldosa) | Tasa de apertura |
| `chat_mensaje` | Cada mensaje del usuario, con su número de orden | Profundidad de la charla |
| `chat_tarjeta` | Cada tarjeta (cotización, comparación, demo, WhatsApp, contacto, opciones) | Cuánto se cotiza |
| `chat_opcion` | Se toca una respuesta sugerida | Si las respuestas sugeridas ayudan |
| `chat_clic` | Clic en la demo o en WhatsApp desde el chat | **Conversión** |
| `chat_contacto_guardado` | La persona dejó su contacto | **Conversión** |

**Ojo:** los eventos personalizados de Vercel Analytics necesitan el plan Pro. En Hobby no se registran (no rompen nada).

El embudo que hay que mirar cada semana es `chat_abierto → chat_mensaje (n ≥ 2) → chat_tarjeta (quote) → chat_clic / chat_contacto_guardado`.
