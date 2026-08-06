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
   * Archivo servido desde /public. Vacío hasta que el PDF exista: apuntaba a
   * `/mauro-lizarraga-cv.pdf`, que devolvía 404. Al subir el CV real, poner
   * la ruta acá y los CTAs vuelven solos.
   */
  cv: "",

  qps: {
    live: "https://v0-que-pinta-salta.vercel.app",
    repo: "https://github.com/Malejo01/que-pinta-salta",
    interview: "",
  },

  maestria: {
    repo: "",
  },

  projects: {
    saltaPay: "https://v0-hotel-payment-mvp.vercel.app",
    automotive: "https://f-motors-showroom-prototype.vercel.app",
    restaurant: "https://quiosco-next-steel.vercel.app",
  },
} as const;

export const siteUrl = "https://malejo.com.ar";

export function mailto(subject?: string): string {
  return subject
    ? `mailto:${links.email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${links.email}`;
}
