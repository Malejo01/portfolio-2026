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
 * - `malejo-tema-<estilo>` (tanda P3-4): el tema que la persona eligió
 *   **dentro de ese estilo** (`"dark"` | `"light"`). Sin clave, el tema de
 *   entrada del estilo; una clave de otro estilo no cuenta. La cookie vieja
 *   `malejo-theme` se migra una vez a `malejo-tema-tech` y se borra.
 */
import { AGENCIA_THEME_COOKIE } from "./theme";

export const ESTILO_KEY = "malejo-estilo";
export const DIBUJO_KEY = "malejo-dibujo";
export const BOLSA_KEY = "malejo-dibujo-bolsa";
/** Tanda P3-4: el tema de cada estilo. `temaKey("aula")` → `malejo-tema-aula`. */
export const TEMA_PREFIJO = "malejo-tema-";
export const temaKey = (estilo: string) => TEMA_PREFIJO + estilo;
/** Avisa a las islas que cambió el estilo o el dibujo (además del MutationObserver). */
export const ESTILO_EVENT = "malejo:estilo";

export const DIBUJOS = ["16bit", "chibi", "anime"] as const;

export interface ConfigArranque {
  /** Estilos disponibles → tema de entrada ("light" | "dark" | ""). */
  estilos: Record<string, string>;
  original: string;
  dibujos: readonly string[];
  dibujoOriginal: string;
  /** Estilos con dibujo propio (P3-2): si la persona nunca eligió uno, se ve ese. */
  dibujoPor: Record<string, string>;
  /**
   * La hoja de cada estilo no original (P3-3): `public/agencia/estilos/<id>.css`.
   * Solo se agrega la del estilo activo, así Tech no paga por los demás.
   */
  css: Record<string, string>;
  /** La cookie vieja del tema (`malejo-theme`): solo para migrarla a Tech. */
  cookie: string;
}

export type Tema = "dark" | "light";

/**
 * Tanda P3-4 · el tema con el que se ve un estilo. Pura, sin nada de afuera:
 * la usa el script inline (se serializa con `toString()` junto a `arrancar`),
 * el respaldo del 404, el selector y los tests.
 *
 * - Si el estilo tiene su clave (`malejo-tema-<estilo>`), vale esa.
 * - Si no, y es Tech y hay cookie vieja (`malejo-theme`), vale la cookie y se
 *   pide migrarla (`migrar: true`: guardar la clave de Tech y borrar la cookie).
 * - Si no, el tema de entrada del estilo (`entrada[estilo]`: "dark", "light"
 *   o "" = oscuro, el de siempre del sitio).
 *
 * Una clave de otro estilo no cuenta, y la cookie vieja solo cuenta para Tech.
 */
export function resolverTema(
  estilo: string,
  guardado: string | null,
  cookieVieja: string | null,
  entrada: Record<string, string>,
  original: string,
): { tema: Tema; migrar: boolean } {
  if (guardado === "dark" || guardado === "light") return { tema: guardado, migrar: false };
  if (estilo === original && (cookieVieja === "dark" || cookieVieja === "light")) return { tema: cookieVieja, migrar: true };
  return { tema: entrada[estilo] === "light" ? "light" : "dark", migrar: false };
}

/**
 * El arranque. Se serializa con `toString()` en el `<head>` y también se
 * llama en el respaldo del 404 (`components/agencia/client/theme.ts`): por
 * eso no usa nada de afuera (ni imports, ni spread, ni helpers).
 */
export function arrancar(c: ConfigArranque, enHead = true, resolver: typeof resolverTema = resolverTema) {
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
  // La hoja del estilo: en el <head>, escrita por el parser (bloquea el
  // primer pintado, así no hay destello de Tech); en el respaldo del 404,
  // agregada a mano.
  const href = c.css[est];
  if (href && !document.querySelector('link[data-estilo-css="' + est + '"]')) {
    if (enHead) document.write('<link rel="stylesheet" href="' + href + '" data-estilo-css="' + est + '">');
    else {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      l.setAttribute("data-estilo-css", est);
      document.head.appendChild(l);
    }
  }
  // El tema de este estilo (P3-4): su clave, la cookie vieja si es Tech, o su tema de entrada.
  const m = document.cookie.match(new RegExp("(?:^|; )" + c.cookie + "=(dark|light)"));
  const t = resolver(est, leer("malejo-tema-" + est), m ? m[1] : null, c.estilos, c.original);
  if (t.migrar) {
    try {
      if (ls) ls.setItem("malejo-tema-" + est, t.tema);
      document.cookie = c.cookie + "=; path=/; max-age=0; samesite=lax";
    } catch {}
  }
  const dark = t.tema === "dark";
  d.classList.toggle("dark", dark);
  d.style.colorScheme = dark ? "dark" : "light";
  let dib = leer("malejo-dibujo");
  if ((!dib || c.dibujos.indexOf(dib) < 0) && c.dibujoPor[est]) dib = c.dibujoPor[est];
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

export function configArranque(
  estilos: { id: string; disponible: boolean; temaDeEntrada?: "claro" | "oscuro"; dibujoPorDefecto?: string }[],
  original: string,
  dibujoOriginal: string,
  css: Record<string, string> = {},
): ConfigArranque {
  const mapa: Record<string, string> = {};
  const dibujoPor: Record<string, string> = {};
  for (const e of estilos) {
    if (!e.disponible) continue;
    mapa[e.id] = e.temaDeEntrada === "claro" ? "light" : e.temaDeEntrada === "oscuro" ? "dark" : "";
    if (e.dibujoPorDefecto) dibujoPor[e.id] = e.dibujoPorDefecto;
  }
  return { estilos: mapa, original, dibujos: DIBUJOS, dibujoOriginal, dibujoPor, css, cookie: AGENCIA_THEME_COOKIE };
}

/** El `<script>` del `<head>`: la función, su configuración y el resolvedor del tema, sin nada más. */
export function scriptDeArranque(c: ConfigArranque): string {
  return `(${arrancar.toString()})(${JSON.stringify(c).replace(/</g, "\\u003c")}, true, ${resolverTema.toString()});`;
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
 * Cambia el estilo: lo guarda, pone `data-estilo` y el tema **de ese estilo**
 * (el que la persona eligió ahí o, si no, su tema de entrada; P3-4). Si nunca
 * eligió dibujo, el del estilo o el siguiente de la bolsa. Todo en una sola
 * View Transition.
 */
export async function elegirEstilo(id: string, temaDeEntrada: "light" | "dark" | "", dibujoPorDefecto?: string, fuentes: string[] = [], css?: string) {
  const d = document.documentElement;
  if (id === estiloActual()) return;
  // La hoja del estilo (P3-3), antes que nada: sin ella el estilo se pintaría con los tokens de Tech.
  if (css) await cargarHoja(id, css);
  // Las fuentes del estilo van con `display: optional`: si se pidieran recién
  // al pintarlo, esta vista quedaría con la de respaldo. Se descargan antes
  // (con un tope de 1,5 s, por si la red no ayuda).
  if (fuentes.length && document.fonts) {
    await Promise.race([Promise.all(fuentes.map((f) => document.fonts.load(f))).catch(() => {}), new Promise((r) => setTimeout(r, 1500))]);
  }
  let dib: string | null = null;
  // Un dibujo elegido a mano manda; si no, el del estilo (Aula: anime) o el siguiente de la bolsa.
  if (!dibujoElegido() && dibujoPorDefecto) dib = dibujoPorDefecto;
  else if (!dibujoElegido()) {
    const bolsa = siguienteDeBolsa(dibujoActual());
    guardar(BOLSA_KEY, JSON.stringify(bolsa));
    dib = bolsa.actual;
  }
  guardar(ESTILO_KEY, id);
  // La cookie vieja ya se migró al arrancar: acá no cuenta (y solo valía para Tech).
  const { tema } = resolverTema(id, leer(temaKey(id)), null, { [id]: temaDeEntrada }, "");
  conTransicion(() => {
    d.setAttribute("data-estilo", id);
    const dark = tema === "dark";
    d.classList.toggle("dark", dark);
    d.style.colorScheme = dark ? "dark" : "light";
    if (dib) d.setAttribute("data-dibujo", dib);
    avisar();
  });
}

/** Agrega la hoja de un estilo y espera a que cargue (tope de 3 s). */
function cargarHoja(id: string, href: string): Promise<void> {
  const ya = document.querySelector<HTMLLinkElement>(`link[data-estilo-css="${id}"]`);
  if (ya && ya.sheet) return Promise.resolve();
  return new Promise((listo) => {
    const l = ya ?? document.createElement("link");
    const fin = () => listo();
    l.addEventListener("load", fin, { once: true });
    l.addEventListener("error", fin, { once: true });
    setTimeout(fin, 3000);
    if (!ya) {
      l.rel = "stylesheet";
      l.href = href;
      l.setAttribute("data-estilo-css", id);
      document.head.appendChild(l);
    }
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
