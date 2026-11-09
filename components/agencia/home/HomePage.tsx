import { home } from "@/content/agencia/home";
import { site } from "@/content/agencia/site";
import { categories } from "@/content/agencia/pricing";
import { WHATSAPP } from "@/lib/agencia/config";
import { siteUrl } from "@/lib/links";
import { Cta } from "./Cta";
import { Hero } from "./Hero";
import { Needs } from "./Needs";
import { Steps } from "./Steps";
import { Team } from "./Team";

/**
 * JSON-LD `ProfessionalService`. Se serializa con JSON.stringify y se escapa
 * `<` para que ningún texto pueda cerrar el `<script>`.
 */
function jsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    description: site.description,
    url: siteUrl,
    image: `${siteUrl}/og`,
    logo: `${siteUrl}/agencia/marca/malejo-app-icon.svg`,
    telephone: `+${WHATSAPP}`,
    priceRange: home.seo.priceRange,
    founder: { "@type": "Person", name: "Mauro Alejandro Lizárraga", url: `${siteUrl}/portfolio` },
    address: { "@type": "PostalAddress", addressLocality: "Salta", addressRegion: "Salta", addressCountry: "AR" },
    areaServed: [
      { "@type": "Country", name: "Argentina" },
      { "@type": "Place", name: home.seo.areaServed },
    ],
    knowsAbout: categories.map((c) => c.label),
  }).replace(/</g, "\\u003c");
}

/**
 * La home corta (tanda R2, auditoría §6.3): hero → ¿Qué necesitás? → cómo
 * trabajo → quién te va a atender → cierre. Objetivo medido: ≤ 3,5
 * pantallas en escritorio y ≤ 5,5 en celular (ver `docs/agencia/INFORME.md`).
 * El catálogo completo está en `/precios`.
 */
export function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <Hero />
      <Needs />
      <Steps />
      <Team />
      <Cta />
    </>
  );
}
