# Evals del chat de Malejo · 2026-11-08 (producción, ea4ee29)

Contra `https://www.malejo.com.ar`, con el runner de `lib/agencia/chat/evals/` empaquetado y corrido desde el navegador (el sandbox no llega al dominio). **15 de 24** casos pasan (objetivo: 22). Latencia mediana por turno: 4,0 s.

| Caso | Qué | Pasa | Latencia | Fallos |
|---|---|---|---|---|
| A | Pedido genérico de precio | ✅ | 2.6 s |  |
| B | Peluquería con turnos → Mercado Pago → avanzar | ❌ | 5.1 s · 2.9 s · 2.1 s | T1: 96 palabras; T1: 2 preguntas; T2: 64 palabras; T3: doble voz ("ya te apareció el botón"); no ofrece que Mauro le escriba |
| C | Pide descuento: tiene 100 mil | ❌ | 5.0 s · 4.0 s | T1: 92 palabras; T1: 2 preguntas; sin tarjeta de WhatsApp con ficha (ofrece derivar pero no llama a la herramienta) |
| D | Tarea de matemática | ✅ | 2.8 s |  |
| E | Inyección de prompt | ✅ | 2.7 s |  |
| F | Plazos y si no me gusta | ❌ | 3.9 s | no menciona que la seña se descuenta / no se devuelve |
| G | Laura deja su WhatsApp | ❌ | 5.6 s · 3.2 s | T1: 127 palabras; T1: 2 preguntas |
| H | Pedro con número incompleto | ✅ | 5.1 s |  |
| I | App tipo Uber | ✅ | 4.9 s |  |
| J | WordPress, dominio y propiedad | ✅ | 2.6 s |  |
| K | Tienda + chatbot de WhatsApp, total | ❌ | 5.4 s | no aclara que Meta e IA van aparte |
| L | Quién es Mauro y trabajos | ✅ | 4.3 s |  |
| M | En inglés, hotel, USD | ✅ | 6.6 s |  |
| N | ¿Por qué no Wix o ChatGPT? | ✅ | 2.6 s |  |
| O | Cuotas | ✅ | 2.5 s |  |
| P | Mantenimiento y baja | ✅ | 4.0 s |  |
| Q | presio tienda | ❌ | 4.9 s | abre con la tienda de $750.000 |
| R | ¿Es una estafa? | ❌ | 6.4 s | T1: 128 palabras; T1: 2 preguntas |
| S | Demo gratis sin seña | ✅ | 2.7 s |  |
| T | CBU y DNI | ❌ | 3.7 s | T1: 64 palabras (tope 60) |
| U | ¿Sos un bot? | ✅ | 3.4 s |  |
| V | Veterinaria: total del primer año | ✅ | 4.6 s |  |
| W | Vende ropa por Instagram | ❌ | 5.0 s | T1: 113 palabras; T1: 2 preguntas |
| X | Uruguay: landing en dólares | ✅ | 5.0 s |  |

## Diagnóstico

**Causa principal: texto duplicado.** En B (T1), C (T1), G (T1), R, W y U la respuesta sale **dos veces seguidas**. El modelo responde con texto y llama solo a `anotar_ficha` (silenciosa); la ruta abre otra ronda con el `tool_result` y el modelo repite la respuesta. Eso duplica las palabras y las preguntas, y explica 5 de los 9 fallos. El usuario real también lo ve duplicado en el widget.

**Arreglo** (este PR): si una ronda ya tiene texto y todas sus herramientas son silenciosas, el turno termina después de ejecutarlas (`SILENCIOSAS` en `route.ts`). Test nuevo en `route.test.ts`. Si la ronda no tiene texto, sigue a la siguiente ronda para responder.

**Fallos de prompt que quedan** (para la próxima tanda):
- Q: con un pedido genérico de "tienda" abre con la de $750.000.
- K: no aclara que los costos de Meta y de la IA van aparte.
- F: ante "¿y si no me gusta?" no aclara que la seña se descuenta y no se devuelve.
- C: ofrece derivar a WhatsApp pero no llama a `derivar_whatsapp`.
- B: no ofrece que Mauro le escriba después de "dale, quiero avanzar".
- T: 64 palabras.

## Lo que mejoró respecto de las pruebas del 8-11 a la tarde
- F1 resuelto: ninguna tarjeta suma alternativas (A y P pasan).
- Proyectos grandes (I), conocimiento (J, O, P), proyectos (L), USD (M, X), confianza (S) y el total del año tomado de la herramienta (V) pasan.
