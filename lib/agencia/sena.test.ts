import { describe, expect, it } from "vitest";
import { conocimiento } from "@/content/agencia/conocimiento";
import { home } from "@/content/agencia/home";
import { legalDocs } from "@/content/agencia/legal";
import { linkDeSena } from "./config";
import { escalaDeSena, filasDeSena, lineaDeSena, senaDesde } from "./pricing";

/** Tanda P2, Fase 3: la copy de la seña escalonada sale de precios.json. */
describe("seña escalonada: textos", () => {
  it("la escala en una línea, sin montos escritos a mano", () => {
    expect(escalaDeSena()).toBe(
      "La seña de la demo depende del tamaño: $25.000 hasta $360.000 y $50.000 hasta $750.000; con inteligencia artificial o WhatsApp oficial, $50.000 como mínimo. Arriba de $750.000, o con un sistema a medida o un proyecto grande, en lugar de la demo va el plan del proyecto por escrito ($60.000). La renovación de una web tiene la demo sin cargo. Siempre se descuenta del total.",
    );
    expect(senaDesde()).toBe("seña desde $25.000, según el proyecto");
  });

  it("la tabla del modal y las líneas del carrito", () => {
    expect(filasDeSena().map((f) => f.monto)).toEqual(["$25.000", "$50.000", "$50.000 como mínimo", "Plan por escrito: $60.000", "Sin cargo"]);
    expect(lineaDeSena({ tipo: "demo", monto: 25000 })).toBe("Seña de la demo: $25.000 (se descuenta)");
    expect(lineaDeSena({ tipo: "plan-escrito", monto: 60000 })).toBe("Plan del proyecto por escrito: $60.000 (se descuenta)");
  });

  it("sin el link del monto no hay botón: queda el alias y WhatsApp", () => {
    // En los tests no hay variables NEXT_PUBLIC_SENA_URL_*.
    expect(linkDeSena({ tipo: "demo", monto: 25000 })).toBe("");
    expect(linkDeSena({ tipo: "demo", monto: 12345 })).toBe("");
    expect(linkDeSena({ tipo: "sin-cargo" })).toBe("");
  });

  it("la cláusula de los términos usa la escala, no reembolsable y descontada del total", () => {
    const clausula = JSON.stringify(legalDocs.terminos);
    expect(clausula).toContain("{SENA_ESCALA}");
    expect(clausula).toMatch(/no son reembolsables/);
    expect(clausula).toMatch(/se descuentan completos del total/);
  });

  it("ya no queda la seña fija de $20.000 en la copy", () => {
    const todo = JSON.stringify([conocimiento, home, legalDocs]);
    expect(todo).not.toContain("$20.000");
    expect(todo).not.toMatch(/seña de \{SENA\}/);
  });
});
