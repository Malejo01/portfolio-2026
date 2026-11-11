/**
 * Textos legales de la agencia. Texto simple: los `[ENTRE CORCHETES]` son
 * datos que Mauro tiene que completar y se renderizan resaltados para que
 * no pasen desapercibidos. `{SENA}` se reemplaza por el monto de
 * `SENA_MONTO` formateado; `{RECARGO}` por el recargo de Mercado Pago.
 *
 * No es asesoramiento legal: conviene que un abogado lo revise antes de
 * publicar (ver "Decisiones para Mauro" en el PR).
 *
 * Tanda P1: las formas de pago siguen a `precios-psicologia-2026-11-10.md`
 * §2. El tope y las cuotas salen de `precios.json`, no escritos a mano.
 */
import { fmt } from "@/lib/agencia/format";
import { pagosConfig } from "./pricing";

const TOPE_TRES = fmt(pagosConfig.topeTres);
const CUOTAS = pagosConfig.tarjetaMaxCuotas;

export type LegalBlock = string | { list: string[] };

export interface LegalSection {
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  slug: "terminos" | "cambios" | "privacidad";
  label: string;
  title: string;
  description: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const UPDATED = "8 de noviembre de 2026";
/** Tanda P1: los términos cambiaron las formas de pago. */
const UPDATED_TERMINOS = "11 de noviembre de 2026";

export const legalDocs: Record<LegalDoc["slug"], LegalDoc> = {
  terminos: {
    slug: "terminos",
    label: "Legal",
    title: "Términos y condiciones",
    description: "Cómo trabajo, qué incluye cada servicio, cómo se paga y de quién es lo que construyo.",
    updated: UPDATED_TERMINOS,
    intro:
      "Estos términos ordenan la relación entre Malejo —la marca de servicios de Mauro Lizárraga, [CUIT], con domicilio en Salta, Argentina— y quien contrata un servicio. Contratar o pagar una seña implica aceptarlos.",
    sections: [
      {
        heading: "1. Servicios y precios",
        blocks: [
          "Los servicios y sus precios están publicados en malejo.com.ar. Los precios están en pesos argentinos, son finales para el alcance descripto en cada plan y están vigentes hasta el 31/01/2027.",
          "Si lo que necesitás no entra en un plan publicado, te paso una cotización por escrito antes de empezar. Nada se cobra fuera de lo acordado por escrito.",
          "Los costos de terceros van aparte y los paga el cliente directamente: mensajes de la API oficial de WhatsApp (la conexión oficial que cobra Meta por cada mensaje automático), consumo del modelo de IA (lo que cobra el servicio de inteligencia artificial por uso), comisiones de Mercado Pago por venta y el registro del dominio (la dirección web).",
          "Los proyectos a medida (proyectos grandes: marketplaces, apps o sistemas complejos) no tienen precio cerrado: empiezan con una charla gratis de 20 minutos y un plan del proyecto por escrito, y se desarrollan por etapas de 2 semanas (sprints) que se cotizan en ese plan. Su mantenimiento mensual es el {MANT_GRANDES} del precio del proyecto.",
        ],
      },
      {
        heading: "2. Seña y demo",
        blocks: [
          "Para armar una demo con tu marca pido una seña de {SENA}. La demo está lista en 72 horas hábiles desde que recibo la seña y el material.",
          "La seña no es reembolsable: paga el trabajo de armar la demo. Si contratás, se descuenta completa del primer pago; si después de ver la demo decidís no contratar, no se devuelve y no hay ningún otro cargo.",
        ],
      },
      {
        heading: "3. Formas de pago",
        blocks: [
          "Los precios están en pesos argentinos. El chat puede mostrar un equivalente aproximado en dólares al tipo de cambio oficial del día, solo como referencia.",
          "Por ahora no emito factura. Si la necesitás, consultalo antes de contratar.",
          {
            list: [
              "Transferencia bancaria: precio publicado, sin recargo, en 2 pagos sin interés: 50 % al aprobar la demo y 50 % en la entrega.",
              `Transferencia en 3 pagos sin interés: un tercio al aprobar la demo, un tercio en la entrega y un tercio a los 30 días de la entrega. Solo si el total contratado es de hasta ${TOPE_TRES}; arriba de ese monto, 2 pagos o Mercado Pago.`,
              `Mercado Pago: {RECARGO} de recargo sobre el precio publicado, en hasta ${CUOTAS} cuotas. El interés de las cuotas lo define Mercado Pago según la tarjeta.`,
              "La seña se descuenta del primer pago.",
              "La página está online desde la entrega. El código y la titularidad de la dirección web se transfieren con el último pago.",
              "Proyectos a medida: el plan del proyecto por escrito se paga por adelantado, y cada etapa de 2 semanas se paga 50 % al arrancarla y 50 % al entregarla, según lo cotizado en ese plan.",
              "Servicios mensuales: se pagan por mes adelantado. Pagando el año por adelantado, pagás 10 meses.",
            ],
          },
        ],
      },
      {
        heading: "4. Plazos",
        blocks: [
          "Los plazos de cada plan son días hábiles y corren desde que recibo el material completo (textos, fotos, logo y accesos). Si el material se demora, el plazo se corre en la misma medida.",
        ],
      },
      {
        heading: "5. Hosting, dominio y renovación",
        blocks: [
          "Las webs incluyen 12 meses de hosting (el servicio que mantiene la página online). Desde el mes 13 se renueva por $90.000 al año o se pasa a un plan de mantenimiento. Si no se renueva, te entrego el código y los accesos para que lo alojes donde quieras.",
          "El dominio se registra a nombre del cliente. Su costo va aparte del precio del plan, según la tarifa vigente de NIC.ar (o del registrador, para otros dominios), y yo me ocupo de registrarlo y configurarlo.",
          "Los planes de mantenimiento no tienen permanencia mínima: se dan de baja avisando con 30 días de anticipación.",
        ],
      },
      {
        heading: "6. Propiedad del código y del contenido",
        blocks: [
          "En páginas web, catálogos, tiendas, turnos y mantenimiento, el código del proyecto es tuyo una vez pagado el total. En sistemas de gestión, asistentes con IA y proyectos a medida, la propiedad del código se define en la propuesta escrita, antes de empezar. El contenido que aportás (textos, fotos, marcas) sigue siendo tuyo. Puedo mostrar el trabajo terminado en mi portfolio salvo que pidas lo contrario por escrito.",
        ],
      },
      {
        heading: "7. Garantía y cambios",
        blocks: [
          "Cada entrega tiene 30 días de garantía: si algo no funciona como se acordó, lo corrijo sin cargo. Las rondas de revisión, los cambios menores y los cambios fuera de plan se rigen por la política de cambios.",
        ],
      },
      {
        heading: "8. Responsabilidad",
        blocks: [
          "Las respuestas de los asistentes con IA se acotan a la información del negocio y citan fuentes, pero pueden equivocarse: el cliente revisa la información que les carga y define qué casos se derivan a una persona.",
          "[REVISAR CON UN ABOGADO: límite de responsabilidad y jurisdicción aplicable.]",
        ],
      },
    ],
  },

  cambios: {
    slug: "cambios",
    label: "Legal",
    title: "Política de cambios",
    description: "Rondas de revisión, qué es un cambio menor, qué es uno mayor y cuánto cuesta lo que queda fuera del plan.",
    updated: UPDATED,
    intro:
      "Esta política dice qué cambios entran en el precio de cada plan y cómo se cotiza lo que queda afuera, para que nunca haya sorpresas.",
    sections: [
      {
        heading: "1. Rondas de revisión",
        blocks: [
          "Cada plan incluye un número de rondas de revisión, publicado en su tarjeta. Una ronda es una lista de ajustes que me mandás junta sobre una entrega; los aplico y te devuelvo la versión corregida.",
          "Una ronda de revisión extra cuesta $25.000.",
        ],
      },
      {
        heading: "2. Cambio menor",
        blocks: [
          "Un cambio menor lleva hasta 30 minutos y no toca la estructura del sitio: un texto, una foto, un precio, un horario, un color.",
          "Durante los 30 días de garantía y dentro de un plan de mantenimiento, los cambios menores están incluidos (Mantenimiento Básico: 30 minutos por mes; Mantenimiento Pro: 2 horas por mes).",
        ],
      },
      {
        heading: "3. Cambio mayor",
        blocks: [
          "Un cambio mayor toca la estructura: una sección o página nueva, una funcionalidad, una integración o un rediseño. Se cotiza por escrito antes de hacerlo y no empieza sin tu aprobación.",
        ],
      },
      {
        heading: "4. Garantía de 30 días",
        blocks: [
          "Durante los 30 días posteriores a cada entrega corrijo sin cargo cualquier cosa que no funcione como se acordó. La garantía cubre errores, no funcionalidades nuevas.",
        ],
      },
      {
        heading: "5. Fuera de plan",
        blocks: [
          "Los cambios que no entran en ningún plan se cobran $10.000 cada 30 minutos, con el tiempo estimado por escrito antes de empezar.",
        ],
      },
    ],
  },

  privacidad: {
    slug: "privacidad",
    label: "Legal",
    title: "Privacidad y datos personales",
    description: "Qué datos guardo, para qué, cuánto tiempo y cómo ejercer tus derechos según la Ley 25.326.",
    updated: UPDATED,
    intro:
      "Esta política explica cómo trato tus datos personales según la Ley 25.326 de Protección de los Datos Personales de la República Argentina.",
    sections: [
      {
        heading: "1. Responsable",
        blocks: [
          "El responsable de la base de datos es Mauro Alejandro Lizárraga (Malejo), [CUIT], con domicilio en [DOMICILIO], Salta, Argentina. Contacto: [EMAIL DE CONTACTO].",
        ],
      },
      {
        heading: "2. Qué datos guardo",
        blocks: [
          "Solo los que vos me das y solo si aceptás expresamente que te contacte:",
          { list: ["Nombre.", "Número de WhatsApp o medio de contacto.", "Rubro de tu negocio.", "Un resumen de lo que necesitás."] },
          "No guardo las conversaciones con el asistente Malejo: solo el resumen de la consulta, y solo si marcaste la casilla de consentimiento. No pido datos sensibles.",
        ],
      },
      {
        heading: "3. Para qué los uso",
        blocks: [
          "Para una única finalidad: contactarte por la consulta que hiciste. No los uso para publicidad, no los vendo y no los cedo a terceros.",
        ],
      },
      {
        heading: "4. Quién más los procesa",
        blocks: [
          "Para que el sitio funcione uso proveedores que procesan datos por cuenta mía y no pueden usarlos para otra cosa:",
          {
            list: [
              "Vercel: aloja el sitio y mide visitas de forma agregada, sin cookies.",
              "Neon: base de datos donde se guardan los contactos.",
              "Anthropic: procesa los mensajes del chat para generar las respuestas del asistente.",
              "Resend: envía el aviso por email cuando completás el formulario de la demo.",
            ],
          },
          "Algunos de estos proveedores procesan datos fuera de Argentina. [REVISAR CON UN ABOGADO: transferencia internacional de datos.]",
        ],
      },
      {
        heading: "5. Cuánto tiempo",
        blocks: [
          "Guardo tus datos 12 meses desde la consulta. Si en ese plazo no contratás, se borran automáticamente.",
        ],
      },
      {
        heading: "6. Tus derechos",
        blocks: [
          "Podés pedir acceso, rectificación o supresión de tus datos escribiendo a [EMAIL DE CONTACTO]. Respondo el pedido de acceso dentro de los 10 días corridos y el de rectificación o supresión dentro de los 5 días hábiles. El acceso es gratuito a intervalos no inferiores a seis meses, salvo interés legítimo (art. 14, inc. 3, Ley 25.326).",
          "La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.",
          "La inscripción de esta base de datos en el Registro Nacional de Bases de Datos de la AAIP está [PENDIENTE].",
        ],
      },
      {
        heading: "7. Cookies y almacenamiento local",
        blocks: [
          "El sitio guarda una sola cookie, `malejo-theme`, con tu preferencia de modo claro u oscuro. El chat de Malejo guarda la charla en el almacenamiento de sesión de tu navegador (solo en esa pestaña, se borra al cerrarla) para que no se pierda si recargás; nunca se manda a ningún servidor para guardarse. Ninguno de los dos identifica a nadie.",
        ],
      },
    ],
  },
};
