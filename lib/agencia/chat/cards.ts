import { fmt, fmtUsd } from "@/lib/agencia/format";
import type { ContactPayload } from "./security";

/**
 * Tarjetas que el chat le muestra a la persona. Tipos y funciones puras: los
 * usan el servidor (herramientas y deduplicación) y el widget (render y la
 * línea que resume cada tarjeta en el historial). Sin zod ni catálogo, para
 * no inflar la isla.
 */

export type Medio = "transferencia" | "mp";
/** "usd" = la tarjeta suma el equivalente en dólares debajo de los pesos. */
export type Moneda = "ars" | "usd";

export interface FilaCard {
  id: string;
  nombre: string;
  /** "desde", "unico", "mensual", "combo" o "aCotizar" (`TipoPrecio`). */
  tipo: string;
  etiqueta: string;
  precio: number | null;
  texto: string;
  unidad: string;
  abono: number | null;
  alt: string;
  plazo: string;
  paraQuien: string;
  recomendado: boolean;
  usd?: { precio: number; abono: number };
}

export type Card =
  | {
      kind: "quote";
      /** Planes y combos pedidos: con extras, medio y moneda arman la firma. */
      ids: string[];
      extras: string[];
      titulo: string;
      implementacion: number;
      mensual: number;
      anual: number;
      desde: boolean;
      medio: Medio;
      moneda: Moneda;
      /** "Dominio .com.ar: según tarifa vigente de NIC.ar". */
      aCotizar: string[];
      usd?: { implementacion: number; mensual: number; tipoDeCambio: number };
      demoHref: string;
    }
  | { kind: "compare"; ids: string[]; medio: Medio; moneda: Moneda; filas: FilaCard[]; tipoDeCambio?: number }
  | { kind: "demo"; demoHref: string; agendaHref: string }
  | { kind: "whatsapp"; href: string }
  | { kind: "consent"; payload: ContactPayload; token: string }
  | { kind: "proyectos"; items: { nombre: string; que: string; href: string }[]; portfolio: { label: string; href: string } }
  /** Formulario de contacto (R3): nombre + WhatsApp + casilla, con un ticket firmado. */
  | { kind: "formContacto"; ticket: { rubro: string; resumen: string; iat: number }; token: string }
  /** Respuestas sugeridas (R3): botones que mandan ese texto como mensaje del usuario. */
  | { kind: "opciones"; opciones: string[] };

export type QuoteCard = Extract<Card, { kind: "quote" }>;

const orden = (xs: string[]) => [...xs].sort().join(",");

/**
 * Firma de una tarjeta. Dos tarjetas con la misma firma son la misma
 * tarjeta: el servidor no repite una `quote`/`compare`/`proyectos` cuya firma
 * ya está en el historial reciente.
 */
export function firmaCard(card: Card): string {
  switch (card.kind) {
    case "quote":
      return `quote:${orden(card.ids)}|${orden(card.extras)}|${card.medio}|${card.moneda}`;
    case "compare":
      return `compare:${orden(card.ids)}|${card.medio}|${card.moneda}`;
    case "demo":
      return `demo:${card.demoHref}`;
    default:
      return card.kind;
  }
}

/** Tarjetas que nunca se repiten. Demo, WhatsApp y consentimiento sí pueden volver. */
export function deduplicable(card: Card): boolean {
  return card.kind === "quote" || card.kind === "compare" || card.kind === "proyectos";
}

/** Firma de cotización → partes, para que el servidor reconstruya la última. */
export function leerFirmaQuote(firma: string): { ids: string[]; extras: string[]; medio: Medio; moneda: Moneda } | null {
  const m = /^quote:([^|]*)\|([^|]*)\|(transferencia|mp)\|(ars|usd)$/.exec(firma);
  if (!m) return null;
  const split = (s: string) => s.split(",").filter(Boolean);
  return { ids: split(m[1]), extras: split(m[2]), medio: m[3] as Medio, moneda: m[4] as Moneda };
}

/**
 * La línea compacta que el widget agrega al mensaje del asistente en el
 * historial, para que el modelo sepa qué tarjetas ya se vieron:
 * `[Tarjeta mostrada · Cotización: Turnos online · MP · $190.800 + $23.300/mes · ≈ USD 130]`.
 */
export function lineaTarjeta(card: Card): string {
  switch (card.kind) {
    case "quote": {
      const partes = [
        `Cotización: ${card.titulo}`,
        card.medio === "mp" ? "MP" : "transferencia",
        `${card.desde ? "desde " : ""}${fmt(card.implementacion)}${card.mensual ? ` + ${fmt(card.mensual)}/mes` : ""}${card.anual ? ` + ${fmt(card.anual)}/año` : ""}`,
        card.usd ? `≈ ${fmtUsd(card.usd.implementacion)}${card.usd.mensual ? ` + ${fmtUsd(card.usd.mensual)}/mes` : ""}` : "",
      ].filter(Boolean);
      return `[Tarjeta mostrada · ${partes.join(" · ")}]`;
    }
    case "compare":
      return `[Tarjeta mostrada · Comparación: ${card.filas.map((f) => f.nombre).join(" | ")}]`;
    case "demo":
      return "[Tarjeta mostrada · Demo]";
    case "whatsapp":
      return "[Tarjeta mostrada · WhatsApp]";
    case "consent":
      return "[Tarjeta mostrada · Consentimiento]";
    case "proyectos":
      return "[Tarjeta mostrada · Proyectos]";
    case "formContacto":
      return "[Tarjeta mostrada · Formulario de contacto]";
    case "opciones":
      // Las respuestas sugeridas no son algo que la persona "vio": no van al historial.
      return "";
  }
}
