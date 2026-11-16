import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Las hojas de los estilos no originales (tanda P3-3), con un hash del
 * contenido en la URL para que el CDN las pueda cachear para siempre. Se
 * calcula en el build (lo usa el layout, que es estático).
 */
export function hojasDeEstilos(ids: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id of ids) {
    try {
      const contenido = readFileSync(path.join(process.cwd(), "public/agencia/estilos", `${id}.css`));
      out[id] = `/agencia/estilos/${id}.css?v=${createHash("sha1").update(contenido).digest("hex").slice(0, 10)}`;
    } catch {
      // Sin hoja: el estilo usa solo lo común (no debería pasar).
    }
  }
  return out;
}
