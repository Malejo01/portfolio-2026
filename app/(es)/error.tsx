"use client";

import { useEffect } from "react";
import { StatusPage } from "@/components/layout/StatusPage";
import { ButtonLink, ButtonRow } from "@/components/ui/ButtonLink";
import { errors } from "@/lib/content/errors";
import { localized } from "@/lib/routes";

/**
 * React exige que un error boundary sea Client Component. Antes el idioma
 * se leía del `lang` de `<html>` con `useSyncExternalStore`, porque el
 * archivo era uno solo y servía a los dos idiomas.
 *
 * Ahora hay uno por árbol y el idioma es una constante del archivo, así que
 * esa maquinaria sobra. La copy sigue viniendo de `lib/content/errors` y no
 * del diccionario grande, para no mandar las dos traducciones completas al
 * bundle del cliente.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const copy = errors["es"];

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
        <ButtonLink href={localized("/", "es")} surface="paper">
          {copy.backToHome}
        </ButtonLink>
      </ButtonRow>
    </StatusPage>
  );
}
