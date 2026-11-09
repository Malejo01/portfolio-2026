/**
 * Qué plan preseleccionar en `/demo` a partir de `?plan=`. Función pura, sin
 * catálogo: la usa la isla `DemoForm` (que recibe las opciones y los alias
 * por props) y la cubre un test con los links viejos que ya circulan por
 * WhatsApp (`landing-profesional`, `combo-web-turnos`).
 *
 * - Un id conocido (o un alias de uno) → esa opción.
 * - Varios ids separados por coma (lo que arma el chat o el cotizador) →
 *   una opción extra con los nombres unidos por " + ".
 * - Nada reconocible → sin preselección.
 */
export interface OpcionPlan {
  id: string;
  name: string;
}

export function planDesdeUrl(
  param: string | null | undefined,
  opciones: readonly OpcionPlan[],
  aliases: Readonly<Record<string, string>> = {},
): { id: string; extra: OpcionPlan | null } | null {
  if (!param) return null;
  const ids = param
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => aliases[id] ?? id);
  if (!ids.length) return null;
  const conocidas = ids.map((id) => opciones.find((o) => o.id === id)).filter((o): o is OpcionPlan => Boolean(o));
  if (!conocidas.length) return null;
  if (conocidas.length === 1) return { id: conocidas[0].id, extra: null };
  const id = conocidas.map((o) => o.id).join(",");
  return { id, extra: { id, name: conocidas.map((o) => o.name).join(" + ") } };
}

/**
 * Campo trampa del formulario de `/demo` (S5): invisible para las personas,
 * fuera de la pantalla y sin foco. Un bot que lo completa recibe "listo" y
 * no se guarda nada. Vive acá porque un archivo `"use server"` solo puede
 * exportar funciones.
 */
export const CAMPO_TRAMPA = "sitio_web";
