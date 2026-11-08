import { deduplicable, firmaCard, lineaTarjeta, type Card, type QuoteCard } from "./cards";

/**
 * Historial que el widget manda a `/api/chat`. El servidor no guarda nada,
 * así que la memoria de lo que se mostró viaja acá:
 *
 * - Cada mensaje del asistente lleva, debajo del texto, una línea por
 *   tarjeta (`[Tarjeta mostrada · …]`): el modelo sabe qué ya vio la persona y
 *   no lo repite ni lo "corrige".
 * - `shownCards` lleva las firmas de las tarjetas deduplicables recientes.
 *
 * Funciones puras: las usa la isla y las prueban los tests.
 */

export interface ChatMsg {
  role: "user" | "assistant";
  text: string;
  cards: Card[];
}

/** El mismo tope que valida el servidor por mensaje. */
export const MAX_CONTENT = 2000;
export const MAX_SHOWN = 40;

export function contenidoDe(m: ChatMsg): string {
  const lineas = m.role === "assistant" ? m.cards.map(lineaTarjeta) : [];
  const pie = lineas.join("\n");
  const espacio = MAX_CONTENT - (pie ? pie.length + 1 : 0);
  const texto = m.text.trim().slice(0, Math.max(0, espacio));
  return [texto, pie].filter(Boolean).join("\n").slice(0, MAX_CONTENT);
}

export function armarHistorial(msgs: ChatMsg[]): { role: "user" | "assistant"; content: string }[] {
  return msgs.map((m) => ({ role: m.role, content: contenidoDe(m) })).filter((m) => m.content);
}

export function firmasMostradas(msgs: ChatMsg[]): string[] {
  return msgs
    .flatMap((m) => m.cards)
    .filter(deduplicable)
    .map(firmaCard)
    .slice(-MAX_SHOWN);
}

export function ultimaQuote(msgs: ChatMsg[]): QuoteCard | null {
  for (let i = msgs.length - 1; i >= 0; i--) {
    const q = [...msgs[i].cards].reverse().find((c): c is QuoteCard => c.kind === "quote");
    if (q) return q;
  }
  return null;
}
