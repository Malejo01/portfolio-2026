import { Reveal } from "@/components/motion/Reveal";
import { AsideNote } from "@/components/ui/Aside";
import { ButtonLink, ButtonRow } from "@/components/ui/ButtonLink";
import { Chip, ChipRow, StatusPill } from "@/components/ui/Chip";
import { SectionLabel, SectionNote } from "@/components/ui/SectionLabel";
import { links } from "@/lib/links";
import type { CasesContent } from "@/lib/types";

/**
 * Cada caso tiene composición propia (design-system.md §8): Qué Pinta Salta
 * lleva aside de stack sobre `paper-2`; MaestrIA va sobre `paper` con barra
 * de encabezado y sin aside. No es un componente parametrizado por data.
 */
export function CaseStudies({ cases }: { cases: CasesContent }) {
  const [qps, maestria] = cases.cards;

  return (
    <section id="casos" className="pb-[clamp(56px,8vw,110px)]">
      <div className="mb-lede flex flex-wrap items-baseline justify-between gap-3">
        <SectionLabel>{cases.label}</SectionLabel>
        <SectionNote>{cases.note}</SectionNote>
      </div>

      {/* ── Caso 1 — Qué Pinta Salta ─────────────────────────────── */}
      <Reveal
        as="article"
        className="hairline overflow-hidden rounded-card border-hair bg-paper-2"
      >
        <div className="flex flex-wrap gap-gap-2 p-card">
          <div className="min-w-0 max-w-[62ch] flex-1 basis-[36ch]">
            <div className="mb-3.5 flex flex-wrap items-center gap-2.5 font-mono text-meta text-ink-soft">
              <StatusPill tone="live">{qps.status}</StatusPill>
              <span>{qps.year}</span>
            </div>

            <h3 className="mt-0 mb-3 font-display text-title leading-[1.08] font-semibold opsz-48 tracking-[-0.02em]">
              {qps.title}
            </h3>

            <p className="mt-0 mb-[18px] max-w-[56ch] text-ink-soft">{qps.summary}</p>

            <ChipRow>
              {qps.highlights?.map((h) => (
                <Chip key={h}>{h}</Chip>
              ))}
            </ChipRow>

            <ButtonRow className="mt-cta">
              <ButtonLink href="/casos/que-pinta-salta" tone="solid" surface="paper-2">
                {qps.cta}
              </ButtonLink>
              {links.qps.live && (
                <ButtonLink href={links.qps.live} surface="paper" external>
                  {cases.ctaLive}
                </ButtonLink>
              )}
              {links.qps.repo && (
                <ButtonLink href={links.qps.repo} surface="paper" external>
                  {cases.ctaRepo}
                </ButtonLink>
              )}
            </ButtonRow>
          </div>

          <AsideNote term={qps.stackLabel ?? "Stack"} className="bg-paper!">
            <span className="grid gap-[5px]">
              {qps.stack.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          </AsideNote>
        </div>
      </Reveal>

      {/* ── Caso 2 — MaestrIA ────────────────────────────────────── */}
      <Reveal
        as="article"
        className="hairline mt-[clamp(16px,2.4vw,24px)] overflow-hidden rounded-card border-hair bg-paper"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-[18px] gap-y-2.5 border-b-[0.5px] border-hair bg-paper-2 px-card py-[clamp(12px,1.8vw,18px)] font-mono text-meta text-ink-soft">
          <StatusPill tone="wip">{maestria.status}</StatusPill>
          <span>{maestria.kicker}</span>
        </div>

        <div className="p-card">
          <h3 className="mt-0 mb-3 font-display text-title leading-[1.08] font-semibold opsz-48 tracking-[-0.02em]">
            {maestria.title}
          </h3>

          <p className="mt-0 mb-[18px] max-w-[56ch] text-ink-soft">{maestria.summary}</p>

          <ChipRow>
            {maestria.stack.map((line) => (
              <Chip key={line} surface="paper-2">
                {line}
              </Chip>
            ))}
          </ChipRow>

          <ButtonRow className="mt-cta">
            <ButtonLink href="/casos/maestria" tone="solid" surface="paper">
              {maestria.cta}
            </ButtonLink>
            {links.maestria.repo && (
              <ButtonLink href={links.maestria.repo} surface="paper-2" external>
                {cases.ctaRepo}
              </ButtonLink>
            )}
          </ButtonRow>
        </div>
      </Reveal>
    </section>
  );
}
