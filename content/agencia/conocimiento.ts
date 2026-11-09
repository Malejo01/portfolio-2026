import { agenciaLinks } from "./links";
import { getPlan, recargoMercadoPago } from "./pricing";

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
  /** Qué demuestra para un cliente, en una línea. */
  demuestra: string;
  href: string;
  /** Plan del catálogo que se parece ("Como Tuki"). */
  parecido: string;
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

export const conocimiento: Conocimiento = {
  quienSoy:
    "Mauro Lizárraga, AI Developer en Salta, Argentina. Desde 2023 da clases de matemática a nivel terciario, donde también fue formador y evaluador docente. En 2025 trabajó como desarrollador full-stack en Accenture, en plataformas internas y chatbots con IA. Se formó en IA aplicada con DataCamp y Anthropic Academy. Hoy construye productos propios: Qué Pinta Salta, AfinIA Jobs, Tuki y MaestrIA.",
  proceso:
    "1) Contás tu idea (brief corto o videollamada). 2) Seña de {SENA}. 3) Demo con tu marca en 72 horas hábiles. 4) Videollamada de 20 minutos para verla juntos y decidir sin compromiso. 5) Si contratás: 50% al aprobar la demo y 50% en la entrega, con la seña descontada del total.",
  pagos: [
    "Transferencia al precio publicado.",
    `Mercado Pago con ${pct} de recargo.`,
    `Hasta 6 cuotas con Mercado Pago, sobre el precio con el ${pct}; el interés de las cuotas lo define Mercado Pago según la tarjeta.`,
    "El total se paga 50% al aprobar la demo y 50% en la entrega.",
    "La seña no se devuelve: paga el trabajo de la demo. Si contratás, se descuenta completa del total.",
    "Los abonos se pagan por mes adelantado; pagando el año por adelantado se pagan 10 meses.",
    "Todavía no emite factura (lo va a hacer más adelante). Si el cliente la necesita, lo habla con Mauro.",
  ],
  dominio:
    "El dominio queda a nombre del cliente. Su costo va aparte del precio del plan, como un adicional (tarifa vigente de NIC.ar para .com.ar), y Mauro lo registra y lo configura.",
  propiedad: "El código y el dominio son del cliente una vez pagado el total: si algún día quiere llevarse el sitio, se lo lleva entero.",
  tecnologia: "No usamos WordPress: trabajamos con Next.js, que es más rápido, más seguro y no depende de plugins.",
  mantenimiento:
    "Sin permanencia mínima: se da de baja avisando con 30 días. Después del primer año, la renovación cubre hosting, SSL, backups y gestión del dominio; los planes de mantenimiento suman cambios incluidos.",
  tiempoRespuesta:
    "Mauro responde por WhatsApp en hasta 2 días hábiles. Nunca prometer que responde al instante ni en el día.",
  garantia:
    "30 días de garantía desde cada entrega (en las webs está incluida en el precio): si algo no funciona como se acordó, se corrige sin cargo. Cubre errores, no funcionalidades nuevas.",
  proyectos: [
    {
      key: "afiniajobs",
      nombre: "AfinIA Jobs",
      que: "Producto propio en beta: lee cada aviso de empleo contra tu perfil y te dice qué tan afín es y qué te falta.",
      demuestra: "IA que lee, puntúa y resume información a escala, con Next.js y PostgreSQL.",
      href: agenciaLinks.afinia,
      parecido: "Sistema a medida y Clasificador con IA",
    },
    {
      key: "quepintasalta",
      nombre: "Qué Pinta Salta",
      que: "La agenda cultural de Salta, cargada sola con IA desde varias fuentes.",
      demuestra: "Directorio con mapa, filtros y carga automática: está en producción.",
      href: agenciaLinks.qps,
      parecido: "Directorio o guía con mapa",
    },
    {
      key: "tuki",
      nombre: "Tuki",
      que: "Asistente de trámites que responde con fuentes oficiales, concebido en NOA Innova 2026 para un municipio de capital provincial.",
      demuestra: "Asistente con IA acotado a información oficial, que cita fuentes y deriva a una persona.",
      href: agenciaLinks.tuki,
      parecido: "Asistente IA para tu web",
    },
    {
      key: "maestria",
      nombre: "MaestrIA",
      que: "Producto propio en desarrollo: el docente sube su programa y la IA arma evaluaciones alineadas; cuando el alumno se equivoca, primero diagnostica el error.",
      demuestra: "Plataforma con roles docente y alumno, IA aplicada a la enseñanza.",
      href: agenciaLinks.maestria,
      parecido: "Plataforma educativa con IA",
    },
  ],
  portfolio: { label: "Portfolio de Mauro", href: "/portfolio" },
  faq: [
    {
      id: "plazos",
      q: "¿Cuánto tarda mi web?",
      a: "Una landing está lista en 3 a 10 días hábiles según el paquete; un sitio de hasta 5 páginas, en unas 2 semanas. El plazo corre desde que recibo tu material.",
    },
    {
      id: "cambios",
      q: "¿Qué es un cambio menor y qué un cambio mayor?",
      a: "Un cambio menor lleva hasta 30 minutos y no toca la estructura: un texto, una foto, un precio o un horario. Uno mayor —una sección, una funcionalidad o un rediseño— se cotiza antes. Fuera de plan: $10.000 cada 30 minutos.",
    },
    {
      id: "pagos",
      q: "¿Cómo pago?",
      a: `Por transferencia, al precio publicado, o con Mercado Pago con un ${pct} de recargo y hasta 6 cuotas. El total se paga 50% al aprobar la demo y 50% en la entrega.`,
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
      a: "La demo con tu marca lleva una seña de {SENA}, que se descuenta del total. Si antes querés sacarte dudas, la videollamada con Mauro es sin cargo. Renová tu web incluye demo previa sin cargo.",
    },
    {
      id: "primer-anio",
      q: "¿Qué pasa después del primer año?",
      a: `Las webs incluyen 12 meses de hosting. Desde el mes 13 elegís: la renovación de ${ars(renovacion)} al año (hosting, SSL, backups y dominio) o un plan de mantenimiento desde ${ars(basico)} por mes, con cambios incluidos.`,
    },
    {
      id: "baja-mantenimiento",
      q: "¿Puedo dar de baja el mantenimiento?",
      a: "Sí. No hay permanencia mínima: avisás con 30 días de anticipación y se da de baja.",
    },
    {
      id: "codigo",
      q: "¿De quién es el código?",
      a: "Tuyo. Una vez pagado el total, el código, los accesos y el dominio son tuyos: si algún día querés llevarte el sitio a otro lado, te lo llevás entero.",
    },
    {
      id: "dominio",
      q: "¿El dominio está incluido?",
      a: "El dominio queda a tu nombre y su costo va aparte del plan, según la tarifa vigente de NIC.ar. Lo registro y lo configuro yo.",
    },
    {
      id: "tecnologia",
      q: "¿Usan WordPress?",
      a: "No usamos WordPress: trabajamos con Next.js, que es más rápido, más seguro y no depende de plugins.",
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
      a: "Es el asistente de este sitio: te cotiza con los precios publicados, te arma el pedido de demo y, si vos querés, le pasa tu contacto a Mauro. Lo supervisa Mauro y no guarda tu conversación.",
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
