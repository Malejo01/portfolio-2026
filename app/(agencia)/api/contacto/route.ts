import { z } from "zod";
import { consume } from "@/lib/agencia/chat/limits";
import {
  hashIp,
  ipFrom,
  isPhoneAR,
  origenPermitido,
  rechazarOrigen,
  verifyConsent,
  verifyTicket,
  verifyTurnstile,
} from "@/lib/agencia/chat/security";
import { resumenDeArmado } from "@/lib/agencia/armado-resumen";
import { avisarPorEmail } from "@/lib/agencia/email";
import { validarArmado } from "@/lib/agencia/pricing";
import { getDb, schema } from "@/lib/db";

/**
 * Guarda un contacto del chat. Es el único camino al insert de `leads`, y
 * exige siempre:
 *
 * 1. `consent: true`: la casilla "Acepto que Mauro me contacte por
 *    WhatsApp" marcada en la UI.
 * 2. Una firma HMAC emitida por `/api/chat`, que el modelo nunca ve. Dos
 *    formatos:
 *    - `guardar_contacto`: la persona escribió nombre y WhatsApp en la
 *      charla; la firma cubre el payload completo, que no se puede editar.
 *    - `pedir_contacto` (R3): un formulario. La firma cubre el **ticket**
 *      (rubro y resumen de la ficha) y la persona escribe nombre y WhatsApp.
 * 3. Turnstile, si existe `TURNSTILE_SECRET_KEY`.
 *
 * Tanda P2 suma la variante **`armado`** ("Mandale tu armado a Mauro"): no
 * lleva firma porque no nace en el chat, pero exige la casilla, Turnstile y
 * los mismos topes. El cliente manda **solo ids**: el servidor los valida
 * contra el catálogo y escribe el resumen ("Armado: … · estimado $X–$Y ·
 * seña $25.000"), más una línea de la ficha si la hay. Si existen
 * `RESEND_API_KEY` y `MAURO_EMAIL`, avisa por mail; si no, `console.info`
 * sin datos personales.
 *
 * Antes de todo, un `Origin` ajeno se rechaza con 403 (S6) y se aplican los
 * topes por IP de los formularios. Solo insert. No hay ningún endpoint que
 * lea contactos.
 */
export const runtime = "nodejs";

const Firmado = z.object({
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

const Formulario = z.object({
  consent: z.literal(true),
  token: z.string(),
  turnstile: z.string().optional(),
  ticket: z.object({ rubro: z.string().min(2).max(80), resumen: z.string().min(5).max(600), iat: z.number() }),
  nombre: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().min(8).max(30),
});

/** Tanda P2: el armado de `/soluciones`. Solo ids; el resumen lo escribe el servidor. */
const Armado = z.object({
  consent: z.literal(true),
  turnstile: z.string().optional(),
  armado: z.object({
    items: z.array(z.string().max(60)).max(24),
    extras: z.array(z.string().max(60)).max(24).optional(),
  }),
  nombre: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().min(8).max(30),
  rubro: z.string().trim().max(80).optional(),
  nota: z.string().trim().max(300).optional(),
  /** Lo que el chat sabe (la ficha del widget): rubro y problema, recortados. */
  ficha: z.object({ rubro: z.string().max(120).optional(), necesidad: z.string().max(300).optional() }).optional(),
});

export async function POST(request: Request) {
  if (!origenPermitido(request.headers.get("origin"))) return rechazarOrigen();
  const raw = await request.json().catch(() => null);
  const esArmado = Boolean(raw && typeof raw === "object" && "armado" in raw);
  const armado = esArmado ? Armado.safeParse(raw) : null;
  const firmado = esArmado ? null : Firmado.safeParse(raw);
  const formulario = esArmado || firmado?.success ? null : Formulario.safeParse(raw);
  if (!armado?.success && !firmado?.success && !formulario?.success) return Response.json({ ok: false, error: "Falta tu consentimiento." }, { status: 400 });

  let datos: { nombre: string; whatsapp: string; rubro: string; resumen: string };
  let origen = "chat";
  if (armado?.success) {
    const a = armado.data;
    const elegido = validarArmado({ items: a.armado.items, extras: a.armado.extras ?? [] });
    if (!elegido.items.length && !elegido.extras.length) {
      return Response.json({ ok: false, error: "Tu armado está vacío: agregá algo antes de mandarlo." }, { status: 400 });
    }
    if (!isPhoneAR(a.whatsapp)) {
      return Response.json({ ok: false, error: "Revisá el WhatsApp: tiene que ser un número argentino con código de área." }, { status: 400 });
    }
    const rubro = (a.rubro || a.ficha?.rubro || "").replace(/\s+/g, " ").trim().slice(0, 80);
    datos = {
      nombre: a.nombre,
      whatsapp: a.whatsapp,
      rubro: rubro.length >= 2 ? rubro : "Sin especificar",
      resumen: resumenDeArmado(elegido, { ficha: a.ficha, nota: a.nota }),
    };
    origen = "armado";
  } else if (firmado?.success) {
    const { payload, token } = firmado.data;
    if (!verifyConsent(payload, token) || !isPhoneAR(payload.whatsapp)) {
      return Response.json({ ok: false, error: "No pude validar el pedido. Probá de nuevo desde el chat." }, { status: 400 });
    }
    datos = payload;
  } else {
    const f = formulario!.data!;
    if (!verifyTicket(f.ticket, f.token)) {
      return Response.json({ ok: false, error: "No pude validar el pedido. Probá de nuevo desde el chat." }, { status: 400 });
    }
    if (!isPhoneAR(f.whatsapp)) {
      return Response.json({ ok: false, error: "Revisá el WhatsApp: tiene que ser un número argentino con código de área." }, { status: 400 });
    }
    datos = { nombre: f.nombre, whatsapp: f.whatsapp, rubro: f.ticket.rubro, resumen: f.ticket.resumen };
  }

  const ip = ipFrom(request.headers);
  const tope = await consume(hashIp(ip), { ambito: "demo" });
  if (!tope.ok) return Response.json({ ok: false, error: "Recibí varios pedidos seguidos. Esperá unos minutos o escribime por WhatsApp." }, { status: 429 });
  const turnstile = armado?.success ? armado.data.turnstile : firmado?.success ? firmado.data.turnstile : formulario!.data!.turnstile;
  if (!(await verifyTurnstile(turnstile, ip))) {
    return Response.json({ ok: false, error: "No pude verificar que no seas un robot." }, { status: 400 });
  }

  const db = getDb();
  if (!db) return Response.json({ ok: false, error: "Ahora no puedo guardar datos: escribime por WhatsApp." }, { status: 503 });

  try {
    await db.insert(schema.leads).values({
      nombre: datos.nombre,
      whatsapp: datos.whatsapp,
      rubro: datos.rubro,
      resumen: datos.resumen,
      origen,
      consentAt: new Date(),
      ipHash: hashIp(ip),
    });
  } catch (err) {
    console.error("[contacto] insert error", (err as Error)?.name);
    return Response.json({ ok: false, error: "No pude guardar tus datos: escribime por WhatsApp." }, { status: 500 });
  }
  if (origen === "armado") {
    const avisado = await avisarPorEmail("Nuevo armado desde malejo.com.ar", `${datos.nombre} · ${datos.whatsapp} · ${datos.rubro}\n\n${datos.resumen}`);
    // Sin mail configurado: un aviso en el log, sin datos personales.
    if (!avisado) console.info("[contacto] armado recibido (sin aviso por mail)");
  }
  return Response.json({ ok: true });
}
