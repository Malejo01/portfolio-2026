/**
 * Copy de `/soluciones`, el armador (tanda P2, D1–D6). `/precios` y
 * `/cotizador` se fusionaron acá. Los precios nunca se escriben a mano:
 * salen de `lib/agencia/pricing.ts` (`estimarArmado`, `lineaDePagos`,
 * `senaPara`). `{X}`, `{Y}`, `{N}` y `{MONTO}` se reemplazan en el render.
 */
export const solucionesCopy = {
  metaTitle: "Soluciones y precios: webs, sistemas y asistentes con IA",
  description:
    "Armá lo que necesita tu negocio: páginas web, tiendas, turnos, sistemas y asistentes con IA, con precios publicados y un estimado al instante. El precio final lo cerramos en una charla.",
  breadcrumb: { inicio: "Inicio", soluciones: "Soluciones" },

  /** Encabezado con los dos caminos (D6). */
  label: "Soluciones",
  title: "Armá lo que necesita tu negocio",
  lead: "Elegí lo que te sirve y mirá un estimado. El precio final lo cerramos en una charla.",
  yaSe: "Ya sé lo que quiero",
  ayudame: "Ayudame a elegir",
  /** Primer mensaje del chat al tocar "Ayudame a elegir". */
  ayudameTema: "Ayudame a elegir qué armar para mi negocio",

  /** Catálogo. */
  catalogoLabel: "Catálogo",
  tabsLabel: "Categorías",
  /** "Estás viendo: Turnos y reservas". `{CAT}` = la categoría. */
  viendo: "Estás viendo: {CAT}",
  /** `{N}` = cuántos ítems de esa categoría hay en el armado. */
  enArmado: "{N} en tu armado",
  /** Carrusel de celular: "Plan 2 de 3". */
  carrusel: { anterior: "Plan anterior", siguiente: "Plan siguiente", punto: "Plan {N} de {T}", combos: "Combos de esta categoría" },
} as const;

export type SolucionesCopy = typeof solucionesCopy;
