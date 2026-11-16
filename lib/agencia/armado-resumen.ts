import type { Armado } from "./armado";
import { estimarArmado, fmt } from "./pricing";

/**
 * El resumen de un armado para Mauro (tanda P2, D3), escrito en el servidor
 * con los ids ya validados: el cliente nunca manda texto de precios.
 *
 *   Kit: Página para aparecer en Google + Agenda de turnos online · estimado $357.000–$411.000 · seña $50.000
 *   Ficha: Peluquería · Quiero que saquen turno solos
 *   Nota: Tengo dos sillones
 *
 * La línea de la ficha y la nota van recortadas. Lo usan `/api/contacto`
 * (el insert y el aviso por mail) y su test.
 */
export const RESUMEN_MAX = 1000;

const limpio = (s: string | undefined, max: number) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export function resumenDeArmado(armado: Armado, extra: { ficha?: { rubro?: string; necesidad?: string }; nota?: string } = {}): string {
  const e = estimarArmado(armado);
  const c = e.cotizacion;
  const partes = [
    `Kit: ${c.items.map((i) => i.nombre).join(" + ")}`,
    e.piso ? `estimado ${fmt(e.piso)}–${fmt(e.techo)}` : "",
    e.mensual ? `+ ${fmt(e.mensual)} por mes` : "",
    e.sena.tipo === "demo" ? `seña ${fmt(e.sena.monto)}` : e.sena.tipo === "plan-escrito" ? `plan escrito ${fmt(e.sena.monto)}` : "demo sin cargo",
  ].filter(Boolean);
  const ficha = [limpio(extra.ficha?.rubro, 80), limpio(extra.ficha?.necesidad, 200)].filter(Boolean).join(" · ");
  const nota = limpio(extra.nota, 300);
  return [partes.join(" · "), ficha ? `Ficha: ${ficha}` : "", nota ? `Nota: ${nota}` : ""].filter(Boolean).join("\n").slice(0, RESUMEN_MAX);
}
