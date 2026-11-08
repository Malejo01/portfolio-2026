import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Card } from "@/lib/agencia/chat/cards";
import type { Ficha } from "@/lib/agencia/chat/ficha";
import { FichaSchema, limpiarFicha } from "@/lib/agencia/chat/ficha-schema";
import { consume } from "@/lib/agencia/chat/limits";
import { systemBlocks } from "@/lib/agencia/chat/prompt";
import { hashIp, ipFrom } from "@/lib/agencia/chat/security";
import { nuevoContexto, runTool, tools } from "@/lib/agencia/chat/tools";
import { senaMonto, waLink } from "@/lib/agencia/config";
import { tipoDeCambio } from "@/lib/agencia/usd";

/**
 * Chat de Malejo. POST `{ messages: [{ role, content }], ficha?, shownCards? }`
 * → stream NDJSON:
 *
 *   {"type":"text","text":"…"}   delta de texto
 *   {"type":"card","card":{…}}   tarjeta de herramienta (cotización, demo…)
 *   {"type":"ficha","ficha":{…}} cambio de ficha (el widget lo fusiona)
 *   {"type":"done"}              fin del turno
 *   {"type":"error","text":"…"}  error mostrable (con tarjeta de WhatsApp)
 *
 * Loop manual con streaming: las herramientas corren acá, en el servidor,
 * validadas con zod. El historial llega del cliente solo como texto (no se
 * guardan transcripciones) y se recorta a los últimos 20 turnos. La ficha y
 * las firmas de tarjetas llegan del widget, se validan y no se guardan.
 *
 * Sin `ANTHROPIC_API_KEY` responde un mensaje fijo con WhatsApp: la UI no
 * se rompe. Los logs no llevan datos personales: solo tipo de error y status.
 */
export const runtime = "nodejs";

const MODEL = process.env.MALEJO_MODEL || "claude-haiku-5-5";
const MAX_TURNS = 20;
const MAX_TOOL_ROUNDS = 4;

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2000) }))
    .min(1)
    .max(60),
  /** Lo que el widget sabe del cliente. Se valida, se trunca y no se guarda. */
  ficha: FichaSchema.optional(),
  /** Firmas de las tarjetas ya mostradas (`firmaCard`), para no repetirlas. */
  shownCards: z.array(z.string().max(300)).max(40).optional(),
});

const FALLBACK = "Ahora no puedo responder, escribime por WhatsApp y te contesta Mauro.";

type Event =
  | { type: "text"; text: string }
  | { type: "card"; card: Card }
  | { type: "ficha"; ficha: Ficha }
  | { type: "done" }
  | { type: "error"; text: string };

function ndjson(events: Event[]): Response {
  return new Response(events.map((e) => JSON.stringify(e)).join("\n") + "\n", {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}

function fallback(text = FALLBACK): Response {
  return ndjson([
    { type: "text", text },
    { type: "card", card: { kind: "whatsapp", href: waLink("Hola Mauro, vengo del chat de malejo.com.ar.") } },
    { type: "done" },
  ]);
}

export async function POST(request: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return Response.json({ error: "Pedido inválido" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) return fallback();

  const ip = ipFrom(request.headers);
  const usage = await consume(hashIp(ip)).catch(() => ({ ok: true as const }));
  if (!usage.ok) {
    return fallback("Por hoy llegamos al límite de mensajes del chat. Escribime por WhatsApp y seguimos por ahí.");
  }

  // Últimos 20 turnos, empezando siempre por un mensaje del usuario.
  let history = body.messages.slice(-MAX_TURNS);
  while (history.length && history[0].role !== "user") history = history.slice(1);
  const messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));

  const ctx = nuevoContexto((await tipoDeCambio()).valor, body.ficha ? limpiarFicha(body.ficha) : {}, body.shownCards);
  const client = new Anthropic();
  // La ficha del bloque final es la que llegó con el pedido: fija durante el turno.
  const system = systemBlocks(senaMonto(), ctx.ficha);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: Event) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      let sentText = false;
      try {
        for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
          const s = client.messages.stream(
            {
              model: MODEL,
              // 800 (antes 600): con anotar_ficha el modelo suele llamar dos
              // herramientas en la misma ronda además del texto, y un input
              // cortado por max_tokens no se ejecuta. Haiku 5.5 piensa de forma
              // adaptativa; con esfuerzo bajo casi no lo hace en un chat.
              max_tokens: 800,
              output_config: { effort: "low" },
              system,
              tools,
              messages,
            },
            { signal: request.signal },
          );
          // Entre rondas del loop (texto → herramienta → texto) va un salto.
          let first = true;
          s.on("text", (delta) => {
            send({ type: "text", text: first && sentText ? `\n${delta}` : delta });
            first = false;
            sentText = true;
          });
          const message = await s.finalMessage();

          if (message.stop_reason === "refusal") {
            send({ type: "text", text: "\nEso no lo puedo responder por acá. Si querés, escribile a Mauro por WhatsApp." });
            break;
          }
          const toolUses = message.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
          // Solo se ejecutan herramientas con stop_reason "tool_use": un input
          // cortado por max_tokens puede parecer válido y no se corre.
          if (message.stop_reason !== "tool_use" || toolUses.length === 0 || round === MAX_TOOL_ROUNDS) break;

          messages.push({ role: "assistant", content: message.content });
          const results: Anthropic.ToolResultBlockParam[] = toolUses.map((t) => {
            const out = runTool(t.name, t.input, ctx);
            if (out.card) send({ type: "card", card: out.card });
            if (out.ficha) send({ type: "ficha", ficha: out.ficha });
            return { type: "tool_result", tool_use_id: t.id, content: out.content, ...(out.isError ? { is_error: true } : {}) };
          });
          messages.push({ role: "user", content: results });
        }
        send({ type: "done" });
      } catch (err) {
        if (err instanceof Anthropic.APIError) console.error("[chat] api error", err.status, err.constructor.name);
        else if ((err as Error)?.name !== "AbortError") console.error("[chat] error", (err as Error)?.name);
        send({ type: "error", text: FALLBACK });
        send({ type: "card", card: { kind: "whatsapp", href: waLink("Hola Mauro, vengo del chat de malejo.com.ar.") } });
        send({ type: "done" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}
