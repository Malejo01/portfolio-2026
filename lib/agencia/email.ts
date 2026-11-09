/**
 * Aviso por email con Resend (solo servidor). Sin `RESEND_API_KEY` o sin
 * `EMAIL_TO` no manda nada y devuelve `false`: quien lo llama decide el
 * respaldo (WhatsApp en `/demo`, `console.warn` en el cron).
 */
export async function avisarPorEmail(subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.EMAIL_TO;
  if (!key || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || "Malejo <onboarding@resend.dev>", to: [to], subject, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
