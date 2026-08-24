import { LOCALES, type Locale } from "@/lib/types";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "es" || value === "en";
}

/**
 * Elige el idioma a partir de `Accept-Language`. El desempate es por el
 * primer match, no por peso: la lista ya viene ordenada por preferencia.
 *
 * Lo usa `proxy.ts` y nadie más. Ya no existe un `getLocale()` que lea
 * `cookies()`: el idioma se resuelve por ruta, y esa es la diferencia entre
 * las tres páginas del sitio siendo estáticas o dinámicas.
 */
export function matchAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase();
    if (!tag) continue;
    const base = tag.split("-")[0];
    if (LOCALES.includes(base as Locale)) return base as Locale;
  }
  return null;
}
