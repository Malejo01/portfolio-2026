import { Aside, AsideStatus } from "@/components/ui/Aside";
import { ButtonLink, ButtonRow } from "@/components/ui/ButtonLink";
import { links, mailto } from "@/lib/links";
import type { HeroContent } from "@/lib/types";

/**
 * Uno de los tres momentos de panel oscuro del sitio (hero, MaestrIA,
 * contacto). Sin animación de entrada: es lo primero que se ve, no hay
 * scroll que la dispare y un fade en el LCP solo lo empeora.
 */
export function Hero({ hero, contactTerm }: { hero: HeroContent; contactTerm: string }) {
  return (
    <section
      id="top"
      className="mt-hero-top flex flex-wrap items-stretch gap-main rounded-card bg-panel p-panel text-panel-ink"
    >
      <div className="min-w-0 flex-1 basis-[36ch]">
        <p className="mt-0 mb-[clamp(18px,3vw,28px)] font-mono text-meta tracking-[0.1em] text-accent-panel uppercase">
          {hero.eyebrow}
        </p>

        <h1 className="m-0 max-w-[20ch] font-display text-hero leading-[1.05] font-semibold opsz-72 tracking-[-0.02em]">
          {hero.headline}
        </h1>

        <p className="mt-[clamp(20px,3vw,28px)] mb-0 max-w-[60ch] text-panel-soft">{hero.lede}</p>

        <ButtonRow className="mt-[clamp(26px,4vw,38px)]">
          <ButtonLink href="/#perfil" tone="solid" surface="panel">
            {hero.ctaPrimary}
          </ButtonLink>
          {links.cv && (
            <ButtonLink href={links.cv} surface="panel" external>
              {hero.ctaCv}
            </ButtonLink>
          )}
          <ButtonLink href={links.github} surface="panel" external>
            GitHub
          </ButtonLink>
          <ButtonLink href={links.linkedin} surface="panel" external>
            LinkedIn
          </ButtonLink>
        </ButtonRow>
      </div>

      <Aside
        onPanel
        header={<AsideStatus onPanel>{hero.status}</AsideStatus>}
        items={hero.aside}
        footer={
          <div>
            <span className="block font-medium text-panel-ink">{contactTerm}</span>
            <a href={mailto()} className="break-all text-accent-panel">
              {links.email}
            </a>
          </div>
        }
      />
    </section>
  );
}
