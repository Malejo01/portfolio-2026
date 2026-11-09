import raw from "@/docs/agencia/datos/precios.json";

/**
 * Catálogo de precios tipado. **Un solo origen**: los datos salen de
 * `docs/agencia/datos/precios.json` (el archivo del handoff; para cambiar un
 * precio se edita ahí) y acá solo se tipan. Cada plan, combo y extra tiene
 * un `id` fijo en el JSON (tanda R2): los nombres pueden cambiar, los ids no.
 * La home, `/servicios`, `/cotizador` y el agente Malejo leen de este módulo,
 * y toda la aritmética pasa por `lib/agencia/pricing.ts`.
 */

export type CategoryKey = "webs" | "tiendas" | "turnos" | "gestion" | "ia" | "mant" | "grandes";

export interface Plan {
  /**
   * Id **fijo**, escrito en `precios.json` (tanda R2). Es el valor que tenía
   * `slugify(nombre)` antes del cambio de nombres: va en `/demo?plan=`, en los
   * `<Precio id>` del blog, en los combos, en los tests y en las evals.
   * Cambiar el nombre de un plan nunca cambia su id.
   */
  id: string;
  category: CategoryKey;
  name: string;
  /** Para quién es, en una línea (va debajo del nombre en la tarjeta). */
  paraQuien: string;
  /**
   * Pago único en pesos. `null` = plan de solo cuota mensual o, si tampoco
   * tiene cuota, un ítem **a cotizar** (ver `aCotizar`).
   */
  impl: number | null;
  /** `true` = precio "desde" (el final depende del alcance). */
  from: boolean;
  /** Cuota mensual en pesos. */
  monthly: number | null;
  /** "pago único", "por cada tarea automatizada", "por año" o vacío. */
  unit: string;
  /** Plazo: "5 a 7 días", "según alcance" o vacío. */
  time: string;
  /** Plan recomendado de la categoría. */
  rec: boolean;
  items: string[];
  /** Prueba social: "Como Tuki". */
  proof: string;
  /**
   * Otra forma de pago ("Otra forma de pago: $90.000 de entrada…"). Texto
   * literal del catálogo. No va en la tarjeta: se muestra en "Otras formas
   * de pago" de la solución y de `/precios`.
   */
  alt: string;
  /**
   * Sin precio fijo: el texto que va en lugar del monto ("se cotiza en el
   * plan escrito"). Vacío en los planes con precio.
   */
  aCotizar: string;
  /** Mantenimiento como porcentaje mensual del precio del proyecto (proyectos grandes). */
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
  paraQuien: string;
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
  id: string;
  name: string;
  paraQuien: string;
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
  combos: { id: string; name: string; paraQuien: string; parts: string; planIds: string[]; list: number; price: number; monthly: number }[];
  /** Ids viejos que ya no existen → el id que los reemplaza (links compartidos). */
  aliases: Record<string, string>;
  extras: { id: string; nombre: string; precio: number | null; unidad?: string; aCotizar?: string }[];
  vigencia: string;
  recargoMercadoPago: number;
  usd: { fallback: number; fuente: string };
}

const catalog = raw as RawCatalog;

/**
 * "Catálogo con pedidos por WhatsApp" → "catalogo-con-pedidos-por-whatsapp".
 * Ya no arma los ids (son fijos en el JSON); queda para slugs de texto libre.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
    id: p.id,
    category: c.key as CategoryKey,
    name: p.name,
    paraQuien: p.paraQuien,
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

/** Qué planes reemplaza cada combo: `planIds` en el JSON, por id fijo. */
export const combos: Combo[] = catalog.combos.map((c) => ({
  id: c.id,
  name: c.name,
  paraQuien: c.paraQuien,
  parts: c.parts,
  planIds: c.planIds,
  list: c.list,
  price: c.price,
  monthly: c.monthly,
}));

export const extras: Extra[] = catalog.extras.map((e) => ({
  id: e.id,
  name: e.nombre,
  price: e.precio,
  unit: e.unidad ?? "",
  aCotizar: e.aCotizar ?? "",
}));

/**
 * Ids viejos → ids vigentes. El plan "Combo Web + Turnos" se unificó con el
 * combo "Página + turnos" (R2): `/demo?plan=combo-web-turnos` sigue andando.
 */
export const aliases: Readonly<Record<string, string>> = catalog.aliases ?? {};

/** El id vigente: el mismo, o al que apunta su alias. */
export function resolverId(id: string): string {
  return aliases[id] ?? id;
}

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
 * precio del proyecto (0,10 = 10 %). **Un solo lugar**: el plan
 * `mantenimiento-de-proyectos-grandes` de `precios.json`.
 */
export const mantenimientoGrandesPct: number =
  categories.flatMap((c) => c.plans).find((p) => p.mantenimientoPct != null)?.mantenimientoPct ?? 0.1;

export function getCategory(key: string): Category | undefined {
  return categories.find((c) => c.key === key);
}

export function getPlan(id: string): Plan | undefined {
  const real = resolverId(id);
  return plans.find((p) => p.id === real);
}

export function getCombo(id: string): Combo | undefined {
  const real = resolverId(id);
  return combos.find((c) => c.id === real);
}

export function getExtra(id: string): Extra | undefined {
  return extras.find((e) => e.id === id);
}

/**
 * Copy de la etiqueta de precio de cada tarjeta (antes vivía en
 * `lib/agencia/pricing.ts`). `precioDePlan()` decide el **tipo** y acá está
 * el texto: la lógica compara tipos, nunca textos.
 */
export const etiquetasPrecio = {
  aCotizar: "A cotizar",
  mensual: "Cuota mensual",
  desde: "Desde",
  unico: "Pago único",
  combo: "Combo",
} as const;

export type TipoPrecio = keyof typeof etiquetasPrecio;

/** Textos de las cotizaciones en texto plano (WhatsApp y el agente). */
export const resumenCopy = {
  unico: "Pago único",
  mensual: "Cuota mensual",
  desde: "desde",
  porMes: "/mes",
  porAnio: "/año",
  usd: "(dólar oficial del día)",
  medio: { transferencia: "transferencia", mp: "Mercado Pago" },
  pagoPor: "Pago por",
  combo: "Combo",
} as const;
