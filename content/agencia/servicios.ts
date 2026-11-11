import type { IconName } from "@/components/agencia/icons";
import type { Proyecto } from "./conocimiento";
import type { CategoryKey } from "./pricing";

/**
 * Copy de las soluciones: la baldosa de "¿Qué necesitás?" (home y
 * `/servicios`) y la página `/servicios/[slug]`. El slug es la `key` de la
 * categoría del catálogo (`/servicios/ia`), así no hay una segunda tabla que
 * se desincronice. Los slugs no cambian aunque cambien los títulos (R2).
 *
 * Plantilla de cada solución (tanda P1, §4.2 de
 * `docs/agencia/precios-psicologia-2026-11-10.md`): H1 con el problema y
 * para quién es → 3 beneficios en chips → las 3 tarjetas en escalera →
 * "¿Cuál me conviene?" → otras opciones → el combo de la solución → un
 * proyecto parecido → franjas de pagos y de costos → FAQ de 3 → cierre.
 */
export interface Solucion {
  category: CategoryKey;
  icon: IconName;
  /** Etiqueta mono corta. */
  label: string;
  /** Baldosa de la home: el problema, como lo diría el cliente. */
  problema: string;
  /** H1 de la página. */
  title: string;
  /** Una línea: baldosa y bajada de la página. */
  description: string;
  paraQuien: string;
  /** `<title>` por problema (SEO, auditoría P2-3). */
  metaTitle: string;
  beneficios: [string, string, string];
  /**
   * "¿Cuál me conviene?" (§4.2.3): 3 filas "Si… → elegí…". `plan` es el id
   * fijo de un plan visible de la categoría (lo verifica un test). Vacío en
   * proyectos a medida, que muestran pasos.
   */
  conviene: { si: string; plan: string }[];
  /** El combo de esta solución, uno solo (§4.2.5), y la pregunta que lo presenta. */
  combo?: { id: string; gancho: string };
  /** Primer mensaje del chat cuando se abre desde esta solución. */
  tema: string;
  /** Las 3 preguntas propias (§4.2.8), por id de `conocimiento.faq`. */
  faq: [string, string, string] | [string, string, string, string];
  /** Lo que se paga aparte, en el modal "Formas de pago". */
  aparte: string[];
  /** Proyecto parecido para mostrar (sin proyecto: la sección no va). */
  proyecto?: Proyecto["key"];
}

const SOLUCIONES: Solucion[] = [
  {
    category: "webs",
    icon: "web",
    label: "Web",
    problema: "Que me encuentren en Google",
    title: "Que te encuentren en Google",
    description: "Una página para que te encuentren en Google y te escriban por WhatsApp.",
    paraQuien: "Para negocios y profesionales que todavía no tienen página, o que la tienen y no les trae consultas.",
    metaTitle: "Página web para tu negocio en Salta: precios",
    beneficios: [
      "Aparecés cuando buscan tu rubro en tu ciudad",
      "Te escriben directo por WhatsApp, con un toque",
      "El primer año online incluido, y la página es tuya",
    ],
    conviene: [
      { si: "Si recién arrancás", plan: "landing-express" },
      { si: "Si querés que te encuentren cuando buscan tu rubro", plan: "landing-profesional" },
      { si: "Si querés que la página cuente todo por vos", plan: "landing-premium" },
    ],
    combo: { id: "combo-arranque", gancho: "¿Además vendés por WhatsApp?" },
    tema: "Quiero que me encuentren en Google",
    faq: ["plazos", "primer-anio", "dominio"],
    aparte: ["Tu dirección web (tunegocio.com.ar), según la tarifa vigente de NIC.ar."],
    proyecto: "quepintasalta",
  },
  {
    category: "tiendas",
    icon: "cart",
    label: "Ventas",
    problema: "Vender por WhatsApp o internet",
    title: "Vender por WhatsApp o por internet",
    description: "Mostrá tus productos con precio y recibí los pedidos armados por WhatsApp, o cobrá online.",
    paraQuien: "Para comercios que venden por WhatsApp o Instagram, bares y restós con carta, y negocios que quieren cobrar online.",
    metaTitle: "Catálogo online y tienda con Mercado Pago: precios",
    beneficios: [
      "Los pedidos te llegan armados por WhatsApp",
      "Cargás y cambiás productos vos, desde el celular",
      "Sin comisiones por venta para mí",
    ],
    conviene: [
      { si: "Si tenés un bar o un restó", plan: "menu-digital-qr" },
      { si: "Si vendés por WhatsApp o Instagram", plan: "catalogo-con-pedidos-por-whatsapp" },
      { si: "Si querés cobrar online sin intervenir", plan: "tienda-online-con-mercado-pago" },
    ],
    combo: { id: "combo-arranque", gancho: "¿Todavía no tenés página?" },
    tema: "Quiero vender por WhatsApp o por internet",
    faq: ["comision-mp", "cuotas", "codigo"],
    aparte: ["La comisión de Mercado Pago por cada venta online (la cobra Mercado Pago, no yo)."],
    proyecto: "quepintasalta",
  },
  {
    category: "turnos",
    icon: "calendar",
    label: "Agenda",
    problema: "Que saquen turno solos",
    title: "Que tus clientes saquen turno solos",
    description: "Tus clientes sacan turno solos y vos ves la agenda en el celular.",
    paraQuien: "Para peluquerías, consultorios, centros de estética, canchas, cabañas y clases.",
    metaTitle: "Turnos online para tu negocio: precios",
    beneficios: [
      "Reservan a cualquier hora, sin escribirte",
      "Recordatorio automático para que no falten",
      "Ves y cambiás tu agenda desde el celular",
    ],
    conviene: [
      { si: "Si das turnos por profesional o por servicio", plan: "turnos-online" },
      { si: "Si alquilás canchas, cabañas o clases y querés cobrar seña", plan: "reservas-con-sena" },
      { si: "Si organizás eventos o salidas con cupo", plan: "inscripciones-a-eventos-y-salidas" },
    ],
    combo: { id: "combo-negocio-con-turnos", gancho: "¿Todavía no tenés página?" },
    tema: "Quiero que mis clientes saquen turno solos",
    faq: ["costos-de-uso", "cuotas", "codigo"],
    aparte: ["Lo que cobra WhatsApp por cada recordatorio automático."],
  },
  {
    category: "gestion",
    icon: "box",
    label: "Gestión",
    problema: "Ordenar stock, pedidos y clientes",
    title: "Ordenar stock, pedidos y clientes",
    description: "Stock, pedidos y clientes en un solo lugar, sin planillas sueltas.",
    paraQuien: "Para comercios y pymes que hoy se organizan con planillas y cuadernos.",
    metaTitle: "Sistema de stock y pedidos para tu negocio: precios",
    beneficios: [
      "Sabés qué tenés sin contar a mano",
      "Ningún pedido se pierde ni se atrasa",
      "Cada empleado ve solo lo que le toca",
    ],
    conviene: [
      { si: "Si querés ver cuánto vendés", plan: "tablero-de-ventas" },
      { si: "Si te quedás sin stock", plan: "control-de-stock-con-qr" },
      { si: "Si los pedidos se te atrasan o se pierden", plan: "pedidos-y-clientes" },
    ],
    combo: { id: "combo-pyme-digital", gancho: "¿Querés todo en un solo paquete?" },
    tema: "Quiero ordenar el stock, los pedidos y los clientes",
    faq: ["cuotas", "codigo-medida", "garantia"],
    aparte: ["Si el sistema manda avisos por WhatsApp, lo que cobra WhatsApp por cada mensaje automático."],
    proyecto: "afiniajobs",
  },
  {
    category: "ia",
    icon: "ia",
    label: "IA",
    problema: "Responder las 24 h con IA",
    title: "Responder las 24 h sin estar pegado al celular",
    description: "Un asistente en tu web o en tu WhatsApp que responde las preguntas de siempre, a cualquier hora.",
    paraQuien: "Para negocios que reciben muchas consultas repetidas.",
    metaTitle: "Asistente con IA para tu negocio: precios",
    beneficios: [
      "Responde las 24 horas, también los fines de semana",
      "Responde solo con lo de tu negocio, no inventa",
      "Te pasa los contactos y los casos que necesitan una persona",
    ],
    conviene: [
      { si: "Si te preguntan siempre lo mismo en tu web", plan: "asistente-ia-para-tu-web" },
      { si: "Si las consultas te llegan por WhatsApp", plan: "asistente-por-whatsapp" },
      { si: "Si querés que además venda", plan: "agente-de-ventas" },
    ],
    combo: { id: "combo-atencion-24-h", gancho: "¿Todavía no tenés página?" },
    tema: "Quiero responder las consultas las 24 h",
    faq: ["costos-de-uso", "codigo-medida", "malejo"],
    aparte: [
      "Lo que gasta la inteligencia artificial por uso.",
      "Si responde por WhatsApp, lo que cobra WhatsApp por mensaje.",
    ],
    proyecto: "tuki",
  },
  {
    category: "mant",
    icon: "wrench",
    label: "Soporte",
    problema: "Que mi web siga funcionando",
    title: "Que tu web siga funcionando",
    description: "Tu página siempre funcionando, con copia de seguridad y alguien que te hace los cambios.",
    paraQuien: "Para quien ya tiene su página (hecha por mí o por otro) y no quiere preocuparse por ella.",
    metaTitle: "Mantenimiento de páginas web: precios",
    beneficios: [
      "Tu página online y segura, con copia de seguridad",
      "Cambios chicos incluidos todos los meses",
      "Respuesta en 24 a 48 h hábiles",
    ],
    conviene: [
      { si: "Si solo querés que siga online", plan: "renovacion" },
      { si: "Si cambiás precios, fotos u horarios seguido", plan: "mantenimiento-basico" },
      { si: "Si querés que Google te muestre más", plan: "mantenimiento-pro" },
    ],
    tema: "Quiero que mi web siga funcionando",
    faq: ["baja-mantenimiento", "cambios", "primer-anio"],
    aparte: [],
  },
  {
    category: "grandes",
    icon: "app",
    label: "A medida",
    problema: "Algo más grande",
    title: "Proyectos a medida",
    description: "Apps o sistemas grandes, a medida: primero charlamos, después te paso un plan por escrito y lo construimos por etapas de 2 semanas.",
    paraQuien: "Para marketplaces, apps propias o sistemas complejos que no entran en ningún plan.",
    metaTitle: "Desarrollo de apps y sistemas a medida",
    beneficios: [
      "Sabés qué se hace y cuánto sale cada etapa antes de decidir",
      "Cada 2 semanas ves algo funcionando",
      "Pagás etapa por etapa: 50% al arrancar y 50% al entregar",
    ],
    conviene: [],
    tema: "Tengo un proyecto grande, a medida",
    faq: ["grandes-pagos", "grandes-plan", "grandes-mant"],
    aparte: ["Los servicios externos que use el sistema (inteligencia artificial, WhatsApp, mapas), según cuánto se usen."],
    proyecto: "afiniajobs",
  },
];

export function solucion(key: CategoryKey | string): Solucion | undefined {
  return SOLUCIONES.find((s) => s.category === key);
}

/** Las seis de la grilla "¿Qué necesitás?" (sin proyectos a medida, que va como link aparte). */
export const soluciones: Solucion[] = SOLUCIONES.filter((s) => s.category !== "grandes");

export const servicios = {
  index: {
    title: "Soluciones",
    metaTitle: "Soluciones y precios para tu negocio",
    description:
      "Páginas web, catálogos y tiendas, turnos, sistemas para ordenar tu negocio, asistentes con IA y mantenimiento. Todo con precio publicado.",
    label: "Soluciones",
    heading: "¿Qué necesitás?",
    lead: "Elegí lo que necesita tu negocio y mirá cuánto sale.",
    cotizador: { label: "Armá tu cotización", href: "/cotizador" },
    precios: { label: "Ver todos los precios", href: "/precios" },
    grandes: {
      label: "Proyectos a medida",
      title: "¿Algo más grande que un plan?",
      body: "Apps o sistemas grandes, a medida: primero charlamos, después te paso un plan por escrito y lo construimos por etapas de 2 semanas.",
      cta: { label: "Ver cómo trabajo los proyectos a medida →", href: "/servicios/grandes" },
    },
  },
  detail: {
    back: { label: "← Todas las soluciones", href: "/servicios" },
    paraQuienLabel: "Para quién es",
    beneficiosLabel: "Qué ganás",
    planesLabel: "Planes",
    convieneTitle: "¿Cuál me conviene?",
    convieneElegi: "elegí",
    /** `{N}` = cantidad de opciones que quedan. */
    otras: "Ver otras opciones ({N})",
    comboLabel: "Combo",
    /** `{GANCHO}` = la pregunta de la solución, `{AHORRO}` = el ahorro en pesos. */
    comboTitle: "{GANCHO} Juntalo y ahorrás {AHORRO}",
    /** En `/servicios/grandes` no hay planes: hay pasos. */
    stepsLabel: "Así arrancamos",
    stepsTitle: "Tres pasos, sin sorpresas",
    proyectoLabel: "Un proyecto parecido",
    proyectoAbrir: "Ver el proyecto",
    pagosMensual: "Lo que pagás por mes se paga por mes adelantado; pagando el año junto, pagás 10 meses.",
    /** `{PLAN}` = precio del plan escrito, `{MANT}` = % de mantenimiento. */
    pagosGrandes: [
      "El plan del proyecto por escrito ({PLAN}) se paga por adelantado.",
      "Cada etapa de 2 semanas se paga 50% al arrancarla y 50% al entregarla.",
      "Mantenimiento: {MANT} mensual del precio del proyecto; lo das de baja cuando quieras, avisando 30 días antes.",
      "Por transferencia, o con Mercado Pago (+{PCT}) en hasta {CUOTAS} cuotas.",
    ],
    aparteLabel: "Se paga aparte",
    /** Aclaración de `/servicios/mant`. `{MANT}` = % de mantenimiento. */
    mantGrandes: { body: "¿Tenés un proyecto a medida? Su mantenimiento es el {MANT} mensual del precio del proyecto.", cta: "Ver proyectos a medida →", href: "/servicios/grandes" },
    faqLabel: "Preguntas",
    faqTitle: "Lo que más me preguntan",
    faqOtra: "¿Otra duda? Preguntale a Malejo",
    cierre: {
      label: "Empecemos",
      title: "¿Te sirve?",
      lead: "Contame qué necesitás y te digo qué te conviene. Si ya lo tenés claro, pedí tu demo.",
      leadGrandes: "Contame tu idea y vemos si es un proyecto a medida. La primera charla es gratis.",
      chat: "Contame qué necesitás",
      demo: "Pedí tu demo",
      agenda: "Agendá la charla gratis",
      whatsapp: "Escribime por WhatsApp",
    },
  },
};

/**
 * La página de la solución que muestra un combo (el `combo` de `SOLUCIONES`):
 * a donde lleva "Ver qué trae" sin JavaScript. La primera que lo tenga.
 */
export function solucionDeCombo(comboId: string): CategoryKey | undefined {
  return SOLUCIONES.find((s) => s.combo?.id === comboId)?.category;
}

/** Todas, con proyectos a medida (para tests y para recorrer la copy). */
export const todasLasSoluciones: readonly Solucion[] = SOLUCIONES;
