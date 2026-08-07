import type { Locale } from "@/lib/types";

/**
 * Copy de las dos pantallas de fallo, separada del diccionario principal a
 * propósito.
 *
 * `error.tsx` es forzosamente un Client Component —React lo exige para un
 * error boundary— así que lo que importe termina en el bundle del cliente.
 * Importar `lib/content` ahí mandaría las dos traducciones completas del
 * sitio. Este módulo acota esa filtración a seis strings por idioma y
 * mantiene la invariante de que la copy no viaja al cliente.
 */
export interface ErrorsCopy {
  notFoundLabel: string;
  notFoundTitle: string;
  notFoundBody: string;
  errorLabel: string;
  errorTitle: string;
  errorBody: string;
  errorRetry: string;
  /** Duplica `nav.backToHome` porque el error boundary no puede leer el diccionario. */
  backToHome: string;
}

export const errors: Record<Locale, ErrorsCopy> = {
  es: {
    notFoundLabel: "Error 404",
    notFoundTitle: "Esta página no existe",
    notFoundBody:
      "El enlace puede estar mal escrito o apuntar a algo que ya no está acá. Los casos de estudio y el resto del sitio siguen donde estaban.",
    errorLabel: "Error",
    errorTitle: "Algo se rompió",
    errorBody:
      "Un error inesperado cortó el render de esta página. Podés reintentar; si vuelve a pasar, escribime y lo miro.",
    errorRetry: "Reintentar",
    backToHome: "Volver al inicio",
  },
  en: {
    notFoundLabel: "Error 404",
    notFoundTitle: "This page doesn't exist",
    notFoundBody:
      "The link may be mistyped, or point to something that isn't here anymore. The case studies and the rest of the site are where they were.",
    errorLabel: "Error",
    errorTitle: "Something broke",
    errorBody:
      "An unexpected error interrupted this page's render. You can retry; if it keeps happening, drop me a line and I'll look into it.",
    errorRetry: "Retry",
    backToHome: "Back to home",
  },
};
