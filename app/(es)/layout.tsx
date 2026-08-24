import type { Metadata, Viewport } from "next";
import { SiteDocument } from "@/components/layout/SiteDocument";
import { SiteShell } from "@/components/layout/SiteShell";
import { rootMetadata, siteViewport } from "@/lib/metadata";

/**
 * Root layout del árbol español. Hay **dos**, uno por idioma, y ninguno
 * `app/layout.tsx` arriba — es la condición que pone Next para permitir
 * varios root layouts, junto con que `/` viva dentro de un grupo.
 *
 * El precio es que navegar entre los dos árboles fuerza una recarga
 * completa. Acá eso es lo correcto: cambiar de idioma cambia el documento
 * entero, empezando por el `lang` del `<html>`.
 *
 * A cambio, el locale es una constante de este árbol en vez de una cookie
 * leída por request, que es lo que devuelve las rutas al prerender.
 */
export const metadata: Metadata = rootMetadata("es");
export const viewport: Viewport = siteViewport;

export default function EsRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteDocument locale="es">
      <SiteShell locale="es">{children}</SiteShell>
    </SiteDocument>
  );
}
