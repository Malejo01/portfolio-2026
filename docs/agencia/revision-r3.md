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
| U4 | "Soy Mauro, **y te atiendo yo**", pero el primer contacto es un bot. | Contradicción chica que un cliente desconfiado nota. | "Soy Mauro. Malejo te orienta y yo hago tu proyecto." | S |
| U5 | El hero no tiene **ningún número**. | "Precios publicados" sin un precio a la vista pide fe. | Agregar "Páginas desde $180.000" (que salga del catálogo) debajo de la bajada. | S |
| U6 | En `/servicios/*` los **3 beneficios** ocupan ~230 px en celular, antes del precio. | El precio queda en la 2.ª pantalla. | En celular, beneficios en una lista compacta (no tarjetas) o después del plan recomendado. | S |
| U7 | `/precios` en celular mide **7,2 pantallas**. | Sigue siendo la página más larga. | Plegar "Ver los otros planes" como en las soluciones; mostrar el recomendado de cada categoría y el resto en `<details>`. | M |
| U8 | El **botón flotante** tapa el "+" de las preguntas del cierre en celular. | Hay que hacer scroll para tocarlo. | `padding-bottom` extra en el último bloque, o que las preguntas del cierre dejen 64 px a la derecha. | S |
| U9 🧑 | El blog tiene **un solo post**. | Para buscar en Google ("cuánto sale una página web en Salta") hace falta más. | 1 post por mes sobre las preguntas reales del chat (ver §3: los temas salen solos de los eventos). | M |
| U10 | Después de enviar `/demo` **no hay una confirmación por WhatsApp** al cliente. | El cliente no sabe si llegó. | Botón "Avisale a Mauro por WhatsApp que lo mandé", con el resumen. | S |
| U11 | `/cotizador` y `/precios` se pisan. | Dos caminos para lo mismo confunden. | Llevar el cotizador a "Armá tu combo" dentro de `/precios`, o sacarlo del menú y del pie y dejarlo solo en las soluciones. | M |

Ya resuelto en esta tanda (R3): `/demo` arranca con lo que la persona ya le contó a Malejo, la charla sobrevive a una recarga y los combos muestran la cuota mensual igual que los planes.

---

## 2. Malejo, como vendedor

_(Se completa con la simulación: ver §2.1 y §2.2.)_

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
