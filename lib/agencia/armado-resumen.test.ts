import { describe, expect, it } from "vitest";
import { resumenDeArmado } from "./armado-resumen";

describe("resumen del armado para Mauro (tanda P2)", () => {
  it("nombres, estimado con rango y seña, escritos en el servidor", () => {
    const r = resumenDeArmado({ items: [{ id: "landing-profesional", origen: "persona" }, { id: "turnos-online", origen: "malejo" }], extras: [] });
    expect(r).toBe("Kit: Combo Página + turnos · estimado $357.000–$411.000 · + $45.000 por mes · seña $50.000");
  });

  it("suma la ficha y la nota recortadas", () => {
    const r = resumenDeArmado(
      { items: [{ id: "landing-express", origen: "persona" }], extras: [] },
      { ficha: { rubro: "  Peluquería ", necesidad: "x".repeat(500) }, nota: "Tengo\ndos sillones" },
    );
    const [, ficha, nota] = r.split("\n");
    expect(ficha).toBe(`Ficha: Peluquería · ${"x".repeat(200)}`);
    expect(nota).toBe("Nota: Tengo dos sillones");
  });

  it("plan escrito y demo sin cargo", () => {
    expect(resumenDeArmado({ items: [{ id: "sistema-a-medida", origen: "persona" }], extras: [] })).toMatch(/plan escrito \$60\.000$/);
    expect(resumenDeArmado({ items: [{ id: "renova-tu-web", origen: "persona" }], extras: [] })).toMatch(/demo sin cargo$/);
  });
});
