import type { Metadata } from "next";
import { PricingSection } from "@/components/agencia/home/PricingSection";
import { solucionesCopy as copy } from "@/content/agencia/soluciones";
import { siteUrl } from "@/lib/links";

export const metadata: Metadata = {
  title: { absolute: `${copy.metaTitle} · Malejo` },
  description: copy.description,
  alternates: { canonical: "/soluciones" },
  openGraph: { title: copy.metaTitle, description: copy.description, url: "/soluciones", images: ["/og"] },
};

/** `BreadcrumbList`: Inicio → Soluciones. `<` escapado, como el resto del JSON-LD. */
function breadcrumb(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: copy.breadcrumb.inicio, item: siteUrl },
      { "@type": "ListItem", position: 2, name: copy.breadcrumb.soluciones, item: `${siteUrl}/soluciones` },
    ],
  }).replace(/</g, "\\u003c");
}

/** `/soluciones` (tanda P2, D1): `/precios` y `/cotizador` en una sola página. Estática. */
export default function SolucionesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb() }} />
      <PricingSection />
    </>
  );
}
