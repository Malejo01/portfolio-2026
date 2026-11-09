/**
 * La ficha del cliente: lo que Malejo va aprendiendo en la charla (rubro,
 * necesidad, planes, presupuesto…). La anota el modelo con `anotar_ficha`,
 * el servidor la normaliza y la emite como evento `ficha`, y **el widget la
 * guarda en memoria** y la reenvía en cada pedido. Nunca se guarda en el
 * servidor ni en la base.
 *
 * Este módulo es puro y sin zod (lo usa la isla del widget). La validación
 * del servidor está en `ficha-schema.ts`.
 */

export const ETAPAS = ["descubrimiento", "cotizado", "interesado", "listo_para_demo", "derivado"] as const;
export type Etapa = (typeof ETAPAS)[number];

export interface Ficha {
  nombre?: string;
  rubro?: string;
  ciudad?: string;
  necesidad?: string;
  presupuesto?: string;
  /** Nombres de planes o combos (el servidor traduce los ids del catálogo). */
  planesInteres?: string[];
  urgencia?: string;
  medioPago?: string;
  cuotas?: string;
  dudas?: string[];
  etapa?: Etapa;
}

/** Topes de tamaño: los mismos para el modelo y para el body del widget. */
export const FICHA_LIMITES = { texto: 120, necesidad: 300, lista: 6, item: 80 } as const;

const TEXTOS = ["nombre", "rubro", "ciudad", "necesidad", "presupuesto", "urgencia", "medioPago", "cuotas"] as const;
const LISTAS = ["planesInteres", "dudas"] as const;

/**
 * Fusiona un cambio en la ficha. Los textos nuevos y no vacíos reemplazan a
 * los anteriores; las listas se unen sin repetidos (sin distinguir
 * mayúsculas) y se quedan con los últimos `lista` elementos.
 */
export function mergeFicha(prev: Ficha, patch: Ficha): Ficha {
  const out: Ficha = { ...prev };
  for (const k of TEXTOS) {
    const v = patch[k]?.trim();
    if (v) out[k] = v;
  }
  for (const k of LISTAS) {
    const nuevos = (patch[k] ?? []).map((s) => s.trim()).filter(Boolean);
    if (!nuevos.length) continue;
    const todos = [...(prev[k] ?? []), ...nuevos];
    const unicos = todos.filter((s, i) => todos.findIndex((t) => t.toLowerCase() === s.toLowerCase()) === i);
    out[k] = unicos.slice(-FICHA_LIMITES.lista);
  }
  if (patch.etapa) out.etapa = patch.etapa;
  return out;
}

export function fichaVacia(f: Ficha | undefined): boolean {
  if (!f) return true;
  return !TEXTOS.some((k) => f[k]?.trim()) && !LISTAS.some((k) => f[k]?.length);
}
