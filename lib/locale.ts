import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/types";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "es" || value === "en";
}

/**
 * Elige el idioma a partir de `Accept-Language`. El desempate es por el
 * primer match, no por peso: la lista ya viene ordenada por preferencia.
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

/**
 * Cookie primero (es la elección explícita del usuario), después la
 * negociación del navegador. El middleware persiste la segunda, pero esta
 * función no depende de que haya corrido: en la primera request el header
 * sigue estando disponible.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const fromCookie = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const h = await headers();
  return matchAcceptLanguage(h.get("accept-language")) ?? DEFAULT_LOCALE;
}
