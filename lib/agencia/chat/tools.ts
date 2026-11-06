import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { combos, extras, getCombo, getPlan, plans } from "@/content/agencia/pricing";
import { CALCOM_URL, waLink } from "@/lib/agencia/config";
import { cotizar, resumenCotizacion } from "@/lib/agencia/pricing";
import { isPhoneAR, signConsent, type ContactPayload } from "./security";

/**
 * Herramientas del agente Malejo. Cada una tiene su esquema zod (se valida
 * en el servidor antes de ejecutar: con `eager_input_streaming` la API no
 * valida el input) y devuelve dos cosas: el texto para el modelo y, si
 * corresponde, una tarjeta para la UI.
 *
 * No hay ninguna herramienta que lea contactos. `guardar_contacto` no
 * guarda: firma el pedido y se lo pasa a la UI, que muestra la casilla de
 * consentimiento; el insert lo hace `/api/contacto` solo con la casilla
 * marcada y la firma válida.
 */

const ids = [...plans.map((p) => p.id), ...combos.map((c) => c.id)];
const extraIds = extras.map((e) => e.id);

const schemas = {
  cotizar: z.object({
    planIds: z.array(z.string()).min(1).max(6),
    extras: z.array(z.string()).max(7).optional(),
    medio: z.enum(["transferencia", "mp"]).optional(),
  }),
  pedir_demo: z.object({ planId: z.string().optional() }),
  derivar_whatsapp: z.object({ resumen: z.string().min(1).max(600) }),
  guardar_contacto: z.object({
    nombre: z.string().trim().min(2).max(80),
    whatsapp: z.string().trim().min(8).max(30),
    rubro: z.string().trim().min(2).max(80),
    resumen: z.string().trim().min(5).max(600),
  }),
};

export type ToolName = keyof typeof schemas;

export const tools: Anthropic.Tool[] = [
  {
    name: "cotizar",
    description:
      "Calcula el precio exacto de uno o más planes o combos del catálogo de Malejo, con extras opcionales y medio de pago. Usala SIEMPRE antes de decir cualquier monto. Si la selección incluye todas las partes de un combo, aplica el combo sola.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        planIds: { type: "array", items: { type: "string", enum: ids }, description: "Ids de planes o combos del catálogo." },
        extras: { type: "array", items: { type: "string", enum: extraIds } },
        medio: { type: "string", enum: ["transferencia", "mp"], description: "mp = Mercado Pago (+6%). Por defecto transferencia." },
      },
      required: ["planIds"],
    },
  },
  {
    name: "pedir_demo",
    description: "Devuelve el link para pedir la demo con seña (y la agenda si existe). Usala cuando la persona quiera avanzar.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: { planId: { type: "string", enum: ids, description: "Plan o combo elegido, si hay uno." } },
    },
  },
  {
    name: "derivar_whatsapp",
    description: "Arma un link de WhatsApp a Mauro con un resumen de la consulta. Usala si no sabés algo, si piden hablar con una persona o si el pedido no entra en el catálogo.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: { resumen: { type: "string", description: "Resumen breve de lo que necesita, en primera persona." } },
      required: ["resumen"],
    },
  },
  {
    name: "guardar_contacto",
    description:
      "Propone guardar el contacto para que Mauro escriba. NO guarda nada: le muestra a la persona una casilla de consentimiento y solo se guarda si la marca. Usala solo cuando la persona ya te dio nombre y WhatsApp por su cuenta y quiere que la contacten.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        nombre: { type: "string" },
        whatsapp: { type: "string", description: "Teléfono argentino." },
        rubro: { type: "string" },
        resumen: { type: "string", description: "Qué necesita, en una o dos frases." },
      },
      required: ["nombre", "whatsapp", "rubro", "resumen"],
    },
  },
];

export type Card =
  | { kind: "quote"; titulo: string; implementacion: number; mensual: number; desde: boolean; demoHref: string; medio: "transferencia" | "mp" }
  | { kind: "demo"; demoHref: string; agendaHref: string }
  | { kind: "whatsapp"; href: string }
  | { kind: "consent"; payload: ContactPayload; token: string };

export interface ToolOutcome {
  content: string;
  isError?: boolean;
  card?: Card;
}

export function runTool(name: string, input: unknown): ToolOutcome {
  if (!(name in schemas)) return { content: `Herramienta desconocida: ${name}`, isError: true };
  const parsed = schemas[name as ToolName].safeParse(input);
  if (!parsed.success) {
    return { content: JSON.stringify({ INVALID_INPUT: parsed.error.issues.map((i) => i.message) }), isError: true };
  }

  switch (name as ToolName) {
    case "cotizar": {
      const args = parsed.data as z.infer<typeof schemas.cotizar>;
      const c = cotizar({ planIds: args.planIds, extras: args.extras, medio: args.medio });
      if (!c.items.length) return { content: `Ningún id existe en el catálogo: ${c.desconocidos.join(", ")}`, isError: true };
      const principal = c.items.filter((i) => i.tipo !== "extra");
      const titulo = c.items.length === 1 ? c.items[0].nombre : principal.map((i) => i.nombre).join(" + ") || "Tu cotización";
      return {
        content: JSON.stringify({ ...c, resumen: resumenCotizacion(c) }),
        card: {
          kind: "quote",
          titulo,
          implementacion: c.implementacion,
          mensual: c.abonoMensual,
          desde: c.desde,
          medio: c.medio,
          demoHref: `/demo?plan=${encodeURIComponent(principal.map((i) => i.id).join(","))}`,
        },
      };
    }
    case "pedir_demo": {
      const { planId } = parsed.data as z.infer<typeof schemas.pedir_demo>;
      const valid = planId && (getPlan(planId) || getCombo(planId)) ? planId : undefined;
      const demoHref = valid ? `/demo?plan=${valid}` : "/demo";
      const agendaHref = CALCOM_URL || waLink("Quiero agendar una videollamada");
      return { content: JSON.stringify({ demoHref, agenda: CALCOM_URL ? "Cal.com" : "WhatsApp" }), card: { kind: "demo", demoHref, agendaHref } };
    }
    case "derivar_whatsapp": {
      const { resumen } = parsed.data as z.infer<typeof schemas.derivar_whatsapp>;
      const href = waLink(`Hola Mauro, vengo del chat de malejo.com.ar. ${resumen}`);
      return { content: "Le mostré el botón de WhatsApp con el resumen.", card: { kind: "whatsapp", href } };
    }
    case "guardar_contacto": {
      const data = parsed.data as z.infer<typeof schemas.guardar_contacto>;
      if (!isPhoneAR(data.whatsapp)) {
        return { content: "El teléfono no parece un número argentino válido. Pedile que lo revise (con código de área).", isError: true };
      }
      const payload: ContactPayload = { ...data, iat: Date.now() };
      return {
        content:
          "Le mostré la casilla de consentimiento. Los datos se guardan SOLO si la marca: no digas que ya quedaron guardados. Decile que, si la marca, Mauro le escribe.",
        card: { kind: "consent", payload, token: signConsent(payload) },
      };
    }
  }
}
