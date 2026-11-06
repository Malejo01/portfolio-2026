import { home } from "@/content/agencia/home";
import { site } from "@/content/agencia/site";
import { categories } from "@/content/agencia/pricing";
import { WHATSAPP } from "@/lib/agencia/config";
import { siteUrl } from "@/lib/links";
import { About } from "./About";
import { Cta } from "./Cta";
import { Faq } from "./Faq";
import { Hero } from "./Hero";
import { Pricing } from "./Pricing";
import { Projects } from "./Projects";
import { Services } from "./Services";
import { Steps } from "./Steps";

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

/** La home: orden de DISENO.md §4. */
export function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <Hero />
      <Services />
      <Steps />
      <Pricing />
      <Projects />
      <About />
      <Faq />
      <Cta />
    </>
  );
}
