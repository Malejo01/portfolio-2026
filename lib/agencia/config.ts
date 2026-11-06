/**
 * Configuración de la agencia que sale de variables de entorno. Todas tienen
 * fallback: el sitio compila y funciona sin ninguna cargada (ver
 * `.env.example`).
 *
 * Ojo con el borde servidor/cliente: las `NEXT_PUBLIC_*` se inlinean en el
 * bundle y sirven en las islas; `SENA_MONTO` y `SENA_ALIAS` **no**. Las islas
 * que muestran la seña la reciben por props desde un Server Component.
 * Como las páginas son estáticas, cambiar cualquiera de estas variables en
 * Vercel requiere un redeploy.
 */

/** Número en formato internacional sin `+`, para `wa.me`. */
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "5493875813233";

/** Vacío = Mauro todavía no tiene Cal.com: los CTAs caen a WhatsApp. */
export const CALCOM_URL = process.env.NEXT_PUBLIC_CALCOM_URL || "";

/** Link de pago de la seña (Mercado Pago u otro). Vacío = alias o WhatsApp. */
export const SENA_URL = process.env.NEXT_PUBLIC_SENA_URL || "";

function parseMonto(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Solo servidor. Monto de la seña en pesos. */
export function senaMonto(): number {
  return parseMonto(process.env.SENA_MONTO) ?? 20000;
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
