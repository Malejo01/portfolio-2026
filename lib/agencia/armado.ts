/**
 * El **armado** (tanda P2): lo que la persona va juntando en `/soluciones`.
 * Estado compartido entre la isla del armador y el widget de Malejo, sin
 * servidor: vive en `sessionStorage` (solo esta pestaña) y cada cambio sale
 * como el evento `malejo:armado`.
 *
 *   emitir({ accion: "agregar", id: "turnos-online", origen: "malejo" })
 *     → lee el armado, aplica la acción, lo guarda y avisa a quien escuche
 *
 * Módulo puro y **sin catálogo** (ni zod): lo importa el widget de Malejo,
 * que no tiene que cargar `precios.json`. Por eso la validación de ids se
 * inyecta: `normalizar(armado, clasificar)`. El clasificador con el catálogo
 * es `clasificarId()` de `lib/agencia/pricing.ts` (resuelve `aliases` y
 * descarta lo que no existe); en el servidor del chat, lo mismo.
 *
 * `?a=id,id` lo refleja en la URL con `replaceState` para compartirlo: se
 * lee en el cliente, así `/soluciones` sigue estática.
 */

export type OrigenItem = "persona" | "malejo";

export interface ItemArmado {
  id: string;
  /** "malejo" = lo sugirió Malejo y la persona tocó "Agregar" (D5). */
  origen: OrigenItem;
}

export interface Armado {
  /** Planes y combos. */
  items: ItemArmado[];
  /** Extras ("Página adicional", el dominio…). */
  extras: string[];
}

export type AccionArmado =
  | { accion: "agregar"; id: string; origen: OrigenItem }
  | { accion: "quitar"; id: string }
  | { accion: "vaciar" }
  /** Reemplaza todo: un armado compartido por link (`?a=`). */
  | { accion: "reemplazar"; armado: Armado };

export interface ArmadoEvento {
  accion: AccionArmado["accion"];
  /** El armado después del cambio. */
  armado: Armado;
  /** El id que se agregó o quitó, si hubo uno. */
  id?: string;
  origen?: OrigenItem;
}

export const ARMADO_KEY = "malejo-armado";
export const ARMADO_EVENT = "malejo:armado";
/** Tope de ítems (planes, combos y extras juntos). */
export const MAX_ITEMS = 12;

export const ARMADO_VACIO: Armado = Object.freeze({ items: [], extras: [] }) as Armado;

/**
 * Qué es un id: `{ id, tipo }` con el id vigente (un alias ya resuelto), o
 * `null` si no existe en el catálogo. `sugerido` es dónde estaba (en
 * `items` o en `extras`): el clasificador con catálogo lo ignora; el que no
 * tiene catálogo lo respeta.
 */
export type Clasificador = (id: string, sugerido?: "item" | "extra") => { id: string; tipo: "item" | "extra" } | null;

/** Sin catálogo: acepta cualquier id con forma de slug y lo deja donde estaba. Solo para datos ya validados. */
export const sinValidar: Clasificador = (id, sugerido = "item") => (ID.test(id) ? { id, tipo: sugerido } : null);

const ID = /^[a-z0-9-]{2,60}$/;

export function armadoVacio(a: Armado | null | undefined): boolean {
  return !a || (a.items.length === 0 && a.extras.length === 0);
}

export function cantidad(a: Armado): number {
  return a.items.length + a.extras.length;
}

/**
 * Limpia un armado: descarta ids con forma rara o que el clasificador no
 * reconoce, resuelve alias, quita repetidos (gana el primero, con su origen)
 * y corta en `MAX_ITEMS`. Un extra que llegó como ítem (o al revés) se
 * acomoda donde corresponde.
 */
export function normalizar(raw: unknown, clasificar: Clasificador): Armado {
  const out: Armado = { items: [], extras: [] };
  if (!raw || typeof raw !== "object") return out;
  const r = raw as { items?: unknown; extras?: unknown };
  const vistos = new Set<string>();
  const sumar = (id: unknown, origen: OrigenItem, sugerido: "item" | "extra") => {
    if (typeof id !== "string" || !ID.test(id) || cantidad(out) >= MAX_ITEMS) return;
    const c = clasificar(id, sugerido);
    if (!c || vistos.has(c.id)) return;
    vistos.add(c.id);
    if (c.tipo === "extra") out.extras.push(c.id);
    else out.items.push({ id: c.id, origen });
  };
  for (const it of Array.isArray(r.items) ? r.items : []) {
    if (typeof it === "string") sumar(it, "persona", "item");
    else if (it && typeof it === "object") {
      const { id, origen } = it as { id?: unknown; origen?: unknown };
      sumar(id, origen === "malejo" ? "malejo" : "persona", "item");
    }
  }
  for (const id of Array.isArray(r.extras) ? r.extras : []) sumar(id, "persona", "extra");
  return out;
}

/** Aplica una acción. Pura: devuelve un armado nuevo (o el mismo si no cambió). */
export function aplicar(a: Armado, accion: AccionArmado, clasificar: Clasificador = sinValidar): Armado {
  switch (accion.accion) {
    case "vaciar":
      return { items: [], extras: [] };
    case "reemplazar":
      return normalizar(accion.armado, clasificar);
    case "quitar": {
      const id = clasificar(accion.id)?.id ?? accion.id;
      return { items: a.items.filter((i) => i.id !== id), extras: a.extras.filter((x) => x !== id) };
    }
    case "agregar": {
      const c = clasificar(accion.id);
      if (!c || a.items.some((i) => i.id === c.id) || a.extras.includes(c.id) || cantidad(a) >= MAX_ITEMS) return a;
      return c.tipo === "extra" ? { ...a, extras: [...a.extras, c.id] } : { ...a, items: [...a.items, { id: c.id, origen: accion.origen }] };
    }
  }
}

/** `?a=` → ids separados por coma, ítems primero y extras después. */
export function aQuery(a: Armado): string {
  return [...a.items.map((i) => i.id), ...a.extras].join(",");
}

/** `?a=turnos-online,blog` → armado validado. Lo que llega por link cuenta como elegido por la persona. */
export function deQuery(param: string | null | undefined, clasificar: Clasificador): Armado {
  if (!param) return { items: [], extras: [] };
  const ids = param
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, MAX_ITEMS * 2);
  return normalizar({ items: ids }, clasificar);
}

/** Firma estable de un armado (para comparar sin importar el orden). */
export function firmaArmado(a: Armado): string {
  return [...a.items.map((i) => i.id), ...a.extras].sort().join(",");
}

/* ─── sessionStorage y evento ──────────────────────────────────────── */

/** El armado guardado en esta pestaña. Nunca tira: sin storage, vacío. */
export function leer(clasificar: Clasificador = sinValidar): Armado {
  try {
    const raw = window.sessionStorage.getItem(ARMADO_KEY);
    return raw ? normalizar(JSON.parse(raw), clasificar) : { items: [], extras: [] };
  } catch {
    return { items: [], extras: [] };
  }
}

export function guardar(a: Armado): void {
  try {
    if (armadoVacio(a)) window.sessionStorage.removeItem(ARMADO_KEY);
    else window.sessionStorage.setItem(ARMADO_KEY, JSON.stringify(a));
  } catch {
    // Modo privado o storage lleno: el armado sigue en memoria de la isla.
  }
}

/**
 * Aplica la acción sobre lo guardado, lo guarda y avisa. Devuelve el armado
 * nuevo. Es la única forma de cambiar el armado: así el carrito, los botones
 * "Agregar" y el widget de Malejo nunca se desincronizan.
 */
export function emitir(accion: AccionArmado, clasificar: Clasificador = sinValidar): Armado {
  // Lo guardado ya pasó por un clasificador: se lee tal cual, sin moverlo.
  const antes = leer();
  const armado = aplicar(antes, accion, clasificar);
  if (armado !== antes) guardar(armado);
  const detail: ArmadoEvento = {
    accion: accion.accion,
    armado,
    ...("id" in accion ? { id: clasificar(accion.id)?.id ?? accion.id } : {}),
    ...("origen" in accion ? { origen: accion.origen } : {}),
  };
  window.dispatchEvent(new CustomEvent<ArmadoEvento>(ARMADO_EVENT, { detail }));
  return armado;
}

/** Escucha los cambios del armado (de esta pestaña). Devuelve la función para dejar de escuchar. */
export function escuchar(cb: (e: ArmadoEvento) => void): () => void {
  const on = (e: Event) => cb((e as CustomEvent<ArmadoEvento>).detail);
  window.addEventListener(ARMADO_EVENT, on);
  return () => window.removeEventListener(ARMADO_EVENT, on);
}
