import { and, lt, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/**
 * Cron diario (`vercel.json`): borra leads y briefs no convertidos de más de
 * 12 meses (lo que promete `/legal/privacidad`) y los contadores del chat de
 * más de 30 días. Vercel manda `Authorization: Bearer $CRON_SECRET`.
 */
export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const db = getDb();
  if (!db) return Response.json({ ok: true, skipped: "sin DATABASE_URL" });

  const haceUnAno = new Date();
  haceUnAno.setFullYear(haceUnAno.getFullYear() - 1);
  const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const leads = await db
    .delete(schema.leads)
    .where(and(eq(schema.leads.convertido, false), lt(schema.leads.createdAt, haceUnAno)))
    .returning({ id: schema.leads.id });
  const briefs = await db
    .delete(schema.briefs)
    .where(and(eq(schema.briefs.convertido, false), lt(schema.briefs.createdAt, haceUnAno)))
    .returning({ id: schema.briefs.id });
  await db.delete(schema.chatUsage).where(lt(schema.chatUsage.dia, hace30));

  return Response.json({ ok: true, leads: leads.length, briefs: briefs.length });
}
