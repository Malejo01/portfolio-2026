import { describe, expect, it } from "vitest";
import { prometeDerivar } from "./derivar";

describe("prometeDerivar (salvaguarda P1)", () => {
  it("detecta las promesas de derivar que el modelo dejó sin herramienta", () => {
    for (const t of [
      "Trabajar en marca blanca lo charla directo Mauro, así que le dejo tu consulta lista por WhatsApp.",
      "Eso lo confirma Mauro. Le dejo tu consulta lista para que te responda por WhatsApp.",
      "Te paso con Mauro para que te responda directamente.",
      "Te derivo a Mauro por WhatsApp.",
    ]) {
      expect(prometeDerivar(t), t).toBe(true);
    }
  });

  it("no salta con menciones que no prometen derivar", () => {
    for (const t of [
      "Mauro responde por WhatsApp en hasta 2 días hábiles.",
      "Te dejo los 3 pagos de $83.000 sin interés. ¿Te sirve?",
      "El asistente en tu WhatsApp responde solo. Te paso el precio: $447.000.",
      "La seña de $20.000 se descuenta del primer pago.",
    ]) {
      expect(prometeDerivar(t), t).toBe(false);
    }
  });
});
