/**
 * Modo del chat según la página (tanda P2, Fase 5): en `/soluciones` Malejo
 * es asesor del **armado** (sugiere con `sugerir_armado`, habla del
 * estimado y cierra con "Mandale tu armado a Mauro"). Pura y sin imports:
 * la usan la ruta (vía `pagina.ts`) y el widget, para elegir las opciones de
 * la bienvenida (Fase 5 bis).
 */
export function modoDePagina(path: string | undefined | null): "armado" | null {
  if (!path) return null;
  return (path.replace(/\/+$/, "") || "/") === "/soluciones" ? "armado" : null;
}
