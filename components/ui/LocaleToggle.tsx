"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/types";

/**
 * El locale vive en una cookie que leen los Server Components, así que
 * cambiarlo es escribir la cookie y pedir un re-render del servidor.
 * No hay routing por idioma ni copy duplicada en el cliente.
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
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next: Locale = locale === "es" ? "en" : "es";

  const tone = onPanel
    ? "border-panel-hair text-panel-soft hover:text-panel-ink hover:border-panel-soft"
    : "border-hair text-ink-soft hover:text-ink hover:border-ink-soft";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={pending}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        startTransition(() => router.refresh());
      }}
      className={`hairline h-[30px] cursor-pointer rounded-chip bg-transparent px-2.5 font-mono text-meta tracking-[0.06em] uppercase transition-colors disabled:opacity-60 ${tone}`}
    >
      {/* El botón muestra el idioma al que lleva, no el actual. */}
      <span aria-hidden="true">{next.toUpperCase()}</span>
    </button>
  );
}
