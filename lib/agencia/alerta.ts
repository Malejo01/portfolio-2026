import { avisarPorEmail } from "./email";

/**
 * S9 · Alerta de uso del chat (la llama el cron diario). Solo números: sin
 * datos personales en el email ni en el log.
 */
export function umbralAlerta(): number {
  const n = Number(process.env.CHAT_ALERT_THRESHOLD);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 300;
}

export async function alertaDeUso(dia: string, mensajes: number | null): Promise<"sin-datos" | "normal" | "email" | "log"> {
  if (mensajes == null) return "sin-datos";
  const umbral = umbralAlerta();
  if (mensajes <= umbral) return "normal";
  const texto = `El chat de malejo.com.ar tuvo ${mensajes} mensajes el ${dia} (umbral: ${umbral}). Revisá el gasto en el workspace de Anthropic y el Firewall de Vercel.`;
  if (await avisarPorEmail("Alerta de uso del chat de Malejo", texto)) return "email";
  console.warn(`[cron] alerta de uso: ${mensajes} mensajes el ${dia} (umbral ${umbral})`);
  return "log";
}
