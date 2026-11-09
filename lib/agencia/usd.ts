import { z } from "zod";
import { usdFallback } from "@/content/agencia/pricing";

/**
 * Tipo de cambio para mostrar "≈ USD" en el chat y en el cotizador. **Solo
 * servidor** (lo usan `/api/chat` y `/api/dolar`; ninguna página lo llama, así
 * que el sitio sigue estático).
 *
 * Dólar oficial, venta, de dolarapi.com, cacheado un día por el data cache de
 * Next y con 3 s de timeout. Si falla: `USD_ARS_FALLBACK` y, si no está,
 * `precios.json → usd.fallback`. Nunca tira: el chat no se cae por esto.
 */
export interface TipoDeCambio {
  /** ARS por USD. */
  valor: number;
  fuente: string;
  /** ISO 8601 de la cotización, o de ahora si es el respaldo. */
  fecha: string;
}

const DOLARAPI = "https://dolarapi.com/v1/dolares/oficial";

const Respuesta = z.object({ venta: z.number().positive(), fechaActualizacion: z.string().optional() });

export function tipoDeCambioDeRespaldo(): TipoDeCambio {
  const env = Number(process.env.USD_ARS_FALLBACK);
  return Number.isFinite(env) && env > 0
    ? { valor: env, fuente: "USD_ARS_FALLBACK", fecha: new Date().toISOString() }
    : { valor: usdFallback.valor, fuente: "precios.json (respaldo)", fecha: new Date().toISOString() };
}

export async function tipoDeCambio(): Promise<TipoDeCambio> {
  try {
    const res = await fetch(DOLARAPI, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(3000),
    } as RequestInit);
    if (!res.ok) throw new Error(String(res.status));
    const data = Respuesta.parse(await res.json());
    return { valor: data.venta, fuente: "dolarapi.com (oficial, venta)", fecha: data.fechaActualizacion ?? new Date().toISOString() };
  } catch {
    return tipoDeCambioDeRespaldo();
  }
}
