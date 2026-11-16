# Malejo · P3: estilos de web, personaje en varios dibujos y easter eggs (plan, 15-11)

**Estado:** plan aprobado en sus decisiones. **Se lanza después de mergear P2.** La parte de sprites arranca ya, en paralelo, porque no depende de código.

## 0. Decisiones de Mauro (15-11)

| # | Decisión |
|---|---|
| E1 | **8 estilos**, cada uno representa un tipo de web que Malejo hace: Tech/IA (el actual), Institucional, Aula virtual, Tienda/catálogo, Personal/portfolio, Gastronomía/bar, Turismo/aire libre y Salud/turnos. |
| E2 | **Dos olas de 4.** Ola 1: Tech/IA, Institucional, Aula virtual y Tienda, junto con todo el sistema de estilos. Ola 2: Personal, Gastronomía, Turismo y Salud, que solo reusan el sistema. |
| E3 | **Piel en todo el sitio y composición propia en la home.** Colores, tipografías, formas, íconos y sprite cambian en todas las páginas. La home además cambia su hero y el acomodo de las secciones según el estilo. `/soluciones` y el chat mantienen su estructura y solo cambian de piel. |
| E4 | **El estilo sale al azar en la primera visita y después se recuerda.** El botón "Probá otro estilo" recorre todos sin repetir (shuffle bag). |
| E5 | **El personaje tiene 3 dibujos (16-bit, chibi y anime) y uno sale al azar en cada cambio de estilo.** Además, cada estilo le pone su accesorio. |
| E6 | **Easter eggs:** tocar al personaje, código Konami y sacudir el celular, mini juego en el 404, y frases ocultas en el chat con un álbum de hallazgos. |
| E7 | **Herramientas gratis** para los sprites: LibreSprite o Piskel, Gemini, las pruebas gratis de las IA de pixel art y scripts de limpieza en el repo. |

## 1. Arquitectura

```
<head> script inline (el mismo patrón del tema, sin leer cookies en el servidor)
  └─ lee localStorage "malejo-estilo"
       ├─ si no existe: elige uno al azar entre los de la ola publicada y lo guarda
       └─ <html data-estilo="aula" data-dibujo="anime">   ← antes del primer pintado
          (rutas siguen ○; sin JS: data-estilo="tech", que es el CSS por defecto)

app/(agencia)/estilos.css
  [data-estilo="institucional"] { --bg… --acc… --radio… --fuente-titulo… }
  [data-estilo="institucional"].dark { … }   ← cada estilo tiene claro y oscuro
  Los nombres de los tokens no cambian: los componentes no se enteran del estilo.

content/agencia/estilos.ts   (fuente única)
  { id, nombre, categoria → servicio que representa, paleta, fuentes,
    accesorio, frase del hero, ejemplo del hero, ola }

Home
  components/agencia/home/estilos/<id>/Hero.tsx   (Server Components)
  · se renderizan todos los heroes; CSS muestra solo el de [data-estilo]
    (los otros llevan display:none y sus imágenes, loading="lazy")
  · el acomodo de las secciones por estilo usa grid-template-areas en CSS
  · cada hero trae un "Así se vería tu web de <categoría> →" que lleva a
    /soluciones?cat=<categoría>: el estilo vende el servicio que muestra

Selector  (isla components/agencia/client/EstiloSelector.tsx)
  escritorio: una pestaña vertical "🎨 Estilos" pegada al borde derecho
  celular:    un ícono 🎨 en el header, al lado del logo (la barra de abajo de P2 no se toca)
  → abre una hoja o panel con 8 miniaturas (las de la ola 2 aparecen como "Próximamente")
    + "Al azar"
  → el cambio usa document.startViewTransition() (fundido) si existe;
    si no, Framer Motion sobre el hero. Con movimiento reducido, cambio instantáneo.

Personaje  (components/agencia/Sprite.tsx, Server Component + CSS)
  public/sprites/<dibujo>/<pose>.png       hojas de frames en una fila
  public/sprites/<dibujo>/sprites.json     { celda, escala, poses: { idle: { frames, fps, loop } }, anclas }
  public/sprites/accesorios/<accesorio>/<dibujo>.png   capa encima, alineada con las anclas
  · la animación usa CSS steps() + background-position: sin JS y pausable
  · 3 dibujos × N accesorios se combinan por capas, sin dibujar cada combinación
  · los dibujos rotan con un shuffle bag en cada cambio de estilo; el dibujo
    elegido se guarda en data-dibujo
  · Malejo (el chat) usa el mismo <Sprite> y elige la pose según el estado:
    saludo al abrir · pensando mientras escribe · señalar cuando muestra tarjetas ·
    festejo cuando alguien manda su armado · idle sin actividad

Easter eggs  (lib/agencia/eggs.ts + isla components/agencia/client/Eggs.tsx, carga diferida)
  registro: { id, nombre, pista, como se dispara }
  álbum en localStorage + "🏆 3/12" en el pie, que abre la lista con pistas
  evento de analytics egg_encontrado { id }: solo el id, nunca texto
```

### Paleta y tipografías por estilo (punto de partida para que lo proponga Claude Design)

| Estilo | Representa | Sensación | Fuentes (máx. 2) | Acento | Accesorio |
|---|---|---|---|---|---|
| Tech/IA | Asistentes, automatizaciones | El actual, oscuro con naranja | Las actuales | Naranja | Auriculares |
| Institucional | Web de empresa, municipio | Sobrio y confiable, mucho aire | Serif de titulares + sans | Azul petróleo | Corbata y carpeta |
| Aula virtual | Plataformas educativas | Cuaderno: renglones, trazos y ecuaciones que se dibujan | Manuscrita + sans | Rojo de margen | Guardapolvo y tiza |
| Tienda | Catálogo, tienda | Vivo, tarjetas de producto, etiquetas de precio | Sans redondeada | Fucsia o verde | Bolsa de compras |
| Personal | Portfolio profesional | Editorial, una columna, foto grande | Serif editorial | Negro y un color | Cámara |
| Gastronomía | Carta QR, bar | Pizarra, tiza, papel kraft | Fuente de pizarra + sans | Mostaza | Delantal y gorro de chef |
| Turismo | Guía con mapa, salidas | Naturaleza, fotos a pantalla completa, topografía | Sans condensada | Verde bosque | Mochila y gorro |
| Salud | Turnos, consultorio | Limpio, verde menta, agenda a la vista | Sans humanista | Menta | Ambo y estetoscopio |

**Regla de fuentes:** entre los 8 estilos, como mucho 6 familias en total, con `next/font` y `preload` solo en las de Tech/IA. El navegador baja una fuente solo cuando el estilo activo la usa.

**Contraste:** un test recorre los 8 estilos en claro y oscuro y calcula el contraste AA de los pares texto/fondo de los tokens. Si alguno no llega, el build falla.

## 2. Easter eggs (12 para el álbum)

| # | Easter egg | Cómo se dispara | Qué pasa |
|---|---|---|---|
| 1 | Cosquillas | Tocar al personaje 5 veces | Se ríe y se mueve (pose mareado) |
| 2 | Enojo | Tocarlo 10 veces | Se cruza de brazos: "¡Che, estoy trabajando!" |
| 3 | Clase gratis | Tocarlo 20 veces | Saca el pizarrón y escribe una ecuación que se anima |
| 4 | Konami | ↑↑↓↓←→←→BA en el teclado | Modo 8-bit: todo pixelado y una musiquita de 3 s (sin audio con movimiento reducido o si el dispositivo está en silencio) |
| 5 | Sacudón | Sacudir el celular (en iOS, pide permiso con un toque) | Lluvia de mates |
| 6 | Mini juego | Entrar al 404 | "Esquivá los bugs": el personaje salta los bugs con tap o espacio, y el récord se guarda en el teléfono |
| 7 | Mate | Escribirle "mate" a Malejo | Malejo ceba uno (animación), sin gastar la API |
| 8 | Salta la linda | Escribir "Salta" | Postal pixelada del cerro San Bernardo |
| 9 | Chiste | Escribir "contame un chiste" | Chiste de programador de una lista fija, sin la API |
| 10 | Profe | Escribir "derivada" o "integral" | Malejo explica en 2 líneas y vuelve al tema |
| 11 | Noche | Entrar entre las 2 y las 5 de la mañana | El personaje bosteza con un café: "¿Vos también trabajando a esta hora?" |
| 12 | Coleccionista | Encontrar los otros 11 | El personaje en versión dorada y un cupón simbólico: "Le mostrás esto a Mauro y te invita un café" |

**Reglas de los easter eggs:**
- Nunca tapan el contenido ni un botón.
- Se cierran solos en 4 s o con Esc.
- Con movimiento reducido no se animan, pero igual cuentan para el álbum.
- Las frases del chat se resuelven **en el cliente, sin llamar a la API**: cero tokens y no cuentan para los límites.
- Si la frase está dentro de una pregunta real ("¿el mate…?"), va al modelo normalmente.
- El cupón es simbólico: no hay descuento en el sistema.

## 3. Cómo producir los sprites animados con herramientas gratis (E7)

### 3.1 Los tres dibujos

| Dibujo | Celda | Proporción | Uso |
|---|---|---|---|
| 16-bit (el actual) | 34×80 px | Cabeza ~38%, piernas largas | El que ya existe: poses v1 en `claude/malejo-sprite-prompt.md` |
| Chibi | 32×40 px | Cabeza ~55%, cuerpo de 2 cabezas, ojos grandes | El más "tierno": tiendas, gastronomía |
| Anime | 48×96 px | Cabeza ~20%, ojos grandes con brillo, pelo con mechones | El más expresivo: aula, personal |

Los tres respetan la **paleta cerrada** del sprite actual: piel, pelo, anteojos, camisa negra, jean y zapatillas. Lo que cambian son las proporciones, no la identidad.

### 3.2 Poses y frames por dibujo (todas en loop salvo que se indique)

| Pose | Frames | fps | Dónde aparece |
|---|---|---|---|
| idle (respira y parpadea) | 4 | 6 | Hero, chat en espera |
| saludo | 6 | 10 | Al abrir el chat, primera visita |
| pensando | 4 | 6 | Mientras Malejo escribe |
| señalar | 4 | 8 | Cuando muestra tarjetas |
| festejo (sin loop) | 6 | 12 | Armado enviado, easter egg 12 |
| mareado | 6 | 10 | Easter egg 1 |
| enojado | 4 | 6 | Easter egg 2 |
| pizarrón | 8 | 8 | Easter egg 3, estilo Aula |
| salto (para el juego) | 6 | 12 | Mini juego del 404 |

Son 48 frames por dibujo, 144 en total. Los accesorios se dibujan **una vez por dibujo** (8 accesorios × 3 dibujos = 24 capas) y van encima del cuerpo.

### 3.3 Flujo de trabajo gratis
1. **Hoja de personaje por dibujo.** Con Gemini, adjuntando las 3 poses v1 y 2 o 3 referencias del estilo (chibi o anime, sin copiar personajes), pedís **solo la pose idle de frente**, en la celda y con la paleta exactas. Iterás hasta que te guste: esa es la base que no se toca.
2. **Poses clave.** Con la base adjunta, pedís el primer y el último frame de cada pose. Gemini es bueno para poses sueltas y flojo para frames intermedios coherentes.
3. **Frames intermedios con IA gratis.** Dos herramientas con prueba gratuita generan la animación a partir de tu sprite: PixelLab (40 generaciones de prueba) y Retro Diffusion (50 créditos web). Con eso alcanza para probar las animaciones más difíciles (saludo, festejo, salto).
4. **Limpieza y animación a mano** en **LibreSprite** (gratis, de código abierto y muy parecido a Aseprite) o en **Piskel** (gratis, en el navegador). Con papel cebolla corregís lo que la IA dejó inconsistente entre frames y exportás una hoja PNG en una fila por pose.
5. **Script de limpieza en el repo** (`scripts/sprites/`, en Python con Pillow, lo armo yo o la tanda):
   - reduce con vecino más cercano a la celda exacta y cuantiza a la paleta cerrada (saca los colores "sucios" de la IA);
   - verifica que todos los frames tengan la misma celda y que el personaje esté anclado en los mismos pies;
   - arma `sprites.json` (frames, fps y anclas de los accesorios) y genera un GIF de vista previa por pose para revisar en el celular.
6. **Dónde se dejan:** `docs/agencia/sprites/fuente/<dibujo>/<pose>.png`. El script deja el resultado en `public/sprites/`.

**Orden recomendado para no trabarse:** primero idle y saludo de los 3 dibujos (con eso la ola 1 ya se ve viva), después pensando y señalar para el chat, y al final los easter eggs y el juego. Si un dibujo no está listo, el sitio usa el 16-bit en su lugar.

## 4. Tanda P3 · ola 1 (resumen; el prompt completo se arma cuando P2 esté mergeada)
1. **Sistema de estilos:**
   - el script inline, `estilos.ts` y `estilos.css` con 4 estilos en claro y oscuro;
   - el test de contraste;
   - el selector (pestaña en escritorio y 🎨 en celular), el shuffle bag y la View Transition.
2. **Home por estilo:**
   - 4 heroes, cada uno con su ejemplo de categoría y el enlace a `/soluciones?cat=`;
   - las secciones por `grid-template-areas`;
   - presupuesto de P2: TBT ≤ 250 ms, LCP ≤ 2,5 s y CLS ≤ 0,05 en todos los estilos.
3. **`<Sprite>` por capas:**
   - el script de sprites;
   - Malejo con poses según el estado;
   - el shuffle bag de dibujos con caída al 16-bit si falta uno.
4. **Easter eggs 1 a 12, con el álbum.** El mini juego del 404 se carga diferido: ≤ 15 kB gzip y canvas, sin librerías.
5. **Verificación:** los 4 estilos × claro/oscuro × 390/1280 px, más capturas, contraste, presupuesto y los easter eggs probados uno por uno.

**Ola 2:** los otros 4 estilos y sus accesorios. Solo suma filas a `estilos.ts`, tokens y heroes, sin tocar el sistema.

## 5. Riesgos y cómo se cubren
- **Lo vistoso no puede tapar lo que se vende.** En los 8 estilos, el hero conserva los dos accesos de P2 ("Hablar con Malejo" y "Armar mi solución") en la primera pantalla del celular. Lo verifica el mismo test de P2.
- **Contraste en estilos claros con acentos pastel:** el test AA bloquea el build.
- **Peso:** los heroes ocultos no cargan imágenes, las fuentes se descargan solo cuando el estilo se usa, y los easter eggs y el juego cargan diferidos.
- **SEO:** el contenido (copy) es el mismo en todos los estilos; solo cambia la presentación. Google ve el estilo Tech/IA por defecto, sin JS.
