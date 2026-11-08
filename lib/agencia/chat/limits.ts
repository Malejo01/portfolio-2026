import { and, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/**
 * Topes de uso del chat, por día: por IP (hasheada) y global. Con base se
 * cuentan en `chat_usage`; sin base, en memoria de la instancia (mejor que
 * nada en desarrollo, no confiable en serverless).
 *
 * Etapa de pruebas (tanda CHAT-R1, F7):
 * - `CHAT_DAILY_LIMIT_IP`: vacío o `0` = **sin límite por IP** (el default).
 * - `CHAT_DAILY_LIMIT_TOTAL`: default **1000** por día, como red de
 *   seguridad ante abuso en un endpoint público; `0` = sin límite.
 * El tope real de gasto lo pone el límite mensual del workspace de Anthropic.
 */
const memory = new Map<string, number>();

/** `undefined`, vacío o inválido → `fallback`; `0` → sin límite. */
function leer(raw: string | undefined, fallback: number): number {
  if (raw == null || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

/** Topes vigentes. `0` = sin límite. */
export function limites(): { ip: number; total: number } {
  return {
    ip: leer(process.env.CHAT_DAILY_LIMIT_IP, 0),
    total: leer(process.env.CHAT_DAILY_LIMIT_TOTAL, 1000),
  };
}

/** Solo para tests: vacía el contador en memoria. */
export function resetUsoEnMemoria(): void {
  memory.clear();
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Suma un mensaje y dice si todavía está dentro de los topes. */
export async function consume(ipHash: string): Promise<{ ok: boolean; reason?: "ip" | "total" }> {
  const { ip, total } = limites();
  if (!ip && !total) return { ok: true };
  const dia = today();
  const db = getDb();

  if (!db) {
    const kIp = `${dia}:${ipHash}`;
    const kTotal = `${dia}:*`;
    const nIp = (memory.get(kIp) ?? 0) + 1;
    const nTotal = (memory.get(kTotal) ?? 0) + 1;
    if (ip && nIp > ip) return { ok: false, reason: "ip" };
    if (total && nTotal > total) return { ok: false, reason: "total" };
    memory.set(kIp, nIp);
    memory.set(kTotal, nTotal);
    return { ok: true };
  }

  const [row] = await db
    .insert(schema.chatUsage)
    .values({ dia, ipHash, mensajes: 1 })
    .onConflictDoUpdate({
      target: [schema.chatUsage.dia, schema.chatUsage.ipHash],
      set: { mensajes: sql`${schema.chatUsage.mensajes} + 1` },
    })
    .returning({ mensajes: schema.chatUsage.mensajes });
  if (ip && (row?.mensajes ?? 0) > ip) return { ok: false, reason: "ip" };
  if (!total) return { ok: true };

  const [sum] = await db
    .select({ n: sql<number>`coalesce(sum(${schema.chatUsage.mensajes}), 0)::int` })
    .from(schema.chatUsage)
    .where(and(eq(schema.chatUsage.dia, dia)));
  if ((sum?.n ?? 0) > total) return { ok: false, reason: "total" };
  return { ok: true };
}
