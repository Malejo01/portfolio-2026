"use client";

import { useEffect, useSyncExternalStore } from "react";
import { StatusPage } from "@/components/layout/StatusPage";
import { ButtonLink, ButtonRow } from "@/components/ui/ButtonLink";
import { errors } from "@/lib/content/errors";
import { DEFAULT_LOCALE, type Locale } from "@/lib/types";

/**
 * React exige que un error boundary sea Client Component, así que este
 * archivo no puede llamar a `getLocale()`: no hay `cookies()` en el
 * cliente.
 *
 * El idioma se lee del `lang` que el servidor ya escribió en <html>, que es
 * la misma fuente de verdad. Se lee con `useSyncExternalStore` y no con
 * `useState` + efecto, por el mismo motivo que ThemeProvider lee la clase
 * `dark`: el DOM ya tiene el valor y duplicarlo en estado de React solo
 * abre la puerta a que se desincronicen.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => observer.disconnect();
}

function getSnapshot(): Locale {
  const lang = document.documentElement.lang;
  return lang === "en" ? "en" : "es";
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const copy = errors[locale];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage label={copy.errorLabel} title={copy.errorTitle} body={copy.errorBody}>
      <ButtonRow>
        <button
          type="button"
          onClick={reset}
          className="hairline inline-flex cursor-pointer items-center rounded-chip border-accent bg-accent px-5 py-3 font-mono text-meta font-medium text-accent-ink transition-colors hover:border-accent-hover hover:bg-accent-hover"
        >
          {copy.errorRetry}
        </button>
        <ButtonLink href="/" surface="paper">
          {copy.backToHome}
        </ButtonLink>
      </ButtonRow>
    </StatusPage>
  );
}
