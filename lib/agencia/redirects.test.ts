import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";
import { REDIRECCIONES_AGENCIA, RUTAS_REDIRIGIDAS } from "./redirects";

/** Todos los archivos de copy y componentes de la agencia (más las páginas de `app/(agencia)`). */
function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) return archivos(ruta);
    return /\.(ts|tsx|mdx)$/.test(nombre) && !/\.test\.ts$/.test(nombre) ? [ruta] : [];
  });
}

/**
 * Un enlace interno a una ruta redirigida: `"/precios"`, `'/cotizador?cat=ia'`,
 * `](/servicios)` o `` href={`/servicios?x`} ``. `/servicios/<slug>` no
 * cuenta: esa ruta se queda. Los comentarios que nombran la ruta vieja entre
 * comillas invertidas tampoco: no son enlaces.
 */
function enlacesRedirigidos(texto: string): string[] {
  const rutas = RUTAS_REDIRIGIDAS.map((r) => r.slice(1)).join("|");
  const re = new RegExp(`(?:["'(]|href=\\{\`)\\/(${rutas})(?=["'\`)?#])`, "g");
  return [...texto.matchAll(re)].map((m) => m[0]);
}

describe("redirecciones de la tanda P2", () => {
  it("/precios, /cotizador y /servicios van a /soluciones con 308", async () => {
    expect(REDIRECCIONES_AGENCIA.map((r) => [r.source, r.destination, r.permanent])).toEqual([
      ["/precios", "/soluciones", true],
      ["/cotizador", "/soluciones", true],
      ["/servicios", "/soluciones", true],
    ]);
    const todas = await nextConfig.redirects!();
    for (const r of REDIRECCIONES_AGENCIA) expect(todas).toContainEqual(r);
    // `/servicios/[slug]` no se redirige: la fuente es exacta, sin `:path*`.
    expect(todas.some((r) => r.source.startsWith("/servicios/"))).toBe(false);
  });

  it("detecta los enlaces viejos y deja pasar las soluciones", () => {
    expect(enlacesRedirigidos(`href="/precios" href='/cotizador?cat=ia' [x](/servicios) href={\`/servicios#a\`}`)).toHaveLength(4);
    expect(enlacesRedirigidos("comentario: `/precios` ya no existe")).toEqual([]);
    expect(enlacesRedirigidos(`href="/servicios/turnos" href="/soluciones?cat=ia" docs/agencia/precios-psicologia.md`)).toEqual([]);
  });

  it("ningún archivo de content/ ni de components/agencia/ enlaza a una ruta redirigida", () => {
    const raiz = process.cwd();
    const encontrados = ["content/agencia", "components/agencia", "app/(agencia)", "lib/agencia"]
      .flatMap((d) => archivos(join(raiz, d)))
      .filter((f) => !f.endsWith("redirects.ts"))
      .flatMap((f) => enlacesRedirigidos(readFileSync(f, "utf8")).map((e) => `${f.replace(raiz, "")}: ${e}`));
    expect(encontrados).toEqual([]);
  });
});
