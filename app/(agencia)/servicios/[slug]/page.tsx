import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/agencia/home/Faq";
import { PricingCatalog } from "@/components/agencia/client/PricingCatalog";
import { home } from "@/content/agencia/home";
import { categories, combos, extras, getCategory } from "@/content/agencia/pricing";
import { faqPagos, serviceCard, servicios } from "@/content/agencia/servicios";
import { siteUrl } from "@/lib/links";

/** Las seis categorías del catálogo, prerenderizadas. Cualquier otro slug: 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.key }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  const card = category && serviceCard(category.key);
  if (!category || !card) return {};
  const title = `${card.title}: precios`;
  const description = `${card.description} ${category.intro}`;
  return {
    title,
    description,
    alternates: { canonical: `/servicios/${slug}` },
    openGraph: { title, description, url: `/servicios/${slug}`, images: ["/og"] },
  };
}

/** JSON-LD `Service` con un `Offer` por plan, precios del catálogo. */
function jsonLd(slug: string): string {
  const category = getCategory(slug)!;
  const card = serviceCard(category.key)!;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    name: card.title,
    description: card.description,
    serviceType: category.label,
    url: `${siteUrl}/servicios/${slug}`,
    provider: { "@type": "ProfessionalService", name: "Malejo", url: siteUrl },
    areaServed: [{ "@type": "Country", name: "Argentina" }, { "@type": "Place", name: "LATAM" }],
    // Los ítems sin precio fijo (proyectos grandes: "se cotiza con el
    // diagnóstico") no llevan `Offer`: un precio en 0 sería falso.
    offers: category.plans.filter((p) => p.impl != null || p.monthly != null).map((p) => ({
      "@type": "Offer",
      name: p.name,
      url: `${siteUrl}/demo?plan=${p.id}`,
      priceCurrency: "ARS",
      ...(p.impl != null
        ? { price: p.impl, ...(p.from ? { priceSpecification: { "@type": "PriceSpecification", minPrice: p.impl, priceCurrency: "ARS" } } : {}) }
        : {
            price: p.monthly,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: p.monthly,
              priceCurrency: "ARS",
              unitText: "MONTH",
            },
          }),
    })),
  }).replace(/</g, "\\u003c");
}

export default async function ServicioPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  const card = category && serviceCard(category.key);
  if (!category || !card) notFound();

  const planIds = new Set(category.plans.map((p) => p.id));
  const related = combos.filter((c) => c.planIds.some((id) => planIds.has(id)));
  const { detail } = servicios;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(slug) }} />
      <section className="wrap pt-10 sm:pt-16">
        <Link href={detail.back.href} className="lnk">
          {detail.back.label}
        </Link>
        <div className="mt-6">
          <span className="lbl lbl-o">{card.label}</span>
          <h1 className="h h2">{card.title}</h1>
          <p className="mb-0 mt-2 max-w-[40em] text-[17px] text-muted">{card.description}</p>
        </div>
      </section>

      <section className="wrap pt-12" aria-label={category.label}>
        <PricingCatalog
          categories={[category]}
          combos={related}
          extras={category.key === "webs" ? extras : []}
          copy={home.pricing}
          idPrefix={`servicio-${category.key}`}
          heading={
            <div>
              <span className="lbl lbl-o">{detail.plansLabel}</span>
              <h2 className="h mt-2 text-[26px] sm:text-[30px]">{detail.plansTitle}</h2>
            </div>
          }
          footer={
            <p className="mb-0 mt-4 text-[13px] leading-[1.55] text-muted">
              {home.pricing.legal}{" "}
              <Link href={detail.cotizador.href} className="lnk text-[13px]">
                {detail.cotizador.label}
              </Link>
            </p>
          }
        />
      </section>

      <section className="wrap max-w-[920px] pb-24 pt-16">
        <span className="lbl lbl-o">{detail.faqLabel}</span>
        <h2 className="h h2">{detail.faqTitle}</h2>
        <FaqList items={faqPagos} name={`faq-${category.key}`} />
      </section>
    </>
  );
}
