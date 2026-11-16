# Estilo Tienda («Almacén de barrio») · especificación aprobada (16-11-2026)

Fuente: lienzo «Malejo — Home estilo Tienda» (Claude Design), fila «✅ Tienda · versión final». Los `.html` de esta carpeta son esas pantallas exportadas. Son **referencia visual**, no código para copiar (tienen estilos inline): traducilos a tokens y componentes del sitio.

## Identidad
- **Un almacén de barrio que toma pedidos.** Toldo a rayas, etiquetas de precio colgantes, tarjetas blancas con borde de 2 px y sombra plana, y botones redondos. Cálido y cercano, no "tienda online genérica".
- **Claro (de base):** crema con tomate, verde y mostaza.
- **Oscuro («Noche cálida»):** marrón muy oscuro. Los botones mantienen sus colores y los textos, íconos y enlaces de color van en versión suave, a pedido de Mauro, para que no encandilen.
- **Tipografía:** **Fredoka** (600/700) en titulares, logo, precios de etiqueta, pestañas y la "IA" del H1, y **Nunito** (400–800) en todo lo demás, botones incluidos.
- **Personaje:** **Chibi por defecto** en Tienda.

## Forma
- **Tarjetas:**
  - radio de 22 px y borde de 2 px;
  - sombra **plana** `0 6px 0 <borde>`, sin desenfoque;
  - la tarjeta elegida o la recomendada lleva el borde en tomate.
- **Botones:**
  - forma de píldora (radio 999 px);
  - el principal es tomate con texto blanco y sombra plana `0 4px 0 #8F2F08`;
  - el secundario es blanco (o superficie) con borde de 2 px del color del texto.
- **Etiqueta de precio:**
  - radio `6px 999px 999px 6px`, fondo mostaza y texto `#2B2118` en Fredoka;
  - el agujero es un círculo del color de la superficie, a 6–9 px del borde izquierdo;
  - en la home es chica (15 px); en Soluciones, grande (22 px) y nunca más ancha que la tarjeta;
  - la palabra "Desde" va arriba, aparte y chica.
- **Toldo:**
  - franja de rayas de 40 px (26 px en celular), con alto de 22 px en escritorio y 14 px en celular;
  - va con las esquinas de abajo redondeadas, **debajo de la barra superior verde**;
  - la hoja de Malejo en el celular lleva el toldo como borde superior.
- **"IA" del H1:** píldora mostaza rotada −3°.
- **Pestaña vertical "Estilos"** en escritorio: la del sistema de P3-1, en tomate.
- **Ticket de Tu kit:** la columna de Soluciones termina con un borde troquelado (semicírculos del color del fondo). Arriba lleva "TU PEDIDO A MAURO" y las líneas internas van punteadas.

## Tokens · claro
| Token | Valor |
|---|---|
| Fondo | `#FBF4E8` |
| Superficie (tarjetas, sección de categorías) | `#FFFFFF` |
| Bordes y sombra plana | `#E7D9C4` |
| Texto / secundario | `#2B2118` / `#5A4A3B` |
| Tomate · acción principal (texto blanco 5,18:1) | `#C2410C` · sombra `#8F2F08` · tinte `#FDE6D8` |
| Verde · barra superior, etiquetas de sección, pagos, WhatsApp, cierre | `#1F6F4A` (blanco 6,12:1) · tinte `#E1F1E7` |
| Mostaza · etiquetas de precio, "IA" (texto `#2B2118` 5,97:1) | `#D29330` |
| Ocre · íconos y paso 3 | `#8A5A0B` (blanco 5,92:1) · tinte `#FBEFD3` |
| Toldo | `#C2410C` / `#FBF4E8` |

## Tokens · oscuro (N1 · Noche cálida)
| Token | Valor |
|---|---|
| Fondo | `#1C1611` |
| Superficie | `#282019` |
| Bordes y sombra plana | `#3B2F25` |
| Texto / secundario | `#F3E9DC` / `#C8B8A5` (9,26:1 sobre el fondo) |
| Botones | los mismos del claro: tomate `#C2410C` y verde `#1F6F4A` con texto blanco |
| Texto, íconos y enlaces en tomate / verde / ocre (versión suave) | `#F08A5D` / `#8CC9A6` / `#E3B45C` (todos ≥ 5,8:1 sobre superficie y tintes) |
| Tintes | `#3A2419` / `#1C3127` / `#3A2E17` |
| Etiqueta de precio | igual que en claro (`#D29330` con texto `#2B2118`) |
| Toldo | `#A8390B` / `#282019` |
| Cierre "¿Lo charlamos?" | **no** es un bloque verde: superficie con borde superior de 2 px |
| Pastilla activa (personaje, categoría en el celular) | fondo `#F3E9DC` con texto `#1C1611` |

## Pantallas
1. **Home** (`F-home-claro`, `F-home-oscuro`, `F-home-celular`):
   - **Hero:** etiqueta verde "Mauro Lizárraga · Salta, Argentina"; H1 de 62 px (42 en celular); los dos botones; los 3 tildes.
   - **Ejemplo del hero, «Almacén Doña Rosa»:**
     - nombre y rubro, y la pastilla "Abierto · hasta 21 h";
     - el selector Delivery / Retiro;
     - 3 productos con ícono, descripción, etiqueta de precio y cantidad;
     - "Tu pedido · 2 · Total $8.300", con "Enviar pedido por WhatsApp" y "Pagar con Mercado Pago";
     - debajo, "Así se vería tu almacén →" y el selector rápido "Personaje: 16-bit · Chibi · Anime";
     - el chibi asoma en la esquina inferior derecha del ejemplo.
   - **Categorías:** las 6 tarjetas, cada una con ícono en un cuadrado entintado, título en Fredoka, una línea y la etiqueta de precio con la línea de pagos.
   - **Cómo trabajo:** 3 recuadros entintados con el número en un círculo.
   - **Celular:** el botón "Cambiar" (dibujo) al lado de "Soy Mauro".
2. **Ejemplo en el celular** (`F-pedido-celular`): es el mismo ejemplo a ancho de teléfono.
   - Lleva categorías en pastillas, los productos con sumar y restar, y la barra fija "Ver pedido · 2 · $8.300".
   - En el celular va **debajo de los dos botones del hero**. Nunca los empuja fuera de la primera pantalla.
3. **Soluciones** (`F-soluciones`): es solo piel sobre P2.
   - **Categorías:** lista con ícono entintado; la activa lleva borde tomate, sombra plana y contador.
   - **Planes:** con la franja de ícono arriba, la etiqueta de precio grande y "El más pedido" como sticker tomate rotado 4°.
   - **Tu kit | Malejo:** pestañas sobre mostaza clara y el ticket troquelado.
4. **Soluciones con Malejo en celular** (`F-soluciones-celular`):
   - la hoja lleva el toldo arriba y el chibi;
   - la burbuja tiene la esquina superior izquierda en punta;
   - las 6 opciones van en píldoras con borde de los 3 colores;
   - la barra del kit es tomate.
5. **Selector** (`F-selector`): hoja desde abajo con los 4 estilos (Tienda "Elegido") y "Cómo se ve Mauro" (Chibi marcado "Por defecto acá").

## Movimiento (Framer Motion, `once: true`, quieto con movimiento reducido)
- El toldo se despliega desde arriba (`scaleY` 0 → 1, `transform-origin: top`, 400 ms).
- Las etiquetas de precio se balancean al entrar: rotación −8° → 4° → 0°, 600 ms, con un escalonado de 60 ms. Tienen que ir sin `.lift` envuelto: ver la regla de `Reveal` en `CLAUDE.md`.
- Nada se mueve en bucle.

## Accesibilidad del ejemplo
El ejemplo del hero es una **ilustración**: no tiene botones reales. Va `aria-hidden="true"` con un texto alternativo para lectores de pantalla ("Ejemplo: un almacén que recibe pedidos por WhatsApp"), y ningún elemento suyo es tabulable.
