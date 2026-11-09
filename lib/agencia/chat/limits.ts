import { and, eq, gte, not, like, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/**
 * Topes de uso del chat (y del formulario de `/demo`). Con base se cuentan
 * en Postgres; sin base, en memoria de la instancia (mejor que nada en
 * desarrollo, no confiable en serverless).
 *
 * Tanda R2 (seguridad, `claude/malejo-seguridad-chat-8-11.md`):
 * - **S1 · Ráfaga por IP**: `CHAT_BURST_LIMIT` mensajes cada 10 minutos por
 *   IP hasheada (default 20; `0` = sin tope). Tabla `chat_burst`.
 * - **Diario por IP**: `CHAT_DAILY_LIMIT_IP`, default **150** (`0` = sin tope).
 * - **Global por día**: `CHAT_DAILY_LIMIT_TOTAL`, default 1000 (`0` = sin
 *   tope). Solo cuenta el chat, no el formulario.
 * - **Llave de pruebas**: con `saltarIp` (header `x-malejo-test` válido) no
 *   se aplican los topes por IP, pero el global sí.
 * - **S7 · Fallar cerrado**: si la base falla, el tope global cae a un
 *   contador en memoria con un tope conservador (`TOPE_SIN_BASE`, 100 por
 *   día por instancia) en vez de dejar pasar todo. Los topes por IP siguen
 *   en memoria.
 * El tope real de gasto lo pone el límite mensual del workspace de Anthropic.
 */

/** Ventana de la ráfaga, en minutos. */
export const VENTANA_MIN = 10;
/** Tope global de emergencia cuando la base no responde (S7). */
export const TOPE_SIN_BASE = 100;

export type Motivo = "rafaga" | "ip" | "total";
export type Ambito = "chat" | "demo";

const memory = new Map<string, number>();

/** `undefined`, vacío o inválido → `fallback`; `0` → sin límite. */
function leer(raw: string | undefined, fallback: number): number {
  if (raw == null || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

/** Topes vigentes. `0` = sin límite. */
export function limites(): { rafaga: number; ip: number; total: number } {
  return {
    rafaga: leer(process.env.CHAT_BURST_LIMIT, 20),
    ip: leer(process.env.CHAT_DAILY_LIMIT_IP, 150),
    total: leer(process.env.CHAT_DAILY_LIMIT_TOTAL, 1000),
  };
}

/** Solo para tests: vacía los contadores en memoria. */
export function resetUsoEnMemoria(): void {
  memory.clear();
}

function today(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function ventana(now: number): number {
  return Math.floor(now / (VENTANA_MIN * 60_000));
}

function sumar(clave: string): number {
  const n = (memory.get(clave) ?? 0) + 1;
  memory.set(clave, n);
  return n;
}

/**
 * Cuenta en memoria. `totalTope` permite bajar el global (fallar cerrado).
 * Suma antes de comparar: un pedido rechazado también cuenta, así una
 * ráfaga insistente no se recupera reintentando.
 */
function enMemoria(key: string, ambito: Ambito, saltarIp: boolean, now: number, totalTope: number): { ok: boolean; reason?: Motivo } {
  const { rafaga, ip } = limites();
  const dia = today(now);
  if (!saltarIp) {
    if (rafaga && sumar(`r:${ventana(now)}:${key}`) > rafaga) return { ok: false, reason: "rafaga" };
    if (ip && sumar(`d:${dia}:${key}`) > ip) return { ok: false, reason: "ip" };
  }
  if (ambito === "chat" && totalTope && sumar(`t:${dia}`) > totalTope) return { ok: false, reason: "total" };
  return { ok: true };
}

/**
 * Suma un pedido y dice si sigue dentro de los topes. Nunca tira: si la
 * base falla, cuenta en memoria con el tope global de emergencia.
 */
export async function consume(
  ipHash: string,
  { saltarIp = false, ambito = "chat", now = Date.now() }: { saltarIp?: boolean; ambito?: Ambito; now?: number } = {},
): Promise<{ ok: boolean; reason?: Motivo }> {
  const { rafaga, ip, total } = limites();
  const totalChat = ambito === "chat" ? total : 0;
  if (!rafaga && !ip && !totalChat) return { ok: true };
  // El formulario cuenta aparte: no consume el cupo del chat de esa IP.
  const key = ambito === "demo" ? `demo:${ipHash}` : ipHash;

  const db = getDb();
  if (!db) return enMemoria(key, ambito, saltarIp, now, totalChat);

  try {
    const dia = today(now);
    if (!saltarIp && rafaga) {
      const [r] = await db
        .insert(schema.chatBurst)
        .values({ ventana: ventana(now), ipHash: key, mensajes: 1 })
        .onConflictDoUpdate({
          target: [schema.chatBurst.ventana, schema.chatBurst.ipHash],
          set: { mensajes: sql`${schema.chatBurst.mensajes} + 1` },
        })
        .returning({ mensajes: schema.chatBurst.mensajes });
      if ((r?.mensajes ?? 0) > rafaga) return { ok: false, reason: "rafaga" };
    }

    // El día se cuenta siempre (también con la llave de pruebas): alimenta
    // el tope global y la alerta de uso del cron.
    const [row] = await db
      .insert(schema.chatUsage)
      .values({ dia, ipHash: key, mensajes: 1 })
      .onConflictDoUpdate({
        target: [schema.chatUsage.dia, schema.chatUsage.ipHash],
        set: { mensajes: sql`${schema.chatUsage.mensajes} + 1` },
      })
      .returning({ mensajes: schema.chatUsage.mensajes });
    if (!saltarIp && ip && (row?.mensajes ?? 0) > ip) return { ok: false, reason: "ip" };
    if (!totalChat) return { ok: true };

    const [sum] = await db
      .select({ n: sql<number>`coalesce(sum(${schema.chatUsage.mensajes}), 0)::int` })
      .from(schema.chatUsage)
      .where(and(eq(schema.chatUsage.dia, dia), not(like(schema.chatUsage.ipHash, "demo:%"))));
    if ((sum?.n ?? 0) > totalChat) return { ok: false, reason: "total" };
    return { ok: true };
  } catch (err) {
    console.error("[limits] base no disponible, cuento en memoria", (err as Error)?.name);
    return enMemoria(key, ambito, saltarIp, now, totalChat ? Math.min(totalChat, TOPE_SIN_BASE) : TOPE_SIN_BASE);
  }
}

/** Mensajes de chat de un día (sin el formulario). Para la alerta del cron (S9). */
export async function mensajesDelDia(dia: string): Promise<number | null> {
  const db = getDb();
  if (!db) return null;
  const [sum] = await db
    .select({ n: sql<number>`coalesce(sum(${schema.chatUsage.mensajes}), 0)::int` })
    .from(schema.chatUsage)
    .where(and(eq(schema.chatUsage.dia, dia), not(like(schema.chatUsage.ipHash, "demo:%"))));
  return sum?.n ?? 0;
}

/** Borra las ventanas de ráfaga viejas (las usa el cron diario). */
export async function limpiarRafagas(now = Date.now()): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.delete(schema.chatBurst).where(not(gte(schema.chatBurst.ventana, ventana(now) - 6)));
}
