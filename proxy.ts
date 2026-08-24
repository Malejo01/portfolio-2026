import { NextResponse, type NextRequest } from "next/server";
import { matchAcceptLanguage } from "@/lib/locale";
import { LOCALE_COOKIE, type Locale } from "@/lib/types";

const YEAR = 60 * 60 * 24 * 365;

function isLocale(value: string | undefined): value is Locale {
  return value === "es" || value === "en";
}

/**
 * Una sola responsabilidad: mandar al inglés a quien llega a `/` por primera
 * vez con el navegador en inglés.
 *
 * Tres decisiones que vale la pena dejar escritas:
 *
 * 1. **Solo `/`.** El matcher no toca ninguna otra ruta. El idioma vive en
 *    la URL, así que `/casos/…` y `/en/…` no necesitan que nadie los
 *    negocie — y mantener al proxy fuera del camino es lo que deja esas
 *    rutas cacheables tal como salen del prerender.
 *
 * 2. **Redirect, no rewrite.** Un 307 deja al visitante parado en `/en`,
 *    con esa URL en la barra y compartible. Un rewrite le mostraría inglés
 *    en `/`, que es exactamente el problema que vinimos a resolver.
 *
 * 3. **Solo si no hay cookie.** La cookie es el registro de "ya elegí": la
 *    escribe este redirect y también el toggle. Con cookie presente, `/`
 *    sirve español y punto. Eso es lo que hace que volver a `/` a mano
 *    después de haber elegido gane sobre el `Accept-Language`, en vez de
 *    rebotar al inglés una y otra vez.
 */
export function proxy(request: NextRequest) {
  if (isLocale(request.cookies.get(LOCALE_COOKIE)?.value)) return NextResponse.next();

  const detected = matchAcceptLanguage(request.headers.get("accept-language")) ?? "es";
  if (detected === "es") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/en";
  const response = NextResponse.redirect(url, 307);
  response.cookies.set(LOCALE_COOKIE, "en", { path: "/", maxAge: YEAR, sameSite: "lax" });
  return response;
}

/**
 * Nada de negative lookaheads: el proxy corre en una única ruta. Si algún
 * día hay que negociar en otra, se suma acá explícitamente.
 */
export const config = {
  matcher: ["/"],
};
