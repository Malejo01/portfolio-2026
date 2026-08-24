import type { Metadata } from "next";
import { ArchitectureDiagram } from "@/components/case-study/ArchitectureDiagram";
import { CaseHeader, CaseHeading } from "@/components/case-study/CaseHeader";
import { CaseShots } from "@/components/case-study/CaseShots";
import { Reveal } from "@/components/motion/Reveal";
import { AsideNote } from "@/components/ui/Aside";
import { ButtonLink, ButtonRow } from "@/components/ui/ButtonLink";
import { getContent } from "@/lib/content";
import { links } from "@/lib/links";
import { getLocale } from "@/lib/locale";

/** Ruta del `opengraph-image` del root. `metadataBase` la vuelve absoluta. */
const OG_IMAGE = "/opengraph-image";

/**
 * Capturas del producto, mismo contrato que MaestrIA: el archivo y sus
 * dimensiones intrínsecas viven acá, los alt en `caseQps.shots` en este mismo
 * orden. `width` es también el tope de render — nada se escala por encima de
 * su resolución real.
 *
 * Las dos primeras son la salida del pipeline —lo que el diagrama de arriba
 * termina produciendo— y por eso van justo después de él: la home con un
 * evento rotulado "importado automáticamente desde entradauno" y la grilla
 * con el toggle de flyers de redes, que es el carril de Instagram visto
 * desde el lado del usuario. Las dos últimas son el radar por email.
 */
const SHOTS: readonly { src: string; width: number; height: number }[] = [
  { src: "/casos/que-pinta-salta/home.png", width: 1808, height: 839 },
  { src: "/casos/que-pinta-salta/grilla-categorias.png", width: 1816, height: 848 },
  { src: "/casos/que-pinta-salta/radar-frecuencia.png", width: 1816, height: 850 },
  { src: "/casos/que-pinta-salta/radar-organizadores.png", width: 1822, height: 843 },
];

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = getContent(await getLocale());
  return {
    title: meta.caseQpsTitle,
    description: meta.caseQpsDescription,
    alternates: { canonical: "/casos/que-pinta-salta" },
    // Declarar `openGraph` acá reemplaza el objeto heredado del root layout:
    // no se mergea campo a campo, así que sin `images` la ruta se queda sin
    // og:image y el convention file de app/opengraph-image.tsx no la cubre.
    // Lo mismo con `twitter`: sin este bloque hereda el título y la
    // descripción del home.
    openGraph: {
      type: "article",
      url: "/casos/que-pinta-salta",
      title: meta.caseQpsTitle,
      description: meta.caseQpsDescription,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: meta.caseQpsTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.caseQpsTitle,
      description: meta.caseQpsDescription,
      images: [OG_IMAGE],
    },
  };
}

export default async function QuePintaSaltaPage() {
  const content = getContent(await getLocale());
  const c = content.caseQps;

  return (
    <article className="pt-[clamp(24px,4vw,48px)] pb-section">
      <CaseHeader
        status={c.status}
        statusTone="live"
        year={c.year}
        title={c.title}
        subtitle={c.subtitle}
        backLabel={content.nav.backToHome}
      />

      {/* ── El problema ──────────────────────────────────────────── */}
      <Reveal className="mt-[clamp(40px,6vw,72px)] flex flex-wrap items-start gap-main">
        <div className="min-w-0 max-w-[62ch] flex-1 basis-[36ch]">
          <CaseHeading className="mt-0 mb-3.5">{c.problemHeading}</CaseHeading>
          {c.problem.map((text, i) => (
            <p
              key={text.slice(0, 24)}
              className={`mt-0 text-ink-soft ${i === c.problem.length - 1 ? "mb-0" : "mb-4"}`}
            >
              {text}
            </p>
          ))}
        </div>
        <AsideNote term={c.roleLabel}>{c.role}</AsideNote>
      </Reveal>

      {/* ── La decisión que define el sistema ────────────────────── */}
      <Reveal>
        <CaseHeading className="mt-block mb-0">{c.decisionHeading}</CaseHeading>

        {/* Los dos carriles del sistema, uno por fila. La línea de cierre de
            1px es la misma marca de énfasis que el borde de la compuerta. */}
        <div className="mt-[clamp(22px,3vw,34px)] mb-[clamp(26px,3.4vw,38px)]">
          <div className="h-[0.5px] bg-accent" />
          <div className="flex flex-wrap items-baseline gap-x-[18px] gap-y-2 py-3.5">
            <span className="font-display text-decision leading-[1.05] font-semibold opsz-72 tracking-[-0.025em] text-accent">
              {c.decisionModel}
            </span>
            <span className="font-mono text-meta text-accent">{c.decisionModelNote}</span>
          </div>
          <div className="h-[0.5px] bg-hair" />
          <div className="flex flex-wrap items-baseline gap-x-[18px] gap-y-2 py-3.5">
            <span className="font-display text-decision leading-[1.05] font-semibold opsz-72 tracking-[-0.025em] text-ink">
              {c.decisionCode}
            </span>
            <span className="font-mono text-meta text-ink-soft">{c.decisionCodeNote}</span>
          </div>
          <div className="h-px bg-ink" />
        </div>

        <div className="flex flex-wrap items-start gap-main">
          <div className="min-w-0 max-w-[62ch] flex-1 basis-[36ch]">
            {c.decisionBody.map((text, i) => (
              <p
                key={text.slice(0, 24)}
                className={`mt-0 text-ink-soft ${i === c.decisionBody.length - 1 ? "mb-0" : "mb-4"}`}
              >
                {text}
              </p>
            ))}
          </div>
          <AsideNote term={c.gateAsideLabel}>{c.gateAside}</AsideNote>
        </div>
      </Reveal>

      {/* ── Cómo funciona ────────────────────────────────────────── */}
      <section>
        <CaseHeading className="mt-block mb-lede">{c.howHeading}</CaseHeading>
        <ArchitectureDiagram labels={c.diagram} />

        <CaseShots
          shots={SHOTS}
          alts={c.shots}
          hint={c.shotsHint}
          className="mt-[clamp(26px,3.6vw,40px)]"
        />
      </section>

      {/* ── Dedup ────────────────────────────────────────────────── */}
      <Reveal className="mt-[clamp(30px,4vw,52px)] flex flex-wrap items-start gap-main">
        <div className="min-w-0 max-w-[62ch] flex-1 basis-[36ch]">
          {c.afterDiagram.map((text, i) => (
            <p
              key={text.slice(0, 24)}
              className={`mt-0 text-ink-soft ${i === c.afterDiagram.length - 1 ? "mb-0" : "mb-4"}`}
            >
              {text}
            </p>
          ))}

          {/* Única fórmula de toda la página. */}
          <div className="hairline mt-[clamp(22px,3vw,34px)] flex flex-wrap items-center justify-center gap-x-4 gap-y-3 rounded-card border-hair bg-paper-2 p-[clamp(20px,3vw,30px)]">
            <span className="font-display text-formula leading-none font-medium opsz-48 text-ink">
              J(A,B)
            </span>
            <span className="font-display text-formula-sm leading-none font-medium text-ink-soft">
              =
            </span>
            <span className="inline-grid justify-items-center gap-1.5 font-display text-formula-sm leading-[1.1] font-medium opsz-48">
              <span className="px-2.5">|A ∩ B|</span>
              <span aria-hidden="true" className="h-[0.5px] w-full bg-ink" />
              <span className="px-2.5">|A ∪ B|</span>
            </span>
          </div>

          <p className="mt-3 mb-0 font-mono text-meta text-ink-soft">{c.formulaNote}</p>
        </div>

        <AsideNote term={c.resultLabel}>{c.result}</AsideNote>
      </Reveal>

      {/* ── Stack + CTAs ─────────────────────────────────────────── */}
      <Reveal className="mt-[clamp(36px,5vw,60px)] border-t-[0.5px] border-hair pt-[clamp(20px,3vw,30px)]">
        <p className="m-0 font-mono text-meta text-ink-soft">
          <span className="mr-2 font-medium text-ink">{c.stackLabel}</span>
          {c.stack.join(" · ")}
        </p>

        <ButtonRow className="mt-cta">
          {links.qps.live && (
            <ButtonLink href={links.qps.live} tone="solid" surface="paper" external>
              {c.ctaLive}
            </ButtonLink>
          )}
          {links.qps.repo && (
            <ButtonLink href={links.qps.repo} surface="paper-2" external>
              {c.ctaRepo}
            </ButtonLink>
          )}
          {links.qps.interview && (
            <ButtonLink href={links.qps.interview} surface="paper-2" external>
              {c.ctaInterview}
            </ButtonLink>
          )}
          <ButtonLink href="/#casos" surface="paper-2">
            {content.nav.backToHome}
          </ButtonLink>
        </ButtonRow>
      </Reveal>
    </article>
  );
}
