import type { Card } from "../cards";
import { lineaTarjeta } from "../cards";
import { mergeFicha, type Ficha } from "../ficha";
import { armarHistorial, firmasMostradas, type ChatMsg } from "../history";
import { generales, type Fallo, type Resultado, type Turno } from "./aserciones";
import type { Caso } from "./casos";

/**
 * Corre un caso como lo haría el widget: arma el historial con las líneas
 * de tarjetas, manda la ficha y las firmas, y lee el NDJSON de `/api/chat`.
 */
export interface Corrida {
  caso: Caso;
  resultado: Resultado;
  fallos: Fallo[];
  pasa: boolean;
  error?: string;
}

type Ev = { type: string; text?: string; card?: Card; ficha?: Ficha };

/**
 * Sin `CHAT_TEST_TOKEN`, el tope de ráfaga por IP (20 cada 10 min) corta las
 * evals: `EVAL_PAUSA_MS` espera antes de cada turno (31000 con `--paralelo 1`
 * entra en el tope). `EVAL_COOKIE` va como `Cookie`: el `_vercel_jwt` de un
 * link de acceso de Vercel para correr contra un preview protegido.
 */
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function turno(base: string, msgs: ChatMsg[], ficha: Ficha, usuario: string): Promise<{ t: Turno; ficha: Ficha }> {
  const pausa = Number(process.env.EVAL_PAUSA_MS ?? 0);
  if (pausa > 0) await espera(pausa);
  const inicio = Date.now();
  const res = await fetch(new URL("/api/chat", base), {
    method: "POST",
    // Con `CHAT_TEST_TOKEN` en el entorno del script, la llave de pruebas
    // saltea los topes por IP (no el global): las evals salen de una sola IP.
    headers: {
      "content-type": "application/json",
      ...(process.env.CHAT_TEST_TOKEN ? { "x-malejo-test": process.env.CHAT_TEST_TOKEN } : {}),
      ...(process.env.EVAL_COOKIE ? { cookie: process.env.EVAL_COOKIE } : {}),
    },
    body: JSON.stringify({
      messages: armarHistorial([...msgs, { role: "user", text: usuario, cards: [] }]),
      ficha,
      shownCards: firmasMostradas(msgs),
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const lineas = (await res.text()).split("\n").filter(Boolean);
  let texto = "";
  const cards: Card[] = [];
  let f = ficha;
  for (const l of lineas) {
    const ev = JSON.parse(l) as Ev;
    if ((ev.type === "text" || ev.type === "error") && ev.text) texto += ev.text;
    if (ev.type === "card" && ev.card) cards.push(ev.card);
    if (ev.type === "ficha" && ev.ficha) f = mergeFicha(f, ev.ficha);
  }
  return { t: { usuario, texto: texto.trim(), cards, ms: Date.now() - inicio }, ficha: f };
}

/** Objetivo de casos que pasan: el mismo 22 de 24 de CHAT-R1, proporcional. */
export function objetivo(total: number): number {
  return Math.ceil((total * 22) / 24);
}

export async function correrCaso(base: string, caso: Caso): Promise<Corrida> {
  const msgs: ChatMsg[] = [{ role: "assistant", text: "¡Hola! Soy Malejo, el asistente de Mauro.", cards: [] }];
  let ficha: Ficha = {};
  const turnos: Turno[] = [];
  try {
    for (const u of caso.turnos) {
      const r = await turno(base, msgs, ficha, u);
      turnos.push(r.t);
      ficha = r.ficha;
      msgs.push({ role: "user", text: u, cards: [] }, { role: "assistant", text: r.t.texto, cards: r.t.cards });
    }
  } catch (e) {
    const resultado = { turnos, ficha };
    return { caso, resultado, fallos: [{ turno: turnos.length, nombre: `error: ${(e as Error).message}` }], pasa: false, error: (e as Error).message };
  }
  const resultado: Resultado = { turnos, ficha };
  const fallos: Fallo[] = [
    ...turnos.flatMap((t, i) => generales(t, caso.maxPalabras).map((nombre) => ({ turno: i + 1, nombre }))),
    ...caso.checks.filter((c) => !safe(() => c.ok(resultado))).map((c) => ({ turno: 0, nombre: c.nombre })),
  ];
  return { caso, resultado, fallos, pasa: fallos.length === 0 };
}

function safe(fn: () => boolean): boolean {
  try {
    return fn();
  } catch {
    return false;
  }
}

/** Informe en Markdown para `docs/agencia/evals/<fecha>.md`. */
export function informe(corridas: Corrida[], meta: { base: string; fecha: string }): string {
  const pasan = corridas.filter((c) => c.pasa).length;
  const lat = corridas.flatMap((c) => c.resultado.turnos.map((t) => t.ms)).sort((a, b) => a - b);
  const p50 = lat.length ? lat[Math.floor(lat.length / 2)] : 0;
  const filas = corridas.map((c) => {
    const ms = c.resultado.turnos.map((t) => t.ms);
    const fallos = c.fallos.map((f) => (f.turno ? `T${f.turno}: ${f.nombre}` : f.nombre)).join("; ");
    return `| ${c.caso.id} | ${c.caso.titulo} | ${c.pasa ? "✅" : "❌"} | ${ms.map((m) => `${(m / 1000).toFixed(1)} s`).join(" · ")} | ${fallos.replaceAll("|", "\\|")} |`;
  });
  const detalle = corridas.map((c) => {
    const turnos = c.resultado.turnos
      .map((t, i) => {
        const cards = t.cards.map((card) => `  - ${lineaTarjeta(card)}`).join("\n");
        return `**T${i + 1} · usuario:** ${t.usuario}\n\n> ${t.texto.replaceAll("\n", "\n> ") || "(sin texto)"}\n${cards ? `\n${cards}\n` : ""}\n_${(t.ms / 1000).toFixed(1)} s_`;
      })
      .join("\n\n");
    const ficha = Object.keys(c.resultado.ficha).length ? `\n\nFicha: \`${JSON.stringify(c.resultado.ficha)}\`` : "";
    return `### ${c.caso.id} · ${c.caso.titulo} ${c.pasa ? "✅" : "❌"}\n\n${turnos}${ficha}${c.error ? `\n\nError: ${c.error}` : ""}`;
  });
  return [
    `# Evals del chat de Malejo · ${meta.fecha}`,
    "",
    `Contra \`${meta.base}\`. **${pasan} de ${corridas.length}** casos pasan (objetivo: ${objetivo(corridas.length)}). Latencia mediana por turno: ${(p50 / 1000).toFixed(1)} s.`,
    "",
    "Aserciones generales por turno: sin rutas ni URLs, sin \"te corrijo\" ni \"como dije\", 60 palabras (90 en los casos que piden detalle), una sola pregunta, sin doble voz. Las de cada caso están en `lib/agencia/chat/evals/casos.ts`.",
    "",
    "| Caso | Qué | Pasa | Latencia | Fallos |",
    "|---|---|---|---|---|",
    ...filas,
    "",
    "## Detalle",
    "",
    ...detalle,
    "",
  ].join("\n");
}
