/**
 * S10 · Headers de seguridad del sitio de la agencia (tanda R2). Los usa
 * `next.config.ts` y los cubre `headers.test.ts`.
 *
 * Solo para las rutas de la agencia: la fuente excluye `/portfolio` (y
 * todo lo que cuelga de ahí), así el portfolio no cambia. La CSP va en modo
 * **report-only**: el navegador avisa en consola qué bloquearía, pero no
 * bloquea nada. Permite lo que hoy usa el sitio: Vercel Analytics (mismo
 * origen, `/_vercel/insights`), Turnstile, Cal.com embebido, los videos y
 * pósters propios, las fuentes de `next/font` (servidas desde el sitio) y
 * los scripts inline del tema y del JSON-LD. `wa.me` es navegación (links),
 * que la CSP no restringe.
 */
export const FUENTE_AGENCIA = "/((?!portfolio(?:/|$)).*)";

export const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com https://vitals.vercel-insights.com",
  "frame-src https://challenges.cloudflare.com https://cal.com https://*.cal.com",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join("; ");

export const HEADERS_AGENCIA: { key: string; value: string }[] = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
];
