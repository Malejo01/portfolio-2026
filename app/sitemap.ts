import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/links";
import { agenciaRoutes } from "@/lib/agencia/routes";
import { ROUTE_KEYS, pathFor } from "@/lib/routes";

/**
 * Las dos versiones de cada página, cada una declarando a la otra en
 * `alternates.languages`. Sale de la misma tabla que los `hreflang` del
 * `<head>` (`lib/routes.ts`), así que no pueden desincronizarse.
 *
 * `x-default` no va acá: el protocolo de sitemaps no lo define, es cosa de
 * las etiquetas del documento.
 *
 * Al final van las rutas del sitio de la agencia (`lib/agencia/routes.ts`),
 * que es solo en español y no declara alternates.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const abs = (path: string) => `${siteUrl}${path}`;

  const portfolio = ROUTE_KEYS.flatMap((route) => {
    const priority = route === "home" ? 1 : 0.8;
    const languages = { es: abs(pathFor(route, "es")), en: abs(pathFor(route, "en")) };

    return (["es", "en"] as const).map((locale) => ({
      url: abs(pathFor(route, locale)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
      alternates: { languages },
    }));
  });

  const agencia = (await agenciaRoutes()).map(({ path, priority }) => ({
    url: abs(path),
    lastModified,
    changeFrequency: "monthly" as const,
    priority,
  }));

  return [...agencia, ...portfolio];
}
