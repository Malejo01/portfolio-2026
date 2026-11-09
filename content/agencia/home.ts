import type { IconName } from "@/components/agencia/icons";
import { agenciaLinks } from "./links";
import { faqPorIds } from "./conocimiento";
import { agendaGrandesHref } from "./grandes";
import { mantenimientoGrandesPct, recargoMercadoPago, vigencia, type CategoryKey } from "./pricing";

/**
 * Copy de la home de la agencia. Textos exactos de
 * `docs/agencia/referencia.html`. El FAQ sale de `conocimiento.ts`, la misma
 * base que usa el chat de Malejo (tanda CHAT-R1).
 *
 * Ningún precio está escrito a mano: los "Desde" de servicios salen del
 * catálogo y los montos de la seña de `SENA_MONTO` (se inyectan en el render).
 */

export interface ServiceCard {
  category: CategoryKey;
  icon: IconName;
  label: string;
  title: string;
  description: string;
  items: string[];
  /** Qué precio del catálogo es el "Desde": la menor implementación o el menor abono. */
  from: { basis: "impl" | "monthly"; suffix: string };
}

export interface HeroCard {
  icon: IconName;
  label: string;
  title: string;
  body: string;
}

export interface Project {
  key: "afiniajobs" | "quepintasalta" | "tuki" | "maestria";
  name: string;
  label: string;
  description: string;
  tags: string[];
  href: string;
  alt: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

const pct = `${Math.round(recargoMercadoPago * 100)}%`;

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
    primary: { label: "Pedí tu demo", href: "/demo" },
    secondary: { label: "Ver servicios", href: "#servicios" },
    cards: [
      { icon: "web", label: "Web", title: "Webs que venden", body: "Una página para que te encuentren en Google y te escriban por WhatsApp." },
      { icon: "app", label: "Apps", title: "Apps a tu medida", body: "Tus clientes sacan turno solos y vos ves la agenda en el celular." },
      { icon: "ia", label: "IA", title: "IA que atiende por vos", body: "Asistentes que responden las 24 horas." },
    ] satisfies HeroCard[],
  },

  services: {
    label: "Servicios",
    title: "Qué hago por tu negocio",
    fromLabel: "Desde",
    cta: "Ver precios",
    cards: [
      {
        category: "webs",
        icon: "web",
        label: "Web",
        title: "Webs que venden",
        description: "Tu página web, preparada para aparecer en Google cuando buscan tu rubro en tu ciudad, con botón de WhatsApp.",
        items: ["Lista en 3 a 10 días", "El primer año online incluido, sin pagar nada más", "El código es tuyo"],
        from: { basis: "impl", suffix: "" },
      },
      {
        category: "tiendas",
        icon: "cart",
        label: "Ventas",
        title: "Catálogos y tiendas",
        description: "Mostrá tus productos con precio y recibí los pedidos armados por WhatsApp, o cobrá online.",
        items: ["Sin comisiones por venta", "Cambiás precios en segundos", "Cargás y cambiás productos vos, desde el celular"],
        from: { basis: "impl", suffix: "" },
      },
      {
        category: "turnos",
        icon: "calendar",
        label: "Agenda",
        title: "Turnos y reservas",
        description: "Tus clientes reservan solos y te llega todo ordenado.",
        items: ["Recordatorios automáticos", "Seña con Mercado Pago", "Ves y cambiás tus horarios desde el celular"],
        from: { basis: "impl", suffix: " + cuota mensual" },
      },
      {
        category: "gestion",
        icon: "box",
        label: "Gestión",
        title: "Sistemas para el día a día",
        description: "Stock, pedidos y clientes sin planillas sueltas.",
        items: ["Control de mercadería escaneando con el celular", "Pedidos y clientes en orden", "Tus ventas del mes en una sola pantalla"],
        from: { basis: "impl", suffix: " + cuota mensual" },
      },
      {
        category: "ia",
        icon: "ia",
        label: "IA",
        title: "IA que atiende por vos",
        description: "Asistentes en tu web o WhatsApp y automatizaciones que ahorran horas.",
        items: ["Responde las 24 horas", "Responde solo con la información de tu negocio, no inventa", "Te pasa los contactos"],
        from: { basis: "impl", suffix: "" },
      },
      {
        category: "mant",
        icon: "wrench",
        label: "Soporte",
        title: "Mantenimiento",
        description: "Tu página siempre funcionando, con copia de seguridad y alguien que te hace los cambios.",
        items: ["Respuesta en 24 a 48 h", "Cambios chicos incluidos", "Informe mensual de visitas y consultas"],
        from: { basis: "monthly", suffix: "/mes" },
      },
    ] satisfies ServiceCard[],
  },

  steps: {
    label: "Cómo trabajo",
    title: "Primero ves tu demo, después decidís",
    /** `{SENA}` = monto de `SENA_MONTO` formateado. */
    lead: "Te armo una demo de tu web antes de que pagues el total. Solo una seña de {SENA}.",
    items: [
      { label: "Paso 1", title: "Contame tu idea", body: "Completás un formulario corto o agendás una charla gratis de 20 minutos." },
      { label: "Paso 2", title: "Seña de {SENA}", body: "Se descuenta completa del total si contratás." },
      { label: "Paso 3", title: "Demo en 72 h", body: "Te armo una demo con tu marca en 72 horas hábiles." },
      { label: "Paso 4", title: "Videollamada", body: "La vemos juntos en 20 minutos y decidís sin compromiso." },
    ],
  },

  pricing: {
    label: "Precios",
    title: "Todo con precio publicado",
    lead: "Elegí qué necesitás y sabés cuánto sale antes de hablar.",
    medioLabel: "Medio de pago",
    transferencia: "Transferencia",
    mp: "Mercado Pago",
    mpChip: `+${pct}`,
    tabsLabel: "Categorías de servicios",
    recommended: "Recomendado",
    planCta: "Lo quiero",
    monthlySuffix: " por mes (incluye que siga funcionando)",
    combosLabel: "Combos",
    combosTitle: "Juntá servicios y ahorrá",
    saveLabel: "Ahorrás",
    comboCta: "Quiero este combo",
    extrasLabel: "Extras",
    legal: `Precios en pesos, vigentes hasta el ${vigencia}. Webs: el primer año online y 30 días de garantía incluidos. El total se paga 50% al aprobar la demo y 50% en la entrega; con Mercado Pago, hasta 6 cuotas. Tu dirección web, lo que cobra WhatsApp por cada mensaje automático y lo que cobra el servicio de inteligencia artificial van aparte.`,
    legalCta: { label: "¿No ves lo tuyo? Pedí una cotización", href: "/cotizador" },
    /** Pestaña "Proyectos grandes": tres pasos en vez de planes. */
    grandes: {
      stepLabel: "Paso",
      free: "Sin cargo",
      maintenance: `Mantenimiento: ${Math.round(mantenimientoGrandesPct * 100)}% mensual del precio del proyecto, sin permanencia.`,
      cta: { label: "Agendá la charla gratis", href: agendaGrandesHref },
    },
  },

  projects: {
    label: "Proyectos",
    title: "Lo que ya está andando",
    lead: "Proyectos propios que ya están funcionando.",
    all: { label: "Ver todo en el portfolio →", href: "/portfolio#casos" },
    featured: {
      key: "afiniajobs",
      name: "AfinIA Jobs",
      label: "Proyecto propio · en prueba",
      description: "Lee cada aviso contra tu perfil y te dice qué tan afín es y qué te falta.",
      tags: ["Empleo", "Ordena avisos solo"],
      href: agenciaLinks.afinia,
      alt: "AfinIA Jobs: portada con ofertas de empleo puntuadas según el perfil",
    } satisfies Project,
    featuredCta: "Abrir AfinIA Jobs",
    side: [
      {
        key: "quepintasalta",
        name: "Qué Pinta Salta",
        label: "Web + app",
        description: "La agenda cultural de Salta, cargada sola con IA desde varias fuentes.",
        tags: [],
        href: agenciaLinks.qps,
        alt: "Qué Pinta Salta: carrusel de eventos y agenda del día",
      },
      {
        key: "tuki",
        name: "Tuki",
        label: "Web + app",
        description: "Asistente de trámites que responde con fuentes oficiales. Concebido en NOA Innova 2026.",
        tags: [],
        href: agenciaLinks.tuki,
        alt: "Tuki: consulta sobre la licencia de conducir y respuesta con fuentes oficiales",
      },
    ] satisfies Project[],
    wide: {
      key: "maestria",
      name: "MaestrIA",
      label: "Proyecto propio · en construcción",
      description:
        "El docente sube su programa y la IA arma evaluaciones alineadas. Cuando el alumno se equivoca, primero diagnostica el error y después da la respuesta.",
      tags: ["Educación", "Arma evaluaciones"],
      href: agenciaLinks.maestria,
      alt: "MaestrIA: inicio para practicar con cuestionarios generados con IA",
    } satisfies Project,
    wideCta: "Ver MaestrIA",
    openLabel: "Abrir",
  },

  about: {
    label: "Quién está detrás",
    title: "De profe de matemática a desarrollador: explico simple y entrego rápido.",
    body: "Soy Mauro Lizárraga. Durante años expliqué matemática en institutos terciarios; hoy uso ese mismo oficio para que la tecnología se entienda y funcione para tu negocio.",
    story: [
      "Desde 2023 doy clases de matemática a nivel terciario, donde también fui formador y evaluador docente.",
      "En 2025 trabajé como desarrollador en Accenture, armando sistemas internos y asistentes con IA para una multinacional. Hoy construyo mis propios productos: Qué Pinta Salta, AfinIA Jobs, Tuki y MaestrIA.",
      "Me formé en IA aplicada con DataCamp y Anthropic Academy. Mi forma de trabajar: entender primero, explicar claro y entregar rápido.",
    ],
    more: "Leer la historia completa",
    less: "Ver menos",
    spriteAlt: "Mauro en pixel art con las manos en los bolsillos",
  },

  faq: {
    label: "Preguntas",
    title: "Lo que más me preguntan",
    /** Las respuestas viven en `conocimiento.ts`: la misma fuente que usa el chat. */
    items: faqPorIds(["plazos", "cambios", "pagos", "primer-anio", "codigo", "malejo"]) satisfies FaqItem[],
  },

  cta: {
    label: "Empecemos",
    title: "¿Lo charlamos?",
    lead: "Contame qué necesitás y en hasta 2 días hábiles te paso una propuesta con precio y plazo.",
    whatsapp: "Escribime por WhatsApp",
    whatsappText: "Hola Mauro, vengo de malejo.com.ar y quiero contarte qué necesito.",
    agenda: "Agendá una videollamada",
    hint: "O preguntale a Malejo, abajo a la derecha.",
  },

  seo: {
    priceRange: "$$",
    areaServed: "LATAM",
  },
} as const;
