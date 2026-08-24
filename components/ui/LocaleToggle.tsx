"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TAP_TARGET_44 } from "@/components/ui/ThemeToggle";
import { swapLocale } from "@/lib/routes";
import { LOCALE_COOKIE, type Locale } from "@/lib/types";

/**
 * Cambiar de idioma es navegar, no escribir una cookie y re-renderizar. Cada
 * idioma tiene su URL, así que esto es un enlace de verdad: se puede abrir
 * en otra pestaña, copiar, y un buscador lo sigue.
 *
 * `swapLocale` preserva la ruta —de `/casos/maestria` a
 * `/en/casos/maestria`, no al home— y por eso hace falta `usePathname`.
 * Es un hook de cliente y no toca el render del servidor, así que no
 * compromete el prerender de la página.
 *
 * La cookie sigue existiendo, con un rol mucho más chico: es el registro de
 * "ya elegí". `proxy.ts` solo redirige `/` por `Accept-Language` cuando no
 * hay ninguna, así que dejarla acá es lo que hace que volver a `/` a mano
 * después de haber elegido no rebote al inglés.
 */
export function LocaleToggle({
  locale,
  ariaLabel,
  onPanel = false,
}: {
  locale: Locale;
  ariaLabel: string;
  onPanel?: boolean;
}) {
  const pathname = usePathname();
  const next: Locale = locale === "es" ? "en" : "es";
  const href = swapLocale(pathname, next);

  const tone = onPanel
    ? "border-panel-hair text-panel-soft hover:text-panel-ink hover:border-panel-soft"
    : "border-hair text-ink-soft hover:text-ink hover:border-ink-soft";

  return (
    <Link
      href={href}
      hrefLang={next}
      aria-label={ariaLabel}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={`hairline inline-flex h-[30px] items-center rounded-chip bg-transparent px-2.5 font-mono text-meta tracking-[0.06em] uppercase no-underline transition-colors hover:no-underline ${TAP_TARGET_44} ${tone}`}
    >
      {/* El botón muestra el idioma al que lleva, no el actual. */}
      <span aria-hidden="true">{next.toUpperCase()}</span>
    </Link>
  );
}
