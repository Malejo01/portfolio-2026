import { describe, expect, it } from "vitest";
import { nuevoContexto, runTool } from "./tools";
import { mensajeWhatsApp, SALUDO, WA_MAX } from "./whatsapp";

const quote = (args: Record<string, unknown>) => {
  const card = runTool("cotizar", args, nuevoContexto(1000)).card;
  if (card?.kind !== "quote") throw new Error("sin tarjeta");
  return card;
};

describe("mensajeWhatsApp", () => {
  it("sin ficha ni cotización es el saludo genérico", () => {
    expect(mensajeWhatsApp()).toBe(SALUDO);
    expect(mensajeWhatsApp({}, null)).toBe(SALUDO);
    expect(mensajeWhatsApp({ rubro: "  " })).toBe(SALUDO);
  });

  it("arma el formato completo con la ficha y la cotización", () => {
    const texto = mensajeWhatsApp(
      {
        nombre: "Laura",
        rubro: "Peluquería",
        ciudad: "Salta",
        necesidad: "Turnos online para 3 peluqueras",
        planesInteres: ["Agenda de turnos online", "Combo Página + turnos"],
        presupuesto: "200 mil",
        urgencia: "este mes",
        medioPago: "Mercado Pago",
        cuotas: "6 cuotas",
        dudas: ["¿Factura?", "¿Dominio?"],
      },
      quote({ planIds: ["turnos-online"], medio: "mp", moneda: "usd" }),
    );
    expect(texto).toBe(
      [
        "Hola Mauro, vengo del chat de malejo.com.ar.",
        "• Nombre: Laura",
        "• Rubro: Peluquería · Ciudad: Salta",
        "• Necesito: Turnos online para 3 peluqueras",
        "• Me interesa: Agenda de turnos online, Combo Página + turnos",
        "• Cotización: Agenda de turnos online · $190.800 + $23.300/mes (≈ USD 190) · Mercado Pago · 6 cuotas",
        "• Presupuesto: 200 mil · Urgencia: este mes",
        "• Dudas: ¿Factura?; ¿Dominio?",
      ].join("\n"),
    );
  });

  it("omite las líneas vacías y las partes vacías de una línea", () => {
    const texto = mensajeWhatsApp({ ciudad: "Montevideo", urgencia: "ya" });
    expect(texto).toBe(`${SALUDO}\n• Ciudad: Montevideo\n• Urgencia: ya`);
    expect(texto).not.toContain("Nombre");
    expect(texto).not.toContain("undefined");
  });

  it("sin cotización, el medio y las cuotas van en su propia línea", () => {
    expect(mensajeWhatsApp({ medioPago: "Mercado Pago", cuotas: "3" })).toContain("• Pago: Mercado Pago · 3");
  });

  it("suma la consulta del modelo si no repite la necesidad", () => {
    expect(mensajeWhatsApp({ necesidad: "Una app tipo Uber" }, null, "Una app tipo Uber")).not.toContain("Consulta");
    expect(mensajeWhatsApp({}, null, "Quiero hablar con una persona")).toContain("• Consulta: Quiero hablar con una persona");
  });

  it("nunca pasa de 1.000 caracteres y corta por renglón", () => {
    const texto = mensajeWhatsApp({
      necesidad: "n".repeat(300),
      dudas: Array.from({ length: 6 }, () => "d".repeat(80)),
      planesInteres: Array.from({ length: 6 }, () => "p".repeat(80)),
      rubro: "r".repeat(120),
      ciudad: "c".repeat(120),
    });
    expect(texto.length).toBeLessThanOrEqual(WA_MAX);
    expect(texto.startsWith(SALUDO)).toBe(true);
    expect(texto.endsWith("…")).toBe(false);
  });
});
