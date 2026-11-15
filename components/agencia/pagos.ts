import { pagosConfig, recargoMercadoPago } from "@/content/agencia/pricing";
import { fmt, senaMinima } from "@/lib/agencia/pricing";

/**
 * Completa los marcadores de la copy de pagos (`content/agencia/home.ts`,
 * `servicios.ts`): `{SENA}` (la seña más chica, para "desde {SENA}"; la
 * escala completa es `escalaDeSena()`), `{TOPE}` (el tope de los 3 pagos),
 * `{PCT}` (recargo de Mercado Pago) y `{CUOTAS}`.
 */
export function completarPagos(texto: string): string {
  return texto
    .replaceAll("{SENA}", fmt(senaMinima()))
    .replaceAll("{TOPE}", fmt(pagosConfig.topeTres))
    .replaceAll("{PCT}", `${Math.round(recargoMercadoPago * 100)}%`)
    .replaceAll("{CUOTAS}", String(pagosConfig.tarjetaMaxCuotas));
}
