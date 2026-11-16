"""Verificación de las animaciones de la tanda P3-1.

Compara cuadro por cuadro y en tiempos las tiras generadas
(public/agencia/sprites/<dibujo>/{idle,saludo,festejo}.png y sprites.json)
con los GIF aprobados:
- idle: docs/agencia/sprites/referencia/chibi-idle.gif (solo chibi, a tamaño real);
- saludo y festejo: docs/agencia/sprites/malejo-animaciones/<dibujo>/*-referencia.gif
  (a la mitad del tamaño y con fondo gris: se reduce la tira y se busca el corrimiento).

Para cada cuadro del GIF busca el cuadro de la tira que mejor coincide y
compara la secuencia y los tiempos. Escribe animaciones.json y, de paso,
la lámina dibujos-y-poses.png (3 dibujos × 3 poses, lado a lado).

Uso: python3 -I docs/agencia/verificacion/p3-1/animaciones.py
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageSequence

RAIZ = Path(__file__).resolve().parents[4]
DIR = Path(__file__).parent
SPR = RAIZ / "public/agencia/sprites"
DATOS = json.loads((SPR / "sprites.json").read_text())
FUENTE = RAIZ / "docs/agencia/sprites"
UMBRAL = 40  # diferencia por canal que cuenta como píxel distinto (el GIF cuantiza)


def cuadros(dibujo, anim):
    d = DATOS[dibujo]
    tira = Image.open(SPR / dibujo / f"{anim}.png").convert("RGBA")
    return [tira.crop((k * d["ancho"], 0, (k + 1) * d["ancho"], d["alto"])) for k in range(3)]


def gif(ruta):
    g = Image.open(ruta)
    return [(np.array(f.convert("RGB")).astype(int), f.info.get("duration")) for f in ImageSequence.Iterator(g)], g.size


def componer(cuadro, tam, pos, fondo):
    lienzo = Image.new("RGBA", tam, fondo + (255,))
    lienzo.alpha_composite(cuadro, pos) if pos[0] >= 0 and pos[1] >= 0 else lienzo.paste(cuadro, pos, cuadro)
    return np.array(lienzo.convert("RGB")).astype(int)


def distintos(a, b):
    return int((np.abs(a - b).max(axis=2) > UMBRAL).sum())


def comparar(dibujo, anim, ruta, escala):
    frs, tam = gif(ruta)
    fondo = tuple(int(v) for v in frs[0][0][0, 0])
    cs = cuadros(dibujo, anim)
    if escala != 1:
        cs = [c.resize((c.width // escala, c.height // escala), Image.NEAREST) for c in cs]
    # El corrimiento que mejor apoya el cuadro normal sobre el primer cuadro del GIF.
    mejor = None
    for ox in range(-30, 31):
        for oy in range(-30, 31):
            try:
                dd = distintos(componer(cs[0], tam, (ox, oy), fondo), frs[0][0])
            except ValueError:
                continue
            if mejor is None or dd < mejor[0]:
                mejor = (dd, ox, oy)
    _, ox, oy = mejor
    secuencia, difs = [], []
    for g, t in frs:
        sc = [distintos(componer(c, tam, (ox, oy), fondo), g) for c in cs]
        k = int(np.argmin(sc))
        secuencia.append([k, t])
        difs.append(sc[k])
    # Pasos repetidos del GIF (mismo cuadro seguido) se juntan, igual que en el sitio.
    def juntar(seq):
        out = []
        for k, t in seq:
            if out and out[-1][0] == k:
                out[-1][1] += t
            else:
                out.append([k, t])
        return out

    esperada = juntar([list(x) for x in DATOS[dibujo]["animaciones"][anim]["secuencia"]])
    obtenida = juntar(secuencia)
    return {
        "gif": str(ruta.relative_to(RAIZ)),
        "secuencia_gif": obtenida,
        "secuencia_sitio": esperada,
        "coincide": obtenida == esperada,
        "pixeles_distintos_por_cuadro": difs,
        "pixeles_por_cuadro": tam[0] * tam[1],
    }


def lamina():
    filas = []
    alto = 240
    for dibujo in ["16bit", "chibi", "anime"]:
        d = DATOS[dibujo]
        esc = alto / (d["alto"] - d["aire"])
        fila = []
        for pose in ["normal", "pensando", "ok"]:
            im = Image.open(SPR / dibujo / f"{pose}.png").convert("RGBA")
            fila.append(im.resize((round(d["ancho"] * esc), round(d["alto"] * esc)), Image.NEAREST))
        filas.append(fila)
    ancho_celda = max(im.width for f in filas for im in f) + 24
    alto_celda = max(im.height for f in filas for im in f) + 24
    out = Image.new("RGBA", (ancho_celda * 3, alto_celda * 3), (238, 241, 244, 255))
    for i, fila in enumerate(filas):
        for j, im in enumerate(fila):
            out.alpha_composite(im, (j * ancho_celda + (ancho_celda - im.width) // 2, i * alto_celda + alto_celda - im.height - 12))
    out.save(DIR / "dibujos-y-poses.png")


def main():
    res = {}
    res["chibi/idle"] = comparar("chibi", "idle", FUENTE / "referencia/chibi-idle.gif", 1)
    for dibujo in ["16bit", "chibi", "anime"]:
        for anim in ["saludo", "festejo"]:
            res[f"{dibujo}/{anim}"] = comparar(dibujo, anim, FUENTE / f"malejo-animaciones/{dibujo}/{anim}-referencia.gif", 2)
    lamina()
    (DIR / "animaciones.json").write_text(json.dumps(res, indent=2, ensure_ascii=False) + "\n")
    for k, v in res.items():
        print(("✓" if v["coincide"] else "✗"), k, v["secuencia_gif"], "distintos:", v["pixeles_distintos_por_cuadro"])
    if not all(v["coincide"] for v in res.values()):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
