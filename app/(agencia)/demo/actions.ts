"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getCombo, getPlan } from "@/content/agencia/pricing";
import { hashIp, ipFrom } from "@/lib/agencia/chat/security";
import { waLink } from "@/lib/agencia/config";
import { getDb, schema } from "@/lib/db";

/**
 * Server Action del brief de `/demo`. Valida con zod, guarda en `briefs` si
 * hay base y avisa por email con Resend si hay `RESEND_API_KEY`. Si no hay
 * ninguna de las dos, el brief no se pierde: devuelve un link de WhatsApp
 * con el texto armado.
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
  status: "idle" | "error" | "ok" | "fallback";
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

async function avisar(texto: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.EMAIL_TO;
  if (!key || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Malejo <onboarding@resend.dev>",
        to: [to],
        subject: "Nuevo brief desde malejo.com.ar",
        text: texto,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const FIELDS: BriefField[] = ["nombre", "contacto", "rubro", "necesidad", "plan", "presupuesto", "consent"];

export async function enviarBrief(_prev: BriefState, form: FormData): Promise<BriefState> {
  const raw = Object.fromEntries(FIELDS.map((k) => [k, form.get(k)?.toString() ?? ""]));
  const values = raw as BriefState["values"];
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
      const h = await headers();
      await db.insert(schema.briefs).values({
        nombre: b.nombre,
        contacto: b.contacto,
        rubro: b.rubro,
        necesidad: b.necesidad,
        plan: b.plan || null,
        presupuesto: b.presupuesto || null,
        consentAt: new Date(),
        ipHash: hashIp(ipFrom(h)),
      });
      guardado = true;
    } catch (err) {
      console.error("[brief] insert error", (err as Error)?.name);
    }
  }
  const avisado = await avisar(texto);

  const whatsapp = waLink(`Hola Mauro, te paso mi brief para la demo:\n${texto}`);
  if (!guardado && !avisado) return { status: "fallback", whatsapp, values };
  return { status: "ok", whatsapp };
}
