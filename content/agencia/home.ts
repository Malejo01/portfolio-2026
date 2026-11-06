import type { IconName } from "@/components/agencia/icons";
import { agenciaLinks } from "./links";
import { getPlan, recargoMercadoPago, vigencia, type CategoryKey } from "./pricing";

/**
 * Copy de la home de la agencia. Textos exactos de
 * `docs/agencia/referencia.html`; donde la referencia no los trae (respuestas
 * 2 a 6 del FAQ) están armados con datos del catálogo y anotados en
 * "Decisiones para Mauro".
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
const renovacion = getPlan("renovacion")?.impl ?? 0;
const basico = getPlan("mantenimiento-basico")?.monthly ?? 0;
const ars = (n: number) => `$${new Intl.NumberFormat("es-AR").format(n)}`;

export const home = {
  hero: {
    label: "AI Developer · Argentina y LATAM",
    /** El H1 tecleado: dos líneas, palabra por palabra. `accent` = naranja. */
    lines: [
      [{ text: "Webs" }, { text: "y" }, { text: "apps" }],
      [{ text: "potenciadas" }, { text: "con" }, { text: "IA.", accent: true }],
    ] as { text: string; accent?: boolean }[][],
    ariaLabel: "Webs y apps potenciadas con IA.",
    lead: "Webs, micro-apps y asistentes con IA para tu negocio. Listos en días, con precios publicados.",
    primary: { label: "Pedí tu demo", href: "/demo" },
    secondary: { label: "Ver servicios", href: "#servicios" },
    cards: [
      { icon: "web", label: "Web", title: "Webs que venden", body: "Landing pages y sitios rápidos para tu negocio." },
      { icon: "app", label: "Apps", title: "Apps a tu medida", body: "Turnos, reservas y paneles fáciles de usar." },
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
        description: "Landings y sitios rápidos, con SEO local y botón de WhatsApp.",
        items: ["Lista en 3 a 10 días", "12 meses de hosting incluidos", "El código es tuyo"],
        from: { basis: "impl", suffix: "" },
      },
      {
        category: "tiendas",
        icon: "cart",
        label: "Ventas",
        title: "Catálogos y tiendas",
        description: "Menú QR, catálogo con pedidos por WhatsApp o tienda con Mercado Pago.",
        items: ["Sin comisiones por venta", "Cambiás precios en segundos", "Panel para cargar productos"],
        from: { basis: "impl", suffix: "" },
      },
      {
        category: "turnos",
        icon: "calendar",
        label: "Agenda",
        title: "Turnos y reservas",
        description: "Tus clientes reservan solos y te llega todo ordenado.",
        items: ["Recordatorios automáticos", "Seña con Mercado Pago", "Panel de horarios"],
        from: { basis: "impl", suffix: " + abono" },
      },
      {
        category: "gestion",
        icon: "box",
        label: "Gestión",
        title: "Sistemas para el día a día",
        description: "Stock, pedidos y clientes sin planillas sueltas.",
        items: ["Stock con QR", "Pedidos y clientes", "Tablero de ventas"],
        from: { basis: "impl", suffix: " + abono" },
      },
      {
        category: "ia",
        icon: "ia",
        label: "IA",
        title: "IA que atiende por vos",
        description: "Asistentes en tu web o WhatsApp y automatizaciones que ahorran horas.",
        items: ["Responde las 24 horas", "Cita fuentes reales", "Te pasa los contactos"],
        from: { basis: "impl", suffix: "" },
      },
      {
        category: "mant",
        icon: "wrench",
        label: "Soporte",
        title: "Mantenimiento",
        description: "Hosting, backups y cambios incluidos para que no te preocupes.",
        items: ["Respuesta en 24 a 48 h", "Cambios menores incluidos", "Reporte mensual (Pro)"],
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
      { label: "Paso 1", title: "Contame tu idea", body: "Completás un brief corto o agendás un diagnóstico gratis de 20 minutos." },
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
    monthlySuffix: "/mes de servicio",
    combosLabel: "Combos",
    combosTitle: "Juntá servicios y ahorrá",
    saveLabel: "Ahorrás",
    comboCta: "Quiero este combo",
    extrasLabel: "Extras",
    legal: `Precios en pesos, vigentes hasta el ${vigencia}. Webs: 12 meses de hosting y 30 días de garantía incluidos. Proyectos desde $450.000: 3 pagos sin recargo por transferencia. Los costos de Meta (WhatsApp) y del modelo de IA van aparte.`,
    legalCta: { label: "¿No ves lo tuyo? Pedí una cotización", href: "/cotizador" },
  },

  projects: {
    label: "Proyectos",
    title: "Lo que ya está andando",
    lead: "Productos propios y trabajos para clientes.",
    all: { label: "Ver todo en el portfolio →", href: "/portfolio#casos" },
    featured: {
      key: "afiniajobs",
      name: "AfinIA Jobs",
      label: "Producto propio · beta",
      description: "Lee cada aviso contra tu perfil y te dice qué tan afín es y qué te falta.",
      tags: ["Next.js", "IA", "PostgreSQL"],
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
      label: "Producto propio · en desarrollo",
      description:
        "El docente sube su programa y la IA arma evaluaciones alineadas. Cuando el alumno se equivoca, primero diagnostica el error y después da la respuesta.",
      tags: ["Next.js", "IA", "Neon", "EdTech"],
      href: agenciaLinks.maestria,
      alt: "MaestrIA: inicio para practicar con cuestionarios generados con IA",
    } satisfies Project,
    wideCta: "Ver MaestrIA",
    openLabel: "Abrir",
  },

  about: {
    label: "Quién está detrás",
    title: "De profe de matemática a AI Developer.",
    body: "Soy Mauro Lizárraga. Durante años expliqué matemática en institutos terciarios; hoy uso ese mismo oficio para que la tecnología se entienda y funcione para tu negocio.",
    story: [
      "Desde 2023 doy clases de matemática a nivel terciario, donde también fui formador y evaluador docente.",
      "En 2025 trabajé como desarrollador full-stack en Accenture, en plataformas internas y chatbots con IA. Hoy construyo mis propios productos: Qué Pinta Salta, AfinIA Jobs, Tuki y MaestrIA.",
      "Me formé en IA aplicada con DataCamp y Anthropic Academy. Mi forma de trabajar: entender primero, explicar claro y entregar rápido.",
    ],
    more: "Leer la historia completa",
    less: "Ver menos",
    photo: "Foto profesional",
    spriteAlt: "Mauro en pixel art con las manos en los bolsillos",
  },

  faq: {
    label: "Preguntas",
    title: "Lo que más me preguntan",
    items: [
      {
        q: "¿Cuánto tarda mi web?",
        a: "Una landing está lista en 3 a 10 días hábiles según el paquete; un sitio de hasta 5 páginas, en unas 2 semanas. El plazo corre desde que recibo tu material.",
      },
      {
        q: "¿Qué es un cambio menor y qué un cambio mayor?",
        a: "Un cambio menor lleva hasta 30 minutos y no toca la estructura: un texto, una foto, un precio o un horario. Un cambio mayor —una sección nueva, una funcionalidad o un rediseño— se cotiza por escrito antes de hacerlo. Fuera de plan, cada 30 minutos cuestan $10.000.",
      },
      {
        q: "¿Cómo pago?",
        a: `Por transferencia, al precio publicado, o con Mercado Pago con un ${pct} de recargo. Los proyectos desde $450.000 se pueden pagar en 3 pagos sin recargo por transferencia, y los sistemas desde $900.000, por hitos (40/30/30).`,
      },
      {
        q: "¿Qué pasa después del primer año?",
        a: `Las webs incluyen 12 meses de hosting. Desde el mes 13 elegís: la renovación de ${ars(renovacion)} al año (hosting, SSL, backups y dominio) o un plan de mantenimiento desde ${ars(basico)} por mes, con cambios incluidos.`,
      },
      {
        q: "¿De quién es el código?",
        a: "Tuyo. Una vez pagado el total, el código y los accesos son tuyos: si algún día querés llevarte el sitio a otro lado, te lo llevás entero.",
      },
      {
        q: "¿Qué hace el asistente Malejo?",
        a: "Es el asistente de este sitio: te cotiza con los precios publicados, te arma el pedido de demo y, si vos querés, le pasa tu contacto a Mauro. Lo supervisa Mauro y no guarda tu conversación.",
      },
    ] satisfies FaqItem[],
  },

  cta: {
    label: "Empecemos",
    title: "¿Lo charlamos?",
    lead: "Contame qué necesitás y en 24 h te paso una propuesta con precio y plazo.",
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
