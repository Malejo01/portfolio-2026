import {
  getCombo,
  getExtra,
  getPlan,
  recargoMercadoPago,
  type Combo,
  type Plan,
} from "@/content/agencia/pricing";
import { fmt } from "./format";

/**
 * **Única lógica de precios** de la agencia. La usan la sección de precios
 * de la home, `/servicios/[slug]`, `/cotizador` y la herramienta `cotizar`
 * del agente Malejo. Funciones puras: también corren en las islas.
 */

export { fmt };

export type Medio = "transferencia" | "mp";

/**
 * Precio según el medio de pago. Mercado Pago suma el recargo del catálogo
 * (6 %) y redondea a $100, que es lo que muestra `05-precios-mercadopago.png`
 * ($180.000 → $190.800, $45.000 → $47.700).
 */
export function conRecargo(n: number, medio: Medio): number {
  if (medio !== "mp") return n;
  return Math.round((n * (1 + recargoMercadoPago)) / 100) * 100;
}

/** "AHORRÁS 13%": descuento del combo sobre la suma de lista, redondeado. */
export function ahorro(combo: Pick<Combo, "list" | "price">): number {
  return Math.round((1 - combo.price / combo.list) * 100);
}

export interface ItemCotizado {
  id: string;
  tipo: "plan" | "combo" | "extra";
  nombre: string;
  /** Pago único de implementación (0 si es solo abono). */
  implementacion: number;
  /** Abono mensual (0 si no tiene). */
  mensual: number;
  /** Pago anual (la renovación de mantenimiento: $90.000 por año). */
  anual: number;
  /** El precio es "desde": el final depende del alcance. */
  desde: boolean;
  /** Para combos: los planes que reemplaza. */
  incluye?: string[];
}

export interface Cotizacion {
  medio: Medio;
  items: ItemCotizado[];
  /** Suma de implementaciones (pago único). */
  implementacion: number;
  /** Suma de abonos mensuales. */
  abonoMensual: number;
  /** Suma de pagos anuales. */
  anual: number;
  /** Total del primer año: implementación + 12 abonos + pagos anuales. */
  total: number;
  /** Algún ítem es "desde": el total es un piso, no un precio cerrado. */
  desde: boolean;
  /** Combos que se aplicaron solos porque estaban todas sus partes. */
  combosAplicados: string[];
  /** Ids que no existen en el catálogo (el agente los reporta, no los inventa). */
  desconocidos: string[];
}

function itemDePlan(plan: Plan, medio: Medio): ItemCotizado {
  const anual = plan.unit === "por año" ? (plan.impl ?? 0) : 0;
  return {
    id: plan.id,
    tipo: "plan",
    nombre: plan.name,
    implementacion: anual ? 0 : conRecargo(plan.impl ?? 0, medio),
    mensual: conRecargo(plan.monthly ?? 0, medio),
    anual: conRecargo(anual, medio),
    desde: plan.from,
  };
}

function itemDeCombo(combo: Combo, medio: Medio): ItemCotizado {
  return {
    id: combo.id,
    tipo: "combo",
    nombre: `Combo ${combo.name}`,
    implementacion: conRecargo(combo.price, medio),
    mensual: conRecargo(combo.monthly, medio),
    anual: 0,
    desde: false,
    incluye: combo.planIds,
  };
}

/**
 * Cotiza una selección. `planIds` acepta ids de planes y de combos
 * (`combo-arranque`). Si la selección contiene todas las partes de un
 * combo, se reemplazan por el combo (es siempre más barato). El recargo se
 * aplica ítem por ítem, así el total es la suma exacta de lo que se ve.
 */
export function cotizar({
  planIds,
  extras = [],
  medio = "transferencia",
}: {
  planIds: string[];
  extras?: string[];
  medio?: Medio;
}): Cotizacion {
  const desconocidos: string[] = [];
  const elegidos = new Set<string>();
  const combosElegidos: Combo[] = [];

  for (const id of planIds) {
    const combo = getCombo(id);
    if (combo) {
      if (!combosElegidos.includes(combo)) combosElegidos.push(combo);
    } else if (getPlan(id)) elegidos.add(id);
    else desconocidos.push(id);
  }

  // Combos explícitos absorben sus partes; después, combos implícitos.
  for (const c of combosElegidos) c.planIds.forEach((p) => elegidos.delete(p));
  const combosAplicados: string[] = [];
  for (const c of (["combo-pyme-digital", "combo-arranque", "combo-atencion-24-h", "combo-negocio-con-turnos"] as const)
    .map(getCombo)
    .filter((c): c is Combo => Boolean(c))) {
    if (c.planIds.length && c.planIds.every((p) => elegidos.has(p))) {
      c.planIds.forEach((p) => elegidos.delete(p));
      combosElegidos.push(c);
      combosAplicados.push(c.id);
    }
  }

  const items: ItemCotizado[] = [
    ...combosElegidos.map((c) => itemDeCombo(c, medio)),
    ...planIds.filter((id) => elegidos.has(id)).map((id) => itemDePlan(getPlan(id)!, medio)),
  ];

  for (const id of new Set(extras)) {
    const extra = getExtra(id);
    if (!extra) {
      desconocidos.push(id);
      continue;
    }
    items.push({
      id: extra.id,
      tipo: "extra",
      nombre: extra.name,
      implementacion: conRecargo(extra.price, medio),
      mensual: 0,
      anual: 0,
      desde: false,
    });
  }

  const implementacion = items.reduce((s, i) => s + i.implementacion, 0);
  const abonoMensual = items.reduce((s, i) => s + i.mensual, 0);
  const anual = items.reduce((s, i) => s + i.anual, 0);

  return {
    medio,
    items,
    implementacion,
    abonoMensual,
    anual,
    total: implementacion + abonoMensual * 12 + anual,
    desde: items.some((i) => i.desde),
    combosAplicados,
    desconocidos,
  };
}

/** Lo que se muestra en grande en la tarjeta de un plan (DISENO.md §4 Precios). */
export function precioDePlan(plan: Plan, medio: Medio) {
  const soloAbono = plan.impl == null;
  return {
    etiqueta: soloAbono ? "Abono" : plan.from ? "Desde" : "Implementación",
    precio: conRecargo(soloAbono ? (plan.monthly ?? 0) : plan.impl!, medio),
    unidad: soloAbono ? "/mes" : plan.unit,
    abono: !soloAbono && plan.monthly ? conRecargo(plan.monthly, medio) : null,
  };
}

/** Texto plano de una cotización, para WhatsApp y para el agente. */
export function resumenCotizacion(c: Cotizacion): string {
  const lineas = c.items.map((i) => {
    const partes = [
      i.implementacion ? `${i.desde ? "desde " : ""}${fmt(i.implementacion)}` : "",
      i.mensual ? `${fmt(i.mensual)}/mes` : "",
      i.anual ? `${fmt(i.anual)}/año` : "",
    ].filter(Boolean);
    return `• ${i.nombre}: ${partes.join(" + ")}`;
  });
  const medio = c.medio === "mp" ? "Mercado Pago" : "transferencia";
  return [
    ...lineas,
    `Implementación: ${c.desde ? "desde " : ""}${fmt(c.implementacion)}`,
    c.abonoMensual ? `Abono: ${fmt(c.abonoMensual)}/mes` : "",
    `Pago por ${medio}.`,
  ]
    .filter(Boolean)
    .join("\n");
}
