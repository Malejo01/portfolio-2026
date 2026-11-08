import { tipoDeCambio } from "@/lib/agencia/usd";

/**
 * `GET /api/dolar` → `{ valor, fuente, fecha }`. Lo lee el cotizador en el
 * cliente para mostrar "≈ USD" sin volver dinámica la página. La consulta a
 * dolarapi.com se cachea un día (`lib/agencia/usd.ts`) y la respuesta, una
 * hora en la CDN.
 */
export const runtime = "nodejs";

export async function GET() {
  const tc = await tipoDeCambio();
  return Response.json(tc, {
    headers: { "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
