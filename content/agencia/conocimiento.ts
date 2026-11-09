import { agenciaLinks } from "./links";
import { getPlan, mantenimientoGrandesPct, recargoMercadoPago, type CategoryKey } from "./pricing";

/**
 * Base de conocimiento **única** de Malejo: quién es Mauro, cómo se trabaja,
 * cómo se paga, qué pasa con el dominio, el código y el mantenimiento, los
 * proyectos para mostrar y el FAQ. La leen el FAQ de la home (y el de
 * `/servicios/[slug]`) y el system prompt del chat, que genera su bloque de
 * conocimiento desde acá igual que genera el catálogo desde `pricing.ts`.
 *
 * Las decisiones de negocio salen de la tanda CHAT-R1 (`docs/agencia/INFORME.md`).
 * `{SENA}` se reemplaza en el render por el monto de `SENA_MONTO` (es una
 * variable de servidor: no se escribe acá).
 *
 * Regla: ninguna respuesta del FAQ pasa de 40 palabras (lo verifica un test).
 */

export interface FaqEntry {
  /** Estable: la home y `/servicios` eligen preguntas por id, no por texto. */
  id: string;
  q: string;
  a: string;
}

export interface Proyecto {
  key: "afiniajobs" | "quepintasalta" | "tuki" | "maestria";
  nombre: string;
  /** Qué es, en una línea. */
  que: string;
  /** El problema que resuelve, contado para un dueño de negocio (título de la tarjeta de la home). */
  problema: string;
  /** Qué demuestra para un cliente, en una línea y sin nombres de tecnologías. */
  demuestra: string;
  href: string;
  /** Planes del catálogo que se le parecen ("Como Tuki"), por id fijo. */
  parecidoIds: string[];
  /** Los nombres de esos planes, unidos: lo arma `conocimiento`, no se escribe. */
  parecido: string;
  /** La solución (`/servicios/<slug>`) a la que lleva "Se parece a…". */
  solucion: CategoryKey;
}

export interface Conocimiento {
  quienSoy: string;
  proceso: string;
  pagos: string[];
  dominio: string;
  propiedad: string;
  tecnologia: string;
  mantenimiento: string;
  tiempoRespuesta: string;
  garantia: string;
  proyectos: Proyecto[];
  portfolio: { label: string; href: string };
  faq: FaqEntry[];
}

const pct = `${Math.round(recargoMercadoPago * 100)}%`;
const ars = (n: number) => `$${new Intl.NumberFormat("es-AR").format(n)}`;
const renovacion = getPlan("renovacion")?.impl ?? 0;
const basico = getPlan("mantenimiento-basico")?.monthly ?? 0;
const planEscrito = getPlan("diagnostico-escrito")?.impl ?? 0;
const mantGrandes = `${Math.round(mantenimientoGrandesPct * 100)}%`;

/** "Como Tuki" → los nombres vigentes de los planes, por id. */
function nombres(ids: string[]): string {
  return ids
    .map((id) => getPlan(id)?.name)
    .filter(Boolean)
    .join(" y ");
}

type ProyectoBase = Omit<Proyecto, "parecido">;

const proyectos: ProyectoBase[] = [
  {
    key: "afiniajobs",
    nombre: "AfinIA Jobs",
    que: "Proyecto propio en prueba: lee cada aviso de empleo contra tu perfil y te dice qué tan afín es y qué te falta.",
    problema: "Lee cientos de avisos y te dice cuáles te convienen",
    demuestra: "Inteligencia artificial que lee, puntúa y resume mucha información por vos.",
    href: agenciaLinks.afinia,
    parecidoIds: ["clasificador-con-ia", "sistema-a-medida"],
    solucion: "ia",
  },
  {
    key: "quepintasalta",
    nombre: "Qué Pinta Salta",
    que: "La agenda cultural de Salta, cargada sola con IA desde varias fuentes.",
    problema: "Una agenda cultural que se carga sola",
    demuestra: "Una guía con mapa y filtros que se actualiza sola: ya está funcionando.",
    href: agenciaLinks.qps,
    parecidoIds: ["directorio-o-guia-con-mapa"],
    solucion: "tiendas",
  },
  {
    key: "tuki",
    nombre: "Tuki",
    que: "Asistente de trámites que responde con fuentes oficiales, concebido en NOA Innova 2026 para un municipio de capital provincial.",
    problema: "Un asistente que responde trámites las 24 h",
    demuestra: "Un asistente que responde solo con información oficial, dice de dónde la sacó y pasa a una persona cuando hace falta.",
    href: agenciaLinks.tuki,
    parecidoIds: ["asistente-ia-para-tu-web"],
    solucion: "ia",
  },
  {
    key: "maestria",
    nombre: "MaestrIA",
    que: "Proyecto propio en construcción: el docente sube su programa y la IA arma evaluaciones alineadas; cuando el alumno se equivoca, primero diagnostica el error.",
    problema: "Evaluaciones que se arman solas desde el programa",
    demuestra: "Un aula virtual con docentes y alumnos, y la inteligencia artificial aplicada a enseñar.",
    href: agenciaLinks.maestria,
    parecidoIds: ["plataforma-educativa-con-ia"],
    solucion: "ia",
  },
];

export const conocimiento: Conocimiento = {
  quienSoy:
    "Mauro Lizárraga, desarrollador en Salta, Argentina. Desde 2023 da clases de matemática a nivel terciario, donde también fue formador y evaluador docente. En 2025 trabajó como desarrollador en Accenture, armando sistemas internos y asistentes con IA para una multinacional. Se formó en IA aplicada con DataCamp y Anthropic Academy. Hoy construye proyectos propios: Qué Pinta Salta, AfinIA Jobs, Tuki y MaestrIA.",
  proceso:
    "1) Me contás qué necesitás (por WhatsApp, por este chat o en una charla gratis de 20 minutos). 2) Seña de {SENA}, que se descuenta del total. 3) Demo con tu marca en 72 horas hábiles. 4) La vemos juntos en 20 minutos y decidís sin compromiso. 5) Si contratás: 50% al aprobar la demo y 50% al recibir el proyecto, con la seña descontada.",
  pagos: [
    "Transferencia al precio publicado.",
    `Mercado Pago con ${pct} de recargo.`,
    `Hasta 6 cuotas con Mercado Pago, sobre el precio con el ${pct}; el interés de las cuotas lo define Mercado Pago según la tarjeta.`,
    "El total se paga 50% al aprobar la demo y 50% en la entrega.",
    `Proyectos a medida (grandes): el plan del proyecto por escrito (${ars(planEscrito)}) se paga por adelantado, y cada etapa de 2 semanas se paga 50% al arrancarla y 50% al entregarla.`,
    "La seña no se devuelve: paga el trabajo de la demo. Si contratás, se descuenta completa del total.",
    "Las cuotas mensuales se pagan por mes adelantado; pagando el año por adelantado se pagan 10 meses.",
    "Todavía no emite factura (lo va a hacer más adelante). Si el cliente la necesita, lo habla con Mauro.",
  ],
  dominio:
    "La dirección web (el dominio) queda a nombre del cliente. Su costo va aparte del precio del plan, como un adicional (tarifa vigente de NIC.ar para .com.ar), y Mauro la registra y la configura.",
  propiedad:
    "En páginas web, catálogos, tiendas, turnos y mantenimiento, la página y el dominio son del cliente una vez pagado el total: si algún día quiere llevársela, se la lleva entera. En sistemas para ordenar el negocio, asistentes con IA y proyectos a medida NO digas que el código es del cliente: la propiedad del código se define en la propuesta escrita.",
  tecnologia:
    "No se usan plantillas como WordPress: se trabaja con tecnología propia (Next.js), más rápida y segura, que no se cae por un plugin ni hay que actualizarla.",
  mantenimiento: `Sin permanencia mínima: se da de baja avisando con 30 días. Después del primer año, mantener online cubre que la página siga funcionando y segura, con copia de seguridad y la dirección web; los planes de mantenimiento suman cambios incluidos. En los proyectos a medida, el mantenimiento es el ${mantGrandes} mensual del precio del proyecto.`,
  tiempoRespuesta:
    "Mauro responde por WhatsApp en hasta 2 días hábiles. Nunca prometer que responde al instante ni en el día.",
  garantia:
    "30 días de garantía desde cada entrega (en las webs está incluida en el precio): si algo no funciona como se acordó, se corrige sin cargo. Cubre errores, no funcionalidades nuevas.",
  proyectos: proyectos.map((p) => ({ ...p, parecido: nombres(p.parecidoIds) })),
  portfolio: { label: "Portfolio de Mauro", href: "/portfolio" },
  faq: [
    {
      id: "plazos",
      q: "¿Cuánto tarda mi web?",
      a: "Una página web está lista en 3 a 10 días hábiles según el plan; una web de hasta 5 páginas, en unas 2 semanas. El plazo corre desde que recibo tu material.",
    },
    {
      id: "cambios",
      q: "¿Qué es un cambio chico y qué un cambio grande?",
      a: "Un cambio chico lleva hasta 30 minutos: un texto, una foto, un precio o un horario. Uno grande —una sección nueva, una función o un rediseño— se cotiza antes. Fuera de plan: $10.000 cada 30 minutos.",
    },
    {
      id: "pagos",
      q: "¿Cómo pago?",
      a: `Por transferencia, al precio publicado, o con Mercado Pago con un ${pct} de recargo y hasta 6 cuotas. El total se paga 50% al aprobar la demo y 50% al recibir tu proyecto.`,
    },
    {
      id: "cuotas",
      q: "¿Se puede pagar en cuotas?",
      a: `Sí: hasta 6 cuotas con Mercado Pago, sobre el precio con el ${pct} de recargo. El interés de las cuotas lo define Mercado Pago según tu tarjeta.`,
    },
    {
      id: "sena",
      q: "¿La seña se devuelve?",
      a: "No: la seña de {SENA} paga el trabajo de armar tu demo. Si contratás, se descuenta completa del total.",
    },
    {
      id: "demo-gratis",
      q: "¿Puedo ver una demo sin pagar la seña?",
      a: "La demo con tu marca lleva una seña de {SENA}, que se descuenta del total. Si antes querés sacarte dudas, la charla con Mauro es gratis. La renovación de tu web actual incluye demo previa sin cargo.",
    },
    {
      id: "primer-anio",
      q: "¿Qué pasa después del primer año?",
      a: `Las webs incluyen el primer año online. Desde el segundo elegís: ${ars(renovacion)} por año para que siga online y segura, con copia de seguridad y tu dirección web, o un plan desde ${ars(basico)} por mes con cambios incluidos.`,
    },
    {
      id: "baja-mantenimiento",
      q: "¿Puedo dar de baja el mantenimiento?",
      a: "Sí. No hay permanencia mínima: avisás con 30 días de anticipación y se da de baja.",
    },
    {
      id: "codigo",
      q: "¿De quién es la página?",
      a: "Tuya. Una vez pagado el total, la página, los accesos y tu dirección web son tuyos: si algún día querés llevártela a otro lado, te la llevás entera.",
    },
    {
      id: "codigo-medida",
      q: "¿De quién es el código del sistema?",
      a: "En los sistemas, los asistentes con IA y los proyectos a medida, la propiedad del código se define en la propuesta escrita, antes de empezar.",
    },
    {
      id: "dominio",
      q: "¿La dirección web está incluida?",
      a: "Tu dirección web (tunegocio.com.ar) queda a tu nombre y su costo va aparte del plan, según la tarifa vigente de NIC.ar. La registro y la configuro yo.",
    },
    {
      id: "tecnologia",
      q: "¿Con qué hacen la página?",
      a: "Con tecnología propia, más rápida y segura que las plantillas: no se cae por un plugin ni hay que actualizarla.",
    },
    {
      id: "usd",
      q: "¿Me pasás el precio en dólares?",
      a: "Los precios son en pesos argentinos. Si estás afuera o lo querés en dólares, te paso el equivalente aproximado al dólar oficial del día. La forma de pago desde el exterior la coordinás con Mauro.",
    },
    {
      id: "factura",
      q: "¿Emiten factura?",
      a: "Por ahora no emito factura; lo voy a hacer más adelante. Si la necesitás, hablalo con Mauro antes de contratar.",
    },
    {
      id: "respuesta",
      q: "¿Cuánto tarda Mauro en responder?",
      a: "Hasta 2 días hábiles por WhatsApp. El asistente responde al momento y Mauro supervisa las charlas.",
    },
    {
      id: "garantia",
      q: "¿Tiene garantía?",
      a: "Sí: 30 días desde cada entrega. Si algo no funciona como se acordó, se corrige sin cargo. La garantía cubre errores, no funcionalidades nuevas.",
    },
    {
      id: "malejo",
      q: "¿Qué hace el asistente Malejo?",
      a: "Es el asistente de este sitio: entiende qué necesita tu negocio, te dice qué te conviene y cuánto sale con los precios publicados y, si querés, le pasa tu contacto a Mauro. No guarda tu conversación.",
    },
    {
      id: "costos-aparte",
      q: "¿Qué se paga aparte?",
      a: "Lo que cobra WhatsApp por cada mensaje automático y lo que cobra el servicio de inteligencia artificial por uso. Los pagás vos, directo, según cuánto se use. Te los estimo antes de empezar.",
    },
    {
      id: "comision-mp",
      q: "¿Me cobrás comisión por cada venta?",
      a: "No. Mercado Pago cobra su propia comisión por cada venta online; yo no cobro nada por venta.",
    },
    {
      id: "grandes-pagos",
      q: "¿Cómo se paga un proyecto a medida?",
      a: `El plan del proyecto por escrito (${ars(planEscrito)}) se paga por adelantado. Después, cada etapa de 2 semanas se paga 50% al arrancarla y 50% al entregarla, con un avance funcionando.`,
    },
    {
      id: "grandes-plan",
      q: "¿Qué incluye el plan por escrito?",
      a: "Qué hay que hacer y qué no, cómo se va a construir explicado simple, en cuántas etapas y cuánto sale cada una. Con eso decidís si seguís, sin compromiso.",
    },
    {
      id: "grandes-plazos",
      q: "¿Cuánto tarda un proyecto a medida?",
      a: "Depende del alcance: el plan escrito dice cuántas etapas de 2 semanas lleva. Cada etapa termina con algo funcionando que ves y probás antes de pagar la siguiente.",
    },
    {
      id: "grandes-mant",
      q: "¿Y el mantenimiento después?",
      a: `Es el ${mantGrandes} mensual del precio del proyecto: lo mantengo online, vigilado y con copia de seguridad, con correcciones y ajustes chicos. Sin permanencia mínima.`,
    },
  ],
};

/** Preguntas del FAQ por id, en el orden pedido. Un id inexistente rompe el build (lo cubre un test). */
export function faqPorIds(ids: readonly string[]): FaqEntry[] {
  return ids.map((id) => {
    const item = conocimiento.faq.find((f) => f.id === id);
    if (!item) throw new Error(`FAQ sin la pregunta "${id}"`);
    return item;
  });
}
