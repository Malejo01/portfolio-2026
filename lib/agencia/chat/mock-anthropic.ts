import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";

/**
 * Servidor local que imita `POST /v1/messages` de la API de Anthropic con
 * streaming SSE. Sirve para probar el loop de `/api/chat` sin clave ni red:
 * se apunta el SDK con `ANTHROPIC_BASE_URL` y cada pedido consume la
 * próxima respuesta del guion. Solo para tests (`route.test.ts`).
 */

export type Bloque = { type: "text"; text: string } | { type: "tool_use"; name: string; input: unknown };

export type Respuesta =
  | { bloques: Bloque[]; stop: "end_turn" | "tool_use" | "max_tokens" | "refusal"; demoraMs?: number }
  | { status: number; error: string };

export interface MockAnthropic {
  url: string;
  /** Bodies JSON de cada pedido recibido, en orden. */
  pedidos: Record<string, unknown>[];
  guion(respuestas: Respuesta[]): void;
  cerrar(): Promise<void>;
}

const sse = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

function leer(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let s = "";
    req.on("data", (c) => (s += c));
    req.on("end", () => resolve(s));
  });
}

export async function mockAnthropic(): Promise<MockAnthropic> {
  const pedidos: Record<string, unknown>[] = [];
  let cola: Respuesta[] = [];
  let n = 0;

  const server: Server = createServer(async (req, res) => {
    const body = await leer(req);
    try {
      pedidos.push(JSON.parse(body));
    } catch {
      pedidos.push({});
    }
    const r = cola.shift() ?? { bloques: [{ type: "text", text: "(sin guion)" }], stop: "end_turn" };
    if ("status" in r) {
      res.writeHead(r.status, { "content-type": "application/json" });
      res.end(JSON.stringify({ type: "error", error: { type: "invalid_request_error", message: r.error } }));
      return;
    }
    if (r.demoraMs) await new Promise((ok) => setTimeout(ok, r.demoraMs));
    if (res.destroyed) return;
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache" });
    const id = `msg_${++n}`;
    res.write(
      sse("message_start", {
        type: "message_start",
        message: { id, type: "message", role: "assistant", model: "mock", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 } },
      }),
    );
    r.bloques.forEach((b, index) => {
      if (b.type === "text") {
        res.write(sse("content_block_start", { type: "content_block_start", index, content_block: { type: "text", text: "" } }));
        res.write(sse("content_block_delta", { type: "content_block_delta", index, delta: { type: "text_delta", text: b.text } }));
      } else {
        res.write(
          sse("content_block_start", { type: "content_block_start", index, content_block: { type: "tool_use", id: `toolu_${n}_${index}`, name: b.name, input: {} } }),
        );
        res.write(
          sse("content_block_delta", { type: "content_block_delta", index, delta: { type: "input_json_delta", partial_json: JSON.stringify(b.input) } }),
        );
      }
      res.write(sse("content_block_stop", { type: "content_block_stop", index }));
    });
    res.write(sse("message_delta", { type: "message_delta", delta: { stop_reason: r.stop, stop_sequence: null }, usage: { output_tokens: 20 } }));
    res.write(sse("message_stop", { type: "message_stop" }));
    res.end();
  });

  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", ok));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    pedidos,
    guion(respuestas) {
      cola = [...respuestas];
      pedidos.length = 0;
    },
    cerrar: () =>
      new Promise((ok) => {
        server.closeAllConnections();
        server.close(() => ok());
      }),
  };
}
