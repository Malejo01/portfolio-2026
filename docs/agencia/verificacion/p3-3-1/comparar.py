"""Tanda P3-3.1 · compara dos carpetas de capturas píxel a píxel.

Uso: python3 -I docs/agencia/verificacion/p3-3-1/comparar.py <antes> <despues> [patrón]
Imprime, por archivo, si el tamaño coincide y cuántos píxeles difieren; con
diferencias, guarda <despues>/diff-<archivo> con los píxeles distintos en
rojo. Sale con 1 si alguna captura difiere.
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops

antes, despues = Path(sys.argv[1]), Path(sys.argv[2])
patron = sys.argv[3] if len(sys.argv) > 3 else "*.png"
malas = 0
for a in sorted(antes.glob(patron)):
    if a.name.startswith("diff-"):
        continue
    d = despues / a.name
    if not d.exists():
        print(f"? {a.name}: falta en {despues}")
        malas += 1
        continue
    ia, idd = Image.open(a).convert("RGB"), Image.open(d).convert("RGB")
    if ia.size != idd.size:
        print(f"✗ {a.name}: tamaño {ia.size} → {idd.size}")
        malas += 1
        continue
    dif = ImageChops.difference(ia, idd).convert("L").point(lambda v: 255 if v else 0)
    n = sum(1 for v in (dif.get_flattened_data() if hasattr(dif, "get_flattened_data") else dif.getdata()) if v)
    if n:
        malas += 1
        rojo = Image.new("RGB", ia.size, (255, 0, 0))
        Image.composite(rojo, ia, dif).save(despues / f"diff-{a.name}")
        print(f"✗ {a.name}: {n} píxeles distintos, caja {dif.getbbox()}")
    else:
        print(f"✓ {a.name}: idéntica")
sys.exit(1 if malas else 0)
