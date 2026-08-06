import { Reveal } from "@/components/motion/Reveal";
import { Aside, AsideStatus } from "@/components/ui/Aside";
import { ButtonLink, ButtonRow } from "@/components/ui/ButtonLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { links, mailto } from "@/lib/links";
import type { ContactContent } from "@/lib/types";

export function Contact({ contact }: { contact: ContactContent }) {
  return (
    <Reveal
      as="section"
      className="flex flex-wrap items-start gap-main rounded-card bg-panel p-panel text-panel-ink"
    >
      <div id="contacto" className="min-w-0 max-w-[60ch] flex-1 basis-[34ch]">
        <SectionLabel onPanel className="mb-3.5">
          {contact.label}
        </SectionLabel>

        <h2 className="mt-0 mb-lede font-display text-display leading-[1.05] font-semibold opsz-60 tracking-[-0.025em]">
          {contact.title}
        </h2>

        <p className="mt-0 mb-cta text-panel-soft">{contact.body}</p>

        {/* Ver Hero: el acento sobre panel no se distingue del texto del
            cuerpo por color solo (1.03:1). El subrayado es el indicador. */}
        <a
          href={mailto("Hola Mauro")}
          className="font-display text-sub font-medium opsz-36 tracking-[-0.01em] break-words text-accent-panel underline decoration-[0.5px] underline-offset-[6px]"
        >
          {contact.email}
        </a>

        <ButtonRow className="mt-[clamp(24px,3.4vw,34px)]">
          <ButtonLink href={links.linkedin} tone="solid" surface="panel" external>
            {contact.ctaLinkedin}
          </ButtonLink>
          <ButtonLink href={links.github} surface="panel" external>
            {contact.ctaGithub}
          </ButtonLink>
          <ButtonLink href={links.cv} surface="panel" external>
            {contact.ctaCv}
          </ButtonLink>
        </ButtonRow>
      </div>

      <Aside
        onPanel
        header={<AsideStatus onPanel>{contact.responseTime}</AsideStatus>}
        items={contact.aside}
      />
    </Reveal>
  );
}
