import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/(agencia)/api/chat/route";
import { firmaCard, type Card } from "./cards";
import { mockAnthropic, type MockAnthropic } from "./mock-anthropic";
import { nuevoContexto, runTool } from "./tools";

/**
 * `/api/chat` punta a punta contra un modelo simulado (SSE local +
 * `ANTHROPIC_BASE_URL`): texto → herramienta → texto, evento `ficha`,
 * deduplicación de tarjetas, input inválido, error del modelo y timeout.
 */

type Ev = { type: string; text?: string; card?: Card; ficha?: Record<string, unknown> };

const env = process.env as Record<string, string | undefined>;
const prev = { ...env };
const fetchOriginal = globalThis.fetch;
let mock: MockAnthropic;

beforeAll(async () => {
  mock = await mockAnthropic();
  env.ANTHROPIC_BASE_URL = mock.url;
  env.ANTHROPIC_API_KEY = "test-no-es-una-clave";
  env.CHAT_DAILY_LIMIT_TOTAL = "0";
  delete env.DATABASE_URL;
  // dolarapi.com no se toca en los tests: dólar fijo a $1.000.
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) =>
    String(input instanceof Request ? input.url : input).includes("dolarapi.com")
      ? Response.json({ venta: 1000, fechaActualizacion: "2026-11-08T12:00:00Z" })
      : fetchOriginal(input, init)) as typeof fetch;
});

afterAll(async () => {
  globalThis.fetch = fetchOriginal;
  for (const k of ["ANTHROPIC_BASE_URL", "ANTHROPIC_API_KEY", "CHAT_DAILY_LIMIT_TOTAL", "CHAT_ROUND_TIMEOUT_MS", "DATABASE_URL"]) {
    if (prev[k] === undefined) delete env[k];
    else env[k] = prev[k];
  }
  await mock.cerrar();
});

beforeEach(() => {
  delete env.CHAT_ROUND_TIMEOUT_MS;
});

async function chat(body: Record<string, unknown>): Promise<Ev[]> {
  const res = await POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "10.0.0.1" },
      body: JSON.stringify(body),
    }),
  );
  const text = await res.text();
  return text
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as Ev);
}

const user = (content: string) => ({ messages: [{ role: "user", content }] });
const textos = (evs: Ev[]) => evs.filter((e) => e.type === "text" || e.type === "error").map((e) => e.text).join("");
const cards = (evs: Ev[]) => evs.filter((e) => e.type === "card").map((e) => e.card!);

describe("/api/chat con modelo simulado", () => {
  it("texto → herramientas → texto, con tarjeta, evento ficha y caché en el system", async () => {
    mock.guion([
      {
        bloques: [
          { type: "text", text: "Te lo calculo." },
          { type: "tool_use", name: "anotar_ficha", input: { rubro: "Peluquería", planesInteres: ["turnos-online"] } },
          { type: "tool_use", name: "cotizar", input: { planIds: ["turnos-online"], medio: "mp" } },
        ],
        stop: "tool_use",
      },
      { bloques: [{ type: "text", text: "Son **$190.800** más el abono. ¿Querés ver la demo?" }], stop: "end_turn" },
    ]);
    const evs = await chat({ ...user("Tengo una peluquería, ¿cuánto salen los turnos con Mercado Pago?"), ficha: { ciudad: "Salta" } });

    expect(evs.map((e) => e.type)).toEqual(["text", "ficha", "card", "text", "done"]);
    expect(evs[1].ficha).toEqual({ rubro: "Peluquería", planesInteres: ["Turnos online"] });
    expect(cards(evs)[0]).toMatchObject({ kind: "quote", implementacion: 190800, mensual: 23300, medio: "mp" });
    expect(textos(evs)).toBe("Te lo calculo.\nSon **$190.800** más el abono. ¿Querés ver la demo?");

    const [p1, p2] = mock.pedidos as { system: { text: string; cache_control?: unknown }[]; messages: { role: string; content: unknown }[]; tools: unknown[] }[];
    expect(p1.system).toHaveLength(2);
    expect(p1.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(p1.system[1].text).toContain("- Ciudad: Salta");
    expect(p1.tools).toHaveLength(7);
    // La segunda ronda lleva los dos tool_result en un solo mensaje.
    const ultimo = p2.messages.at(-1)!;
    expect(ultimo.role).toBe("user");
    expect((ultimo.content as { type: string }[]).map((b) => b.type)).toEqual(["tool_result", "tool_result"]);
  });

  it("no repite una tarjeta que el widget dice que ya mostró", async () => {
    const firma = firmaCard(runTool("cotizar", { planIds: ["turnos-online"], medio: "mp" }, nuevoContexto(1000)).card!);
    mock.guion([
      { bloques: [{ type: "tool_use", name: "cotizar", input: { planIds: ["turnos-online"], medio: "mp" } }], stop: "tool_use" },
      { bloques: [{ type: "text", text: "¿Avanzamos con la demo?" }], stop: "end_turn" },
    ]);
    const evs = await chat({ ...user("dale"), shownCards: [firma] });
    expect(cards(evs)).toEqual([]);
    const resultado = JSON.stringify((mock.pedidos[1] as { messages: unknown[] }).messages.at(-1));
    expect(resultado).toContain("YA está en pantalla");
  });

  it("un input inválido vuelve como is_error y el modelo se recupera", async () => {
    mock.guion([
      { bloques: [{ type: "tool_use", name: "comparar", input: { ids: ["landing-express"] } }], stop: "tool_use" },
      { bloques: [{ type: "text", text: "¿Querés comparar la Express con la Profesional?" }], stop: "end_turn" },
    ]);
    const evs = await chat(user("¿qué landing me conviene?"));
    const r = (mock.pedidos[1] as { messages: { content: { is_error?: boolean }[] }[] }).messages.at(-1)!.content[0];
    expect(r.is_error).toBe(true);
    expect(textos(evs)).toContain("Profesional");
    expect(evs.at(-1)?.type).toBe("done");
  });

  it("error del modelo → mensaje fijo y WhatsApp con la ficha", async () => {
    mock.guion([{ status: 400, error: "boom" }]);
    const evs = await chat({ ...user("hola"), ficha: { rubro: "Veterinaria", necesidad: "Turnos" } });
    expect(evs.map((e) => e.type)).toEqual(["error", "card", "done"]);
    const wa = cards(evs)[0] as Extract<Card, { kind: "whatsapp" }>;
    expect(decodeURIComponent(wa.href)).toContain("Rubro: Veterinaria");
  });

  it("timeout de la ronda → aviso y WhatsApp, sin colgar el turno", async () => {
    env.CHAT_ROUND_TIMEOUT_MS = "200";
    mock.guion([{ bloques: [{ type: "text", text: "tarde" }], stop: "end_turn", demoraMs: 1500 }]);
    const evs = await chat({ ...user("hola"), ficha: { rubro: "Ferretería" } });
    expect(textos(evs)).toContain("Se me está demorando");
    expect(cards(evs)[0]).toMatchObject({ kind: "whatsapp" });
    expect(decodeURIComponent((cards(evs)[0] as { href: string }).href)).toContain("Rubro: Ferretería");
    expect(evs.at(-1)?.type).toBe("done");
  });

  it("valida ficha y shownCards: un body enorme es 400", async () => {
    const res = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({ ...user("hola"), shownCards: Array.from({ length: 100 }, () => "x") }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("sin ANTHROPIC_API_KEY responde el fallback con la ficha", async () => {
    delete env.ANTHROPIC_API_KEY;
    try {
      const evs = await chat({ ...user("hola"), ficha: { rubro: "Inmobiliaria" } });
      expect(evs.map((e) => e.type)).toEqual(["text", "card", "done"]);
      expect(decodeURIComponent((cards(evs)[0] as { href: string }).href)).toContain("Rubro: Inmobiliaria");
    } finally {
      env.ANTHROPIC_API_KEY = "test-no-es-una-clave";
    }
  });
});
