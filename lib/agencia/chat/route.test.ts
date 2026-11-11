import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/(agencia)/api/chat/route";
import { POST as POSTContacto } from "@/app/(agencia)/api/contacto/route";
import { resetUsoEnMemoria } from "./limits";
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
  env.CHAT_DAILY_LIMIT_IP = "0";
  env.CHAT_BURST_LIMIT = "0";
  delete env.DATABASE_URL;
  // dolarapi.com no se toca en los tests: dólar fijo a $1.000.
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) =>
    String(input instanceof Request ? input.url : input).includes("dolarapi.com")
      ? Response.json({ venta: 1000, fechaActualizacion: "2026-11-08T12:00:00Z" })
      : fetchOriginal(input, init)) as typeof fetch;
});

afterAll(async () => {
  globalThis.fetch = fetchOriginal;
  for (const k of ["ANTHROPIC_BASE_URL", "ANTHROPIC_API_KEY", "CHAT_DAILY_LIMIT_TOTAL", "CHAT_DAILY_LIMIT_IP", "CHAT_BURST_LIMIT", "CHAT_ROUND_TIMEOUT_MS", "DATABASE_URL"]) {
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
      { bloques: [{ type: "text", text: "Son **$187.600** más el abono. ¿Querés ver la demo?" }], stop: "end_turn" },
    ]);
    const evs = await chat({ ...user("Tengo una peluquería, ¿cuánto salen los turnos con Mercado Pago?"), ficha: { ciudad: "Salta" } });

    expect(evs.map((e) => e.type)).toEqual(["text", "ficha", "card", "text", "done"]);
    expect(evs[1].ficha).toEqual({ rubro: "Peluquería", planesInteres: ["Agenda de turnos online"] });
    expect(cards(evs)[0]).toMatchObject({ kind: "quote", implementacion: 187600, mensual: 23300, medio: "mp" });
    expect(textos(evs)).toBe("Te lo calculo.\nSon **$187.600** más el abono. ¿Querés ver la demo?");

    const [p1, p2] = mock.pedidos as { system: { text: string; cache_control?: unknown }[]; messages: { role: string; content: unknown }[]; tools: unknown[] }[];
    expect(p1.system).toHaveLength(2);
    expect(p1.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(p1.system[1].text).toContain("- Ciudad: Salta");
    expect(p1.tools).toHaveLength(9);
    // La segunda ronda lleva los dos tool_result en un solo mensaje.
    const ultimo = p2.messages.at(-1)!;
    expect(ultimo.role).toBe("user");
    expect((ultimo.content as { type: string }[]).map((b) => b.type)).toEqual(["tool_result", "tool_result"]);
  });

  it("texto + solo anotar_ficha cierra el turno: no hay segunda ronda que repita la respuesta", async () => {
    mock.guion([
      {
        bloques: [
          { type: "text", text: "Para una peluquería te sirve Turnos online. ¿Ya tenés web?" },
          { type: "tool_use", name: "anotar_ficha", input: { rubro: "Peluquería" } },
        ],
        stop: "tool_use",
      },
      { bloques: [{ type: "text", text: "Para una peluquería te sirve Turnos online. ¿Ya tenés web?" }], stop: "end_turn" },
    ]);
    const antes = mock.pedidos.length;
    const evs = await chat(user("Tengo una peluquería"));
    expect(evs.map((e) => e.type)).toEqual(["text", "ficha", "done"]);
    expect(textos(evs)).toBe("Para una peluquería te sirve Turnos online. ¿Ya tenés web?");
    expect(mock.pedidos.length - antes).toBe(1);
  });

  it("tanda P1: texto + derivar_whatsapp cierra el turno: no hay segunda ronda que anuncie el botón", async () => {
    mock.guion([
      {
        bloques: [
          { type: "text", text: "Eso lo ve Mauro directamente." },
          { type: "tool_use", name: "derivar_whatsapp", input: { resumen: "Marca blanca" } },
        ],
        stop: "tool_use",
      },
      { bloques: [{ type: "text", text: "Ya te dejé el botón de WhatsApp." }], stop: "end_turn" },
    ]);
    const evs = await chat(user("¿Hacés marca blanca?"));
    expect(evs.map((e) => e.type)).toEqual(["text", "card", "ficha", "done"]);
    expect(textos(evs)).toBe("Eso lo ve Mauro directamente.");
  });

  it("solo anotar_ficha sin texto sí sigue a otra ronda para responder", async () => {
    mock.guion([
      { bloques: [{ type: "tool_use", name: "anotar_ficha", input: { rubro: "Ferretería" } }], stop: "tool_use" },
      { bloques: [{ type: "text", text: "¿Qué querés que haga la web?" }], stop: "end_turn" },
    ]);
    const evs = await chat(user("Tengo una ferretería"));
    expect(evs.map((e) => e.type)).toEqual(["ficha", "text", "done"]);
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

  it("tanda P1: cortado por max_tokens sin texto → mensaje fijo y WhatsApp, no una burbuja vacía", async () => {
    mock.guion([{ bloques: [], stop: "max_tokens" }]);
    const evs = await chat(user("¿Esto no es una estafa?"));
    expect(evs.map((e) => e.type)).toEqual(["text", "card", "done"]);
    expect(textos(evs)).toMatch(/^Ahora no puedo responder/);
    expect(cards(evs)[0]).toMatchObject({ kind: "whatsapp" });
  });

  it("tanda P1: cortado por max_tokens con texto ya enviado no agrega el fallback ni corre herramientas", async () => {
    mock.guion([{ bloques: [{ type: "text", text: "La seña" }, { type: "tool_use", name: "derivar_whatsapp", input: { resumen: "x" } }], stop: "max_tokens" }]);
    const evs = await chat(user("¿Esto no es una estafa?"));
    expect(evs.map((e) => e.type)).toEqual(["text", "done"]);
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

describe("respuestas sugeridas (R3)", () => {
  it("texto + anotar_ficha + sugerir_respuestas cierra el turno con la tarjeta de opciones", async () => {
    mock.guion([
      {
        bloques: [
          { type: "text", text: "Para tu consultorio te conviene la agenda de turnos. ¿Ya tenés página?" },
          { type: "tool_use", name: "anotar_ficha", input: { rubro: "Consultorio" } },
          { type: "tool_use", name: "sugerir_respuestas", input: { opciones: ["Sí, ya tengo", "Todavía no tengo"] } },
        ],
        stop: "tool_use",
      },
      { bloques: [{ type: "text", text: "(no debería pedirse)" }], stop: "end_turn" },
    ]);
    const evs = await chat(user("Tengo un consultorio y quiero dar turnos"));
    expect(mock.pedidos).toHaveLength(1);
    expect(cards(evs)).toEqual([{ kind: "opciones", opciones: ["Sí, ya tengo", "Todavía no tengo"] }]);
    expect(textos(evs)).not.toContain("no debería");
  });

  it("opciones con links o de más de 40 caracteres se rechazan", () => {
    const ctx = nuevoContexto(1000);
    expect(runTool("sugerir_respuestas", { opciones: ["https://x.com", "No"] }, ctx).isError).toBe(true);
    expect(runTool("sugerir_respuestas", { opciones: ["a".repeat(41), "No"] }, ctx).isError).toBe(true);
    expect(runTool("sugerir_respuestas", { opciones: ["Sí"] }, ctx).isError).toBe(true);
  });
});

describe("/api/chat y /api/contacto · seguridad (R2)", () => {
  const pedido = (url: string, origin: string | null, headers: Record<string, string> = {}) =>
    new Request(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "10.9.9.9", ...(origin ? { origin } : {}), ...headers },
      body: JSON.stringify({ messages: [{ role: "user", content: "hola" }] }),
    });

  it("S6: un Origin ajeno recibe 403 en el chat y en el contacto", async () => {
    expect((await POST(pedido("http://localhost/api/chat", "https://evil.example"))).status).toBe(403);
    expect((await POSTContacto(pedido("http://localhost/api/contacto", "https://evil.example"))).status).toBe(403);
    // Sin Origin (curl, el runner de evals) no se rechaza por origen.
    expect((await POSTContacto(pedido("http://localhost/api/contacto", null))).status).toBe(400);
  });

  it("S1: al llegar a la ráfaga, mensaje amable y WhatsApp con la ficha; la llave de pruebas la saltea", async () => {
    env.CHAT_BURST_LIMIT = "1";
    env.CHAT_TEST_TOKEN = "k".repeat(24);
    resetUsoEnMemoria();
    mock.guion([{ bloques: [{ type: "text", text: "Hola." }], stop: "end_turn" }]);
    await (await POST(pedido("http://localhost/api/chat", null))).text();
    const evs = (await (await POST(pedido("http://localhost/api/chat", null))).text())
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Ev);
    expect(evs[0].text).toMatch(/esperá unos minutos/);
    expect(evs.some((e) => e.card?.kind === "whatsapp")).toBe(true);
    mock.guion([{ bloques: [{ type: "text", text: "Seguimos." }], stop: "end_turn" }]);
    const conLlave = await (await POST(pedido("http://localhost/api/chat", null, { "x-malejo-test": "k".repeat(24) }))).text();
    expect(conLlave).toContain("Seguimos.");
    env.CHAT_BURST_LIMIT = "0";
    delete env.CHAT_TEST_TOKEN;
  });
});

describe("/api/contacto · formulario del chat (R3)", () => {
  const enviar = (body: unknown) =>
    POSTContacto(new Request("http://localhost/api/contacto", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "10.7.7.7" }, body: JSON.stringify(body) }));

  it("valida el ticket y el WhatsApp; sin base responde 503 (el pedido era válido)", async () => {
    const out = runTool("pedir_contacto", {}, nuevoContexto(1000, { rubro: "Veterinaria", necesidad: "Turnos" }));
    if (out.card?.kind !== "formContacto") throw new Error("sin formulario");
    const { ticket, token } = out.card;
    expect((await enviar({ consent: true, ticket, token, nombre: "Ana", whatsapp: "3875813233" })).status).toBe(503);
    expect((await enviar({ consent: true, ticket, token, nombre: "Ana", whatsapp: "12345678" })).status).toBe(400);
    expect((await enviar({ consent: true, ticket: { ...ticket, rubro: "Otra" }, token, nombre: "Ana", whatsapp: "3875813233" })).status).toBe(400);
    expect((await enviar({ consent: false, ticket, token, nombre: "Ana", whatsapp: "3875813233" })).status).toBe(400);
  });
});
