import type { CategoryKey } from "./pricing";
import { faqPorIds } from "./conocimiento";
import { home, type FaqItem } from "./home";

/**
 * Copy de `/servicios` y `/servicios/[slug]`. El slug de cada página es la
 * `key` de la categoría del catálogo (`/servicios/ia`), así no hay una
 * segunda tabla que se desincronice.
 */
export const servicios = {
  index: {
    title: "Servicios",
    metaTitle: "Servicios y precios",
    description: "Webs, catálogos y tiendas, turnos, sistemas de gestión, IA y mantenimiento. Todo con precio publicado.",
    label: "Servicios",
    heading: "Qué hago por tu negocio",
    lead: "Seis tipos de proyecto, todos con precio publicado. Entrá a cada uno para ver los planes y los combos.",
    cotizador: { label: "Armá tu cotización", href: "/cotizador" },
    demo: { label: "Pedí tu demo", href: "/demo" },
  },
  detail: {
    back: { label: "← Todos los servicios", href: "/servicios" },
    plansLabel: "Planes",
    plansTitle: "Elegí tu plan",
    faqLabel: "Pagos",
    faqTitle: "Cómo se paga",
    cotizador: { label: "Sumar extras en el cotizador →", href: "/cotizador" },
  },
};

/** FAQ de pagos de cada página de servicio, desde la base de conocimiento. */
export const faqPagos: FaqItem[] = faqPorIds(["pagos", "cuotas", "sena", "primer-anio", "codigo", "cambios"]);

export function serviceCard(key: CategoryKey) {
  return home.services.cards.find((c) => c.category === key);
}
