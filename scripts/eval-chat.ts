/**
 * Evals del chat de Malejo contra el modelo real (tanda CHAT-R1, F10).
 *
 *   npm run eval:chat                        # contra http://localhost:3000
 *   npm run eval:chat -- --url https://malejo.com.ar
 *   npm run eval:chat -- --solo A,B,I        # algunos casos
 *
 * Corre los 24 casos de `lib/agencia/chat/evals/casos.ts` como
 * conversaciones de varios turnos contra `/api/chat`, aplica las aserciones
 * deterministas y escribe `docs/agencia/evals/<fecha>.md`. Sale con código 1
 * si pasan menos de 22.
 *
 * Gasta tokens de verdad (unos 24 × 7 k de entrada, casi todo cacheado):
 * necesita `ANTHROPIC_API_KEY` en el servidor que recibe los pedidos. Con
 * límites diarios activos conviene correrlo con `CHAT_DAILY_LIMIT_TOTAL=0`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { casos } from "@/lib/agencia/chat/evals/casos";
import { correrCaso, informe, type Corrida } from "@/lib/agencia/chat/evals/runner";

function arg(nombre: string): string | undefined {
  const i = process.argv.indexOf(`--${nombre}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const base = arg("url") ?? "http://localhost:3000";
const solo = arg("solo")?.split(",").map((s) => s.trim().toUpperCase());
const paralelo = Math.max(1, Number(arg("paralelo") ?? 3));
const elegidos = solo ? casos.filter((c) => solo.includes(c.id)) : casos;

async function main() {
  console.log(`Evals contra ${base}: ${elegidos.length} casos, ${paralelo} en paralelo.`);
  const corridas: Corrida[] = new Array(elegidos.length);
  let siguiente = 0;
  await Promise.all(
    Array.from({ length: paralelo }, async () => {
      while (siguiente < elegidos.length) {
        const i = siguiente++;
        const c = await correrCaso(base, elegidos[i]);
        corridas[i] = c;
        console.log(`${c.pasa ? "✅" : "❌"} ${c.caso.id} · ${c.caso.titulo}${c.pasa ? "" : ` → ${c.fallos.map((f) => f.nombre).join("; ")}`}`);
      }
    }),
  );

  if (corridas.every((c) => c.resultado.turnos.every((t) => t.texto.startsWith("Ahora no puedo responder")))) {
    console.warn("\n⚠ Todas las respuestas son el fallback fijo: el servidor no tiene ANTHROPIC_API_KEY (o está caído).");
  }
  const pasan = corridas.filter((c) => c.pasa).length;
  const fecha = new Date().toISOString().slice(0, 16).replace(":", "");
  const dir = "docs/agencia/evals";
  mkdirSync(dir, { recursive: true });
  const archivo = `${dir}/${fecha}.md`;
  writeFileSync(archivo, informe(corridas, { base, fecha: new Date().toISOString().slice(0, 16).replace("T", " ") }));
  console.log(`\n${pasan} de ${corridas.length} pasan. Informe: ${archivo}`);
  if (!solo && pasan < 22) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
