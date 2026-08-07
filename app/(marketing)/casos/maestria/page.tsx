import type { Metadata } from "next";
import { CaseHeader, CaseHeading } from "@/components/case-study/CaseHeader";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { AsideNote } from "@/components/ui/Aside";
import { ButtonLink, ButtonRow } from "@/components/ui/ButtonLink";
import { getContent } from "@/lib/content";
import { links } from "@/lib/links";
import { getLocale } from "@/lib/locale";

/** Ruta del `opengraph-image` del root. `metadataBase` la vuelve absoluta. */
const OG_IMAGE = "/opengraph-image";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = getContent(await getLocale());
  return {
    title: meta.caseMaestriaTitle,
    description: meta.caseMaestriaDescription,
    alternates: { canonical: "/casos/maestria" },
    // Declarar `openGraph` acá reemplaza el objeto heredado del root layout:
    // no se mergea campo a campo, así que sin `images` la ruta se queda sin
    // og:image y el convention file de app/opengraph-image.tsx no la cubre.
    // Lo mismo con `twitter`: sin este bloque hereda el título y la
    // descripción del home.
    openGraph: {
      type: "article",
      url: "/casos/maestria",
      title: meta.caseMaestriaTitle,
      description: meta.caseMaestriaDescription,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: meta.caseMaestriaTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.caseMaestriaTitle,
      description: meta.caseMaestriaDescription,
      images: [OG_IMAGE],
    },
  };
}

/**
 * Composición distinta a la de Qué Pinta Salta por decisión de diseño: sin
 * aside, sin diagrama, todo sobre panel oscuro y con lista numerada 01–04.
 * Es el tercer y último momento de contraste del sitio.
 */
export default async function MaestriaPage() {
  const content = getContent(await getLocale());
  const c = content.caseMaestria;

  return (
    <article className="my-[clamp(24px,4vw,48px)] rounded-card bg-panel p-panel text-panel-ink">
      <CaseHeader
        onPanel
        status={c.status}
        statusTone="wip"
        year={c.year}
        kicker={c.kicker}
        title={c.title}
        subtitle={c.subtitle}
        backLabel={content.nav.backToHome}
      />

      {/* ── El problema ──────────────────────────────────────────── */}
      <Reveal className="mt-[clamp(40px,6vw,72px)] flex flex-wrap items-start gap-main">
        <div className="min-w-0 max-w-[62ch] flex-1 basis-[36ch]">
          <CaseHeading onPanel className="mt-0 mb-3.5">
            {c.problemHeading}
          </CaseHeading>
          {c.problem.map((text, i) => (
            <p
              key={text.slice(0, 24)}
              className={`mt-0 text-panel-soft ${i === c.problem.length - 1 ? "mb-0" : "mb-4"}`}
            >
              {text}
            </p>
          ))}
        </div>
        <AsideNote onPanel term={c.roleLabel}>
          {c.role}
        </AsideNote>
      </Reveal>

      {/* ── La decisión que define el sistema ────────────────────── */}
      <Reveal className="my-[clamp(32px,4.6vw,56px)] border-y-[0.5px] border-panel-hair py-[clamp(24px,3.4vw,40px)]">
        <p className="mt-0 mb-4 font-mono text-meta tracking-[0.1em] text-panel-soft uppercase">
          {c.decisionLabel}
        </p>

        <p className="m-0 max-w-[26ch] font-display text-decision leading-[1.05] font-semibold opsz-72 tracking-[-0.025em] text-accent-panel">
          {c.decisionHeadline}
        </p>

        <div className="mt-[clamp(20px,3vw,30px)] flex flex-wrap gap-main">
          <p className="m-0 min-w-0 max-w-[52ch] flex-1 basis-[32ch] text-panel-soft">
            {c.decisionBody[0]}
          </p>
          <p className="m-0 min-w-0 max-w-[48ch] flex-1 basis-[28ch] text-panel-soft">
            {c.decisionBody[1]}
          </p>
        </div>
      </Reveal>

      {/* ── Qué hace ─────────────────────────────────────────────── */}
      <section>
        <CaseHeading onPanel className="mt-0 mb-lede">
          {c.whatHeading}
        </CaseHeading>

        <RevealGroup as="ol" className="m-0 grid list-none border-t-[0.5px] border-panel-hair p-0">
          {c.steps.map((step, i) => (
            <RevealItem
              key={step.slice(0, 24)}
              as="li"
              className="flex flex-wrap gap-x-[clamp(18px,3vw,36px)] gap-y-1.5 border-b-[0.5px] border-panel-hair py-[clamp(14px,2.2vw,22px)]"
            >
              <span className="flex-none basis-[5ch] font-mono text-meta text-accent-panel">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 max-w-[58ch] flex-1 basis-[30ch] text-panel-soft">
                {step}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>

        <p className="mt-[clamp(26px,3.6vw,40px)] mb-0 max-w-[44ch] font-display text-lead leading-[1.4] font-medium opsz-24 text-panel-ink">
          {c.closing}
        </p>
      </section>

      {/* ── Resultado ────────────────────────────────────────────── */}
      <Reveal className="mt-[clamp(32px,4.6vw,56px)] max-w-[62ch]">
        <CaseHeading onPanel className="mt-0 mb-3.5">
          {c.resultLabel}
        </CaseHeading>
        <p className="m-0 text-panel-soft">{c.result}</p>
      </Reveal>

      {/* ── Stack + CTAs ─────────────────────────────────────────── */}
      <Reveal className="mt-[clamp(28px,4vw,48px)] border-t-[0.5px] border-panel-hair pt-[clamp(18px,2.6vw,26px)]">
        <p className="m-0 font-mono text-meta text-panel-soft">
          <span className="mr-2 font-medium text-panel-ink">{c.stackLabel}</span>
          {c.stack.join(" · ")}
        </p>

        <ButtonRow className="mt-cta">
          {links.maestria.repo && (
            <ButtonLink href={links.maestria.repo} tone="solid" surface="panel" external>
              {c.ctaRepo}
            </ButtonLink>
          )}
          <ButtonLink href="/#casos" surface="panel">
            {content.nav.backToHome}
          </ButtonLink>
        </ButtonRow>
      </Reveal>
    </article>
  );
}
