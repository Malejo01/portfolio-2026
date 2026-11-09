"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getCombo, getPlan } from "@/content/agencia/pricing";
import { consume } from "@/lib/agencia/chat/limits";
import { hashIp, ipFrom, origenPermitido, verifyTurnstile } from "@/lib/agencia/chat/security";
import { waLink } from "@/lib/agencia/config";
import { CAMPO_TRAMPA } from "@/lib/agencia/demo-plan";
import { avisarPorEmail } from "@/lib/agencia/email";
import { getDb, schema } from "@/lib/db";

/**
 * Server Action del brief de `/demo`. Valida con zod, guarda en `briefs` si
 * hay base y avisa por email con Resend si hay `RESEND_API_KEY`. Si no hay
 * ninguna de las dos, el brief no se pierde: devuelve un link de WhatsApp
 * con el texto armado.
 *
 * Anti-abuso (tanda R2): `Origin` ajeno → error (S6); campo trampa
 * (`CAMPO_TRAMPA`), invisible para las personas: si viene lleno se responde
 * "listo" sin guardar ni avisar (S5); Turnstile si hay claves (S4); y los
 * topes por IP del chat (ráfaga y diario), contados aparte (S1).
 *
 * `headers()` acá no vuelve dinámica la página: corre solo al enviar.
 */

const Brief = z.object({
  nombre: z.string().trim().min(2, "Decime tu nombre.").max(80),
  contacto: z
    .string()
    .trim()
    .min(6, "Dejame un WhatsApp o un email.")
    .max(120)
    .refine((v) => /\S+@\S+\.\S+/.test(v) || v.replace(/\D/g, "").length >= 8, "Tiene que ser un WhatsApp o un email válido."),
  rubro: z.string().trim().min(2, "Contame el rubro.").max(80),
  necesidad: z.string().trim().min(10, "Contame un poco más (al menos 10 caracteres).").max(2000),
  plan: z.string().trim().max(200).optional(),
  presupuesto: z.string().trim().max(60).optional(),
  consent: z.literal("on", { message: "Necesito tu permiso para contactarte." }),
});

type BriefField = keyof z.infer<typeof Brief>;

export interface BriefState {
  status: "idle" | "error" | "ok" | "fallback" | "bloqueado";
  errors?: Partial<Record<BriefField, string>>;
  values?: Partial<Record<BriefField, string>>;
  whatsapp?: string;
}

function planLabel(ids: string | undefined): string {
  if (!ids) return "";
  return ids
    .split(",")
    .map((id) => getPlan(id)?.name ?? getCombo(id)?.name ?? "")
    .filter(Boolean)
    .join(" + ");
}

const FIELDS: BriefField[] = ["nombre", "contacto", "rubro", "necesidad", "plan", "presupuesto", "consent"];

export async function enviarBrief(_prev: BriefState, form: FormData): Promise<BriefState> {
  const h = await headers();
  const raw = Object.fromEntries(FIELDS.map((k) => [k, form.get(k)?.toString() ?? ""]));
  const values = raw as BriefState["values"];
  const whatsappDe = (t: string) => waLink(`Hola Mauro, te paso mi consulta para la demo:\n${t}`);

  if (!origenPermitido(h.get("origin"))) return { status: "bloqueado", values };
  // Un bot llena todo: el campo trampa delata. Respondemos "listo" y no se guarda nada.
  if (form.get(CAMPO_TRAMPA)?.toString().trim()) return { status: "ok" };

  const ip = ipFrom(h);
  const tope = await consume(hashIp(ip), { ambito: "demo" });
  if (!tope.ok) return { status: "fallback", values, whatsapp: whatsappDe(`Nombre: ${raw.nombre}\nRubro: ${raw.rubro}\nNecesita: ${raw.necesidad}`) };
  if (!(await verifyTurnstile(form.get("cf-turnstile-response")?.toString(), ip))) return { status: "bloqueado", values };

  const parsed = Brief.safeParse(raw);
  if (!parsed.success) {
    const errors: BriefState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as BriefField;
      errors[field] ??= field === "consent" ? "Necesito tu permiso para contactarte." : issue.message;
    }
    return { status: "error", errors, values };
  }

  const b = parsed.data;
  const plan = planLabel(b.plan);
  const texto = [
    `Nombre: ${b.nombre}`,
    `Contacto: ${b.contacto}`,
    `Rubro: ${b.rubro}`,
    plan ? `Plan: ${plan}` : "",
    b.presupuesto ? `Presupuesto: ${b.presupuesto}` : "",
    `Necesita: ${b.necesidad}`,
  ]
    .filter(Boolean)
    .join("\n");

  let guardado = false;
  const db = getDb();
  if (db) {
    try {
      await db.insert(schema.briefs).values({
        nombre: b.nombre,
        contacto: b.contacto,
        rubro: b.rubro,
        necesidad: b.necesidad,
        plan: b.plan || null,
        presupuesto: b.presupuesto || null,
        consentAt: new Date(),
        ipHash: hashIp(ip),
      });
      guardado = true;
    } catch (err) {
      console.error("[brief] insert error", (err as Error)?.name);
    }
  }
  const avisado = await avisarPorEmail("Nueva consulta desde malejo.com.ar", texto);

  const whatsapp = whatsappDe(texto);
  if (!guardado && !avisado) return { status: "fallback", whatsapp, values };
  return { status: "ok", whatsapp };
}
