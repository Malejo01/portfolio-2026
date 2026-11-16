# Estilo Aula virtual («Pizarrón») · especificación aprobada (16-11-2026)

Fuente: lienzo «Malejo — Home estilo Aula virtual» (Claude Design), fila «✅ Aula virtual · versión final». Los `.html` de esta carpeta son esas pantallas exportadas: **referencia visual**, no código para copiar (estilos inline). Traducilos a tokens y componentes del sitio.

## Identidad
- **Oscuro (de base): pizarrón verde con marco de madera**, escrito con tizas de colores.
- **Claro: pizarra blanca escrita con fibrones**, con marco gris.
- **Tipografía:** **Caveat** (600/700) en titulares, etiquetas, precios, botones de texto y garabatos, y **Nunito** (400–800) en el texto de lectura y los botones principales. A Mauro le gustan **la cursiva y los garabatos**: van sin miedo, pero el texto largo siempre en Nunito.
- **Forma:**
  - radio de 6 px;
  - tarjetas con **borde punteado de 2 px**;
  - el marco de madera es una franja de 14 px arriba (`#8B5E3C` con borde inferior `#6E4A2E`) y el borde de los paneles del kit y de la hoja de Malejo.
- **"IA" del H1:** resaltada con un trazo de resaltador detrás (gradiente del 55 % hacia abajo).

## Garabatos (SVG, dibujados con `pathLength` al entrar; quietos con movimiento reducido)
- "f(idea) = idea + IA" con un subrayado curvo, arriba del H1.
- Flecha de tiza con "¡mirá!" del texto del hero al ejemplo del aula.
- Subrayado a mano bajo cada título de sección (alternando amarillo y rosa).
- "∑ clientes ✓" al costado de las categorías y "demo en ≈ 72 h ★" al costado de Cómo trabajo.
- Mancha de borrador (gradiente radial blanco muy suave) detrás del hero, solo en oscuro.
- En Soluciones, "¡recomendado!" encerrado en un óvalo rosa y los casilleros dibujados de las categorías.

## Tokens · oscuro (pizarrón)
| Token | Valor |
|---|---|
| Fondo | `#1E3A2C` (con dos gradientes radiales blancos al 4–5 % para la textura) |
| Panel (kit, hoja de Malejo) | `#183024` |
| Barra inferior | `#16301F` |
| Texto / secundario | `#F2F1EA` / `#C9D3CB` |
| Bordes punteados | `rgba(242,241,234,0.35)` |
| Tiza amarilla (principal, botones con texto `#1E3A2C`) | `#F6D365` |
| Tiza rosa (segundo: acentos, recomendado, botón de Malejo) | `#F4A7B9` |
| Tiza celeste (tercero: detalles, etiquetas) | `#9CD3F0` |
| Resaltador de "IA" | `rgba(246,211,101,0.25)` |

## Tokens · claro (pizarra blanca)
| Token | Valor |
|---|---|
| Fondo | `#F7F8F5` |
| Superficie | `#FFFFFF` |
| Marco | `#B8C1C7` (borde inferior `#9AA4AB`) |
| Texto / secundario | `#1F2A24` / `#46524B` |
| Bordes punteados | `#9AA8A0` |
| Fibrón verde (principal, botones con texto blanco) | `#1F6F4A` · tinte `#E3F2EA` |
| Fibrón naranja (segundo) | `#C2410C` · tinte `#FDE8DE` |
| Fibrón azul (tercero) | `#1D5FA8` · tinte `#E2ECF8` |
| Resaltador de "IA" | `#FFE58A` |

## Pantallas
1. **Home:**
   - **Hero:** etiqueta en cursiva; H1 en Caveat de 68 px; el ejemplo «Instituto del Sol · Matemática I · Funciones» (avance, clases tildadas, asistente con IA) en un recuadro punteado; debajo, "Así se vería tu aula virtual →".
   - **Personaje:** el selector rápido "personaje: pixel · chibi · anime" en cursiva, y el personaje **anime por defecto** en la esquina del ejemplo.
   - **Categorías:** 6 tarjetas punteadas con ícono de tiza, título en cursiva del color de la tiza, una línea y el precio.
   - **Cómo trabajo:** "Paso 1/2/3" en cursiva grande sobre recuadros punteados.
   - **Cierre:** "¿Lo charlamos?" en cursiva.
2. **Soluciones:**
   - **Categorías:** lista en cursiva con casilleros dibujados (la activa tildada en amarillo; el contador del kit entre paréntesis en rosa).
   - **Planes:** borde punteado; título y precio en cursiva; "o 3 pagos…" en Nunito bold.
   - **Columna "Tu kit | Malejo":** pestañas sobre la madera; estimado en cursiva amarilla de 40 px; botón "Mandale tu kit a Mauro" amarillo.
3. **Celular:**
   - **Home:** botón para cambiar el dibujo al lado de "Soy Mauro".
   - **Soluciones con Malejo:** chips en cursiva; la hoja de Malejo con el borde superior de madera, el mensaje en cursiva y las 6 opciones en recuadros punteados de los 3 colores; la barra del kit amarilla.
