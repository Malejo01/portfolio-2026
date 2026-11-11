import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Card } from "@/lib/agencia/chat/cards";
import type { Ficha } from "@/lib/agencia/chat/ficha";
import { FichaSchema, limpiarFicha } from "@/lib/agencia/chat/ficha-schema";
import { consume, type Motivo } from "@/lib/agencia/chat/limits";
import { systemBlocks } from "@/lib/agencia/chat/prompt";
import { contextoDePagina } from "@/lib/agencia/chat/pagina";
import { recortarHistorial } from "@/lib/agencia/chat/recorte";
import { TEST_HEADER, esTokenDePrueba, hashIp, ipFrom, origenPermitido, rechazarOrigen } from "@/lib/agencia/chat/security";
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
 * Seguridad (tanda R2): 403 si llega un `Origin` ajeno (S6); topes por
 * ráfaga, por IP y global con fallo cerrado (S1, S7, `limits.ts`), que la
 * llave `x-malejo-test` saltea solo por IP; y el historial recortado a
 * 12.000 caracteres (S8, `recorte.ts`).
 *
 * Sin `ANTHROPIC_API_KEY` responde un mensaje fijo con WhatsApp: la UI no
 * se rompe. Los logs no llevan datos personales: solo tipo de error y status.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.MALEJO_MODEL || "claude-haiku-5-5";
const MAX_TURNS = 20;
const MAX_TOOL_ROUNDS = 4;
/** Herramientas que no muestran nada: no justifican otra ronda del modelo. */
const SILENCIOSAS = new Set(["anotar_ficha", "sugerir_respuestas"]);
/**
 * Herramientas que solo muestran una tarjeta (WhatsApp, proyectos, el
 * formulario o la casilla de contacto): su resultado no trae nada que el
 * modelo tenga que contar. Si la ronda ya respondió con texto, otra ronda
 * solo agregaba "Ya te dejé el botón…" (evals reales del 11-11: U, AF).
 * `pedir_demo` no está: después de la demo el modelo ofrece el contacto.
 */
const SOLO_TARJETA = new Set(["derivar_whatsapp", "mostrar_proyectos", "pedir_contacto", "guardar_contacto"]);

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
  /** `location.pathname` del widget. Se valida contra las rutas del sitio (`pagina.ts`). */
  pagina: z.string().max(120).optional(),
});

/** Al llegar a un tope: mensaje amable y WhatsApp con la ficha. */
const LIMITE: Record<Motivo, string> = {
  rafaga: "Vamos muy rápido: esperá unos minutos y seguimos. Si preferís, escribile a Mauro por WhatsApp con lo que charlamos.",
  ip: "Por hoy llegamos al límite de mensajes del chat. Escribile a Mauro por WhatsApp con lo que charlamos y seguimos por ahí.",
  total: "Por hoy el chat llegó a su límite de mensajes. Escribile a Mauro por WhatsApp con lo que charlamos y seguimos por ahí.",
};

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
  if (!origenPermitido(request.headers.get("origin"))) return rechazarOrigen();

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return Response.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const ficha = body.ficha ? limpiarFicha(body.ficha) : {};
  if (!process.env.ANTHROPIC_API_KEY) return fallback(FALLBACK, nuevoContexto(0, ficha, body.shownCards));

  const ip = ipFrom(request.headers);
  // `consume` no tira: si la base falla, cuenta en memoria con un tope conservador (S7).
  const usage = await consume(hashIp(ip), { saltarIp: esTokenDePrueba(request.headers.get(TEST_HEADER)) });
  if (!usage.ok) return fallback(LIMITE[usage.reason ?? "total"], nuevoContexto(0, ficha, body.shownCards));

  // Últimos 20 turnos y 12.000 caracteres como mucho, empezando siempre por
  // un mensaje del usuario y conservando el último (S8).
  let history = recortarHistorial(body.messages.slice(-MAX_TURNS));
  while (history.length && history[0].role !== "user") history = history.slice(1);
  if (!history.length) return Response.json({ error: "Pedido inválido" }, { status: 400 });
  const messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));

  const ctx = nuevoContexto((await tipoDeCambio()).valor, ficha, body.shownCards);
  // Un reintento como mucho: el timeout por ronda manda sobre la espera total.
  const client = new Anthropic({ maxRetries: 1 });
  // La ficha del bloque final es la que llegó con el pedido: fija durante el turno.
  const system = systemBlocks(senaMonto(), ctx.ficha, await contextoDePagina(body.pagina));
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
              // max_tokens es el techo de TODO lo generado, pensamiento incluido:
              // Haiku 5.5 piensa siempre (adaptativo; `effort: low` solo lo
              // acorta). Con 800 (tanda P1, evals reales del 11-11) un turno que
              // pensaba más salía cortado a mitad de frase, vacío o sin el
              // tool_use. Solo se paga lo generado y el largo de la respuesta lo
              // fija el prompt (60 palabras): el techo no tiene que apretar.
              max_tokens: 4000,
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
          // Cortado por el techo sin haber dicho nada: mejor el mensaje fijo y
          // WhatsApp que una burbuja vacía.
          if (message.stop_reason === "max_tokens" && !sentText) {
            send({ type: "text", text: FALLBACK });
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
          // Si la ronda ya respondió con texto y solo anotó la ficha, el turno
          // termina acá: con otra ronda el modelo repetía la respuesta entera
          // (evals del 8-11 en producción: 6 de 24 casos con el texto duplicado).
          const huboTexto = message.content.some((b) => b.type === "text" && b.text.trim() !== "");
          if (huboTexto && toolUses.every((t) => SILENCIOSAS.has(t.name))) break;
          // Lo mismo con las que solo muestran una tarjeta, si ninguna falló
          // (con un error, el modelo tiene que poder explicarlo).
          if (huboTexto && results.every((r) => !r.is_error) && toolUses.every((t) => SILENCIOSAS.has(t.name) || SOLO_TARJETA.has(t.name))) break;
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
