import type { IconName } from "@/components/agencia/icons";
import { conocimiento, faqPorIds, type Proyecto } from "./conocimiento";
import { agendaGrandesHref } from "./grandes";
import { mantenimientoGrandesPct, recargoMercadoPago, vigencia } from "./pricing";

/**
 * Copy de la home de la agencia (tanda R2: home corta, auditoría §6.3).
 * Orden: hero → "¿Qué necesitás?" → cómo trabajo → quién te va a atender →
 * cierre. Los precios completos viven en `/precios` y en cada solución.
 *
 * Ningún precio está escrito a mano: los "Desde" salen del catálogo y los
 * montos de la seña de `SENA_MONTO` (se inyectan en el render). Las
 * baldosas salen de `servicios.ts` y los proyectos de `conocimiento.ts`.
 */

export interface HeroCard {
  icon: IconName;
  title: string;
  body: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

const pct = `${Math.round(recargoMercadoPago * 100)}%`;

/** El texto genérico de WhatsApp: el respaldo de todos los botones del chat. */
export const WHATSAPP_TEXTO = "Hola Mauro, vengo de malejo.com.ar y quiero contarte qué necesito.";

export const home = {
  hero: {
    label: "Mauro Lizárraga · Salta, Argentina",
    /** El H1 tecleado: dos líneas, palabra por palabra. `accent` = naranja. */
    lines: [
      [{ text: "Webs" }, { text: "y" }, { text: "apps" }],
      [{ text: "potenciadas" }, { text: "con" }, { text: "IA.", accent: true }],
    ] as { text: string; accent?: boolean }[][],
    ariaLabel: "Webs y apps potenciadas con IA.",
    lead: "Webs, sistemas y asistentes con IA para tu negocio. Listos en días, con precios publicados.",
    /** Abre el chat de Malejo; sin JS, WhatsApp con el texto genérico. */
    primary: "Contame qué necesitás",
    secondary: "Escribime por WhatsApp",
    cardsLabel: "Por qué es seguro",
    cards: [
      { icon: "check", title: "Precios publicados", body: "Sabés cuánto sale antes de hablar." },
      { icon: "check", title: "Ves tu demo antes de pagar el total", body: "Con tu marca, en 72 horas hábiles." },
      { icon: "check", title: "50% al aprobar, 50% al recibir", body: "La seña se descuenta del total." },
    ] satisfies HeroCard[],
  },

  needs: {
    label: "¿Qué necesitás?",
    title: "Elegí lo que le pasa a tu negocio",
    fromLabel: "Desde",
    ask: "Preguntale a Malejo",
    grandes: { label: "¿Algo más grande? Proyectos a medida →", href: "/servicios/grandes" },
    precios: { label: "Ver todos los precios →", href: "/precios" },
  },

  steps: {
    label: "Cómo trabajo",
    title: "Primero ves tu demo, después decidís",
    /** `{SENA}` = monto de `SENA_MONTO` formateado. */
    lead: "Ves tu demo antes de pagar el total. La seña de {SENA} se descuenta.",
    items: [
      { title: "Me contás", body: "Por el chat, por WhatsApp o en una charla gratis de 20 minutos." },
      { title: "Seña de {SENA}", body: "Se descuenta completa del total si contratás." },
      { title: "Demo en 72 h", body: "Con tu marca, en 72 horas hábiles." },
      { title: "La vemos juntos", body: "20 minutos por videollamada. Decidís sin compromiso." },
      { title: "50% y 50%", body: "50% al aprobar la demo y 50% al recibir tu proyecto." },
    ],
    stepLabel: "Paso",
    demo: { label: "Pedí tu demo →", href: "/demo" },
  },

  team: {
    label: "Quién te va a atender",
    title: "Soy Mauro, detrás de Malejo.",
    body: [
      "Fui profe de matemática en institutos terciarios: explico simple y sin vueltas.",
      "Trabajé en Accenture y hoy armo páginas, sistemas y asistentes para negocios de Salta y de toda Argentina.",
    ],
    photoAlt: "Mauro Lizárraga",
    spriteAlt: "Mauro en pixel art con las manos en los bolsillos",
    projectsTitle: "Proyectos propios que ya están funcionando",
    projects: ["quepintasalta", "tuki", "afiniajobs"] satisfies Proyecto["key"][],
    parecido: "Se parece a:",
    more: { label: "Ver más proyectos →", href: "/portfolio#casos" },
  },

  cta: {
    label: "Empecemos",
    title: "¿Lo charlamos?",
    lead: "Contame qué necesitás y te digo qué te conviene y cuánto sale.",
    primary: "Contame qué necesitás",
    whatsapp: "Escribime por WhatsApp",
    agenda: "Agendá una videollamada",
    faqLabel: "Preguntas frecuentes",
    faq: faqPorIds(["plazos", "pagos", "primer-anio"]) satisfies FaqItem[],
  },

  /** Catálogo completo: `/precios` (antes vivía en la home). */
  pricing: {
    metaTitle: "Precios de páginas web, turnos, tiendas y asistentes con IA",
    description: "Todos los precios publicados: páginas web, catálogos y tiendas, turnos online, sistemas, asistentes con IA, mantenimiento, combos y extras.",
    label: "Precios",
    title: "Todo con precio publicado",
    lead: "Elegí qué necesitás y sabés cuánto sale antes de hablar.",
    medioLabel: "Medio de pago",
    transferencia: "Transferencia",
    mp: "Mercado Pago",
    mpChip: `+${pct}`,
    tabsLabel: "Soluciones",
    selectLabel: "Elegí una solución",
    recommended: "Recomendado",
    planCta: "Lo quiero",
    monthlySuffix: " por mes (incluye que siga funcionando)",
    combosLabel: "Combos",
    combosTitle: "Juntá soluciones y ahorrá",
    saveLabel: "Ahorrás",
    comboCta: "Quiero este combo",
    extrasLabel: "Extras",
    otrasFormasLabel: "Otras formas de pago",
    legal: `Precios en pesos, vigentes hasta el ${vigencia}. Webs: el primer año online y 30 días de garantía incluidos. El total se paga 50% al aprobar la demo y 50% en la entrega; con Mercado Pago, hasta 6 cuotas. Tu dirección web, lo que cobra WhatsApp por cada mensaje automático y lo que cobra el servicio de inteligencia artificial van aparte.`,
    legalCta: { label: "¿No ves lo tuyo? Contame qué necesitás", href: "/cotizador" },
    /** Pestaña "Proyectos a medida": tres pasos en vez de planes. */
    grandes: {
      stepLabel: "Paso",
      free: "Sin cargo",
      maintenance: `Mantenimiento: ${Math.round(mantenimientoGrandesPct * 100)}% mensual del precio del proyecto, sin permanencia.`,
      cta: { label: "Agendá la charla gratis", href: agendaGrandesHref },
    },
  },

  seo: {
    priceRange: "$$",
    areaServed: "LATAM",
  },
} as const;

/** Los proyectos de "Quién te va a atender", en el orden de la home. */
export function proyectosDeLaHome(): Proyecto[] {
  return home.team.projects.map((k) => conocimiento.proyectos.find((p) => p.key === k)!).filter(Boolean);
}
