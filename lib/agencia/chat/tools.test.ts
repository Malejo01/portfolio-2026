import { describe, expect, it } from "vitest";
import { isPhoneAR, signConsent, verifyConsent } from "./security";
import { runTool } from "./tools";

describe("herramientas del agente", () => {
  it("cotizar usa cotizar() y arma la tarjeta", () => {
    const out = runTool("cotizar", { planIds: ["combo-web-turnos"] });
    expect(out.isError).toBeUndefined();
    expect(out.card).toMatchObject({ kind: "quote", implementacion: 450000, mensual: 45000, demoHref: "/demo?plan=combo-web-turnos" });
  });

  it("rechaza input inválido o ids inventados", () => {
    expect(runTool("cotizar", { planIds: [] }).isError).toBe(true);
    expect(runTool("cotizar", { planIds: ["web-magica"] }).isError).toBe(true);
    expect(runTool("leer_contactos", {}).isError).toBe(true);
  });

  it("guardar_contacto no guarda: devuelve una firma para la UI", () => {
    const out = runTool("guardar_contacto", { nombre: "Ana", whatsapp: "387 581-3233", rubro: "Veterinaria", resumen: "Quiere turnos online" });
    expect(out.card?.kind).toBe("consent");
    if (out.card?.kind !== "consent") return;
    expect(verifyConsent(out.card.payload, out.card.token)).toBe(true);
    // Un payload editado invalida la firma.
    expect(verifyConsent({ ...out.card.payload, whatsapp: "1111111111" }, out.card.token)).toBe(false);
  });

  it("guardar_contacto exige teléfono argentino", () => {
    expect(runTool("guardar_contacto", { nombre: "Ana", whatsapp: "12345678", rubro: "Vete", resumen: "Quiere turnos" }).isError).toBe(true);
  });

  it("la firma vence", () => {
    const p = { nombre: "A", whatsapp: "3875813233", rubro: "x", resumen: "y", iat: Date.now() - 2 * 60 * 60 * 1000 };
    expect(verifyConsent(p, signConsent(p))).toBe(false);
  });

  it("teléfonos", () => {
    for (const ok of ["+54 9 387 581-3233", "0387 15 581-3233", "3875813233", "11 2345-6789"]) expect(isPhoneAR(ok), ok).toBe(true);
    for (const bad of ["hola", "12345", "+1 555 1234"]) expect(isPhoneAR(bad), bad).toBe(false);
  });
});

describe("sin MALEJO_SALT en producción", () => {
  it("no firma ni acepta consentimientos", () => {
    const prev = { env: process.env.NODE_ENV, salt: process.env.MALEJO_SALT };
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = "production";
    delete env.MALEJO_SALT;
    try {
      const out = runTool("guardar_contacto", { nombre: "Ana", whatsapp: "3875813233", rubro: "Vete", resumen: "Quiere turnos" });
      expect(out.card?.kind).toBe("whatsapp");
      const p = { nombre: "A", whatsapp: "3875813233", rubro: "x", resumen: "y", iat: Date.now() };
      expect(verifyConsent(p, signConsent(p))).toBe(false);
    } finally {
      env.NODE_ENV = prev.env;
      if (prev.salt) env.MALEJO_SALT = prev.salt;
    }
  });
});
