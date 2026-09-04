import { CaseHeader, CaseHeading } from "@/components/case-study/CaseHeader";
import { CaseShots } from "@/components/case-study/CaseShots";
import { RetrievalDiagram } from "@/components/case-study/RetrievalDiagram";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { AsideNote } from "@/components/ui/Aside";
import { ButtonLink, ButtonRow } from "@/components/ui/ButtonLink";
import { getContent } from "@/lib/content";
import { localized } from "@/lib/routes";
import { links } from "@/lib/links";
import type { Locale } from "@/lib/types";

/**
 * Tercera composición del sitio, sobre `paper` como Qué Pinta Salta pero sin
 * los dos carriles: la decisión de Tuki es una sola —anclar cada respuesta a
 * un documento— y va como titular en tinta entre hairlines, con el aside de
 * trazabilidad al lado. `panel` queda reservado a MaestrIA.
 *
 * Es el único caso con una sección de organización del trabajo: el rol es
 * parte del argumento, no una nota al pie. Por eso el aside del problema
 * también es de rol y no de stack.
 *
 * Sin videos todavía: la página cierra sin ellos. Cuando lleguen, van junto
 * a las capturas, después de "Cómo funciona", como evidencia.
 */

/**
 * Capturas del prototipo web, mismo contrato que los otros dos casos: el
 * archivo y sus dimensiones viven acá, los alt en `caseTuki.shots` en este
 * mismo orden. `width` es también el tope de render.
 *
 * La tercera es un recorte a propósito: solo el bloque de fuentes al pie de
 * una respuesta. La respuesta completa nombraba al municipio en una URL y
 * ese es exactamente el nombre que el caso no dice. El bloque recortado es
 * además la evidencia que importa: cada respuesta resuelve a documentos
 * del corpus con fecha de verificación.
 */
const SHOTS = [
  { src: "/casos/tuki/inicio.png", width: 1820, height: 878 },
  { src: "/casos/tuki/consultas-frecuentes.png", width: 1455, height: 1108 },
  { src: "/casos/tuki/fuentes-oficiales.png", width: 938, height: 315 },
] as const;

export function CaseTuki({ locale }: { locale: Locale }) {
  const content = getContent(locale);
  const c = content.caseTuki;

  return (
    <article className="pt-[clamp(24px,4vw,48px)] pb-section">
      <CaseHeader
        status={c.status}
        statusTone="wip"
        year={c.year}
        kicker={c.kicker}
        title={c.title}
        subtitle={c.subtitle}
        backLabel={content.nav.backToHome}
        locale={locale}
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
      <Reveal className="mt-block border-y-[0.5px] border-hair py-[clamp(24px,3.4vw,40px)]">
        <CaseHeading className="mt-0 mb-4">{c.decisionHeading}</CaseHeading>

        <p className="m-0 max-w-[26ch] font-display text-decision leading-[1.05] font-semibold opsz-72 tracking-[-0.025em] text-ink">
          {c.decisionHeadline}
        </p>

        <div className="mt-[clamp(20px,3vw,30px)] flex flex-wrap items-start gap-main">
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
          <AsideNote term={c.traceAsideLabel}>{c.traceAside}</AsideNote>
        </div>
      </Reveal>

      {/* ── Cómo funciona ────────────────────────────────────────── */}
      <section>
        <CaseHeading className="mt-block mb-lede">{c.howHeading}</CaseHeading>
        <RetrievalDiagram labels={c.diagram} />

        <Reveal className="mt-[clamp(26px,3.6vw,40px)] flex flex-wrap items-start gap-main">
          <div className="min-w-0 max-w-[62ch] flex-1 basis-[36ch]">
            {c.how.map((text, i) => (
              <p
                key={text.slice(0, 24)}
                className={`mt-0 text-ink-soft ${i === c.how.length - 1 ? "mb-0" : "mb-4"}`}
              >
                {text}
              </p>
            ))}
          </div>
          <AsideNote term={c.evalAsideLabel}>{c.evalAside}</AsideNote>
        </Reveal>

        <CaseShots
          shots={SHOTS}
          alts={c.shots}
          hint={c.shotsHint}
          className="mt-[clamp(26px,3.6vw,40px)]"
        />
      </section>

      {/* ── Qué está construido ──────────────────────────────────── */}
      <section className="mt-block">
        <Reveal>
          <CaseHeading className="mt-0 mb-3.5">{c.builtHeading}</CaseHeading>
          <p className="mt-0 mb-lede max-w-[62ch] text-ink-soft">{c.builtIntro}</p>
        </Reveal>

        <RevealGroup as="ol" className="m-0 grid list-none border-t-[0.5px] border-hair p-0">
          {c.built.map((item, i) => (
            <RevealItem
              key={item.slice(0, 24)}
              as="li"
              className="flex flex-wrap gap-x-[clamp(18px,3vw,36px)] gap-y-1.5 border-b-[0.5px] border-hair py-[clamp(14px,2.2vw,22px)]"
            >
              <span className="flex-none basis-[5ch] font-mono text-meta text-ink-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 max-w-[58ch] flex-1 basis-[30ch] text-ink-soft">
                {item}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ── Cómo se organizó el trabajo ──────────────────────────── */}
      <Reveal className="mt-block flex flex-wrap items-start gap-main">
        <div className="min-w-0 max-w-[62ch] flex-1 basis-[36ch]">
          <CaseHeading className="mt-0 mb-3.5">{c.teamHeading}</CaseHeading>
          {c.team.map((text, i) => (
            <p
              key={text.slice(0, 24)}
              className={`mt-0 text-ink-soft ${i === c.team.length - 1 ? "mb-0" : "mb-4"}`}
            >
              {text}
            </p>
          ))}
        </div>
        <AsideNote term={c.planAsideLabel}>{c.planAside}</AsideNote>
      </Reveal>

      {/* ── Estado ───────────────────────────────────────────────── */}
      <Reveal className="mt-[clamp(32px,4.6vw,56px)] max-w-[62ch]">
        <CaseHeading className="mt-0 mb-3.5">{c.resultLabel}</CaseHeading>
        <p className="m-0 text-ink-soft">{c.result}</p>
      </Reveal>

      {/* ── Stack + CTAs ─────────────────────────────────────────── */}
      <Reveal className="mt-[clamp(36px,5vw,60px)] border-t-[0.5px] border-hair pt-[clamp(20px,3vw,30px)]">
        <p className="m-0 font-mono text-meta text-ink-soft">
          <span className="mr-2 font-medium text-ink">{c.stackLabel}</span>
          {c.stack.join(" · ")}
        </p>

        <ButtonRow className="mt-cta">
          {links.tuki.live && (
            <ButtonLink href={links.tuki.live} tone="solid" surface="paper" external>
              {c.ctaLive}
            </ButtonLink>
          )}
          {links.tuki.repo && (
            <ButtonLink href={links.tuki.repo} surface="paper-2" external>
              {c.ctaRepo}
            </ButtonLink>
          )}
          <ButtonLink href={localized("/#casos", locale)} surface="paper-2">
            {content.nav.backToHome}
          </ButtonLink>
        </ButtonRow>
      </Reveal>
    </article>
  );
}
