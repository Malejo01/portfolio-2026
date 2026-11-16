import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { estilos } from "@/content/agencia/estilos";

/**
 * Tanda P3-1: contraste AA de los estilos disponibles, en claro y oscuro.
 * Lee los tokens de `agencia.css` (Tech/IA, el de base) y `estilos.css` (los
 * demás) y los resuelve con la misma cascada del navegador:
 * `:root` < `.dark` < `[data-estilo="x"]` < `[data-estilo="x"].dark`.
 *
 * Los pares son los que usan los componentes (texto sobre su fondo, botones,
 * íconos). Texto: 4,5:1. Texto grande e íconos: 3:1.
 */
const raiz = path.join(process.cwd(), "app/(agencia)");
const css = readFileSync(path.join(raiz, "agencia.css"), "utf8") + "\n" + readFileSync(path.join(raiz, "estilos.css"), "utf8");

function bloque(selector: string): Record<string, string> {
  const out: Record<string, string> = {};
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?:^|\\n)${esc}\\s*\\{([^}]*)\\}`, "g");
  for (const m of css.matchAll(re)) {
    for (const d of m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[d[1]] = d[2].trim();
  }
  return out;
}

function tokens(estilo: string, oscuro: boolean): Record<string, string> {
  const capas = [bloque(":root")];
  if (oscuro) capas.push(bloque(".dark"));
  if (estilo !== "tech") {
    capas.push(bloque(`[data-estilo="${estilo}"]`));
    if (oscuro) capas.push(bloque(`[data-estilo="${estilo}"].dark`));
  }
  return Object.assign({}, ...capas);
}

function resolver(t: Record<string, string>, v: string, prof = 0): string {
  const m = v.match(/^var\((--[\w-]+)\)$/);
  if (!m) return v;
  if (prof > 10 || !(m[1] in t)) throw new Error(`token sin resolver: ${v}`);
  return resolver(t, t[m[1]], prof + 1);
}

type RGBA = [number, number, number, number];

function color(v: string): RGBA {
  const h = v.replace("#", "");
  if (/^[0-9a-f]{6}$/i.test(h)) return [...([0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]), 1];
  const m = v.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/);
  if (!m) throw new Error(`color que el test no entiende: ${v}`);
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
}

/** Un color con transparencia, apoyado sobre otro sólido. */
function sobre(c: RGBA, base: RGBA): [number, number, number] {
  return [0, 1, 2].map((i) => c[i] * c[3] + base[i] * (1 - c[3])) as [number, number, number];
}

function luminancia([r, g, b]: [number, number, number]): number {
  const c = [r, g, b].map((x) => {
    const s = x / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** `base` es la superficie que queda debajo de un fondo con transparencia (el badge va sobre la tarjeta). */
function contraste(a: string, b: string, base: string): number {
  const fondo = sobre(color(b), color(base));
  const texto = sobre(color(a), [...fondo, 1]);
  const [l1, l2] = [luminancia(texto), luminancia(fondo)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const FONDOS = ["--bg", "--surf", "--surf-2"];
/** [texto, fondo, mínimo]. */
const PARES: [string, string, number][] = [
  ...FONDOS.flatMap((f) => [
    ["--text", f, 4.5],
    ["--muted", f, 4.5],
    ["--titulo", f, 4.5],
    ["--acc-text", f, 4.5],
    ["--etiqueta", f, 4.5],
    ["--btn-s-texto", f, 4.5],
    // `--marca` (el isotipo y la "M" del logo) no entra: los logotipos
    // están exentos de 1.4.11, y el naranja de Tech claro ya era así en P2.
  ] as [string, string, number][]),
  ["--acc-text", "--ic-bg", 4.5],
  ["--acc-ink", "--acc", 4.5],
  ["--user-text", "--ic-bg", 4.5],
  ["--ok-text", "--save-bg", 4.5],
  ["--malejo-btn-ink", "--malejo-btn", 3],
  ["--pie-texto", "--pie-bg", 4.5],
  // P3-2: las pestañas del kit sobre el marco (madera en el pizarrón).
  ["--text", "--marco", 4.5],
  ["--pie-muted", "--pie-bg", 4.5],
  // Los 3 tonos: precios y "Ingresar →" sobre la superficie y sobre su tinte.
  ...[1, 2, 3].flatMap((n) => [
    [`--tono-${n}`, "--surf", 4.5],
    [`--tono-${n}`, `--tono-${n}-bg`, 3],
    [`--tono-${n}-texto`, `--tono-${n}-bg`, 4.5],
    ["--muted", `--tono-${n}-bg`, 4.5],
    ["--titulo", `--tono-${n}-bg`, 4.5],
  ] as [string, string, number][]),
];

/** El Tech/IA de P2 tiene pares de piel que no se ven (el pie es transparente: va sobre `--bg`). */
function fondoEfectivo(t: Record<string, string>, f: string): string {
  const v = resolver(t, t[f]);
  return v === "transparent" ? resolver(t, t["--bg"]) : v;
}

describe("contraste AA de los estilos", () => {
  for (const e of estilos.filter((x) => x.disponible)) {
    for (const oscuro of [false, true]) {
      it(`${e.id} ${oscuro ? "oscuro" : "claro"}`, () => {
        const t = tokens(e.id, oscuro);
        const fallas: string[] = [];
        for (const [a, b, min] of PARES) {
          const c = contraste(resolver(t, t[a]), fondoEfectivo(t, b), resolver(t, t["--surf"]));
          if (c < min) fallas.push(`${a} sobre ${b}: ${c.toFixed(2)} (mínimo ${min})`);
        }
        expect(fallas).toEqual([]);
      });
    }
  }
});
