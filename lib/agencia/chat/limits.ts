import { and, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/**
 * Topes de uso del chat: por IP (hasheada) y global, por día. Con base se
 * cuentan en `chat_usage`; sin base, en memoria de la instancia (mejor que
 * nada en desarrollo, no confiable en serverless).
 */
const memory = new Map<string, number>();

function limits() {
  return {
    ip: Number(process.env.CHAT_DAILY_LIMIT_IP) || 30,
    total: Number(process.env.CHAT_DAILY_LIMIT_TOTAL) || 500,
  };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Suma un mensaje y dice si todavía está dentro de los topes. */
export async function consume(ipHash: string): Promise<{ ok: boolean; reason?: "ip" | "total" }> {
  const { ip, total } = limits();
  const dia = today();
  const db = getDb();

  if (!db) {
    const kIp = `${dia}:${ipHash}`;
    const kTotal = `${dia}:*`;
    const nIp = (memory.get(kIp) ?? 0) + 1;
    const nTotal = (memory.get(kTotal) ?? 0) + 1;
    if (nIp > ip) return { ok: false, reason: "ip" };
    if (nTotal > total) return { ok: false, reason: "total" };
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
  if ((row?.mensajes ?? 0) > ip) return { ok: false, reason: "ip" };

  const [sum] = await db
    .select({ n: sql<number>`coalesce(sum(${schema.chatUsage.mensajes}), 0)::int` })
    .from(schema.chatUsage)
    .where(and(eq(schema.chatUsage.dia, dia)));
  if ((sum?.n ?? 0) > total) return { ok: false, reason: "total" };
  return { ok: true };
}
