import { useSyncExternalStore } from "react";
import { dibujoActual, estiloActual, suscribirEstilo } from "@/lib/agencia/estilo";

/**
 * El estilo y el dibujo activos (tanda P3-1), leídos de `<html>` como el
 * tema: `data-estilo` y `data-dibujo` los escribe el script inline. El HTML
 * del servidor asume el original (Tech/IA, 16-bit).
 */
export function useEstilo(): { estilo: string; dibujo: string } {
  const estilo = useSyncExternalStore(suscribirEstilo, estiloActual, () => "tech");
  const dibujo = useSyncExternalStore(suscribirEstilo, dibujoActual, () => "16bit");
  return { estilo, dibujo };
}
