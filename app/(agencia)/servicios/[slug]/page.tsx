import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AbrirChat } from "@/components/agencia/client/AbrirChat";
import { Reveal } from "@/components/agencia/client/Reveal";
import { FaqList } from "@/components/agencia/home/Faq";
import { Check, Icon } from "@/components/agencia/icons";
import { CostosFranja, PagosFranja } from "@/components/agencia/InfoPagos";
import { completarPagos } from "@/components/agencia/pagos";
import { ComboCard, GrandesSteps, PlanCard, PlanFila } from "@/components/agencia/PlanCard";
import { conocimiento, faqPorIds } from "@/content/agencia/conocimiento";
import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { categories, getCategory, getCombo, getPlan, mantenimientoGrandesPct, planesDe } from "@/content/agencia/pricing";
import { servicios, solucion } from "@/content/agencia/servicios";
import { waLink } from "@/lib/agencia/config";
import { ahorroEnPesos, fmt } from "@/lib/agencia/pricing";
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

/** `{SENA}`, `{PCT}`, `{CUOTAS}`, `{PLAN}` y `{MANT}` de la copy de `servicios.ts`. */
function completar(texto: string): string {
  return completarPagos(texto)
    .replaceAll("{PLAN}", fmt(getPlan("diagnostico-escrito")?.impl ?? 0))
    .replaceAll("{MANT}", `${Math.round(mantenimientoGrandesPct * 100)}%`);
}

/**
 * Página de una solución (tanda P1, §4.2 de
 * `docs/agencia/precios-psicologia-2026-11-10.md`), la misma plantilla para
 * las siete y en este orden: H1 con el problema y para quién es, con los 3
 * beneficios en chips → las 3 tarjetas `visibles` en escalera → "¿Cuál me
 * conviene?" → "Ver otras opciones (N)" → el combo de la solución → un
 * proyecto parecido en una línea → franjas de pagos y de costos → FAQ de 3
 * → cierre con el chat, la demo y WhatsApp.
 *
 * Proyectos a medida (`grandes`) muestra sus pasos en vez de planes, se
 * paga por etapas (sin 3 pagos) y no ofrece la demo de 72 h.
 *
 * Todo es HTML del servidor, en transferencia. Las islas: `Reveal`,
 * `AbrirChat` y `PlanDialog`. Sin JS, cada "Ver qué incluye" abre el
 * `<details>` con id del plan en esta misma página.
 */
export default async function ServicioPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  const s = category && solucion(category.key);
  if (!category || !s) notFound();

  const { detail } = servicios;
  const grandes = category.key === "grandes";
  const wa = waLink(WHATSAPP_TEXTO);
  const { visibles, otras } = planesDe(category);
  const recomendado = category.plans.find((p) => p.rec) ?? category.plans[0];
  const combo = s.combo ? getCombo(s.combo.id) : undefined;
  const proyecto = s.proyecto ? conocimiento.proyectos.find((p) => p.key === s.proyecto) : undefined;
  const conMensual = category.plans.some((p) => p.monthly);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(slug) }} />

      {/* 1 · El problema, para quién es y los beneficios en chips */}
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
          <p className="m-0 max-w-[40em] text-[16px] leading-[1.55] text-muted">{s.paraQuien}</p>
        </div>
        <ul aria-label={detail.beneficiosLabel} className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
          {s.beneficios.map((b) => (
            <li key={b} className="chip h-auto min-h-8 py-1 leading-snug">
              <Check size={14} />
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* 2 · Las 3 tarjetas (o los pasos, en proyectos a medida) */}
      <section className="wrap pt-8 sm:pt-10" aria-label={grandes ? detail.stepsTitle : detail.planesLabel}>
        {grandes ? (
          <>
            <span className="lbl lbl-o">{detail.stepsLabel}</span>
            <h2 className="h mt-2 text-[26px] sm:text-[30px]">{detail.stepsTitle}</h2>
            <GrandesSteps plans={category.plans} />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibles.map((plan) => (
                <PlanCard key={plan.id} plan={plan} heading="h2" enPagina />
              ))}
            </div>

            {/* 3 · ¿Cuál me conviene? */}
            {s.conviene.length ? (
              <div className="card mt-6 px-5 py-4">
                <h2 className="h text-[20px]">{detail.convieneTitle}</h2>
                <ul className="m-0 mt-2 flex list-none flex-col p-0 text-[15px] leading-[1.45]">
                  {s.conviene.map((c) => (
                    <li key={c.plan} className="flex flex-wrap items-baseline gap-x-1.5 border-b border-border py-2 last:border-b-0">
                      <span className="text-muted">{c.si}</span>
                      <span aria-hidden="true" className="text-acc-text">
                        →
                      </span>
                      <span>
                        {detail.convieneElegi} <strong>{getPlan(c.plan)?.name}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* 4 · Otras opciones */}
            {otras.length ? (
              <details className="plans mt-5">
                <summary className="btn btn-s min-h-11">{detail.otras.replace("{N}", String(otras.length))}</summary>
                <ul className="card m-0 mt-3 list-none px-5 py-1">
                  {otras.map((plan) => (
                    <PlanFila key={plan.id} plan={plan} enPagina />
                  ))}
                </ul>
              </details>
            ) : null}
          </>
        )}
      </section>

      {/* 5 · El combo de esta solución */}
      {combo && s.combo ? (
        <section className="wrap pt-10 sm:pt-12">
          <span className="lbl lbl-o">{detail.comboLabel}</span>
          <h2 className="h mt-2 max-w-[24em] text-[22px] sm:text-[26px]">
            {detail.comboTitle.replace("{GANCHO}", s.combo.gancho).replace("{AHORRO}", fmt(ahorroEnPesos(combo)))}
          </h2>
          <div className="mt-4 max-w-[420px]">
            <ComboCard combo={combo} enPagina />
          </div>
        </section>
      ) : null}

      {/* 6 · Un proyecto parecido, en una línea */}
      {proyecto ? (
        <section className="wrap pt-10 sm:pt-12">
          <Reveal>
            <a
              href={proyecto.href}
              target="_blank"
              rel="noopener"
              className="card lift flex items-center gap-4 p-3 text-text no-underline sm:p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- póster liviano, ya optimizado */}
              <img
                src={`/agencia/proyectos/${proyecto.key}.jpg`}
                alt=""
                width={960}
                height={439}
                loading="lazy"
                className="shot block aspect-[960/439] h-auto w-28 flex-none rounded-[12px] object-cover object-top sm:w-40"
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="lbl lbl-o text-[10px]">{detail.proyectoLabel}</span>
                <strong className="text-[15px] leading-snug">
                  {proyecto.nombre}: {proyecto.problema}
                </strong>
                <span className="lnk text-[13px]">
                  {detail.proyectoAbrir} <Icon name="arrow" size={14} />
                </span>
              </span>
            </a>
          </Reveal>
        </section>
      ) : null}

      {/* 7 · Formas de pago y qué se paga a quién */}
      <section className="wrap flex flex-col gap-4 pt-10 sm:pt-12">
        {grandes ? (
          <div className="card px-5 py-4">
            <span className="lbl">{home.pricing.pagos.title}</span>
            <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0 text-[15px] leading-[1.5]">
              {detail.pagosGrandes.map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check />
                  {completar(t)}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <PagosFranja extra={conMensual ? [detail.pagosMensual] : []} aparte={s.aparte} aparteLabel={detail.aparteLabel} />
        )}
        <CostosFranja />
        {category.key === "mant" ? (
          <p className="m-0 text-[14px] text-muted">
            {completar(detail.mantGrandes.body)}{" "}
            <Link href={detail.mantGrandes.href} className="lnk min-h-11 text-[14px]">
              {detail.mantGrandes.cta}
            </Link>
          </p>
        ) : null}
      </section>

      {/* 8 · Tres preguntas */}
      <section className="wrap max-w-[920px] pt-10 sm:pt-12">
        <span className="lbl lbl-o">{detail.faqLabel}</span>
        <h2 className="h h2">{detail.faqTitle}</h2>
        <FaqList items={faqPorIds(s.faq)} name={`faq-${category.key}`} />
        <AbrirChat href={wa} tema={s.tema} className="lnk mt-3 min-h-11">
          {detail.faqOtra}
        </AbrirChat>
      </section>

      {/* 9 · Cierre: chat, demo (o la charla, en proyectos a medida) y WhatsApp */}
      <section className="wrap pb-20 pt-10 sm:pb-24 sm:pt-12">
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
