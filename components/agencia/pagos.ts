import { pagosConfig, recargoMercadoPago } from "@/content/agencia/pricing";
import { senaMonto } from "@/lib/agencia/config";
import { fmt } from "@/lib/agencia/pricing";

/**
 * Completa los marcadores de la copy de pagos (`content/agencia/home.ts`,
 * `servicios.ts`): `{SENA}` (la seña de `SENA_MONTO`), `{TOPE}` (el tope de
 * los 3 pagos), `{PCT}` (recargo de Mercado Pago) y `{CUOTAS}`. Solo
 * servidor: la seña sale de una variable de entorno.
 */
export function completarPagos(texto: string): string {
  return texto
    .replaceAll("{SENA}", fmt(senaMonto()))
    .replaceAll("{TOPE}", fmt(pagosConfig.topeTres))
    .replaceAll("{PCT}", `${Math.round(recargoMercadoPago * 100)}%`)
    .replaceAll("{CUOTAS}", String(pagosConfig.tarjetaMaxCuotas));
}
