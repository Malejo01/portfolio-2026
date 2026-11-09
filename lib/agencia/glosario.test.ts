import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { conocimiento } from "@/content/agencia/conocimiento";
import { cotizadorCopy } from "@/content/agencia/cotizador";
import { demoCopy } from "@/content/agencia/demo";
import { home } from "@/content/agencia/home";
import { malejoCopy } from "@/content/agencia/malejo";
import { categories, combos, etiquetasPrecio, extras, resumenCopy } from "@/content/agencia/pricing";
import { servicios } from "@/content/agencia/servicios";
import { site } from "@/content/agencia/site";

/**
 * Glosario (tanda R2, auditoría §4): la copy que ve un dueño de negocio no
 * usa jerga. Recorre **toda** la copy de `content/agencia/` salvo los
 * legales (que pueden conservar los términos técnicos, explicados entre
 * paréntesis) y el catálogo de `precios.json`, y falla si aparece alguno de
 * los términos prohibidos. Los ids y los links no son copy: se saltean.
 */
const PROHIBIDOS: [nombre: string, re: RegExp][] = [
  ["FOTO PROFESIONAL", /foto profesional/i],
  ["Landing", /\blandings?\b/i],
  ["SEO", /\bSEO\b/i],
  ["hosting", /\bhosting\b/i],
  ["abono", /\babonos?\b/i],
  ["API", /\bAPI\b/],
  ["n8n", /\bn8n\b/i],
  ["sprint", /\bsprints?\b/i],
  ["Implementación", /\bimplementaci[óo]n\b/i],
  ["micro-apps", /micro-?apps?/i],
  ["AI Developer", /\bAI Developer\b/i],
  ["brief", /\bbrief\b/i],
];

/** Claves que no son copy: ids, slugs, links y nombres de íconos. */
const NO_COPY = new Set(["id", "ids", "href", "key", "planIds", "parecidoIds", "solucion", "category", "icon", "section", "slug", "tema"]);

function textos(valor: unknown, ruta: string, out: [string, string][] = []): [string, string][] {
  if (typeof valor === "string") {
    if (!/^(https?:|\/|#|mailto:)/.test(valor)) out.push([ruta, valor]);
  } else if (Array.isArray(valor)) {
    valor.forEach((v, i) => textos(v, `${ruta}[${i}]`, out));
  } else if (valor && typeof valor === "object") {
    for (const [k, v] of Object.entries(valor)) if (!NO_COPY.has(k)) textos(v, `${ruta}.${k}`, out);
  }
  return out;
}

const fuentes: Record<string, unknown> = {
  home,
  site,
  servicios,
  conocimiento,
  cotizadorCopy,
  demoCopy,
  malejoCopy,
  catalogo: { categories, combos, extras, etiquetasPrecio, resumenCopy },
};

describe("glosario: sin jerga fuera de los legales", () => {
  for (const [nombre, valor] of Object.entries(fuentes)) {
    it(`content/agencia · ${nombre}`, () => {
      const hallazgos = textos(valor, nombre).flatMap(([ruta, t]) =>
        PROHIBIDOS.filter(([, re]) => re.test(t)).map(([termino]) => `${ruta}: "${termino}" en «${t.slice(0, 90)}»`),
      );
      expect(hallazgos).toEqual([]);
    });
  }

  it("los posts del blog", () => {
    const dir = path.join(process.cwd(), "content/agencia/blog");
    const hallazgos: string[] = [];
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".mdx"))) {
      // Los componentes (`<Precio id="landing-express" />`) llevan ids, no copy.
      const texto = readFileSync(path.join(dir, f), "utf8").replace(/<[A-Z][^>]*\/>/g, "");
      for (const [termino, re] of PROHIBIDOS) if (re.test(texto)) hallazgos.push(`${f}: "${termino}"`);
    }
    expect(hallazgos).toEqual([]);
  });
});
