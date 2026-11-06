import type { Locale } from "@/lib/types";

/**
 * Las URLs del portfolio, las dos versiones de cada una. Es la única tabla de
 * rutas: de acá salen los `canonical`, los `hreflang`, el sitemap y el
 * destino del toggle de idioma. Agregar una página es sumar una fila.
 *
 * Desde noviembre de 2026 el portfolio vive bajo `/portfolio` (español) y
 * `/portfolio/en` (inglés): la raíz del dominio pasa a ser el sitio de la
 * agencia Malejo. Las URLs viejas (`/casos/…`, `/en/…`) redirigen con 308
 * desde `next.config.ts`, así que los enlaces del CV y de LinkedIn siguen
 * funcionando.
 */
export const PORTFOLIO_ES = "/portfolio";
export const PORTFOLIO_EN = "/portfolio/en";

export type RouteKey = "home" | "tuki" | "qps" | "maestria";

/** Las páginas de caso: todo lo que no es el home. */
export type CaseRoute = Exclude<RouteKey, "home">;

const PATHS: Record<RouteKey, Record<Locale, string>> = {
  home: { es: PORTFOLIO_ES, en: PORTFOLIO_EN },
  tuki: { es: `${PORTFOLIO_ES}/casos/tuki`, en: `${PORTFOLIO_EN}/casos/tuki` },
  qps: { es: `${PORTFOLIO_ES}/casos/que-pinta-salta`, en: `${PORTFOLIO_EN}/casos/que-pinta-salta` },
  maestria: { es: `${PORTFOLIO_ES}/casos/maestria`, en: `${PORTFOLIO_EN}/casos/maestria` },
};

export const ROUTE_KEYS = Object.keys(PATHS) as RouteKey[];

export function pathFor(route: RouteKey, locale: Locale): string {
  return PATHS[route][locale];
}

/**
 * `hreflang` recíproco más `x-default`. Los tres apuntan a rutas relativas
 * porque `metadataBase` del layout las vuelve absolutas.
 *
 * `x-default` va al español: es la versión base y la que recibe al
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
 * copy y de los CTAs están escritos **relativos al portfolio** (`/`,
 * `/#casos`, `/casos/maestria`): así la copy no sabe dónde está montado el
 * portfolio y mudarlo fue cambiar solo esta función.
 *
 * El caso del ancla se trata aparte por una razón concreta: `/portfolio/#casos`
 * haría que Next redirija por la barra final antes de saltar al ancla, así
 * que tiene que salir `/portfolio#casos`.
 */
export function localized(href: string, locale: Locale): string {
  const base = locale === "es" ? PORTFOLIO_ES : PORTFOLIO_EN;
  if (href === "/") return base;
  if (href.startsWith("/#")) return `${base}${href.slice(1)}`;
  return `${base}${href}`;
}

/**
 * La ruta equivalente en el otro idioma, preservando dónde está parado el
 * visitante: de `/portfolio/casos/maestria` a `/portfolio/en/casos/maestria`,
 * no al home.
 *
 * Es manipulación de string y no un lookup en `PATHS` a propósito: así una
 * URL que todavía no está en la tabla —un 404, una ruta futura— igual
 * cambia de idioma en lugar de mandar al visitante al inicio. Una ruta fuera
 * del portfolio (un 404 en la raíz) cae al home del otro idioma.
 */
export function swapLocale(pathname: string, to: Locale): string {
  let rest = "";
  if (pathname === PORTFOLIO_EN || pathname.startsWith(`${PORTFOLIO_EN}/`)) {
    rest = pathname.slice(PORTFOLIO_EN.length);
  } else if (pathname === PORTFOLIO_ES || pathname.startsWith(`${PORTFOLIO_ES}/`)) {
    rest = pathname.slice(PORTFOLIO_ES.length);
  }
  return `${to === "es" ? PORTFOLIO_ES : PORTFOLIO_EN}${rest}`;
}
