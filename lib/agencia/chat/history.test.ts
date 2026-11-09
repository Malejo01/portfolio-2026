import { describe, expect, it } from "vitest";
import type { Card } from "./cards";
import { armarHistorial, firmasMostradas, MAX_CONTENT, ultimaQuote, type ChatMsg } from "./history";
import { nuevoContexto, runTool } from "./tools";

const ctx = () => nuevoContexto(1000);
const quote = runTool("cotizar", { planIds: ["turnos-online"], medio: "mp" }, ctx()).card!;
const demo: Card = { kind: "demo", demoHref: "/demo?plan=turnos-online", agendaHref: "https://wa.me/1" };

describe("historial con memoria de tarjetas", () => {
  const msgs: ChatMsg[] = [
    { role: "assistant", text: "¡Hola!", cards: [] },
    { role: "user", text: "Tengo una peluquería, ¿con Mercado Pago?", cards: [] },
    { role: "assistant", text: "Te lo calculo.", cards: [quote] },
    { role: "assistant", text: "", cards: [demo] },
  ];

  it("agrega una línea por tarjeta al mensaje del asistente", () => {
    const h = armarHistorial(msgs);
    expect(h[2].content).toBe("Te lo calculo.\n[Tarjeta mostrada · Cotización: Agenda de turnos online · MP · $190.800 + $23.300/mes]");
    // Un mensaje con solo tarjetas ya no se pierde del historial.
    expect(h[3]).toEqual({ role: "assistant", content: "[Tarjeta mostrada · Demo]" });
  });

  it("nunca pasa del tope por mensaje, y la línea de la tarjeta sobrevive", () => {
    const largo: ChatMsg = { role: "assistant", text: "a".repeat(5000), cards: [quote] };
    const [m] = armarHistorial([largo]);
    expect(m.content.length).toBeLessThanOrEqual(MAX_CONTENT);
    expect(m.content).toContain("[Tarjeta mostrada · Cotización");
  });

  it("firmas solo de las tarjetas deduplicables", () => {
    expect(firmasMostradas(msgs)).toEqual(["quote:turnos-online||mp|ars"]);
  });

  it("última cotización mostrada", () => {
    expect(ultimaQuote(msgs)).toBe(quote);
    expect(ultimaQuote([])).toBeNull();
  });
});
