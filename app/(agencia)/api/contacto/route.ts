import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { hashIp, ipFrom, isPhoneAR, verifyConsent, verifyTurnstile } from "@/lib/agencia/chat/security";

/**
 * Guarda un contacto del chat. Es el único camino al insert de `leads`, y
 * exige las tres cosas:
 *
 * 1. `consent: true`: la casilla "Acepto que Mauro me contacte por
 *    WhatsApp" marcada en la UI.
 * 2. Una firma HMAC válida del payload, emitida por `/api/chat` cuando el
 *    agente propuso guardar el contacto. El modelo nunca ve esa firma, así
 *    que no puede disparar este endpoint, y el payload no se puede editar.
 * 3. Turnstile, si existe `TURNSTILE_SECRET_KEY`.
 *
 * Solo insert. No hay ningún endpoint que lea contactos.
 */
export const runtime = "nodejs";

const Body = z.object({
  consent: z.literal(true),
  token: z.string(),
  turnstile: z.string().optional(),
  payload: z.object({
    nombre: z.string().min(2).max(80),
    whatsapp: z.string().min(8).max(30),
    rubro: z.string().min(2).max(80),
    resumen: z.string().min(5).max(600),
    iat: z.number(),
  }),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, error: "Falta tu consentimiento." }, { status: 400 });

  const { payload, token, turnstile } = parsed.data;
  if (!verifyConsent(payload, token) || !isPhoneAR(payload.whatsapp)) {
    return Response.json({ ok: false, error: "No pude validar el pedido. Probá de nuevo desde el chat." }, { status: 400 });
  }

  const ip = ipFrom(request.headers);
  if (!(await verifyTurnstile(turnstile, ip))) {
    return Response.json({ ok: false, error: "No pude verificar que no seas un robot." }, { status: 400 });
  }

  const db = getDb();
  if (!db) return Response.json({ ok: false, error: "Ahora no puedo guardar datos: escribime por WhatsApp." }, { status: 503 });

  try {
    await db.insert(schema.leads).values({
      nombre: payload.nombre,
      whatsapp: payload.whatsapp,
      rubro: payload.rubro,
      resumen: payload.resumen,
      origen: "chat",
      consentAt: new Date(),
      ipHash: hashIp(ip),
    });
  } catch (err) {
    console.error("[contacto] insert error", (err as Error)?.name);
    return Response.json({ ok: false, error: "No pude guardar tus datos: escribime por WhatsApp." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
