import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ExperienceContent } from "@/lib/types";

export function Experience({ experience }: { experience: ExperienceContent }) {
  return (
    <section id="experiencia" className="pt-section-sm pb-[clamp(40px,6vw,72px)]">
      <SectionLabel as="h2" className="mb-3.5">
        {experience.label}
      </SectionLabel>

      <RevealGroup className="grid border-t-[0.5px] border-hair">
        {experience.rows.map((row) => (
          <RevealItem
            key={row.title}
            className="flex flex-wrap gap-x-gap-2 gap-y-2 border-b-[0.5px] border-hair py-row"
          >
            <span className="flex-none basis-[16ch] font-mono text-meta text-ink-soft">
              {row.period}
            </span>
            <div className="min-w-0 max-w-[58ch] flex-1 basis-[32ch]">
              <span className="block font-display text-lead font-semibold opsz-18 tracking-[-0.01em]">
                {row.title}
              </span>
              <span className="text-ink-soft">{row.body}</span>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
