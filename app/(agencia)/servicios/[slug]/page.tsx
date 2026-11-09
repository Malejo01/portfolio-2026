import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AbrirChat } from "@/components/agencia/client/AbrirChat";
import { Reveal } from "@/components/agencia/client/Reveal";
import { FaqList } from "@/components/agencia/home/Faq";
import { Check, Icon } from "@/components/agencia/icons";
import { ComboCard, GrandesSteps, PlanCard } from "@/components/agencia/PlanCard";
import { conocimiento, faqPorIds } from "@/content/agencia/conocimiento";
import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { categories, combos, extras, getCategory, getPlan, mantenimientoGrandesPct, recargoMercadoPago } from "@/content/agencia/pricing";
import { servicios, solucion } from "@/content/agencia/servicios";
import { senaMonto, waLink } from "@/lib/agencia/config";
import { fmt, montoDeExtra } from "@/lib/agencia/pricing";
import { siteUrl } from "@/lib/links";

/** Las siete categorías del catálogo, prerenderizadas. Cualquier otro slug: 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.key }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  const s = category && solucion(category.key);
  if (!category || !s) return {};
  // Título por problema (auditoría P2-3); el slug no cambia.
  const title = s.metaTitle;
  const description = `${s.description} ${category.intro}`;
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
  const s = solucion(category.key)!;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.description,
    serviceType: category.label,
    url: `${siteUrl}/servicios/${slug}`,
    provider: { "@type": "ProfessionalService", name: "Malejo", url: siteUrl },
    areaServed: [{ "@type": "Country", name: "Argentina" }, { "@type": "Place", name: "LATAM" }],
    // Los ítems sin precio fijo ("se cotiza en el plan escrito") no llevan
    // `Offer`: un precio en 0 sería falso.
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

/** `{SENA}`, `{PCT}`, `{PLAN}`, `{MANT}` y `{N}` de la copy de `servicios.ts`. */
function completar(texto: string, n = 0): string {
  return texto
    .replaceAll("{SENA}", fmt(senaMonto()))
    .replaceAll("{PCT}", `${Math.round(recargoMercadoPago * 100)}%`)
    .replaceAll("{PLAN}", fmt(getPlan("diagnostico-escrito")?.impl ?? 0))
    .replaceAll("{MANT}", `${Math.round(mantenimientoGrandesPct * 100)}%`)
    .replaceAll("{N}", String(n));
}

/**
 * Página de una solución (tanda R2, auditoría §6.2), con la misma plantilla
 * para las siete: H1 con el problema y para quién es → 3 beneficios → el
 * plan recomendado destacado y los demás en `<details>` (sin JS) → un
 * proyecto parecido → cómo se paga → el FAQ propio → cierre con el chat,
 * la demo y WhatsApp.
 *
 * Proyectos a medida (`grandes`) cambia en tres cosas: muestra los pasos en
 * vez de planes, se paga por etapas, y no ofrece la demo de 72 h, el
 * cotizador ni "la página es tuya" (la propiedad del código se define en la
 * propuesta escrita).
 *
 * Todo es HTML del servidor: los precios van en transferencia (el selector
 * de Mercado Pago está en `/precios`) y las únicas islas son `Reveal` y
 * `AbrirChat`.
 */
export default async function ServicioPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  const s = category && solucion(category.key);
  if (!category || !s) notFound();

  const { detail } = servicios;
  const grandes = category.key === "grandes";
  const wa = waLink(WHATSAPP_TEXTO);
  const recomendado = category.plans.find((p) => p.rec) ?? category.plans[0];
  const otros = category.plans.filter((p) => p !== recomendado);
  const planIds = new Set(category.plans.map((p) => p.id));
  const related = combos.filter((c) => c.planIds.some((id) => planIds.has(id)));
  const proyecto = s.proyecto ? conocimiento.proyectos.find((p) => p.key === s.proyecto) : undefined;
  const conMensual = category.plans.some((p) => p.monthly);
  const otrasFormas = category.plans.filter((p) => p.alt);
  const pagos = grandes ? detail.pagosGrandes : [...detail.pagos, ...(conMensual ? [detail.pagosMensual] : [])];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(slug) }} />

      {/* 1 · El problema y para quién es */}
      <section className="wrap pt-8 sm:pt-14">
        <Link href={detail.back.href} className="lnk min-h-11">
          {detail.back.label}
        </Link>
        <div className="mt-3 flex flex-col gap-2 sm:mt-5">
          <span className="lbl lbl-o inline-flex items-center gap-2">
            <Icon name={s.icon} size={16} />
            {category.label}
          </span>
          <h1 className="h h2 max-w-[18em]">{s.title}</h1>
          <p className="m-0 max-w-[40em] text-[17px] leading-[1.55] text-muted">{s.description}</p>
          <p className="m-0 max-w-[40em] text-[15px] leading-[1.55]">
            <strong>{detail.paraQuienLabel}:</strong> {s.paraQuien}
          </p>
        </div>

        {/* 2 · Tres beneficios */}
        <ul aria-label={detail.beneficiosLabel} className="m-0 mt-6 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-3 sm:gap-5">
          {s.beneficios.map((b) => (
            <li key={b} className="card flex items-start gap-3 p-4 text-[15px] font-semibold leading-snug sm:p-5">
              <Check size={18} />
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* 3 · El plan recomendado (o los pasos, en proyectos a medida) */}
      <section className="wrap pt-12 sm:pt-16">
        <span className="lbl lbl-o">{grandes ? detail.stepsLabel : detail.recomendadoLabel}</span>
        <h2 className="h mt-2 text-[26px] sm:text-[30px]">{grandes ? detail.stepsTitle : detail.recomendadoTitle}</h2>
        {grandes ? (
          <GrandesSteps plans={category.plans} medio="transferencia" copy={{ ...home.pricing, ...home.pricing.grandes }} />
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
              <PlanCard plan={recomendado} medio="transferencia" copy={home.pricing} />
              {related.slice(0, 2).map((combo) => (
                <ComboCard key={combo.id} combo={combo} medio="transferencia" copy={home.pricing} />
              ))}
            </div>
            <p className="mb-0 mt-3.5 text-[13px] text-muted">{category.intro} {category.note}</p>

            {otros.length ? (
              <details className="plans mt-5">
                <summary className="btn btn-s min-h-11">
                  {otros.length === 1 ? detail.otro : completar(detail.otros, otros.length)}
                  <Icon name="arrow" size={16} className="plans-arrow" />
                </summary>
                <div className="mt-5 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {otros.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} medio="transferencia" copy={home.pricing} />
                  ))}
                  {related.slice(2).map((combo) => (
                    <ComboCard key={combo.id} combo={combo} medio="transferencia" copy={home.pricing} />
                  ))}
                </div>
                {category.key === "webs" ? (
                  <div className="card mt-5 flex flex-wrap items-center gap-4 px-5 py-4">
                    <span className="lbl flex-none">{detail.extrasLabel}</span>
                    <ul className="m-0 flex flex-1 list-none flex-wrap gap-2 p-0">
                      {extras.map((e) => (
                        <li key={e.id} className="chip h-[34px]">
                          {e.name} <strong>{montoDeExtra(e, "transferencia")}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </details>
            ) : null}
          </>
        )}
      </section>

      {/* 4 · Un proyecto parecido */}
      {proyecto ? (
        <section className="wrap pt-12 sm:pt-16">
          <Reveal>
            <article className="card card-big grid grid-cols-1 items-center gap-5 p-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-7">
              {/* eslint-disable-next-line @next/next/no-img-element -- póster liviano, ya optimizado */}
              <img
                src={`/agencia/proyectos/${proyecto.key}.jpg`}
                alt={`${proyecto.nombre}: ${proyecto.problema}`}
                width={960}
                height={439}
                loading="lazy"
                className="shot block aspect-[960/439] h-auto w-full rounded-[18px] object-cover object-top"
              />
              <div className="flex flex-col gap-2 px-2 pb-3 sm:pr-5">
                <span className="lbl lbl-o">{detail.proyectoLabel}</span>
                <h2 className="h text-[24px] leading-[1.15]">{proyecto.problema}</h2>
                <p className="m-0 text-[15px] leading-[1.55] text-muted">{proyecto.demuestra}</p>
                <p className="m-0 text-[13px] text-muted">
                  {proyecto.nombre} · {detail.proyectoPropio}
                </p>
                <a href={proyecto.href} target="_blank" rel="noopener" className="lnk min-h-11 self-start">
                  {detail.proyectoAbrir} <Icon name="arrow" size={14} />
                </a>
              </div>
            </article>
          </Reveal>
        </section>
      ) : null}

      {/* 5 · Cómo se paga */}
      <section className="wrap pt-12 sm:pt-16">
        <span className="lbl lbl-o">{detail.pagosLabel}</span>
        <h2 className="h mt-2 text-[26px] sm:text-[30px]">{detail.pagosTitle}</h2>
        <div className="card mt-5 grid grid-cols-1 gap-5 p-5 sm:p-7 md:grid-cols-2">
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px] leading-[1.5]">
            {pagos.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check />
                {completar(t)}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-4 text-[14px] leading-[1.5] text-muted">
            {s.aparte.length ? (
              <div>
                <span className="lbl text-[10px]">{detail.aparteLabel}</span>
                <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
                  {s.aparte.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {otrasFormas.length ? (
              <div>
                <span className="lbl text-[10px]">{detail.otrasFormasLabel}</span>
                <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
                  {otrasFormas.map((p) => (
                    <li key={p.id}>
                      <strong className="text-text">{p.name}:</strong> {p.alt}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {category.key === "mant" ? (
              <p className="m-0">
                {completar(detail.mantGrandes.body)}{" "}
                <Link href={detail.mantGrandes.href} className="lnk min-h-11 text-[14px]">
                  {detail.mantGrandes.cta}
                </Link>
              </p>
            ) : null}
            {grandes ? null : (
              <Link href={detail.cotizador.href} className="lnk min-h-11 self-start text-[14px]">
                {detail.cotizador.label}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 6 · Preguntas propias */}
      <section className="wrap max-w-[920px] pt-12 sm:pt-16">
        <span className="lbl lbl-o">{detail.faqLabel}</span>
        <h2 className="h h2">{detail.faqTitle}</h2>
        <FaqList items={faqPorIds(s.faq)} name={`faq-${category.key}`} />
      </section>

      {/* 7 · Cierre: chat, demo (o la charla, en proyectos a medida) y WhatsApp */}
      <section className="wrap pb-20 pt-12 sm:pb-24 sm:pt-16">
        <div className="card card-big hi flex flex-col gap-6 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-[34em] flex-col gap-2">
            <span className="lbl lbl-o">{detail.cierre.label}</span>
            <h2 className="h text-[32px] leading-none sm:text-[40px]">{detail.cierre.title}</h2>
            <p className="m-0 text-[16px] leading-[1.55] text-muted">{grandes ? detail.cierre.leadGrandes : detail.cierre.lead}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-col">
            <AbrirChat href={wa} tema={s.tema} className="btn btn-p">
              <Icon name="chat" size={18} />
              {detail.cierre.chat}
            </AbrirChat>
            {grandes ? (
              <a href={home.pricing.grandes.cta.href} target="_blank" rel="noopener" className="btn btn-s">
                {detail.cierre.agenda}
              </a>
            ) : (
              <Link href={`/demo?plan=${recomendado.id}`} className="btn btn-s">
                {detail.cierre.demo}
              </Link>
            )}
            <a href={wa} target="_blank" rel="noopener" className="btn btn-s">
              <Icon name="whatsapp" size={18} />
              {detail.cierre.whatsapp}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
