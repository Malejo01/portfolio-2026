import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Piezas de seguridad del chat. Solo servidor.
 *
 * - La IP nunca se guarda: se guarda SHA-256(sal + IP), con `MALEJO_SALT`.
 * - El consentimiento lo firma el servidor (HMAC con la misma sal) cuando el
 *   agente propone guardar un contacto. La firma viaja a la UI, nunca al
 *   modelo, y solo la UI la devuelve, con la casilla marcada. Así el modelo
 *   no puede "activar" el guardado por su cuenta.
 */

function salt(): string {
  // Sin sal configurada se usa una fija de desarrollo: los hashes siguen sin
  // ser la IP, pero Mauro tiene que cargar MALEJO_SALT en producción.
  return process.env.MALEJO_SALT || "malejo-dev-salt";
}

export function ipFrom(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "0.0.0.0";
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(`${salt()}:${ip}`).digest("hex");
}

export interface ContactPayload {
  nombre: string;
  whatsapp: string;
  rubro: string;
  resumen: string;
  /** Epoch ms de emisión: la firma vence a la hora. */
  iat: number;
}

function canonical(p: ContactPayload): string {
  return JSON.stringify([p.nombre, p.whatsapp, p.rubro, p.resumen, p.iat]);
}

export function signConsent(p: ContactPayload): string {
  return createHmac("sha256", salt()).update(canonical(p)).digest("hex");
}

export function verifyConsent(p: ContactPayload, token: string): boolean {
  if (!/^[0-9a-f]{64}$/.test(token)) return false;
  if (Date.now() - p.iat > 60 * 60 * 1000 || p.iat > Date.now() + 60_000) return false;
  const expected = Buffer.from(signConsent(p), "hex");
  return timingSafeEqual(expected, Buffer.from(token, "hex"));
}

/**
 * Teléfono argentino: con o sin +54, con o sin 9, con o sin 0 de larga
 * distancia y 15 de celular, separado por espacios o guiones.
 * Ej.: "+54 9 387 581-3233", "0387 15 581-3233", "3875813233".
 */
export const PHONE_AR = /^(?:\+?54[\s-]?)?(?:9[\s-]?)?0?\d{2,4}[\s-]?(?:15[\s-]?)?\d{3,4}[\s-]?\d{4}$/;

export function isPhoneAR(value: string): boolean {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return PHONE_AR.test(trimmed) && digits.length >= 10 && digits.length <= 14;
}

/** Turnstile: si no hay `TURNSTILE_SECRET_KEY`, no se exige. */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
