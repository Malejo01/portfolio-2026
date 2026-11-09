import type { CategoryKey } from "./pricing";
import { faqPorIds } from "./conocimiento";
import { home, type FaqItem, type ServiceCard } from "./home";

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
    grandes: {
      label: "Proyectos grandes",
      title: "¿Algo más grande que un plan?",
      body: "Marketplaces, apps a medida o sistemas complejos: consultoría sin cargo, diagnóstico escrito y desarrollo por sprints con demo.",
      cta: { label: "Ver cómo trabajo proyectos grandes →", href: "/servicios/grandes" },
    },
  },
  detail: {
    back: { label: "← Todos los servicios", href: "/servicios" },
    plansLabel: "Planes",
    plansTitle: "Elegí tu plan",
    /** En `/servicios/grandes` no hay planes: hay pasos. */
    stepsLabel: "Pasos",
    stepsTitle: "Así arrancamos",
    faqLabel: "Pagos",
    faqTitle: "Cómo se paga",
    cotizador: { label: "Sumar extras en el cotizador →", href: "/cotizador" },
  },
};

/** FAQ de pagos de cada página de servicio, desde la base de conocimiento. */
export const faqPagos: FaqItem[] = faqPorIds(["pagos", "cuotas", "sena", "primer-anio", "codigo", "cambios"]);

/**
 * Tarjeta de "Proyectos grandes": tiene página propia (`/servicios/grandes`)
 * pero no va en la grilla de 3×2 de la home, que es del diseño aprobado.
 */
export const grandesCard: ServiceCard = {
  category: "grandes",
  icon: "app",
  label: "A medida",
  title: "Proyectos grandes",
  description: "Para marketplaces, apps a medida o sistemas complejos: primero entendemos el proyecto, después lo construimos por etapas.",
  items: ["Consultoría inicial sin cargo", "Diagnóstico escrito", "Sprints con demo"],
  from: { basis: "impl", suffix: "" },
};

export function serviceCard(key: CategoryKey): ServiceCard | undefined {
  return home.services.cards.find((c) => c.category === key) ?? (key === "grandes" ? grandesCard : undefined);
}
