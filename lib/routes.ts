import type { Locale } from "@/lib/types";

/**
 * Las URLs del sitio, las dos versiones de cada una. Es la única tabla de
 * rutas: de acá salen los `canonical`, los `hreflang`, el sitemap y el
 * destino del toggle de idioma. Agregar una página es sumar una fila.
 *
 * El español no lleva prefijo y el inglés sí. No es simetría rota por
 * descuido: `/` ya está indexado y es la URL que está en el CV y en
 * LinkedIn, así que mover el español a `/es` obligaría a redirigir la raíz
 * del sitio para ganar nada.
 */
export type RouteKey = "home" | "qps" | "maestria";

const PATHS: Record<RouteKey, Record<Locale, string>> = {
  home: { es: "/", en: "/en" },
  qps: { es: "/casos/que-pinta-salta", en: "/en/casos/que-pinta-salta" },
  maestria: { es: "/casos/maestria", en: "/en/casos/maestria" },
};

export const ROUTE_KEYS = Object.keys(PATHS) as RouteKey[];

export function pathFor(route: RouteKey, locale: Locale): string {
  return PATHS[route][locale];
}

/**
 * `hreflang` recíproco más `x-default`. Los tres apuntan a rutas relativas
 * porque `metadataBase` del layout las vuelve absolutas.
 *
 * `x-default` va al español: es la versión sin prefijo y la que recibe al
 * visitante que el buscador no sabe clasificar.
 */
export function alternatesFor(route: RouteKey, locale: Locale) {
  return {
    canonical: PATHS[route][locale],
    languages: {
      es: PATHS[route].es,
      en: PATHS[route].en,
      "x-default": PATHS[route].es,
    },
  };
}

/**
 * Mueve un href interno al árbol del idioma que toque. Los enlaces de la
 * copy y de los CTAs están escritos en su forma española (`/`, `/#casos`,
 * `/casos/maestria`) porque el español es el que no lleva prefijo.
 *
 * El caso del ancla se trata aparte por una razón concreta: `/en/#casos`
 * haría que Next redirija por la barra final antes de saltar al ancla, así
 * que tiene que salir `/en#casos`.
 */
export function localized(href: string, locale: Locale): string {
  if (locale === "es") return href;
  if (href === "/") return "/en";
  if (href.startsWith("/#")) return `/en${href.slice(1)}`;
  return `/en${href}`;
}

/**
 * La ruta equivalente en el otro idioma, preservando dónde está parado el
 * visitante: de `/casos/maestria` a `/en/casos/maestria`, no al home.
 *
 * Es manipulación de string y no un lookup en `PATHS` a propósito: así una
 * URL que todavía no está en la tabla —un 404, una ruta futura— igual
 * cambia de idioma en lugar de mandar al visitante al inicio.
 */
export function swapLocale(pathname: string, to: Locale): string {
  const withoutPrefix =
    pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;

  if (to === "es") return withoutPrefix;
  return withoutPrefix === "/" ? "/en" : `/en${withoutPrefix}`;
}
