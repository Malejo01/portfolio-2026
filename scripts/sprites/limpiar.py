"""Sprites de Malejo · paso 1 (tanda P3-1).

Verifica las 3 poses de cada dibujo (y los cuadros de saludo y festejo),
recorta el margen transparente común y copia el resultado a
public/agencia/sprites/<dibujo>/<pose>.png.

No reescala ni cuantiza: los dibujos no siguen una grilla exacta y
reescalarlos los ensucia. Verifica:
- el mismo lienzo en todas las imágenes de un dibujo;
- alfa binaria (0 o 255);
- 24 colores o menos;
- los pies alineados (última fila opaca, diferencia de 2 px o menos).

El recorte es la unión de los recuadros opacos, con 2 bloques de aire
arriba para el salto del festejo (animar.py) y los pies en la última fila.

Uso: python3 scripts/sprites/limpiar.py   (o npm run sprites)
"""
import json
import sys
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parents[2]
FUENTE = RAIZ / "docs/agencia/sprites/fuente"
ANIM = RAIZ / "docs/agencia/sprites/malejo-animaciones"
SALIDA = RAIZ / "public/agencia/sprites"
CONFIG = json.loads((Path(__file__).parent / "config.json").read_text())
POSES = ["normal", "pensando", "ok"]
CUADROS = ["saludo-a", "saludo-b", "festejo"]


def datos(im: Image.Image):
    return im.get_flattened_data() if hasattr(im, "get_flattened_data") else im.getdata()


def abrir(p: Path) -> Image.Image:
    return Image.open(p).convert("RGBA")


def verificar(nombre: str, im: Image.Image, lienzo):
    errores = []
    if im.size != lienzo:
        errores.append(f"{nombre}: lienzo {im.size}, se esperaba {lienzo}")
    alfa = set(datos(im.getchannel("A")))
    if alfa - {0, 255}:
        errores.append(f"{nombre}: alfa no binaria ({sorted(alfa - {0, 255})[:5]}…)")
    colores = {p[:3] for p in datos(im) if p[3] == 255}
    if len(colores) > 24:
        errores.append(f"{nombre}: {len(colores)} colores (máximo 24)")
    return errores


def recorte(dibujo: str):
    """Devuelve (imágenes, caja de recorte, aire de arriba)."""
    c = CONFIG[dibujo]
    ims = {p: abrir(FUENTE / dibujo / f"{p}.png") for p in POSES}
    ims.update({p: abrir(ANIM / dibujo / f"{p}.png") for p in CUADROS})
    lienzo = ims["normal"].size
    errores = []
    for n, im in ims.items():
        errores += verificar(f"{dibujo}/{n}", im, lienzo)
    pies = {n: im.getchannel("A").getbbox()[3] for n, im in ims.items()}
    if max(pies.values()) - min(pies.values()) > 2:
        errores.append(f"{dibujo}: pies desalineados {pies}")
    if errores:
        print("\n".join("✗ " + e for e in errores))
        sys.exit(1)
    cajas = [im.getchannel("A").getbbox() for im in ims.values()]
    aire = 2 * c["bloque"]
    x0 = min(b[0] for b in cajas)
    y0 = min(b[1] for b in cajas) - aire
    x1 = max(b[2] for b in cajas)
    y1 = max(b[3] for b in cajas)
    return ims, (x0, y0, x1, y1), aire


def guardar(im: Image.Image, ruta: Path):
    """PNG con paleta exacta (sin cuantizar: hay 24 colores o menos y alfa
    binaria). Pesa varias veces menos que RGBA y los píxeles son los mismos."""
    colores = sorted(set(datos(im)))
    opacos = [c for c in colores if c[3] == 255]
    if len(opacos) > 255:
        im.save(ruta, optimize=True)
        return
    indice = {c: i + 1 for i, c in enumerate(opacos)}
    pal = Image.new("P", im.size, 0)
    paleta = [0, 0, 0]
    for c in opacos:
        paleta += list(c[:3])
    pal.putpalette(paleta + [0] * (768 - len(paleta)))
    pal.putdata([indice[p] if p[3] == 255 else 0 for p in datos(im)])
    pal.save(ruta, optimize=True, transparency=0)


def recortar(im: Image.Image, caja) -> Image.Image:
    """`crop` admite cajas fuera del lienzo: lo que sobra queda transparente."""
    return im.crop(caja)


def main():
    for dibujo in ["16bit", "chibi", "anime"]:
        ims, caja, aire = recorte(dibujo)
        (SALIDA / dibujo).mkdir(parents=True, exist_ok=True)
        for p in POSES:
            guardar(recortar(ims[p], caja), SALIDA / dibujo / f"{p}.png")
        ancho, alto = caja[2] - caja[0], caja[3] - caja[1]
        print(f"✓ {dibujo}: {ancho}×{alto} (recorte {caja}, aire {aire})")


if __name__ == "__main__":
    main()
