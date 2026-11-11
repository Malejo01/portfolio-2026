import { bajaMantenimiento, calendarioTres, conocimiento, faqPorIds, type Proyecto } from "./conocimiento";
import { agendaGrandesHref } from "./grandes";
import { mantenimientoGrandesPct, recargoMercadoPago, vigencia } from "./pricing";

/**
 * Copy de la home de la agencia (tanda R2: home corta, auditoría §6.3; tanda
 * P1: `docs/agencia/precios-psicologia-2026-11-10.md` §4.1).
 * Orden: hero → "¿Qué necesitás?" → cómo trabajo → quién te va a atender →
 * cierre. Los precios completos viven en `/precios` y en cada solución.
 *
 * Ningún precio está escrito a mano: los "Desde" salen del catálogo y los
 * montos de la seña de `SENA_MONTO` (se inyectan en el render). Las
 * baldosas salen de `servicios.ts` y los proyectos de `conocimiento.ts`.
 * `{SENA}`, `{TOPE}`, `{PCT}` y `{CUOTAS}` se reemplazan en el render
 * (`completarPagos` de `components/agencia/pagos.ts`).
 */

export interface FaqItem {
  q: string;
  a: string;
}

const pct = `${Math.round(recargoMercadoPago * 100)}%`;

/** El texto genérico de WhatsApp: el respaldo de todos los botones del chat. */
export const WHATSAPP_TEXTO = "Hola Mauro, vengo de malejo.com.ar y quiero contarte qué necesito.";

/**
 * Formas de pago (§2): el modal "Formas de pago" de `/precios` y de cada
 * solución, y la franja de `/servicios/[slug]`. Una sola copy.
 */
const pagos = {
  title: "Formas de pago",
  /** La franja de las soluciones: "2 pagos · 3 pagos sin interés · tarjeta hasta 6 cuotas". */
  franja: ["2 pagos", "3 pagos sin interés", "tarjeta hasta {CUOTAS} cuotas"],
  verDetalle: "Ver detalle",
  opciones: [
    { title: "2 pagos sin interés", body: "Por transferencia: 50% al aprobar la demo y 50% al entregar." },
    {
      title: "3 pagos sin interés",
      body: `Por transferencia: ${calendarioTres}. Si el total es de hasta {TOPE}.`,
    },
    { title: "Tarjeta con Mercado Pago", body: "Precio +{PCT}, hasta {CUOTAS} cuotas. El interés de las cuotas lo pone Mercado Pago." },
  ],
  notas: [
    "La seña de {SENA} se descuenta del primer pago.",
    "El código y tu dirección web pasan a tu nombre con el último pago. La página está online desde la entrega.",
  ],
};

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
    /** §4.1: las tres garantías pasan a una fila de chips de 3 o 4 palabras. */
    chipsLabel: "Por qué es seguro",
    chips: ["Precios publicados", "Demo antes de pagar", "3 pagos sin interés"],
  },

  needs: {
    label: "¿Qué necesitás?",
    title: "Elegí lo que necesita tu negocio",
    fromLabel: "Desde",
    porMes: " por mes",
    ask: "Preguntale a Malejo",
    grandes: { label: "¿Algo más grande? Proyectos a medida →", href: "/servicios/grandes" },
    precios: { label: "Ver todos los precios", href: "/precios" },
  },

  steps: {
    label: "Cómo trabajo",
    title: "Primero ves tu demo, después decidís",
    items: [
      { title: "Me contás", body: "Por el chat, por WhatsApp o en una charla gratis." },
      { title: "Ves tu demo en 72 h", body: "Con tu marca. Decidís sin compromiso." },
      { title: "Pagás en 2 o 3 veces", body: "Sin interés, por transferencia." },
    ],
    stepLabel: "Paso",
    demo: { label: "Pedí tu demo →", href: "/demo" },
    /** Modal "¿Cómo funciona la seña?" (§4.1). */
    sena: {
      trigger: "¿Cómo funciona la seña?",
      title: "¿Cómo funciona la seña?",
      items: [
        "Para armar tu demo con tu marca se paga una seña de {SENA}.",
        "En 72 horas hábiles la vemos juntos, en 20 minutos, y decidís sin compromiso.",
        "Si contratás, la seña se descuenta completa del primer pago.",
        "Si no, la seña no se devuelve: pagó el trabajo de la demo.",
      ],
    },
  },

  team: {
    label: "Quién te va a atender",
    title: "Soy Mauro, detrás de Malejo.",
    /** §4.1: dos líneas, sin párrafo. */
    body: "Profe de matemática y desarrollador: explico simple y armo lo que tu negocio necesita.",
    photoAlt: "Mauro Lizárraga",
    spriteAlt: "Mauro en pixel art con las manos en los bolsillos",
    projectsTitle: "Proyectos propios que ya están funcionando",
    projects: ["quepintasalta", "tuki", "afiniajobs"] satisfies Proyecto["key"][],
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
    /** El selector de medio de pago salió de `/precios` (D6); queda en el cotizador. */
    medioLabel: "Medio de pago",
    transferencia: "Transferencia",
    mp: "Mercado Pago",
    mpChip: `+${pct}`,
    tabsLabel: "Soluciones",
    /** Fase 3 bis A: "Estás viendo: Turnos y reservas". `{CAT}` = la categoría. */
    viendo: "Estás viendo: {CAT}",
    masSobre: "Más sobre esta solución →",
    recommended: "Recomendado",
    planCta: "Lo quiero",
    /** Fase 3 bis D: todo lo que se paga por mes "incluye soporte funcional". */
    monthlySuffix: " por mes (incluye soporte funcional)",
    verIncluye: "Ver qué incluye",
    verTrae: "Ver qué trae",
    /** `{N}` = cuántas opciones quedan. */
    otras: "Ver otras opciones ({N})",
    combosLabel: "Combos",
    combosTitle: "Juntá soluciones y ahorrá",
    porSeparado: "Por separado",
    saveLabel: "Ahorrás",
    comboCta: "Quiero este combo",
    extras: {
      trigger: "Sumale extras",
      title: "Sumale extras",
      lead: "Se suman a cualquier plan. Armá la cuenta completa en el cotizador.",
      cotizador: { label: "Ir al cotizador →", href: "/cotizador" },
    },
    /** Letra chica en una línea + el modal "Condiciones" (§4.3). */
    legal: `Precios en pesos, por transferencia, vigentes hasta el ${vigencia}.`,
    condiciones: {
      trigger: "Ver condiciones",
      title: "Condiciones",
      items: [
        `Precios en pesos argentinos, por transferencia, vigentes hasta el ${vigencia}.`,
        "Webs: el primer año online y 30 días de garantía incluidos.",
        "Tu dirección web va aparte (la tarifa de NIC.ar).",
        "En los planes con inteligencia artificial o WhatsApp, lo que se gasta por uso va aparte: lo cobran esas empresas.",
        `Lo que pagás por mes incluye soporte funcional, y ${bajaMantenimiento}.`,
      ],
    },
    legalCta: { label: "¿No ves lo tuyo? Contame qué necesitás", href: "/cotizador" },
    /** Modal de cada plan (§5), en este orden. */
    modal: {
      plazo: "Plazo",
      incluye: "Qué incluye",
      noIncluye: "Qué no incluye",
      trae: "Qué trae",
      despues: "Después del primer año",
      /** Para las categorías que no son webs: la nota de la categoría. */
      nota: "A tener en cuenta",
      alt: "Otra forma de pago",
      /** "o 2 pagos de $X · o tarjeta hasta 6 cuotas". */
      otrasFormas: "o {N} pagos de {MONTO} · o tarjeta hasta {CUOTAS} cuotas",
      ask: "Preguntale a Malejo",
      /** Primer mensaje del chat desde un plan: `{PLAN}` = el nombre. */
      tema: "Quiero saber más de {PLAN}",
      cerrar: "Cerrar",
    },
    pagos,
    /** Pestaña "Proyectos a medida": tres pasos en vez de planes. */
    grandes: {
      stepLabel: "Paso",
      free: "Sin cargo",
      maintenance: `Mantenimiento: ${Math.round(mantenimientoGrandesPct * 100)}% mensual del precio del proyecto; ${bajaMantenimiento}.`,
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
