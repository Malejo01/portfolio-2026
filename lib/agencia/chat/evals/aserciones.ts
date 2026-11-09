import { fmt } from "@/lib/agencia/format";
import type { Card, QuoteCard } from "../cards";
import type { Ficha } from "../ficha";

/**
 * Aserciones deterministas de los evals del chat (tanda CHAT-R1, F10). Sin
 * modelo juez: regex y tarjetas. Las generales corren sobre cada respuesta;
 * las de cada caso, sobre la conversación entera (`casos.ts`).
 */

export interface Turno {
  usuario: string;
  texto: string;
  cards: Card[];
  ms: number;
}

export interface Resultado {
  turnos: Turno[];
  ficha: Ficha;
}

export interface Check {
  nombre: string;
  ok: (r: Resultado) => boolean;
}

export interface Fallo {
  turno: number;
  nombre: string;
}

export const palabras = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

/** URLs, dominios o rutas del sitio escritas en el texto. */
export const RUTA_CRUDA = /https?:\/\/|wa\.me|malejo\.com\.ar|(^|[\s(«"'])\/(demo|cotizador|servicios|portfolio|legal|blog|api)\b/i;
export const CORRECCION = /te corrijo|me corrijo|como (te )?dije|como te comenté|corrijo:/i;
export const DOBLE_VOZ = /ya te (apareci[óo]|dej[ée]|mostr[ée]) (el|la) (bot[óo]n|tarjeta)|ah[ií] (abajo )?ten[ée]s el bot[óo]n|te dej[ée] el bot[óo]n/i;

/** Preguntas en un texto: signos de cierre "?" (las dobles "¿…?" cuentan una). */
export const preguntas = (t: string) => (t.match(/\?/g) ?? []).length;

/**
 * Generales, por turno. `max` es el tope de palabras del caso: 60 por
 * defecto; los casos que piden detalle llegan a 90, nunca más.
 */
export function generales(t: Turno, max = 60): string[] {
  const fallos: string[] = [];
  if (RUTA_CRUDA.test(t.texto)) fallos.push("sin rutas ni URLs");
  if (CORRECCION.test(t.texto)) fallos.push('sin "te corrijo" ni "como dije"');
  if (palabras(t.texto) > Math.min(max, 90)) fallos.push(`como mucho ${Math.min(max, 90)} palabras (tuvo ${palabras(t.texto)})`);
  if (preguntas(t.texto) > 1) fallos.push(`una sola pregunta (tuvo ${preguntas(t.texto)})`);
  if (DOBLE_VOZ.test(t.texto)) fallos.push("sin doble voz alrededor de la tarjeta");
  if (!t.texto.trim() && !t.cards.length) fallos.push("respuesta vacía");
  return fallos;
}

// ── Helpers para los checks de cada caso ────────────────────────────────

export const ultimo = (r: Resultado) => r.turnos[r.turnos.length - 1];
export const todoTexto = (r: Resultado) => r.turnos.map((t) => t.texto).join("\n");
export const todasCards = (r: Resultado) => r.turnos.flatMap((t) => t.cards);
export const de = <K extends Card["kind"]>(cards: Card[], kind: K) => cards.filter((c): c is Extract<Card, { kind: K }> => c.kind === kind);
export const quotes = (r: Resultado): QuoteCard[] => de(todasCards(r), "quote");
export const sinCards = (r: Resultado) => todasCards(r).length === 0;
export const hay = (r: Resultado, kind: Card["kind"]) => todasCards(r).some((c) => c.kind === kind);
export const texto = (re: RegExp) => (r: Resultado) => re.test(todoTexto(r));
export const totalPrimerAnio = (q: QuoteCard) => q.implementacion + q.mensual * 12 + q.anual;
export const montoEnTexto = (r: Resultado, n: number) => todoTexto(r).includes(fmt(n));
