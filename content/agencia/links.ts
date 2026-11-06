/**
 * Enlaces externos de la agencia. Mismo criterio que `lib/links.ts` del
 * portfolio: un string vacío significa "todavía no hay URL" y el componente
 * no renderiza el CTA.
 */
export const agenciaLinks = {
  afinia: "https://afiniajobs.com.ar",
  qps: "https://quepintasalta.com.ar",
  /** Prototipo propio del hackathon. Nunca el demo presentado al cliente. */
  tuki: "https://tuki-salta.vercel.app",
  maestria: "https://maestria-edu.vercel.app",
  /** Pendiente: Mauro carga el email de contacto para derechos ARCO. */
  email: "",
} as const;
