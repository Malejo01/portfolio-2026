/**
 * Redirecciones de la agencia (tanda P2, D1). `/precios` y `/cotizador` se
 * fusionaron en `/soluciones`, el armador; el índice `/servicios` también va
 * ahí. **`/servicios/[slug]` se queda**: es la página de cada solución para
 * Google y para el chat.
 *
 * Son 308 (permanentes) y Next conserva la query sola: `/precios?cat=ia`
 * llega a `/soluciones?cat=ia` y `/cotizador?a=…` a `/soluciones?a=…`. Las
 * usa `next.config.ts` y las cubre `redirects.test.ts`, que además revisa que
 * ningún enlace del sitio apunte a una ruta redirigida.
 */
export const REDIRECCIONES_AGENCIA = [
  { source: "/precios", destination: "/soluciones", permanent: true },
  { source: "/cotizador", destination: "/soluciones", permanent: true },
  { source: "/servicios", destination: "/soluciones", permanent: true },
] as const;

/** Rutas que ya no existen como página: nada del sitio las enlaza. */
export const RUTAS_REDIRIGIDAS: readonly string[] = REDIRECCIONES_AGENCIA.map((r) => r.source);
