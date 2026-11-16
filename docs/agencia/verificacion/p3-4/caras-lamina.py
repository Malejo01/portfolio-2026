"""Tanda P3-4 · arma caras-comparacion.png: los recortes de caras.js (5 por
dibujo, a 4× de densidad) en filas, y debajo la imagen de referencia.
Uso: python3 -I docs/agencia/verificacion/p3-4/caras-lamina.py"""
from pathlib import Path

from PIL import Image, ImageDraw

D = Path(__file__).parent
NOMBRES = ["chat-40", "chat-32", "barra-56", "hero-tech", "equipo"]
filas = []
for dibujo in ["16bit", "chibi", "anime"]:
    ims = [Image.open(D / f"cara-{dibujo}-{n}.png").convert("RGB") for n in NOMBRES]
    ims = [im.resize((im.width // 2, im.height // 2), Image.NEAREST) for im in ims]
    alto = max(im.height for im in ims)
    fila = Image.new("RGB", (sum(im.width for im in ims) + 24 * len(ims) + 120, alto + 20), (255, 255, 255))
    ImageDraw.Draw(fila).text((8, alto // 2), dibujo, fill=(30, 30, 30))
    x = 120
    for im in ims:
        fila.paste(im, (x, 10))
        x += im.width + 24
    filas.append(fila)
ref = Image.open(D / "caras-hoy-vs-propuesta.png").convert("RGB")
ancho = max([f.width for f in filas] + [ref.width])
titulo = 30
out = Image.new("RGB", (ancho, titulo + sum(f.height for f in filas) + 30 + ref.height), (255, 255, 255))
d = ImageDraw.Draw(out)
d.text((8, 8), "P3-4 (CaraMalejo): chat 40 · chat 32 · barra 56 · hero de Tech · retrato del equipo", fill=(16, 110, 60))
y = titulo
for f in filas:
    out.paste(f, (0, y))
    y += f.height
d.text((8, y + 8), "Referencia (adjunto de la tanda)", fill=(30, 30, 30))
out.paste(ref, (0, y + 30))
out.save(D / "caras-comparacion.png", optimize=True)
print("✓ caras-comparacion.png")
