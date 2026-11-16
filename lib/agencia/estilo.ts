/**
 * Estilo y dibujo del personaje (tanda P3-1): lo que va en `<html>` como
 * `data-estilo` y `data-dibujo`.
 *
 * La fuente de verdad son esos dos atributos, que **escribe el script inline**
 * del layout antes del primer pintado (`scriptDeArranque`). El servidor no
 * los conoce: sin JS no hay atributo y el CSS por defecto es Tech/IA con el
 * dibujo 16-bit. Así las rutas siguen estáticas.
 *
 * Guardado, todo en `localStorage` (no viaja al servidor):
 * - `malejo-estilo`: el estilo elegido. Sin él, **Tech/IA** siempre.
 * - `malejo-dibujo`: el dibujo que la persona eligió a mano. Si existe, manda.
 * - `malejo-dibujo-bolsa`: `{ actual, resto }`, el shuffle bag. Cada cambio
 *   de estilo saca el siguiente dibujo; solo corre si la persona nunca eligió.
 */
import { AGENCIA_THEME_COOKIE } from "./theme";

export const ESTILO_KEY = "malejo-estilo";
export const DIBUJO_KEY = "malejo-dibujo";
export const BOLSA_KEY = "malejo-dibujo-bolsa";
/** Avisa a las islas que cambió el estilo o el dibujo (además del MutationObserver). */
export const ESTILO_EVENT = "malejo:estilo";

export const DIBUJOS = ["16bit", "chibi", "anime"] as const;

export interface ConfigArranque {
  /** Estilos disponibles → tema de entrada ("light" | "dark" | ""). */
  estilos: Record<string, string>;
  original: string;
  dibujos: readonly string[];
  dibujoOriginal: string;
  cookie: string;
}

/**
 * El arranque. Se serializa con `toString()` en el `<head>` y también se
 * llama en el respaldo del 404 (`components/agencia/client/theme.ts`): por
 * eso no usa nada de afuera (ni imports, ni spread, ni helpers).
 */
export function arrancar(c: ConfigArranque) {
  const d = document.documentElement;
  d.classList.add("js");
  let ls: Storage | null = null;
  try {
    ls = window.localStorage;
  } catch {}
  const leer = function (k: string) {
    try {
      return ls ? ls.getItem(k) : null;
    } catch {
      return null;
    }
  };
  let est = leer("malejo-estilo");
  if (!est || !Object.prototype.hasOwnProperty.call(c.estilos, est)) est = c.original;
  d.setAttribute("data-estilo", est);
  const m = document.cookie.match(new RegExp("(?:^|; )" + c.cookie + "=(dark|light)"));
  const dark = m ? m[1] === "dark" : c.estilos[est] !== "light";
  d.classList.toggle("dark", dark);
  d.style.colorScheme = dark ? "dark" : "light";
  let dib = leer("malejo-dibujo");
  if (!dib || c.dibujos.indexOf(dib) < 0) {
    try {
      dib = JSON.parse(leer("malejo-dibujo-bolsa") || "{}").actual;
    } catch {
      dib = null;
    }
  }
  if (!dib || c.dibujos.indexOf(dib) < 0) dib = c.dibujoOriginal;
  d.setAttribute("data-dibujo", dib);
}

export function configArranque(estilos: { id: string; disponible: boolean; temaDeEntrada?: "claro" | "oscuro" }[], original: string, dibujoOriginal: string): ConfigArranque {
  const mapa: Record<string, string> = {};
  for (const e of estilos) if (e.disponible) mapa[e.id] = e.temaDeEntrada === "claro" ? "light" : e.temaDeEntrada === "oscuro" ? "dark" : "";
  return { estilos: mapa, original, dibujos: DIBUJOS, dibujoOriginal, cookie: AGENCIA_THEME_COOKIE };
}

/** El `<script>` del `<head>`: la función y su configuración, sin nada más. */
export function scriptDeArranque(c: ConfigArranque): string {
  return `(${arrancar.toString()})(${JSON.stringify(c).replace(/</g, "\\u003c")});`;
}

/* ─── Desde las islas ─────────────────────────────────────────────── */

function guardar(k: string, v: string | null) {
  try {
    if (v == null) window.localStorage.removeItem(k);
    else window.localStorage.setItem(k, v);
  } catch {}
}

function leer(k: string): string | null {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
}

export function estiloActual(): string {
  return document.documentElement.getAttribute("data-estilo") || "tech";
}

export function dibujoActual(): string {
  return document.documentElement.getAttribute("data-dibujo") || "16bit";
}

/** ¿La persona eligió el dibujo a mano? Entonces el shuffle bag no corre. */
export function dibujoElegido(): boolean {
  const d = leer(DIBUJO_KEY);
  return Boolean(d && (DIBUJOS as readonly string[]).includes(d));
}

/** Corre `fn` dentro de una View Transition si el navegador la tiene y no hay movimiento reducido. */
function conTransicion(fn: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducido && typeof doc.startViewTransition === "function") doc.startViewTransition(fn);
  else fn();
}

function avisar() {
  window.dispatchEvent(new CustomEvent(ESTILO_EVENT));
}

/** El siguiente dibujo del shuffle bag (sin repetir hasta agotar la bolsa). */
export function siguienteDeBolsa(actual: string, azar: () => number = Math.random): { actual: string; resto: string[] } {
  let resto: string[] = [];
  try {
    const b = JSON.parse(leer(BOLSA_KEY) || "{}");
    if (Array.isArray(b.resto)) resto = b.resto.filter((x: unknown) => typeof x === "string" && (DIBUJOS as readonly string[]).includes(x));
  } catch {}
  if (resto.length === 0) {
    resto = DIBUJOS.filter((d) => d !== actual);
    for (let i = resto.length - 1; i > 0; i--) {
      const j = Math.floor(azar() * (i + 1));
      [resto[i], resto[j]] = [resto[j], resto[i]];
    }
  }
  const [sig, ...quedan] = resto;
  return { actual: sig, resto: quedan };
}

/**
 * Cambia el estilo: lo guarda, pone `data-estilo` y, si la persona nunca
 * eligió tema, el tema de entrada del estilo. Si nunca eligió dibujo, saca
 * el siguiente de la bolsa. Todo en una sola View Transition.
 */
export async function elegirEstilo(id: string, temaDeEntrada: "light" | "dark" | "", cookie: string, fuentes: string[] = []) {
  const d = document.documentElement;
  if (id === estiloActual()) return;
  // Las fuentes del estilo van con `display: optional`: si se pidieran recién
  // al pintarlo, esta vista quedaría con la de respaldo. Se descargan antes
  // (con un tope de 1,5 s, por si la red no ayuda).
  if (fuentes.length && document.fonts) {
    await Promise.race([Promise.all(fuentes.map((f) => document.fonts.load(f))).catch(() => {}), new Promise((r) => setTimeout(r, 1500))]);
  }
  let dib: string | null = null;
  if (!dibujoElegido()) {
    const bolsa = siguienteDeBolsa(dibujoActual());
    guardar(BOLSA_KEY, JSON.stringify(bolsa));
    dib = bolsa.actual;
  }
  guardar(ESTILO_KEY, id);
  const sinTema = !new RegExp(`(?:^|; )${cookie}=(dark|light)`).test(document.cookie);
  conTransicion(() => {
    d.setAttribute("data-estilo", id);
    if (sinTema) {
      const dark = temaDeEntrada !== "light";
      d.classList.toggle("dark", dark);
      d.style.colorScheme = dark ? "dark" : "light";
    }
    if (dib) d.setAttribute("data-dibujo", dib);
    avisar();
  });
}

/** La persona eligió un dibujo: desde ahora manda ese. */
export function elegirDibujo(dibujo: string) {
  if (!(DIBUJOS as readonly string[]).includes(dibujo)) return;
  guardar(DIBUJO_KEY, dibujo);
  if (dibujo === dibujoActual()) return;
  conTransicion(() => {
    document.documentElement.setAttribute("data-dibujo", dibujo);
    avisar();
  });
}

/** El dibujo siguiente en orden fijo (botón de flechas del celular y avatar del chat). */
export function dibujoSiguiente(): string {
  const i = (DIBUJOS as readonly string[]).indexOf(dibujoActual());
  return DIBUJOS[(i + 1) % DIBUJOS.length];
}

/** Escucha cambios de `data-estilo`/`data-dibujo` (para `useSyncExternalStore`). */
export function suscribirEstilo(cb: () => void): () => void {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-estilo", "data-dibujo"] });
  return () => obs.disconnect();
}
