import type { Card } from "./cards";
import type { Ficha } from "./ficha";

/**
 * Memoria de la charla entre recargas (tanda R3), solo en `sessionStorage`
 * de esta pestaña: si la persona va a `/demo` y vuelve, o recarga, sigue
 * donde estaba. Nunca va al servidor ni a otra pestaña, y se borra al
 * cerrar la pestaña o con "Empezar de nuevo". Todo con try/catch: en modo
 * privado o con el almacenamiento bloqueado, el chat arranca de cero.
 */
export const SESION_KEY = "malejo-chat-v1";
/** Mensajes que se guardan como mucho (los últimos). */
export const SESION_MAX = 30;

export type SegGuardado = { t: "text"; text: string } | { t: "card"; card: Card };
export interface MsgGuardado {
  id: number;
  role: "user" | "assistant";
  text: string;
  cards: Card[];
  segs?: SegGuardado[];
}
export interface Sesion {
  msgs: MsgGuardado[];
  ficha: Ficha;
}

export function guardarSesion(s: Sesion, storage: Pick<Storage, "setItem"> | undefined = globalThis.sessionStorage): void {
  try {
    storage?.setItem(SESION_KEY, JSON.stringify({ msgs: s.msgs.slice(-SESION_MAX), ficha: s.ficha }));
  } catch {}
}

export function leerSesion(storage: Pick<Storage, "getItem"> | undefined = globalThis.sessionStorage): Sesion | null {
  try {
    const raw = storage?.getItem(SESION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Sesion>;
    if (!Array.isArray(s.msgs) || !s.msgs.length) return null;
    const msgs = s.msgs.filter(
      (m): m is MsgGuardado =>
        Boolean(m) && (m.role === "user" || m.role === "assistant") && typeof m.text === "string" && typeof m.id === "number" && Array.isArray(m.cards),
    );
    if (!msgs.some((m) => m.role === "user")) return null;
    return { msgs, ficha: s.ficha && typeof s.ficha === "object" ? s.ficha : {} };
  } catch {
    return null;
  }
}

export function borrarSesion(storage: Pick<Storage, "removeItem"> | undefined = globalThis.sessionStorage): void {
  try {
    storage?.removeItem(SESION_KEY);
  } catch {}
}
