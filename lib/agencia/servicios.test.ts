import { describe, expect, it } from "vitest";
import { faqPorIds } from "@/content/agencia/conocimiento";
import { getCategory, getCombo } from "@/content/agencia/pricing";
import { solucionDeCombo, todasLasSoluciones } from "@/content/agencia/servicios";

/** Tanda P1 (§4.2): la plantilla de cada solución apunta a datos que existen. */
describe("soluciones (tanda P1)", () => {
  for (const s of todasLasSoluciones.filter((x) => x.category !== "grandes")) {
    it(`${s.category}: "¿Cuál me conviene?" son 3 filas con planes visibles de la categoría`, () => {
      const visibles = getCategory(s.category)!.visibles;
      expect(s.conviene).toHaveLength(3);
      for (const c of s.conviene) expect(visibles, c.plan).toContain(c.plan);
      expect(new Set(s.conviene.map((c) => c.plan)).size).toBe(3);
    });
  }

  it("cada solución tiene 3 preguntas, y existen", () => {
    for (const s of todasLasSoluciones) {
      expect(s.faq, s.category).toHaveLength(3);
      expect(() => faqPorIds(s.faq)).not.toThrow();
    }
  });

  it("el combo de cada solución existe y aparece en esa pestaña de /precios", () => {
    for (const s of todasLasSoluciones.filter((x) => x.combo)) {
      const combo = getCombo(s.combo!.id);
      expect(combo, s.category).toBeDefined();
      expect(combo!.categorias, s.category).toContain(s.category);
    }
  });

  it("todo combo tiene una solución donde está su detalle sin JS", () => {
    for (const id of ["combo-arranque", "combo-atencion-24-h", "combo-negocio-con-turnos", "combo-pyme-digital"]) {
      expect(solucionDeCombo(id), id).toBeDefined();
    }
  });
});
