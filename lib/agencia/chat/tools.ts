import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { conocimiento } from "@/content/agencia/conocimiento";
import { combos, extras, getCombo, getPlan, plans, resolverId } from "@/content/agencia/pricing";
import { CALCOM_URL, waLink } from "@/lib/agencia/config";
import { comparar, cotizar, fmt, resumenCotizacion } from "@/lib/agencia/pricing";
import { deduplicable, firmaCard, leerFirmaQuote, type Card, type Medio, type Moneda, type QuoteCard } from "./cards";
import { mergeFicha, type Ficha } from "./ficha";
import { FichaSchema, limpiarFicha } from "./ficha-schema";
import { consentEnabled, isPhoneAR, signConsent, signTicket, type ContactPayload } from "./security";
import { mensajeWhatsApp } from "./whatsapp";

/**
 * Herramientas del agente Malejo. Cada una tiene su esquema zod (se valida
 * en el servidor antes de ejecutar: con `eager_input_streaming` la API no
 * valida el input) y devuelve hasta tres cosas: el texto para el modelo, una
 * tarjeta para la UI y un cambio de ficha.
 *
 * - `cotizar` suma lo que se contrata junto; `comparar` muestra
 *   alternativas sin sumarlas. Ninguna cotiza proyectos grandes.
 * - `anotar_ficha` es silenciosa: no muestra nada y nunca guarda en el
 *   servidor; el widget guarda la ficha en memoria.
 * - `sugerir_respuestas` (R3) muestra 2 o 3 respuestas tocables al pie
 *   del turno; tampoco justifica otra ronda del modelo.
 * - Una tarjeta `quote`/`compare`/`proyectos` igual a una ya mostrada no se
 *   vuelve a emitir (`ctx.shown` trae las firmas del historial reciente).
 *
 * No hay ninguna herramienta que lea contactos. `guardar_contacto` no
 * guarda: firma el pedido y se lo pasa a la UI, que muestra la casilla de
 * consentimiento; el insert lo hace `/api/contacto` solo con la casilla
 * marcada y la firma válida.
 */

const ids = [...plans.map((p) => p.id), ...combos.map((c) => c.id)];
const extraIds = extras.map((e) => e.id);
const esGrande = (id: string) => getPlan(id)?.category === "grandes";

const medio = z.enum(["transferencia", "mp"]).optional();
const moneda = z.enum(["ars", "usd"]).optional();

const schemas = {
  cotizar: z.object({
    planIds: z.array(z.string()).min(1).max(6),
    extras: z.array(z.string()).max(8).optional(),
    medio,
    moneda,
  }),
  comparar: z.object({ ids: z.array(z.string()).min(2).max(4), medio, moneda }),
  anotar_ficha: FichaSchema,
  mostrar_proyectos: z.object({}).passthrough(),
  pedir_demo: z.object({ planId: z.string().optional() }),
  derivar_whatsapp: z.object({ resumen: z.string().trim().min(1).max(600) }),
  pedir_contacto: z.object({ motivo: z.string().trim().max(200).optional() }),
  sugerir_respuestas: z.object({
    opciones: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(40)
          .refine((t) => !/https?:|www\.|\//i.test(t), "sin links ni rutas"),
      )
      .min(2)
      .max(3),
  }),
  guardar_contacto: z.object({
    nombre: z.string().trim().min(2).max(80),
    whatsapp: z.string().trim().min(8).max(30),
    rubro: z.string().trim().max(80).optional(),
    resumen: z.string().trim().max(600).optional(),
  }),
};

export type ToolName = keyof typeof schemas;

const fichaProps = {
  nombre: { type: "string" },
  rubro: { type: "string", description: "Rubro del negocio: peluquería, veterinaria, ferretería…" },
  ciudad: { type: "string" },
  necesidad: { type: "string", description: "Qué necesita, en una frase y en primera persona." },
  presupuesto: { type: "string", description: "Lo que dijo que puede gastar, textual." },
  planesInteres: { type: "array", items: { type: "string" }, description: "Ids del catálogo que le interesan." },
  urgencia: { type: "string" },
  medioPago: { type: "string", description: "transferencia o Mercado Pago" },
  cuotas: { type: "string", description: "Ej.: 6 cuotas" },
  dudas: { type: "array", items: { type: "string" }, description: "Dudas abiertas que Mauro tendría que responder." },
  etapa: { type: "string", enum: ["descubrimiento", "cotizado", "interesado", "listo_para_demo", "derivado"] },
} as const;

export const tools: Anthropic.Tool[] = [
  {
    name: "cotizar",
    description:
      "Precio exacto de lo que la persona contrataría JUNTO (suma todo: pago único, cuota mensual y total del primer año). Usala antes de decir cualquier monto de una selección. Para comparar opciones alternativas usá comparar: cotizar nunca es para alternativas. Si están todas las partes de un combo, aplica el combo sola. No sirve para proyectos a medida (grandes).",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        planIds: { type: "array", items: { type: "string", enum: ids }, description: "Planes o combos que se contratan juntos." },
        extras: { type: "array", items: { type: "string", enum: extraIds } },
        medio: { type: "string", enum: ["transferencia", "mp"], description: "mp = Mercado Pago (+6%). Por defecto transferencia." },
        moneda: { type: "string", enum: ["ars", "usd"], description: "usd = suma el equivalente en dólares. Solo si lo pide, escribe desde el exterior o en otro idioma." },
      },
      required: ["planIds"],
    },
  },
  {
    name: "comparar",
    description:
      "Muestra de 2 a 4 opciones ALTERNATIVAS lado a lado (precio, cuota mensual, plazo y para quién es), sin sumarlas ni dar un total. Usala cuando la persona elige entre opciones: dos páginas web distintas, o dos planes de mantenimiento.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        ids: { type: "array", items: { type: "string", enum: ids }, description: "De 2 a 4 planes o combos alternativos." },
        medio: { type: "string", enum: ["transferencia", "mp"] },
        moneda: { type: "string", enum: ["ars", "usd"] },
      },
      required: ["ids"],
    },
  },
  {
    name: "anotar_ficha",
    description:
      "Anota en silencio lo que aprendiste del cliente (no muestra nada y no se lo digas). Llamala cada vez que aprendas algo nuevo: rubro, necesidad, planes que le interesan, presupuesto, urgencia, medio de pago, dudas o etapa. Solo los campos nuevos.",
    eager_input_streaming: true,
    input_schema: { type: "object", properties: fichaProps },
  },
  {
    name: "mostrar_proyectos",
    description: "Muestra una tarjeta con los proyectos reales de Mauro (AfinIA Jobs, Qué Pinta Salta, Tuki y MaestrIA) y el link al portfolio. Usala si preguntan por trabajos, experiencia o confianza.",
    eager_input_streaming: true,
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "pedir_demo",
    description: "Muestra el botón para pedir la demo con seña (y la agenda de la videollamada). Usala cuando la persona quiera avanzar con un plan del catálogo. No es para proyectos grandes.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: { planId: { type: "string", enum: ids, description: "Plan o combo elegido, si hay uno." } },
    },
  },
  {
    name: "derivar_whatsapp",
    description:
      "Muestra el botón de WhatsApp a Mauro con la ficha del cliente y la última cotización ya cargadas. Usala si pide una persona, si no hay dato en el conocimiento, si pide descuento o un caso especial, o para un proyecto grande.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: { resumen: { type: "string", description: "La consulta en una frase, en primera persona." } },
      required: ["resumen"],
    },
  },
  {
    name: "pedir_contacto",
    description:
      "Muestra un formulario corto (nombre y WhatsApp, con la casilla de consentimiento) para que Mauro le escriba. No guarda nada: se guarda solo si la persona lo completa y marca la casilla. Ofrecelo una vez cuando mostró interés y todavía no dejó su contacto. Si ya te escribió su nombre y su WhatsApp, usá guardar_contacto.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: { motivo: { type: "string", description: "Qué quiere que Mauro le resuelva, en una frase (si no está en la ficha)." } },
    },
  },
  {
    name: "sugerir_respuestas",
    description:
      "Muestra 2 o 3 botones con respuestas cortas que la persona puede tocar en vez de escribir. Usala al final de un turno en el que hiciste una pregunta con respuestas previsibles (sí o no, el rubro, cómo atiende hoy, cuál de dos opciones). Escribilas en primera persona, como las diría el cliente, de hasta 40 caracteres (ej.: \"Sí, quiero turnos\", \"Todavía no tengo página\"). No las menciones en el texto.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        opciones: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3, description: "Respuestas cortas en primera persona." },
      },
      required: ["opciones"],
    },
  },
  {
    name: "guardar_contacto",
    description:
      "Propone guardar el contacto para que Mauro escriba. NO guarda nada: le muestra a la persona una casilla de consentimiento y solo se guarda si la marca. Usala solo cuando la persona ya te dio nombre y WhatsApp por su cuenta y quiere que la contacten. Rubro y resumen salen de la ficha si no los pasás.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        nombre: { type: "string" },
        whatsapp: { type: "string", description: "Teléfono argentino completo, con código de área." },
        rubro: { type: "string" },
        resumen: { type: "string", description: "Qué necesita, en una o dos frases." },
      },
      required: ["nombre", "whatsapp"],
    },
  },
];

/** Lo que cada herramienta necesita del pedido. */
export interface ToolContext {
  /** ARS por USD del día. */
  tipoDeCambio: number;
  ficha: Ficha;
  /** Firmas de las tarjetas ya mostradas (del historial y de este turno). */
  shown: Set<string>;
}

export interface ToolOutcome {
  content: string;
  isError?: boolean;
  card?: Card;
  /** Cambio de ficha normalizado (ya fusionado en `ctx.ficha`). */
  ficha?: Ficha;
}

export function nuevoContexto(tipoDeCambio: number, ficha: Ficha = {}, shownCards: string[] = []): ToolContext {
  return { tipoDeCambio, ficha, shown: new Set(shownCards) };
}

/** Arma la tarjeta de cotización. La usa la herramienta y la reconstrucción desde una firma. */
export function quoteCard(args: { planIds: string[]; extras?: string[]; medio?: Medio; moneda?: Moneda }, tipoDeCambio: number) {
  const m = args.medio ?? "transferencia";
  const mon = args.moneda ?? "ars";
  const c = cotizar({ planIds: args.planIds, extras: args.extras, medio: m, tipoDeCambio });
  const principal = c.items.filter((i) => i.tipo !== "extra");
  const card: QuoteCard = {
    kind: "quote",
    ids: [...new Set(args.planIds.map(resolverId))],
    extras: [...new Set(args.extras ?? [])],
    titulo: c.items.length === 1 ? c.items[0].nombre : principal.map((i) => i.nombre).join(" + ") || "Tu cotización",
    implementacion: c.implementacion,
    mensual: c.abonoMensual,
    anual: c.anual,
    desde: c.desde,
    medio: m,
    moneda: mon,
    aCotizar: c.aCotizar,
    ...(mon === "usd" && c.usd ? { usd: { implementacion: c.usd.implementacion, mensual: c.usd.abonoMensual, tipoDeCambio: c.usd.tipoDeCambio } } : {}),
    demoHref: `/demo?plan=${encodeURIComponent(principal.map((i) => i.id).join(","))}`,
  };
  return { cotizacion: c, card };
}

/** La última cotización mostrada, reconstruida desde su firma (el cliente no manda montos). */
export function ultimaCotizacion(ctx: ToolContext): QuoteCard | null {
  const firma = [...ctx.shown].reverse().find((s) => s.startsWith("quote:"));
  const partes = firma && leerFirmaQuote(firma);
  if (!partes) return null;
  const { cotizacion, card } = quoteCard({ planIds: partes.ids, extras: partes.extras, medio: partes.medio, moneda: partes.moneda }, ctx.tipoDeCambio);
  return cotizacion.items.length ? card : null;
}

const nombreDe = (id: string) => getPlan(id)?.name ?? (getCombo(id) ? `Combo ${getCombo(id)!.name}` : id);

function conDedup(ctx: ToolContext, out: ToolOutcome): ToolOutcome {
  if (!out.card || !deduplicable(out.card)) return out;
  const firma = firmaCard(out.card);
  if (ctx.shown.has(firma)) {
    return {
      content: `${out.content}\n\nEsa misma tarjeta YA está en pantalla: no la mostré de nuevo. No la repitas ni la cites; seguí con el próximo paso.`,
    };
  }
  ctx.shown.add(firma);
  return out;
}

const planEscrito = fmt(getPlan("diagnostico-escrito")?.impl ?? 0);
const GRANDES = `Es un proyecto a medida (grande): no va con tarjeta de cotización ni con la demo de 72 horas. Proponé el camino charla gratis (20 min) → plan del proyecto por escrito (${planEscrito}, por adelantado) → etapas de 2 semanas con avance funcionando, cada una 50% al arrancarla y 50% al entregarla. Ofrecé la charla por WhatsApp con derivar_whatsapp.`;

export function runTool(name: string, input: unknown, ctx: ToolContext): ToolOutcome {
  if (!(name in schemas)) return { content: `Herramienta desconocida: ${name}`, isError: true };
  const parsed = schemas[name as ToolName].safeParse(input ?? {});
  if (!parsed.success) {
    return { content: JSON.stringify({ INVALID_INPUT: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }), isError: true };
  }

  switch (name as ToolName) {
    case "cotizar": {
      const args = parsed.data as z.infer<typeof schemas.cotizar>;
      if (args.planIds.some(esGrande)) return { content: GRANDES, isError: true };
      const { cotizacion: c, card } = quoteCard(args, ctx.tipoDeCambio);
      if (!c.items.length) return { content: `Ningún id existe en el catálogo: ${c.desconocidos.join(", ")}`, isError: true };
      const { usd, ...ars } = c;
      const enUsd = card.moneda === "usd" && usd ? { usd, tipoDeCambio: `dólar oficial del día: $${usd.tipoDeCambio}` } : {};
      // Las claves usan el vocabulario del sitio (pago único, cuota mensual):
      // el modelo tiende a repetir lo que lee.
      const { implementacion, abonoMensual, total, ...resto } = ars;
      const usaWhatsAppOIa = (id: string) => ["ia", "turnos"].includes(getPlan(id)?.category ?? "");
      const conUso = c.items.some((i) => usaWhatsAppOIa(i.id) || (i.incluye ?? []).some(usaWhatsAppOIa));
      // La otra forma de pago de los planes cotizados (antes solo la devolvía `comparar`).
      const otraFormaDePago = c.items
        .map((i) => getPlan(i.id))
        .filter((p) => p?.alt)
        .map((p) => `${p!.name}: ${p!.alt}`);
      return conDedup(ctx, {
        content: JSON.stringify({
          pagoUnico: implementacion,
          cuotaMensual: abonoMensual,
          totalPrimerAnio: total,
          ...resto,
          ...enUsd,
          resumen: resumenCotizacion(card.moneda === "usd" ? c : ars),
          ...(otraFormaDePago.length ? { otraFormaDePago } : {}),
          cuotas: "Hasta 6 con Mercado Pago (+6%); el interés lo pone la tarjeta: NO calcules el valor de cada cuota.",
          ...(conUso ? { recordatorio: "Incluye WhatsApp automático o IA: aclará en una frase que lo que cobran por uso WhatsApp y el servicio de IA va aparte." } : {}),
        }),
        card,
      });
    }
    case "comparar": {
      const args = parsed.data as z.infer<typeof schemas.comparar>;
      if (args.ids.some(esGrande)) return { content: GRANDES, isError: true };
      const usd = args.moneda === "usd";
      const c = comparar({ ids: args.ids, medio: args.medio, tipoDeCambio: usd ? ctx.tipoDeCambio : undefined });
      if (c.filas.length < 2) return { content: `Para comparar hacen falta al menos 2 ids del catálogo. Desconocidos: ${c.desconocidos.join(", ") || "ninguno"}`, isError: true };
      return conDedup(ctx, {
        content: JSON.stringify({ ...c, nota: "Son alternativas: no las sumes ni des un total." }),
        card: {
          kind: "compare",
          ids: c.filas.map((f) => f.id),
          medio: c.medio,
          moneda: usd ? "usd" : "ars",
          filas: c.filas,
          ...(c.tipoDeCambio ? { tipoDeCambio: c.tipoDeCambio } : {}),
        },
      });
    }
    case "anotar_ficha": {
      const patch = limpiarFicha(parsed.data as z.infer<typeof schemas.anotar_ficha>);
      if (patch.planesInteres) patch.planesInteres = patch.planesInteres.map(nombreDe);
      ctx.ficha = mergeFicha(ctx.ficha, patch);
      return { content: "Anotado. No lo menciones.", ficha: patch };
    }
    case "mostrar_proyectos": {
      const items = conocimiento.proyectos.filter((p) => p.href).map((p) => ({ nombre: p.nombre, que: p.que, href: p.href }));
      return conDedup(ctx, {
        content: `Le mostré la tarjeta con ${items.map((i) => i.nombre).join(", ")} y el portfolio. No escribas los links.`,
        card: { kind: "proyectos", items, portfolio: conocimiento.portfolio },
      });
    }
    case "pedir_demo": {
      const { planId } = parsed.data as z.infer<typeof schemas.pedir_demo>;
      if (planId && esGrande(planId)) return { content: GRANDES, isError: true };
      const valid = planId && (getPlan(planId) || getCombo(planId)) ? planId : undefined;
      const demoHref = valid ? `/demo?plan=${valid}` : "/demo";
      const agendaHref = CALCOM_URL || waLink("Quiero agendar una videollamada");
      return {
        content: "Le mostré el botón para pedir la demo y la agenda. No escribas el link.",
        card: { kind: "demo", demoHref, agendaHref },
      };
    }
    case "derivar_whatsapp": {
      const { resumen } = parsed.data as z.infer<typeof schemas.derivar_whatsapp>;
      ctx.ficha = mergeFicha(ctx.ficha, { etapa: "derivado" });
      const href = waLink(mensajeWhatsApp(ctx.ficha, ultimaCotizacion(ctx), resumen));
      return {
        content: "Le mostré el botón de WhatsApp con su ficha. No repitas que te pasa con Mauro ni escribas el link.",
        card: { kind: "whatsapp", href },
        ficha: { etapa: "derivado" },
      };
    }
    case "pedir_contacto": {
      const { motivo } = parsed.data as z.infer<typeof schemas.pedir_contacto>;
      if (!consentEnabled()) {
        const href = waLink(mensajeWhatsApp(ctx.ficha, ultimaCotizacion(ctx), motivo));
        return { content: "Ahora no puedo guardar contactos. Le mostré el botón de WhatsApp con su ficha.", card: { kind: "whatsapp", href } };
      }
      const ticket = {
        rubro: (ctx.ficha.rubro || "Sin especificar").slice(0, 80),
        resumen: (ctx.ficha.necesidad || motivo || "Quiere que Mauro le escriba").slice(0, 600),
        iat: Date.now(),
      };
      return {
        content: "Le mostré el formulario. Los datos se guardan SOLO si lo completa y marca la casilla: no digas que ya quedaron guardados ni le pidas los datos por chat.",
        card: { kind: "formContacto", ticket, token: signTicket(ticket) },
      };
    }
    case "sugerir_respuestas": {
      const { opciones } = parsed.data as z.infer<typeof schemas.sugerir_respuestas>;
      return { content: "Mostré los botones. No los menciones.", card: { kind: "opciones", opciones: [...new Set(opciones)] } };
    }
    case "guardar_contacto": {
      const data = parsed.data as z.infer<typeof schemas.guardar_contacto>;
      const rubro = (data.rubro || ctx.ficha.rubro || "").slice(0, 80);
      const resumen = (data.resumen || ctx.ficha.necesidad || "").slice(0, 600);
      if (!consentEnabled()) {
        // Sin MALEJO_SALT en producción no se guardan contactos: se deriva a WhatsApp.
        const href = waLink(mensajeWhatsApp(mergeFicha(ctx.ficha, { nombre: data.nombre }), ultimaCotizacion(ctx), resumen));
        return {
          content: "Ahora no puedo guardar contactos. Le mostré el botón para escribirle a Mauro por WhatsApp con su ficha.",
          card: { kind: "whatsapp", href },
        };
      }
      if (!isPhoneAR(data.whatsapp)) {
        return { content: "El teléfono no parece un número argentino válido. Pedile el número completo, con código de área.", isError: true };
      }
      // Sin rubro o necesidad no se pierde el contacto (simulación R3, C13): van valores neutros.
      const payload: ContactPayload = {
        nombre: data.nombre,
        whatsapp: data.whatsapp,
        rubro: rubro.length >= 2 ? rubro : "Sin especificar",
        resumen: resumen.length >= 5 ? resumen : "Quiere que Mauro le escriba",
        iat: Date.now(),
      };
      ctx.ficha = mergeFicha(ctx.ficha, { nombre: data.nombre });
      return {
        content:
          "Le mostré la casilla de consentimiento. Los datos se guardan SOLO si la marca: no digas que ya quedaron guardados. Decile que, si la marca, Mauro le escribe por WhatsApp en hasta 2 días hábiles.",
        card: { kind: "consent", payload, token: signConsent(payload) },
        ficha: { nombre: data.nombre },
      };
    }
  }
}
