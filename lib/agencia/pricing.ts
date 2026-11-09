import {
  etiquetasPrecio,
  getCombo,
  getExtra,
  getPlan,
  recargoMercadoPago,
  resolverId,
  resumenCopy,
  type Combo,
  type Extra,
  type Plan,
  type TipoPrecio,
} from "@/content/agencia/pricing";
import { fmt, fmtUsd } from "./format";

/**
 * **Única lógica de precios** de la agencia. La usan la sección de precios
 * de la home, `/servicios/[slug]`, `/cotizador` y las herramientas `cotizar`
 * y `comparar` del agente Malejo. Funciones puras: también corren en las
 * islas. El tipo de cambio entra como parámetro (lo resuelve
 * `lib/agencia/usd.ts` en el servidor), así todo sigue siendo testeable.
 */

export { fmt, fmtUsd };

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

/**
 * Pesos → dólares al tipo de cambio dado (ARS por USD). Redondea a la
 * decena; abajo de USD 100 redondea a la unidad, porque en un abono chico
 * la decena distorsiona demasiado ($23.300 a 1.450 son USD 16, no 20).
 */
export function aUsd(ars: number, tipoDeCambio: number): number {
  if (!ars || !(tipoDeCambio > 0)) return 0;
  const usd = ars / tipoDeCambio;
  return usd < 100 ? Math.round(usd) : Math.round(usd / 10) * 10;
}

/** "AHORRÁS 13%": descuento del combo sobre la suma de lista, redondeado. */
export function ahorro(combo: Pick<Combo, "list" | "price">): number {
  return Math.round((1 - combo.price / combo.list) * 100);
}

export interface ItemCotizado {
  id: string;
  tipo: "plan" | "combo" | "extra";
  nombre: string;
  /** Pago único de implementación (0 si es solo abono o a cotizar). */
  implementacion: number;
  /** Abono mensual (0 si no tiene). */
  mensual: number;
  /** Pago anual (la renovación de mantenimiento: $90.000 por año). */
  anual: number;
  /** El precio es "desde": el final depende del alcance. */
  desde: boolean;
  /** Sin precio fijo: el texto que va en lugar del monto. Vacío si tiene precio. */
  aCotizar: string;
  /** Para combos: los planes que reemplaza. */
  incluye?: string[];
}

export interface CotizacionUsd {
  /** ARS por USD usado en la conversión. */
  tipoDeCambio: number;
  implementacion: number;
  abonoMensual: number;
  anual: number;
  total: number;
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
  /** Ítems sin precio fijo (dominio, sprint): "Nombre: se cotiza con…". */
  aCotizar: string[];
  /** Combos que se aplicaron solos porque estaban todas sus partes. */
  combosAplicados: string[];
  /** Ids que no existen en el catálogo (el agente los reporta, no los inventa). */
  desconocidos: string[];
  /** Equivalente en dólares, solo si se pasó un tipo de cambio. */
  usd?: CotizacionUsd;
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
    aCotizar: plan.aCotizar,
  };
}

function itemDeCombo(combo: Combo, medio: Medio): ItemCotizado {
  return {
    id: combo.id,
    tipo: "combo",
    nombre: `${resumenCopy.combo} ${combo.name}`,
    implementacion: conRecargo(combo.price, medio),
    mensual: conRecargo(combo.monthly, medio),
    anual: 0,
    desde: false,
    aCotizar: "",
    incluye: combo.planIds,
  };
}

/**
 * Cotiza una selección **que se contrata junta**: suma todo. Para mostrar
 * alternativas sin sumarlas está `comparar()`.
 *
 * `planIds` acepta ids de planes y de combos (`combo-arranque`). Si la
 * selección contiene todas las partes de un combo, se reemplazan por el
 * combo (es siempre más barato). El recargo se aplica ítem por ítem, así el
 * total es la suma exacta de lo que se ve. Un id de plan que llega como
 * extra (el diagnóstico escrito era un extra) se cotiza como plan.
 */
export function cotizar({
  planIds,
  extras = [],
  medio = "transferencia",
  tipoDeCambio,
}: {
  planIds: string[];
  extras?: string[];
  medio?: Medio;
  /** ARS por USD. Si viene, la cotización suma su equivalente en dólares. */
  tipoDeCambio?: number;
}): Cotizacion {
  const desconocidos: string[] = [];
  // Ids viejos (`combo-web-turnos`) se cotizan con su reemplazo.
  const pedidos = planIds.map(resolverId);
  const extrasPedidos: string[] = [];
  for (const id of new Set(extras)) {
    if (getPlan(id) && !getExtra(id)) pedidos.push(id);
    else extrasPedidos.push(id);
  }

  const elegidos = new Set<string>();
  const combosElegidos: Combo[] = [];
  for (const id of pedidos) {
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
    ...[...new Set(pedidos)].filter((id) => elegidos.has(id)).map((id) => itemDePlan(getPlan(id)!, medio)),
  ];

  for (const id of extrasPedidos) {
    const extra = getExtra(id);
    if (!extra) {
      desconocidos.push(id);
      continue;
    }
    const precio = extra.price == null ? 0 : conRecargo(extra.price, medio);
    const anual = extra.unit === "por año";
    items.push({
      id: extra.id,
      tipo: "extra",
      nombre: extra.name,
      implementacion: anual ? 0 : precio,
      mensual: 0,
      anual: anual ? precio : 0,
      desde: false,
      aCotizar: extra.price == null ? extra.aCotizar : "",
    });
  }

  const implementacion = items.reduce((s, i) => s + i.implementacion, 0);
  const abonoMensual = items.reduce((s, i) => s + i.mensual, 0);
  const anual = items.reduce((s, i) => s + i.anual, 0);
  const total = implementacion + abonoMensual * 12 + anual;

  return {
    medio,
    items,
    implementacion,
    abonoMensual,
    anual,
    total,
    desde: items.some((i) => i.desde),
    aCotizar: items.filter((i) => i.aCotizar).map((i) => `${i.nombre}: ${i.aCotizar}`),
    combosAplicados,
    desconocidos,
    ...(tipoDeCambio && tipoDeCambio > 0
      ? {
          usd: {
            tipoDeCambio,
            implementacion: aUsd(implementacion, tipoDeCambio),
            abonoMensual: aUsd(abonoMensual, tipoDeCambio),
            anual: aUsd(anual, tipoDeCambio),
            total: aUsd(total, tipoDeCambio),
          },
        }
      : {}),
  };
}

/** Monto de un extra para un chip: "$60.000", o el texto si no tiene precio fijo. */
export function montoDeExtra(extra: Pick<Extra, "price" | "aCotizar">, medio: Medio): string {
  return extra.price == null ? extra.aCotizar : fmt(conRecargo(extra.price, medio));
}

/**
 * Lo que se muestra en grande en la tarjeta de un plan (DISENO.md §4 Precios).
 * `tipo` es para la lógica; `etiqueta` es copy (`content/agencia/pricing.ts`).
 * En los planes de pago único no se repite "pago único" como unidad: ya lo
 * dice la etiqueta.
 */
export function precioDePlan(plan: Plan, medio: Medio) {
  const aCotizar = plan.impl == null && plan.monthly == null;
  const soloMensual = plan.impl == null && !aCotizar;
  const tipo: TipoPrecio = aCotizar ? "aCotizar" : soloMensual ? "mensual" : plan.from ? "desde" : "unico";
  return {
    tipo,
    etiqueta: etiquetasPrecio[tipo] as string,
    /** `null` = sin precio fijo: mostrar `texto`. */
    precio: aCotizar ? null : conRecargo(soloMensual ? (plan.monthly ?? 0) : plan.impl!, medio),
    texto: plan.aCotizar,
    unidad: soloMensual ? "/mes" : tipo === "unico" && plan.unit === "pago único" ? "" : plan.unit,
    abono: !soloMensual && plan.monthly ? conRecargo(plan.monthly, medio) : null,
  };
}

/** Una opción de `comparar()`: lo justo para elegir, sin totales. */
export interface FilaComparacion {
  id: string;
  nombre: string;
  tipo: TipoPrecio;
  /** Copy de `etiquetasPrecio`: "Desde", "Pago único", "Cuota mensual", "Combo" o "A cotizar". */
  etiqueta: string;
  /** Monto principal. `null` = a cotizar (ver `texto`). */
  precio: number | null;
  texto: string;
  unidad: string;
  /** Abono mensual aparte del precio principal, si hay. */
  abono: number | null;
  /** Otra forma de pago del catálogo ("Otra forma de pago: …"), literal. */
  alt: string;
  plazo: string;
  /** Para quién es (planes) o lo que incluye (combos). */
  paraQuien: string;
  recomendado: boolean;
  usd?: { precio: number; abono: number };
}

export interface Comparacion {
  medio: Medio;
  filas: FilaComparacion[];
  desconocidos: string[];
  tipoDeCambio?: number;
}

/**
 * Compara alternativas (2 a 4 planes o combos) **sin sumarlas**: cada fila es
 * una opción por separado. Es lo que corresponde cuando la persona todavía
 * elige entre Landing Express y Profesional, o entre Mantenimiento Básico y
 * Pro. Nunca devuelve un total.
 */
export function comparar({
  ids,
  medio = "transferencia",
  tipoDeCambio,
}: {
  ids: string[];
  medio?: Medio;
  tipoDeCambio?: number;
}): Comparacion {
  const filas: FilaComparacion[] = [];
  const desconocidos: string[] = [];
  const conUsd = tipoDeCambio && tipoDeCambio > 0 ? tipoDeCambio : undefined;

  for (const id of new Set(ids.map(resolverId))) {
    const plan = getPlan(id);
    const combo = getCombo(id);
    if (plan) {
      const p = precioDePlan(plan, medio);
      filas.push({
        id,
        nombre: plan.name,
        tipo: p.tipo,
        etiqueta: p.etiqueta,
        precio: p.precio,
        texto: p.texto,
        unidad: p.unidad,
        abono: p.abono,
        alt: plan.alt,
        plazo: plan.time,
        paraQuien: plan.paraQuien || (plan.items[0] ?? ""),
        recomendado: plan.rec,
        ...(conUsd ? { usd: { precio: aUsd(p.precio ?? 0, conUsd), abono: aUsd(p.abono ?? 0, conUsd) } } : {}),
      });
    } else if (combo) {
      const precio = conRecargo(combo.price, medio);
      const abono = conRecargo(combo.monthly, medio);
      filas.push({
        id,
        nombre: `${resumenCopy.combo} ${combo.name}`,
        tipo: "combo",
        etiqueta: etiquetasPrecio.combo,
        precio,
        texto: "",
        unidad: "",
        abono,
        alt: "",
        plazo: "",
        paraQuien: combo.parts,
        recomendado: false,
        ...(conUsd ? { usd: { precio: aUsd(precio, conUsd), abono: aUsd(abono, conUsd) } } : {}),
      });
    } else desconocidos.push(id);
  }

  return { medio, filas, desconocidos, ...(conUsd ? { tipoDeCambio: conUsd } : {}) };
}

/** Texto plano de una cotización, para WhatsApp y para el agente. Copy: `resumenCopy`. */
export function resumenCotizacion(c: Cotizacion): string {
  const r = resumenCopy;
  const lineas = c.items.map((i) => {
    const partes = [
      i.implementacion ? `${i.desde ? `${r.desde} ` : ""}${fmt(i.implementacion)}` : "",
      i.mensual ? `${fmt(i.mensual)}${r.porMes}` : "",
      i.anual ? `${fmt(i.anual)}${r.porAnio}` : "",
      i.aCotizar,
    ].filter(Boolean);
    return `• ${i.nombre}: ${partes.join(" + ")}`;
  });
  return [
    ...lineas,
    `${r.unico}: ${c.desde ? `${r.desde} ` : ""}${fmt(c.implementacion)}`,
    c.abonoMensual ? `${r.mensual}: ${fmt(c.abonoMensual)}${r.porMes}` : "",
    c.usd ? `≈ ${fmtUsd(c.usd.implementacion)}${c.usd.abonoMensual ? ` + ${fmtUsd(c.usd.abonoMensual)}${r.porMes}` : ""} ${r.usd}` : "",
    `${r.pagoPor} ${r.medio[c.medio]}.`,
  ]
    .filter(Boolean)
    .join("\n");
}
