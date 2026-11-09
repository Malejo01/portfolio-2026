import { fmt, fmtUsd } from "@/lib/agencia/format";
import type { QuoteCard } from "./cards";
import type { Ficha } from "./ficha";

/**
 * El mensaje de WhatsApp para Mauro, armado con lo que el agente averiguó.
 * **Un solo formato** para el ícono del encabezado del widget, la chip
 * "Hablar por WhatsApp", la tarjeta de `derivar_whatsapp` y el fallback de
 * error. Función pura: corre en el cliente y en el servidor.
 */

export const SALUDO = "Hola Mauro, vengo del chat de malejo.com.ar.";
export const WA_MAX = 1000;

const unir = (partes: (string | undefined)[], sep = " · ") => partes.filter((p) => p && p.trim()).join(sep);

export function mensajeWhatsApp(ficha?: Ficha, cotizacion?: QuoteCard | null, nota?: string): string {
  const raw = ficha ?? {};
  const t = (s?: string) => s?.trim() || "";
  const f = {
    ...raw,
    nombre: t(raw.nombre),
    rubro: t(raw.rubro),
    ciudad: t(raw.ciudad),
    necesidad: t(raw.necesidad),
    presupuesto: t(raw.presupuesto),
    urgencia: t(raw.urgencia),
    medioPago: t(raw.medioPago),
    cuotas: t(raw.cuotas),
    planesInteres: (raw.planesInteres ?? []).map(t).filter(Boolean),
    dudas: (raw.dudas ?? []).map(t).filter(Boolean),
  };
  const lineas: string[] = [];
  const add = (label: string, valor: string) => valor && lineas.push(`• ${label}: ${valor}`);

  add("Nombre", f.nombre);
  const lugar = unir([f.rubro && `Rubro: ${f.rubro}`, f.ciudad && `Ciudad: ${f.ciudad}`]);
  if (lugar) lineas.push(`• ${lugar}`);
  add("Necesito", f.necesidad);
  add("Me interesa", f.planesInteres.join(", "));
  if (cotizacion) {
    const montos = `${cotizacion.desde ? "desde " : ""}${fmt(cotizacion.implementacion)}${cotizacion.mensual ? ` + ${fmt(cotizacion.mensual)}/mes` : ""}`;
    const usd = cotizacion.usd ? `(≈ ${fmtUsd(cotizacion.usd.implementacion)})` : "";
    const medio = cotizacion.medio === "mp" ? "Mercado Pago" : "transferencia";
    add("Cotización", unir([cotizacion.titulo, unir([montos, usd], " "), medio, f.cuotas]));
  } else {
    add("Pago", unir([f.medioPago, f.cuotas]));
  }
  const plata = unir([f.presupuesto && `Presupuesto: ${f.presupuesto}`, f.urgencia && `Urgencia: ${f.urgencia}`]);
  if (plata) lineas.push(`• ${plata}`);
  add("Dudas", f.dudas.join("; "));
  if (nota?.trim() && nota.trim() !== f.necesidad) add("Consulta", nota.trim());

  if (!lineas.length) return SALUDO;
  return recortar([SALUDO, ...lineas].join("\n"), WA_MAX);
}

/** Corta en el último renglón que entra; si ni el primero entra, corta en seco con "…". */
function recortar(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  const lineas = texto.split("\n");
  let out = lineas[0];
  for (const l of lineas.slice(1)) {
    if (out.length + 1 + l.length > max) break;
    out += `\n${l}`;
  }
  return out.length <= max ? out : `${out.slice(0, max - 1)}…`;
}
