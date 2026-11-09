import type { NextConfig } from "next";
import { FUENTE_AGENCIA, HEADERS_AGENCIA } from "./lib/agencia/headers";

/**
 * El portfolio se mudó de la raíz a `/portfolio` (noviembre 2026) para que
 * `malejo.com.ar` sea el sitio de la agencia. Las URLs viejas están en el CV,
 * en LinkedIn y en buscadores: por eso van con 308 (permanente).
 *
 * El 307 temporal de `/` → `/portfolio` se borró cuando la home de la
 * agencia (`app/(agencia)/page.tsx`) quedó lista. `/casos/:slug` tiene un
 * solo segmento para no tocar las capturas de
 * `/public/casos/<caso>/<archivo>.png`.
 */
const nextConfig: NextConfig = {
  /** Headers de seguridad solo para la agencia (S10): `lib/agencia/headers.ts`. */
  async headers() {
    return [{ source: FUENTE_AGENCIA, headers: HEADERS_AGENCIA }];
  },
  async redirects() {
    return [
      { source: "/casos/:slug", destination: "/portfolio/casos/:slug", permanent: true },
      { source: "/en", destination: "/portfolio/en", permanent: true },
      { source: "/en/:path*", destination: "/portfolio/en/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
