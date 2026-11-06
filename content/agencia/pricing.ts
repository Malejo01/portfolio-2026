import raw from "@/docs/agencia/datos/precios.json";

/**
 * Catálogo de precios tipado. **Un solo origen**: los datos salen de
 * `docs/agencia/datos/precios.json` (el archivo del handoff; para cambiar un
 * precio se edita ahí) y acá solo se tipan y se les da un `id` estable.
 * La home, `/servicios`, `/cotizador` y el agente Malejo leen de este módulo,
 * y toda la aritmética pasa por `lib/agencia/pricing.ts`.
 */

export type CategoryKey = "webs" | "tiendas" | "turnos" | "gestion" | "ia" | "mant";

export interface Plan {
  /** Slug del nombre: `landing-profesional`. Estable: va en `/demo?plan=`. */
  id: string;
  category: CategoryKey;
  name: string;
  /** Implementación en pesos. `null` = plan de solo abono. */
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
  price: number;
}

/** "Catálogo con pedidos por WhatsApp" → "catalogo-con-pedidos-por-whatsapp". */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const categories: Category[] = raw.categorias.map((c) => ({
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

export const combos: Combo[] = raw.combos.map((c) => ({
  id: `combo-${slugify(c.name)}`,
  name: c.name,
  parts: c.parts,
  planIds: COMBO_PARTS[c.name] ?? [],
  list: c.list,
  price: c.price,
  monthly: c.monthly,
}));

export const extras: Extra[] = raw.extras.map((e) => ({
  id: slugify(e.nombre),
  name: e.nombre,
  price: e.precio,
}));

/** "2027-01-31" → "31/01/2027". */
export const vigencia: string = raw.vigencia.split("-").reverse().join("/");

export const recargoMercadoPago: number = raw.recargoMercadoPago;

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
