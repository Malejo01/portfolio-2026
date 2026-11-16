/**
 * Configuración de la agencia que sale de variables de entorno. Todas tienen
 * fallback: el sitio compila y funciona sin ninguna cargada (ver
 * `.env.example`).
 *
 * Ojo con el borde servidor/cliente: las `NEXT_PUBLIC_*` se inlinean en el
 * bundle y sirven en las islas; `SENA_ALIAS` **no**. Las islas que muestran
 * el alias lo reciben por props desde un Server Component. El monto de la
 * seña ya no es una variable (tanda P2): sale de `senaPara()` y de
 * `precios.json → senas`.
 * Como las páginas son estáticas, cambiar cualquiera de estas variables en
 * Vercel requiere un redeploy.
 */

/** Número en formato internacional sin `+`, para `wa.me`. */
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "5493875813233";

/** Vacío = Mauro todavía no tiene Cal.com: los CTAs caen a WhatsApp. */
export const CALCOM_URL = process.env.NEXT_PUBLIC_CALCOM_URL || "";

/**
 * Links de pago de la seña escalonada (tanda P2, D4), uno por monto, y el
 * del plan del proyecto por escrito. Vacío = alias de transferencia y
 * WhatsApp, nunca un botón roto. Cada `process.env.NEXT_PUBLIC_*` va
 * escrito entero: así Next lo inlinea en las islas.
 */
const LINKS_DE_SENA: Readonly<Record<number, string>> = {
  25000: process.env.NEXT_PUBLIC_SENA_URL_25000 || "",
  50000: process.env.NEXT_PUBLIC_SENA_URL_50000 || "",
};
const PLAN_ESCRITO_URL = process.env.NEXT_PUBLIC_PLAN_ESCRITO_URL || "";

/** El link de pago que corresponde a una seña. `""` si no hay (o si es sin cargo). */
export function linkDeSena(sena: { tipo: "demo" | "plan-escrito" | "sin-cargo"; monto?: number }): string {
  if (sena.tipo === "sin-cargo") return "";
  if (sena.tipo === "plan-escrito") return PLAN_ESCRITO_URL;
  return LINKS_DE_SENA[sena.monto ?? 0] ?? "";
}

/** Solo servidor. Alias para transferir la seña. */
export function senaAlias(): string {
  return process.env.SENA_ALIAS || "";
}

/** `https://wa.me/<número>?text=<texto>`. */
export function waLink(text?: string): string {
  const base = `https://wa.me/${WHATSAPP}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Agenda: Cal.com si existe; si no, WhatsApp con el pedido de videollamada. */
export function agendaLink(): string {
  return CALCOM_URL || waLink("Quiero agendar una videollamada");
}
