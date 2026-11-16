"""Sprites de Malejo · paso 2 (tanda P3-1): las tiras animadas.

Por dibujo, tres tiras horizontales en public/agencia/sprites/<dibujo>/:

- idle.png (por código, sin imágenes nuevas): normal · abajo · parpadeo.
  · Respirar: todo lo que está arriba de la fila donde empieza el jean,
    menos 2 bloques, baja 1 bloque.
  · Parpadear: dentro de cada lente (la caja de config.json menos un
    anillo de 2 bloques; 1 a la derecha, como la referencia aprobada) lo
    que no es piel se pinta de piel, y se dibuja una línea curva oscura de
    1 bloque desde la mitad del lente (las puntas un bloque más arriba).
  · Secuencia: normal, abajo, abajo, normal, normal, parpadeo, normal
    (450, 450, 450, 450, 900, 110 y 1400 ms).
- saludo.png (dibujado por Mauro): normal · a · b.
  Secuencia normal 300, a 220, b 220, a 220, b 220, a 220, normal 700.
- festejo.png (dibujado): normal · festejo 2 bloques más arriba · festejo.
  Secuencia normal 250, arriba 120, festejo 900, normal 600.

Sin cuadros intermedios ni mezcla de transparencias: en pixel art una
mezcla deja fantasmas. Escribe public/agencia/sprites/sprites.json.

Uso: python3 scripts/sprites/animar.py   (después de limpiar.py)
"""
import json
from pathlib import Path

from PIL import Image

from limpiar import CONFIG, RAIZ, SALIDA, guardar, recorte, recortar

SECUENCIAS = {
    "idle": [[0, 450], [1, 450], [1, 450], [0, 450], [0, 900], [2, 110], [0, 1400]],
    "saludo": [[0, 300], [1, 220], [2, 220], [1, 220], [2, 220], [1, 220], [0, 700]],
    "festejo": [[0, 250], [1, 120], [2, 900], [0, 600]],
}


def respirar(im: Image.Image, c) -> Image.Image:
    corte = c["filaJean"] - 2 * c["bloque"]
    w, h = im.size
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im.crop((0, corte, w, h)), (0, corte))
    arriba = im.crop((0, 0, w, corte))
    out.alpha_composite(arriba, (0, c["bloque"]))
    return out


def parpadear(im: Image.Image, c) -> Image.Image:
    out = im.copy()
    px = out.load()
    b = c["bloque"]
    piel = [tuple(p) for p in c["piel"]]
    relleno = piel[0] + (255,)
    oscuro = tuple(c["oscuro"]) + (255,)
    for x0, y0, x1, y1 in c["ojos"]:
        # Anillo de 2 bloques (1 a la derecha): igual que la referencia del chibi.
        ix0, iy0, ix1, iy1 = x0 + 2 * b, y0 + 2 * b, x1 - b, y1 - 2 * b
        for y in range(iy0, iy1):
            for x in range(ix0, ix1):
                p = px[x, y]
                if p[3] and p[:3] not in piel:
                    px[x, y] = relleno
        # La línea: desde la mitad del lente, las puntas un bloque más arriba.
        arriba = iy0 + (iy1 - iy0) // 2
        fin = ix1 - b
        for y in range(arriba, arriba + 2 * b):
            for x in range(ix0, fin):
                punta = x < ix0 + b or x >= fin - b
                if (y < arriba + b) == punta:
                    px[x, y] = oscuro
    return out


def subir(im: Image.Image, dy: int) -> Image.Image:
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.alpha_composite(im, (0, -dy))
    return out


def tira(cuadros):
    w, h = cuadros[0].size
    out = Image.new("RGBA", (w * len(cuadros), h), (0, 0, 0, 0))
    for i, c in enumerate(cuadros):
        out.paste(c, (i * w, 0))
    return out


def main():
    datos = {}
    for dibujo in ["16bit", "chibi", "anime"]:
        c = CONFIG[dibujo]
        ims, caja, aire = recorte(dibujo)
        normal = ims["normal"]
        idle = [normal, respirar(normal, c), parpadear(normal, c)]
        saludo = [normal, ims["saludo-a"], ims["saludo-b"]]
        festejo = [normal, subir(ims["festejo"], 2 * c["bloque"]), ims["festejo"]]
        for nombre, cuadros in [("idle", idle), ("saludo", saludo), ("festejo", festejo)]:
            guardar(tira([recortar(x, caja) for x in cuadros]), SALIDA / dibujo / f"{nombre}.png")
        datos[dibujo] = {
            "nombre": c["nombre"],
            "bloque": c["bloque"],
            "ancho": caja[2] - caja[0],
            "alto": caja[3] - caja[1],
            "aire": aire,
            "poses": ["normal", "pensando", "ok"],
            "animaciones": {
                k: {"cuadros": 3, "secuencia": v, "total": sum(t for _, t in v)} for k, v in SECUENCIAS.items()
            },
        }
        print(f"✓ {dibujo}: idle, saludo y festejo")
    (SALIDA / "sprites.json").write_text(json.dumps(datos, indent=2, ensure_ascii=False) + "\n")
    (RAIZ / "app/(agencia)/sprites-animaciones.css").write_text(keyframes())


def keyframes() -> str:
    """Las @keyframes de las tiras, con los tiempos de SECUENCIAS. Cada tira
    tiene 3 cuadros: el cuadro k es translateX(-k/3 del ancho de la tira)."""
    out = [
        "/* Generado por scripts/sprites/animar.py (npm run sprites). No editar a mano:\n"
        "   los tiempos salen de SECUENCIAS y van también en public/agencia/sprites/sprites.json. */\n"
    ]
    for nombre, seq in SECUENCIAS.items():
        total = sum(t for _, t in seq)
        out.append(f"/* {nombre}: {total} ms · " + ", ".join(f"{k}:{t}" for k, t in seq) + " */")
        out.append(f"@keyframes tira-{nombre} {{")
        t = 0
        previo = None
        for k, dur in seq:
            if k != previo:
                pct = round(t * 100 / total, 3)
                out.append(f"  {pct:g}% {{ transform: translateX({-k * 100 / 3:.4f}%); }}")
                previo = k
            t += dur
        out.append(f"  100% {{ transform: translateX({-seq[-1][0] * 100 / 3:.4f}%); }}")
        out.append("}")
        out.append(f":root {{ --tira-{nombre}-ms: {total}ms; }}\n")
    return "\n".join(out)


if __name__ == "__main__":
    main()
