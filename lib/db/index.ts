import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export { schema };

let cached: ReturnType<typeof drizzle<typeof schema>> | null | undefined;

/**
 * Cliente de Drizzle sobre el driver HTTP de Neon, o `null` si no hay
 * `DATABASE_URL`. Todo lo que guarda datos tiene que tolerar el `null`: el
 * sitio funciona sin base (el chat responde y deriva a WhatsApp, el brief
 * avisa por email si hay Resend).
 */
export function getDb() {
  if (cached !== undefined) return cached;
  const url = process.env.DATABASE_URL;
  cached = url ? drizzle(neon(url), { schema }) : null;
  return cached;
}
