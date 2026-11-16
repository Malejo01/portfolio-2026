/**
 * El recorrido de bienvenida (tanda P3-4): lo que comparten el cargador
 * (`components/agencia/client/RecorridoLoader.tsx`, liviano, en todas las
 * páginas), la isla del recorrido (`Recorrido.tsx`, que se baja recién cuando
 * hace falta) y el enlace "¿Cómo uso la página?" (`ComoUsar.tsx`). Sin React.
 *
 * Los objetivos son elementos reales con `data-recorrido="malejo|kit|estilos"`.
 * Puede haber varios por paso (el botón del encabezado y el de la barra
 * inferior, por ejemplo): gana el **visible** con menor
 * `data-recorrido-prioridad` (sin el atributo, 5). Si no hay ninguno
 * visible, el paso se saltea.
 */

/** `localStorage`: "visto" (terminó) o "saltado" (lo cerró o no llegó a salir). */
export const RECORRIDO_KEY = "malejo-recorrido";
/** Lo dispara "¿Cómo uso la página?": abre el recorrido sin tocar la marca. */
export const RECORRIDO_EVENT = "malejo:recorrido";
/** Lo dispara el widget de Malejo cuando se abre el chat. */
export const CHAT_ABIERTO_EVENT = "malejo:chat-abierto";

export type MarcaRecorrido = "visto" | "saltado";

export function leerMarca(): string | null {
  try {
    return window.localStorage.getItem(RECORRIDO_KEY);
  } catch {
    // Sin storage no se puede recordar: mejor no mostrarlo solo.
    return "saltado";
  }
}

export function marcar(valor: MarcaRecorrido): void {
  try {
    window.localStorage.setItem(RECORRIDO_KEY, valor);
  } catch {}
}

/** Visible: con caja, sin `display: none` ni `visibility: hidden` en el camino. */
export function visible(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (!el.getClientRects().length) return false;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return false;
  return getComputedStyle(el).visibility !== "hidden" && !el.closest("[inert], [aria-hidden='true']");
}

/** El objetivo de un paso: el visible con menor prioridad. */
export function objetivo(id: string): HTMLElement | null {
  const todos = [...document.querySelectorAll<HTMLElement>(`[data-recorrido="${id}"]`)].filter(visible);
  todos.sort((a, b) => prioridad(a) - prioridad(b));
  return todos[0] ?? null;
}

function prioridad(el: HTMLElement): number {
  const p = Number(el.getAttribute("data-recorrido-prioridad"));
  return Number.isFinite(p) && p > 0 ? p : 5;
}

/** Pide abrir el recorrido (el enlace "¿Cómo uso la página?"). */
export function pedirRecorrido(): void {
  window.dispatchEvent(new CustomEvent(RECORRIDO_EVENT));
}
