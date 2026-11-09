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
  // ser la IP, pero esa sal está en el repo. Por eso en producción la firma
  // de consentimiento no se emite ni se acepta sin MALEJO_SALT
  // (`consentEnabled`): con la sal pública cualquiera podría falsificarla.
  return process.env.MALEJO_SALT || "malejo-dev-salt";
}

/** Se puede firmar y verificar consentimiento: hay sal propia, o no es producción. */
export function consentEnabled(): boolean {
  return Boolean(process.env.MALEJO_SALT) || process.env.NODE_ENV !== "production";
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
  if (!consentEnabled() || !/^[0-9a-f]{64}$/.test(token)) return false;
  if (Date.now() - p.iat > 60 * 60 * 1000 || p.iat > Date.now() + 60_000) return false;
  const expected = Buffer.from(signConsent(p), "hex");
  return timingSafeEqual(expected, Buffer.from(token, "hex"));
}

/**
 * Ticket del formulario de contacto del chat (tanda R3, `pedir_contacto`).
 * El servidor firma el rubro y el resumen que salen de la ficha; el nombre
 * y el WhatsApp los escribe la persona en el formulario, con la casilla
 * marcada. Así `/api/contacto` solo acepta envíos que nacieron en el chat,
 * y el modelo tampoco puede disparar el guardado: necesita a la persona.
 * El prefijo `ticket:` evita que una firma sirva para el otro formato.
 */
export interface ContactTicket {
  rubro: string;
  resumen: string;
  iat: number;
}

export function signTicket(t: ContactTicket): string {
  return createHmac("sha256", salt()).update(`ticket:${JSON.stringify([t.rubro, t.resumen, t.iat])}`).digest("hex");
}

export function verifyTicket(t: ContactTicket, token: string): boolean {
  if (!consentEnabled() || !/^[0-9a-f]{64}$/.test(token)) return false;
  if (Date.now() - t.iat > 2 * 60 * 60 * 1000 || t.iat > Date.now() + 60_000) return false;
  return timingSafeEqual(Buffer.from(signTicket(t), "hex"), Buffer.from(token, "hex"));
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

/**
 * Llave de pruebas (S1): el header `x-malejo-test: <token>` saltea los
 * límites por IP (no el global), para correr las evals desde una sola IP.
 * Sin `CHAT_TEST_TOKEN` configurado no hay llave. Comparación en tiempo
 * constante sobre los SHA-256, así el largo del token no se filtra.
 */
export const TEST_HEADER = "x-malejo-test";

export function esTokenDePrueba(valor: string | null | undefined): boolean {
  const token = process.env.CHAT_TEST_TOKEN;
  if (!token || token.length < 16 || !valor) return false;
  const a = createHash("sha256").update(token).digest();
  const b = createHash("sha256").update(valor).digest();
  return timingSafeEqual(a, b);
}

/**
 * Orígenes aceptados por `/api/chat`, `/api/contacto` y la Server Action de
 * `/demo` (S6). Un pedido **con** `Origin` distinto se rechaza con 403; sin
 * `Origin` (curl, el runner de evals, un servidor) pasa y lo frenan los
 * límites. Vale el dominio propio, `NEXT_PUBLIC_SITE_URL`, las URLs que
 * Vercel le da al despliegue (vista previa incluida: `VERCEL_URL`,
 * `VERCEL_BRANCH_URL`, `VERCEL_PROJECT_PRODUCTION_URL`), los de
 * `CHAT_ALLOWED_ORIGINS` (separados por coma) y, fuera de producción,
 * `localhost`.
 */
export function origenesPermitidos(env: NodeJS.ProcessEnv = process.env): Set<string> {
  const lista = ["https://malejo.com.ar", "https://www.malejo.com.ar"];
  const url = (v?: string) => {
    if (!v) return;
    try {
      lista.push(new URL(v.includes("://") ? v : `https://${v}`).origin);
    } catch {}
  };
  url(env.NEXT_PUBLIC_SITE_URL);
  url(env.VERCEL_URL);
  url(env.VERCEL_BRANCH_URL);
  url(env.VERCEL_PROJECT_PRODUCTION_URL);
  for (const o of (env.CHAT_ALLOWED_ORIGINS ?? "").split(",")) url(o.trim());
  return new Set(lista);
}

export function origenPermitido(origin: string | null | undefined, env: NodeJS.ProcessEnv = process.env): boolean {
  if (!origin) return true;
  let o: URL;
  try {
    o = new URL(origin);
  } catch {
    return false;
  }
  if (env.NODE_ENV !== "production" && (o.hostname === "localhost" || o.hostname === "127.0.0.1")) return true;
  return origenesPermitidos(env).has(o.origin);
}

/** Respuesta 403 para un `Origin` ajeno. */
export function rechazarOrigen(): Response {
  return Response.json({ ok: false, error: "Origen no permitido." }, { status: 403 });
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
