import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST } from "@/app/(agencia)/api/chat/route";
import { mockAnthropic, type MockAnthropic } from "../mock-anthropic";
import { generales, preguntas, RUTA_CRUDA } from "./aserciones";
import { casos } from "./casos";
import { correrCaso, objetivo } from "./runner";

describe("aserciones generales", () => {
  const t = (texto: string) => ({ usuario: "", texto, cards: [], ms: 0 });

  it("detectan rutas crudas y URLs (F3 de producción)", () => {
    for (const mal of ["el link es /demo?plan=turnos-online", "entrá a https://malejo.com.ar", "escribile a wa.me/549387", "mirá (/cotizador)", "en malejo.com.ar/servicios"]) {
      expect(RUTA_CRUDA.test(mal), mal).toBe(true);
    }
    for (const bien of ["Te dejo la demo abajo.", "Son $190.800 + $23.300/mes", "24/7 y 50/50"]) expect(RUTA_CRUDA.test(bien), bien).toBe(false);
  });

  it('detectan "te corrijo", el largo, varias preguntas y la doble voz', () => {
    expect(generales(t("te corrijo: el abono queda en $23.300 (no $23.300 como dije)"))).toContain('sin "te corrijo" ni "como dije"');
    expect(generales(t("palabra ".repeat(61)))[0]).toMatch(/como mucho 60/);
    expect(generales(t("palabra ".repeat(80)), 90)).toEqual([]);
    expect(generales(t("palabra ".repeat(95)), 120)[0]).toMatch(/como mucho 90/);
    expect(generales(t("¿Qué rubro? ¿Y cuándo?"))).toContain("una sola pregunta (tuvo 2)");
    expect(preguntas("¿Querés que Mauro te escriba?")).toBe(1);
    expect(generales(t("Te paso con Mauro. Ya te apareció el botón de WhatsApp."))).toContain("sin doble voz alrededor de la tarjeta");
    expect(generales(t("Dale, te armo la demo con tu marca. ¿Querés verla?"))).toEqual([]);
  });
});

describe("casos", () => {
  it("son los 24 de A a X, los de R2 (Y a AD), los de R3 (AE a AJ) y los de P1 (AK a AO), con turnos y checks", () => {
    expect(casos.map((c) => c.id).join(",")).toBe("A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,AA,AB,AC,AD,AE,AF,AG,AH,AI,AJ,AK,AL,AM,AN,AO");
    expect(objetivo(24)).toBe(22);
    expect(objetivo(casos.length)).toBe(38);
    for (const c of casos) {
      expect(c.turnos.length, c.id).toBeGreaterThan(0);
      expect(c.checks.length, c.id).toBeGreaterThan(0);
      expect(c.maxPalabras ?? 60, c.id).toBeLessThanOrEqual(90);
    }
  });
});

describe("runner punta a punta (runner → /api/chat → modelo simulado)", () => {
  const env = process.env as Record<string, string | undefined>;
  const prev = { base: env.ANTHROPIC_BASE_URL, key: env.ANTHROPIC_API_KEY, total: env.CHAT_DAILY_LIMIT_TOTAL };
  const fetchOriginal = globalThis.fetch;
  let mock: MockAnthropic;

  beforeAll(async () => {
    mock = await mockAnthropic();
    env.ANTHROPIC_BASE_URL = mock.url;
    env.ANTHROPIC_API_KEY = "test-no-es-una-clave";
    env.CHAT_DAILY_LIMIT_TOTAL = "0";
  env.CHAT_DAILY_LIMIT_IP = "0";
  env.CHAT_BURST_LIMIT = "0";
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.includes("dolarapi.com")) return Response.json({ venta: 1000 });
      if (url.startsWith("http://eval.local/")) return POST(new Request(url, init));
      return fetchOriginal(input, init);
    }) as typeof fetch;
  });

  afterAll(async () => {
    globalThis.fetch = fetchOriginal;
    for (const [k, v] of [["ANTHROPIC_BASE_URL", prev.base], ["ANTHROPIC_API_KEY", prev.key], ["CHAT_DAILY_LIMIT_TOTAL", prev.total]] as const) {
      if (v === undefined) delete env[k];
      else env[k] = v;
    }
    await mock.cerrar();
  });

  const caso = (id: string) => casos.find((c) => c.id === id)!;

  it("un caso bien respondido pasa (W: pregunta antes de cotizar, anota la ficha)", async () => {
    mock.guion([
      { bloques: [{ type: "tool_use", name: "anotar_ficha", input: { rubro: "Ropa", necesidad: "Vender por Instagram" } }], stop: "tool_use" },
      { bloques: [{ type: "text", text: "¡Buenísimo! ¿Hoy cómo te hacen los pedidos: por mensaje directo o tenés algún catálogo?" }], stop: "end_turn" },
    ]);
    const r = await correrCaso("http://eval.local", caso("W"));
    expect(r.fallos).toEqual([]);
    expect(r.resultado.ficha).toMatchObject({ rubro: "Ropa" });
  });

  it("las fallas de producción se detectan (A: suma alternativas y escribe la ruta)", async () => {
    mock.guion([
      {
        bloques: [
          { type: "text", text: "Te paso todo." },
          { type: "tool_use", name: "cotizar", input: { planIds: ["landing-express", "landing-profesional", "sitio-pyme"] } },
        ],
        stop: "tool_use",
      },
      { bloques: [{ type: "text", text: "Son $1.150.000, el link es /demo?plan=landing-express" }], stop: "end_turn" },
    ]);
    const r = await correrCaso("http://eval.local", caso("A"));
    expect(r.pasa).toBe(false);
    const nombres = r.fallos.map((f) => f.nombre);
    expect(nombres).toContain("sin rutas ni URLs");
    expect(nombres).toContain("nunca una tarjeta que sume opciones");
  });
});
