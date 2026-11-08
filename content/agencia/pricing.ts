import raw from "@/docs/agencia/datos/precios.json";

/**
 * Catálogo de precios tipado. **Un solo origen**: los datos salen de
 * `docs/agencia/datos/precios.json` (el archivo del handoff; para cambiar un
 * precio se edita ahí) y acá solo se tipan y se les da un `id` estable.
 * La home, `/servicios`, `/cotizador` y el agente Malejo leen de este módulo,
 * y toda la aritmética pasa por `lib/agencia/pricing.ts`.
 */

export type CategoryKey = "webs" | "tiendas" | "turnos" | "gestion" | "ia" | "mant" | "grandes";

export interface Plan {
  /** Slug del nombre: `landing-profesional`. Estable: va en `/demo?plan=`. */
  id: string;
  category: CategoryKey;
  name: string;
  /**
   * Implementación en pesos. `null` = plan de solo abono o, si tampoco tiene
   * abono, un ítem **a cotizar** (ver `aCotizar`).
   */
  impl: number | null;
  /** `true` = precio "desde" (el final depende del alcance). */
  from: boolean;
  /** Abono mensual en pesos. */
  monthly: number | null;
  /** "pago único", "por flujo", "por año" o vacío. */
  unit: string;
  /** Plazo: "5 a 7 días", "según alcance" o vacío. */
  time: string;
  /** Plan recomendado de la categoría. */
  rec: boolean;
  items: string[];
  /** Prueba social: "Como Tuki". */
  proof: string;
  /** Línea gris alternativa ("O por abono: …"). Texto literal del catálogo. */
  alt: string;
  /**
   * Sin precio fijo: el texto que va en lugar del monto ("se cotiza con el
   * diagnóstico"). Vacío en los planes con precio.
   */
  aCotizar: string;
  /** Mantenimiento como porcentaje mensual de la implementación (proyectos grandes). */
  mantenimientoPct: number | null;
}

export interface Category {
  key: CategoryKey;
  label: string;
  intro: string;
  note: string;
  plans: Plan[];
}

export interface Combo {
  id: string;
  name: string;
  parts: string;
  /** Planes que el combo reemplaza. `cotizar()` lo aplica si están todos. */
  planIds: string[];
  /** Suma de lista de las partes. */
  list: number;
  price: number;
  monthly: number;
}

export interface Extra {
  id: string;
  name: string;
  /** `null` = sin precio fijo en el catálogo (el dominio, según NIC.ar). */
  price: number | null;
  /** "por año" (dominio) o vacío (pago único). */
  unit: string;
  /** Texto en lugar del monto cuando `price` es `null`. */
  aCotizar: string;
}

/** Forma del JSON: los campos opcionales no están en todos los planes. */
interface RawPlan {
  name: string;
  impl: number | null;
  from: boolean;
  monthly: number | null;
  unit: string;
  time: string;
  rec: boolean;
  items: string[];
  proof: string;
  alt: string;
  aCotizar?: string;
  mantenimientoPct?: number;
}

interface RawCatalog {
  categorias: { key: string; label: string; intro: string; note: string; plans: RawPlan[] }[];
  combos: { name: string; parts: string; list: number; price: number; monthly: number }[];
  extras: { nombre: string; precio: number | null; unidad?: string; aCotizar?: string }[];
  vigencia: string;
  recargoMercadoPago: number;
  usd: { fallback: number; fuente: string };
}

const catalog = raw as RawCatalog;

/** "Catálogo con pedidos por WhatsApp" → "catalogo-con-pedidos-por-whatsapp". */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const categories: Category[] = catalog.categorias.map((c) => ({
  key: c.key as CategoryKey,
  label: c.label,
  intro: c.intro,
  note: c.note,
  plans: c.plans.map((p) => ({
    id: slugify(p.name),
    category: c.key as CategoryKey,
    name: p.name,
    impl: p.impl,
    from: p.from,
    monthly: p.monthly,
    unit: p.unit,
    time: p.time,
    rec: p.rec,
    items: p.items,
    proof: p.proof,
    alt: p.alt,
    aCotizar: p.aCotizar ?? "",
    mantenimientoPct: p.mantenimientoPct ?? null,
  })),
}));

export const plans: Plan[] = categories.flatMap((c) => c.plans);

/**
 * Qué planes reemplaza cada combo. Es lo único que no está en el JSON (ahí
 * `parts` es texto): se declara acá por nombre del combo y un test verifica
 * que la suma de lista de las partes coincida con `list` del catálogo.
 */
const COMBO_PARTS: Record<string, string[]> = {
  Arranque: ["landing-profesional", "catalogo-con-pedidos-por-whatsapp"],
  "Atención 24 h": ["landing-profesional", "asistente-ia-para-tu-web"],
  "Negocio con turnos": ["landing-profesional", "turnos-online"],
  "Pyme digital": ["sitio-pyme", "pedidos-y-clientes", "asistente-ia-para-tu-web"],
};

export const combos: Combo[] = catalog.combos.map((c) => ({
  id: `combo-${slugify(c.name)}`,
  name: c.name,
  parts: c.parts,
  planIds: COMBO_PARTS[c.name] ?? [],
  list: c.list,
  price: c.price,
  monthly: c.monthly,
}));

export const extras: Extra[] = catalog.extras.map((e) => ({
  id: slugify(e.nombre),
  name: e.nombre,
  price: e.precio,
  unit: e.unidad ?? "",
  aCotizar: e.aCotizar ?? "",
}));

/** "2027-01-31" → "31/01/2027". */
export const vigencia: string = catalog.vigencia.split("-").reverse().join("/");

export const recargoMercadoPago: number = catalog.recargoMercadoPago;

/**
 * Tipo de cambio de respaldo (ARS por USD) si dolarapi.com no responde y no
 * hay `USD_ARS_FALLBACK`. Ver `lib/agencia/usd.ts`.
 */
export const usdFallback: { valor: number; fuente: string } = { valor: catalog.usd.fallback, fuente: catalog.usd.fuente };

/**
 * Mantenimiento mensual de los proyectos grandes, como fracción de la
 * implementación (0,10 = 10 %). **Un solo lugar**: el plan "Mantenimiento de
 * proyectos grandes" de `precios.json`.
 */
export const mantenimientoGrandesPct: number =
  categories.flatMap((c) => c.plans).find((p) => p.mantenimientoPct != null)?.mantenimientoPct ?? 0.1;

export function getCategory(key: string): Category | undefined {
  return categories.find((c) => c.key === key);
}

export function getPlan(id: string): Plan | undefined {
  return plans.find((p) => p.id === id);
}

export function getCombo(id: string): Combo | undefined {
  return combos.find((c) => c.id === id);
}

export function getExtra(id: string): Extra | undefined {
  return extras.find((e) => e.id === id);
}
