import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SectionLabel, SectionNote } from "@/components/ui/SectionLabel";
import type { ProjectsContent } from "@/lib/types";

/**
 * Tratamiento deliberadamente plano: filas con hairline, sin cards ni
 * thumbnails. No tienen que competir visualmente con los casos de estudio.
 */
export function OtherProjects({ projects }: { projects: ProjectsContent }) {
  return (
    <section id="proyectos" className="pb-section">
      <div className="mb-lede flex flex-wrap items-baseline justify-between gap-3">
        <SectionLabel>{projects.label}</SectionLabel>
        <SectionNote>{projects.note}</SectionNote>
      </div>

      <RevealGroup className="grid border-t-[0.5px] border-hair">
        {projects.rows.map((row) => (
          <RevealItem
            key={row.title}
            className="flex flex-wrap gap-x-gap-2 gap-y-2.5 border-b-[0.5px] border-hair py-row-lg"
          >
            <div className="min-w-0 flex-none basis-[22ch]">
              <span className="block font-display text-lead font-semibold opsz-18 tracking-[-0.01em]">
                {row.title}
              </span>
              <span className="font-mono text-meta text-ink-soft">{row.meta}</span>
            </div>
            <p className="m-0 min-w-0 max-w-[58ch] flex-1 basis-[32ch] text-ink-soft">
              {row.body}
              <br />
              <span className="font-mono text-meta">{row.stack}</span>
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
