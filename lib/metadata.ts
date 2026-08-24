import type { Metadata, Viewport } from "next";
import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/links";
import { alternatesFor, pathFor } from "@/lib/routes";
import type { Locale } from "@/lib/types";

/** Ruta del `opengraph-image` del root. `metadataBase` la vuelve absoluta. */
const OG_IMAGE = "/opengraph-image";

/**
 * La metadata que comparten todas las rutas de un idioma. La exporta cada
 * root layout —hay uno por idioma— y las páginas de abajo la heredan.
 *
 * A propósito **sin** `alternates`: si el layout declarara un canonical,
 * cualquier página que se olvide de sobreescribirlo heredaría el del home.
 * Que cada página declare el suyo hace que olvidarse rompa fuerte y no en
 * silencio.
 */
export function rootMetadata(locale: Locale): Metadata {
  const { meta } = getContent(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: meta.title, template: "%s · Mauro Lizárraga" },
    description: meta.description,
    authors: [{ name: "Mauro Lizárraga", url: siteUrl }],
    creator: "Mauro Lizárraga",
    openGraph: {
      type: "website",
      siteName: "Mauro Lizárraga",
      locale: locale === "es" ? "es_AR" : "en_US",
      url: pathFor("home", locale),
      title: meta.title,
      description: meta.description,
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
    robots: { index: true, follow: true },
  };
}

/** Idéntico en los dos idiomas, pero cada root layout tiene que exportarlo. */
export const siteViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#17150f" },
  ],
};

/** El home: hereda título y descripción del layout, solo declara sus URLs. */
export function homeMetadata(locale: Locale): Metadata {
  return { alternates: alternatesFor("home", locale) };
}

/**
 * Las dos páginas de caso.
 *
 * Declarar `openGraph` acá reemplaza el objeto heredado del root layout: no
 * se mergea campo a campo, así que sin `images` la ruta se queda sin
 * og:image y el convention file de app/opengraph-image.tsx no la cubre. Lo
 * mismo con `twitter`: sin este bloque hereda el título del home.
 */
export function caseMetadata(locale: Locale, route: "qps" | "maestria"): Metadata {
  const { meta } = getContent(locale);
  const title = route === "qps" ? meta.caseQpsTitle : meta.caseMaestriaTitle;
  const description = route === "qps" ? meta.caseQpsDescription : meta.caseMaestriaDescription;

  return {
    title,
    description,
    alternates: alternatesFor(route, locale),
    openGraph: {
      type: "article",
      locale: locale === "es" ? "es_AR" : "en_US",
      url: pathFor(route, locale),
      title,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
  };
}
