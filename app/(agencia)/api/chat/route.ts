import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Card } from "@/lib/agencia/chat/cards";
import type { Ficha } from "@/lib/agencia/chat/ficha";
import { FichaSchema, limpiarFicha } from "@/lib/agencia/chat/ficha-schema";
import { consume } from "@/lib/agencia/chat/limits";
import { systemBlocks } from "@/lib/agencia/chat/prompt";
import { hashIp, ipFrom } from "@/lib/agencia/chat/security";
import { nuevoContexto, runTool, tools, ultimaCotizacion, type ToolContext, type ToolOutcome } from "@/lib/agencia/chat/tools";
import { mensajeWhatsApp } from "@/lib/agencia/chat/whatsapp";
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
 * las firmas de tarjetas llegan del widget, se validan con tope de tamaño y
 * no se guardan.
 *
 * Robustez (tanda CHAT-R1, F9): cada ronda del modelo tiene un timeout
 * propio (`CHAT_ROUND_TIMEOUT_MS`, 20 s); si vence o la API falla, el turno
 * cierra con un mensaje fijo y el botón de WhatsApp **con la ficha**. Un
 * input inválido o una herramienta que tira vuelven al modelo como
 * `is_error` para que se recupere.
 *
 * Sin `ANTHROPIC_API_KEY` responde un mensaje fijo con WhatsApp: la UI no
 * se rompe. Los logs no llevan datos personales: solo tipo de error y status.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.MALEJO_MODEL || "claude-haiku-5-5";
const MAX_TURNS = 20;
const MAX_TOOL_ROUNDS = 4;

function roundTimeout(): number {
  const n = Number(process.env.CHAT_ROUND_TIMEOUT_MS);
  return Number.isFinite(n) && n > 0 ? n : 20_000;
}

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

const FALLBACK = "Ahora no puedo responder. Escribile a Mauro por WhatsApp con tu consulta ya cargada: te contesta en hasta 2 días hábiles.";
const TIMEOUT = "Se me está demorando la respuesta. Escribile a Mauro por WhatsApp con lo que charlamos: te contesta en hasta 2 días hábiles.";

type Event =
  | { type: "text"; text: string }
  | { type: "card"; card: Card }
  | { type: "ficha"; ficha: Ficha }
  | { type: "done" }
  | { type: "error"; text: string };

const HEADERS = { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" };

function waCard(ctx?: ToolContext): Card {
  return { kind: "whatsapp", href: waLink(mensajeWhatsApp(ctx?.ficha, ctx ? ultimaCotizacion(ctx) : null)) };
}

function fallback(text: string, ctx?: ToolContext): Response {
  const events: Event[] = [{ type: "text", text }, { type: "card", card: waCard(ctx) }, { type: "done" }];
  return new Response(events.map((e) => JSON.stringify(e)).join("\n") + "\n", { headers: HEADERS });
}

/** `runTool` nunca debería tirar; si lo hace, el modelo recibe un error y sigue. */
function correrSeguro(name: string, input: unknown, ctx: ToolContext): ToolOutcome {
  try {
    return runTool(name, input, ctx);
  } catch (err) {
    console.error("[chat] tool error", name, (err as Error)?.name);
    return { content: "La herramienta falló. No la repitas: seguí sin ella o derivá a WhatsApp.", isError: true };
  }
}

export async function POST(request: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return Response.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const ficha = body.ficha ? limpiarFicha(body.ficha) : {};
  if (!process.env.ANTHROPIC_API_KEY) return fallback(FALLBACK, nuevoContexto(0, ficha, body.shownCards));

  const ip = ipFrom(request.headers);
  const usage = await consume(hashIp(ip)).catch(() => ({ ok: true as const }));
  if (!usage.ok) {
    return fallback(
      "Por hoy llegamos al límite de mensajes del chat. Escribile a Mauro por WhatsApp y seguimos por ahí.",
      nuevoContexto(0, ficha, body.shownCards),
    );
  }

  // Últimos 20 turnos, empezando siempre por un mensaje del usuario.
  let history = body.messages.slice(-MAX_TURNS);
  while (history.length && history[0].role !== "user") history = history.slice(1);
  const messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));

  const ctx = nuevoContexto((await tipoDeCambio()).valor, ficha, body.shownCards);
  // Un reintento como mucho: el timeout por ronda manda sobre la espera total.
  const client = new Anthropic({ maxRetries: 1 });
  // La ficha del bloque final es la que llegó con el pedido: fija durante el turno.
  const system = systemBlocks(senaMonto(), ctx.ficha);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: Event) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      let sentText = false;
      // El timer de la ronda en curso: si está abortado, el error fue el timeout.
      let timer: AbortSignal | undefined;
      try {
        for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
          timer = AbortSignal.timeout(roundTimeout());
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
            { signal: AbortSignal.any([request.signal, timer]) },
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
            send({ type: "card", card: waCard(ctx) });
            break;
          }
          const toolUses = message.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
          // Solo se ejecutan herramientas con stop_reason "tool_use": un input
          // cortado por max_tokens puede parecer válido y no se corre.
          if (message.stop_reason !== "tool_use" || toolUses.length === 0 || round === MAX_TOOL_ROUNDS) break;

          messages.push({ role: "assistant", content: message.content });
          const results: Anthropic.ToolResultBlockParam[] = toolUses.map((t) => {
            const out = correrSeguro(t.name, t.input, ctx);
            if (out.card) send({ type: "card", card: out.card });
            if (out.ficha) send({ type: "ficha", ficha: out.ficha });
            return { type: "tool_result", tool_use_id: t.id, content: out.content, ...(out.isError ? { is_error: true } : {}) };
          });
          messages.push({ role: "user", content: results });
        }
        send({ type: "done" });
      } catch (err) {
        // Si la persona cerró el chat o recargó, no hay a quién mostrarle nada.
        if (!request.signal.aborted) {
          const timedOut = Boolean(timer?.aborted);
          if (timedOut) console.error("[chat] timeout");
          else if (err instanceof Anthropic.APIError) console.error("[chat] api error", err.status, err.constructor.name);
          else console.error("[chat] error", (err as Error)?.name);
          send({ type: "error", text: `${sentText ? "\n" : ""}${timedOut ? TIMEOUT : FALLBACK}` });
          send({ type: "card", card: waCard(ctx) });
          send({ type: "done" });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: HEADERS });
}
