# Tanda P3-4 · Malejo: recorrido de bienvenida, tema por estilo y caras del personaje

**Requisito:** P3 completo en `main` (PR #10 al #13, `main` en `60f3910` o posterior).

- Repo `Malejo01/portfolio-2026`, sitio de la agencia.
- Rigen todas las reglas de `CLAUDE.md`, en especial:
  - el presupuesto de rendimiento del 16-11;
  - copy en `content/agencia/`, que pasa el test de glosario;
  - ningún hex en componentes;
  - ninguna ramificación por estilo en JS;
  - `data-reveal`;
  - Framer Motion con `LazyMotion` + `m`.
- Trabajá en loop, con un commit por fase y **sin pedir permiso**.
- Rama `p3-4-recorrido` desde `main`. Un solo PR contra `main`, sin mergear.

**Adjunto:** `caras-hoy-vs-propuesta.png`. Arriba están los recortes de hoy en los 3 dibujos (chat 40 px, chat 32 px y barra 56 px). Abajo, el recorte por cara propuesto.

## Fase 1 · Tema por estilo (decisión de Mauro, 16-11)
**Hoy:** el tema es uno solo para todo el sitio (cookie `malejo-theme`). Si la persona alguna vez eligió oscuro, aunque haya sido en Tech, Institucional arranca oscuro.

**Lo que queremos:** cada estilo arranca en **su** tema y recuerda solo lo que la persona cambie **dentro de ese estilo**.
1. **Guardado por estilo** en `localStorage["malejo-tema-<estilo>"]` (`"dark"` | `"light"`). El toggle de tema escribe la clave del estilo activo.
2. **Tema de entrada** (`temaDeEntrada` en `estilos.ts`):
   - Tech: oscuro (el de siempre del sitio);
   - Institucional: claro;
   - Aula: oscuro;
   - Tienda: claro.

   Sin clave guardada para un estilo, vale su tema de entrada. **Una clave de otro estilo no cuenta.**
3. **Migración:** si existe la cookie `malejo-theme` de antes, su valor pasa a ser el de **Tech** (`malejo-tema-tech`) la primera vez, y después la cookie ya no se usa para la agencia. La cookie del portfolio es otra y no se toca.
4. **Lugares a cambiar:**
   - `arrancar()` (el script inline y el respaldo del 404);
   - `elegirEstilo()`: al cambiar de estilo aplica el tema guardado del estilo de destino o, si no hay, su tema de entrada, dentro de la misma View Transition;
   - el `ThemeToggle`.

   Sigue sin haber Server Components que lean el tema, y las rutas siguen `○`.
5. **Tests unitarios** de la función que resuelve el tema (estilo, clave guardada, cookie vieja), y actualizá la sección **Tema** de `CLAUDE.md`.

## Fase 2 · La cara del personaje en los recortes
**Hoy:** el chat (avatar de 40 y 32 px) y el botón de Malejo de la barra inferior (56 px) recortan el sprite **de cuerpo entero alineado arriba**. Con el 16-bit funciona, pero con el chibi (cabeza enorme) se ve solo el pelo, y con el anime sale el cuerpo entero chiquito. Ver la imagen adjunta.
1. **`scripts/sprites/config.json`:** cada dibujo suma `cara: [x0, y0, x1, y1]`, un cuadrado en coordenadas del **lienzo fuente** (`docs/agencia/sprites/fuente/<dibujo>/`). Valores de partida, calculados centrando en los anteojos:

   | Dibujo | `cara` |
   |---|---|
   | 16-bit | `[-5, 6, 355, 367]` (se ve igual que hoy) |
   | chibi | `[38, 73, 472, 508]` |
   | anime | `[94, 9, 287, 202]` |

   Ajustalos si hace falta para que se vea como en la mitad de abajo de la imagen: cara entera con anteojos, algo de pelo y el arranque de los hombros.
   - `limpiar.py` tiene que traducir la caja al lienzo recortado y escribirla en `sprites.json`.
   - Un valor negativo o que se pasa del lienzo significa "aire transparente". No lo recortes a 0.
2. **Componente `<CaraMalejo tamaño forma />`** (sin hooks, sirve en el servidor y en el widget):
   - muestra la pose `ok` de cada dibujo, escalada para que la caja `cara` llene el contenedor;
   - igual que `Sprite`: los 3 dibujos renderizados, el CSS muestra el de `data-dibujo` y los ocultos van `lazy`;
   - `width` y `height` explícitos, sin CLS.
3. **Reemplazos y auditoría:** usalo en el `Avatar` del chat (32 y 40 px) y en el botón de Malejo de la `BottomNav` (56 px). Después buscá cualquier otro `overflow-hidden` que recorte un `Sprite` y aplicá lo mismo. Anotá en el informe cuáles encontraste.
4. **Verificación:** capturas de los 3 dibujos en cada recorte, al lado de la imagen adjunta, en `docs/agencia/verificacion/p3-4/caras-*.png`.

## Fase 3 · Recorrido de bienvenida (onboarding)
**Decisiones de Mauro (16-11):**
- sale **una vez, en la primera visita**, y se puede volver a ver con un enlace **"¿Cómo uso la página?"**;
- **Malejo señala cada botón:** el resto de la página se oscurece, se ilumina un botón por vez y Malejo lo explica en un globito;
- son **3 pasos**, los mismos en celular y escritorio, aunque cambie dónde está cada botón.

### Pasos y copy (en `content/agencia/recorrido.ts`, pasa el glosario)
| Paso | Escritorio (≥ 760 px) | Celular (< 760 px) | Título | Texto |
|---|---|---|---|---|
| 1 | "Hablá con Malejo" del encabezado | Malejo en la barra inferior | Hablá con Malejo | Soy Malejo, el asistente de Mauro. Contame qué necesita tu negocio y te ayudo a elegir. Si preferís, te paso con Mauro por WhatsApp. |
| 2 | "Armar mi kit" del hero | Soluciones en la barra inferior | Armá tu kit | Acá están todas las soluciones con su precio. Sumá lo que te sirve y mirás un estimado al instante. |
| 3 | Pestaña "Estilos" del borde | Ícono de la paleta en el encabezado | Probá otro estilo | ¿Querés ver cómo se vería una web de tu rubro? Mirá esta página como Institucional, Aula virtual o Tienda. |

- **Botones:** "Siguiente" y "Saltar"; en el último paso, "¡Listo!". Arriba, "1 de 3".
- **Los objetivos se marcan con `data-recorrido="malejo|kit|estilos"`** en los elementos reales. Si un objetivo no existe o no se ve, ese paso se saltea.

### Cuándo aparece
- **Solo en la home**, la primera vez (sin `localStorage["malejo-recorrido"]`), unos **4 s después de que el hero esté a la vista** y con el navegador libre (`requestIdleCallback`).
- **No aparece si,** antes de que salga, la persona ya:
  - abrió el chat;
  - tocó alguno de los 3 botones;
  - abrió el selector de estilos;
  - scrolleó más allá del hero.

  En esos casos se marca como `"saltado"` y no vuelve solo.
- **Al terminar o saltar**, se guarda `malejo-recorrido` (`"visto"` o `"saltado"`).
- **"¿Cómo uso la página?"** va en el pie, en el menú del celular y al final del panel de estilos. Lo abre siempre, en cualquier página que tenga los objetivos, y no toca la marca.
- **Sin JS no hay recorrido**, y el enlace no se muestra (`.js-only`).

### Cómo se ve
- **Velo:** oscurece la página con un **hueco** sobre el objetivo, con un margen de 8 px y el radio del objetivo, y con un borde del color de acción del estilo.
  - El color del velo es un token por estilo (`--recorrido-velo`) en claro y oscuro.
  - Mientras dura el recorrido, el objetivo no se puede tocar.
- **Globito:** con las clases de tarjeta del estilo activo y el **personaje del dibujo activo** al costado (`Sprite pose="ok"`, unos 72 px). En el paso 1, Malejo saluda una vez (`reproducir()`).
  - Se ubica del lado con más espacio y **nunca tapa el objetivo**.
  - En el celular va arriba o abajo del objetivo, a todo el ancho menos el margen, y respeta la barra inferior y `safe-area`.
  - Se recalcula al girar el celular, al redimensionar y al hacer scroll.
  - Si el objetivo está fuera de la vista (por ejemplo, "Armar mi kit" después de scrollear), primero `scrollIntoView` suave (instantáneo con movimiento reducido).
- **Movimiento:** el hueco y el globito pasan de un paso al otro con una transición corta; con movimiento reducido, cambio directo. Va en los **4 estilos × claro y oscuro**, solo con tokens.

### Accesibilidad
- El globito es `role="dialog"` con `aria-labelledby` (el título) y `aria-describedby` (el texto).
- Al abrir, el foco va a "Siguiente". Tab circula solo dentro del globito, Esc = "Saltar", y al cerrar el foco vuelve a donde estaba.
- El cambio de paso se anuncia en una región `aria-live="polite"` ("Paso 2 de 3: Armá tu kit").

### Rendimiento
- **Isla nueva `client/Recorrido.tsx`,** cargada con `next/dynamic` (`ssr: false`) **solo** cuando se cumplen las condiciones o alguien toca "¿Cómo uso la página?". El cargador decide sin bajar el chunk.
- La primera visita sigue dentro del presupuesto (LCP de Tech ≤ +10 %, TBT ≤ 250 ms, CLS 0). El recorrido aparece después del LCP y no lo mide.

### Analytics
`recorrido_inicio` (`{ origen: "auto" | "enlace" }`), `recorrido_paso` (`{ paso }`) y `recorrido_fin` (`{ completo: boolean, paso }`). Solo conteos, sin texto.

## Fase 4 · Verificación (antes del PR)
- `npm run lint`, `npm test` y `npm run build`, con la tabla de rutas igual que en `main`.
- **Tema por estilo:** en incógnito:
  - entrar a Institucional da claro, Aula oscuro y Tienda claro;
  - pasar Institucional a oscuro, ir a Tech y volver: Institucional sigue oscuro y Tech no cambió;
  - con la cookie vieja en oscuro, Tech oscuro e Institucional claro;
  - el 404 respeta todo esto.
- **Caras:** las capturas de la Fase 2.
- **Recorrido:** script `docs/agencia/verificacion/p3-4/recorrido.js`, en los 4 estilos × claro y oscuro × 360, 390, 768 y 1280 px:
  - los 3 pasos encuentran su objetivo;
  - el globito queda entero dentro de la vista y no se superpone al hueco;
  - contraste AA del globito;
  - Esc cierra y el foco vuelve;
  - no reaparece al recargar, y "¿Cómo uso la página?" lo vuelve a abrir;
  - no sale si antes se abrió el chat.

  Capturas de cada paso en `docs/agencia/verificacion/p3-4/recorrido-*.png`.
- Presupuesto de rendimiento con el mismo método de P3-3.1.
- Sección "P3-4" en `docs/agencia/INFORME.md` y `CLAUDE.md` actualizado (tema por estilo, `CaraMalejo`, `Recorrido`).
