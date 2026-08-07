/**
 * Punto único de verdad para todo enlace externo.
 *
 * Un string vacío significa "todavía no hay URL": los componentes filtran
 * esas entradas y no renderizan el CTA. Es preferible a dejar un `href="#"`
 * que se ve activo, se puede tabular y no lleva a ningún lado.
 */
export const links = {
  email: "lizarragamauroalejandro@gmail.com",
  github: "https://github.com/Malejo01",
  linkedin: "https://www.linkedin.com/in/mauro-alejandro-lizarraga/",
  /**
   * Archivo servido desde /public. Estuvo vacío mientras el PDF no existía —
   * la ruta devolvía 404 y los CTAs se filtraban solos. El archivo ya está en
   * `public/mauro-lizarraga-cv.pdf`; si se borra, volver a poner "" acá.
   */
  cv: "/mauro-lizarraga-cv.pdf",

  qps: {
    live: "https://quepintasalta.com.ar",
    repo: "https://github.com/Malejo01/que-pinta-salta",
    interview: "",
  },

  maestria: {
    repo: "",
  },

  projects: {
    saltaPay: "https://v0-hotel-payment-mvp.vercel.app",
    automotive: "https://f-motors-showroom-prototype.vercel.app",
  },
} as const;

/**
 * Origen del sitio, resuelto por entorno. Sin dominio propio todavía, así que
 * hardcodear `malejo.com.ar` rompía og:image y sitemap: el host no resuelve.
 *
 * Orden de prioridad:
 * 1. NEXT_PUBLIC_SITE_URL — override manual. Al conectar el dominio propio se
 *    setea acá en Vercel y no hace falta tocar código.
 * 2. VERCEL_PROJECT_PRODUCTION_URL — la inyecta Vercel sola. Es el dominio
 *    estable de producción (el *.vercel.app actual) y viene sin protocolo.
 * 3. localhost para dev local.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();

export function mailto(subject?: string): string {
  return subject
    ? `mailto:${links.email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${links.email}`;
}
