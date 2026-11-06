import type { Metadata } from "next";
import { legalDocs, type LegalDoc } from "./legal";

export { legalDocs };

const LINKS: Record<LegalDoc["slug"], { label: string; href: string }> = {
  terminos: { label: "Términos y condiciones", href: "/legal/terminos" },
  cambios: { label: "Política de cambios", href: "/legal/cambios" },
  privacidad: { label: "Privacidad y datos personales", href: "/legal/privacidad" },
};

export function legalRelated(slug: LegalDoc["slug"]) {
  return (Object.keys(LINKS) as LegalDoc["slug"][]).filter((k) => k !== slug).map((k) => LINKS[k]);
}

export function legalMetadata(slug: LegalDoc["slug"]): Metadata {
  const doc = legalDocs[slug];
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: LINKS[slug].href },
    openGraph: { title: doc.title, description: doc.description, url: LINKS[slug].href, images: ["/og"] },
  };
}
