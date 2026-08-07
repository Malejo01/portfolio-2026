import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SectionLabel, SectionNote } from "@/components/ui/SectionLabel";
import { links } from "@/lib/links";
import type { ProjectRow, ProjectsContent } from "@/lib/types";

/** El `slug` de cada fila resuelve acá, no en la copy. */
const projectHref: Record<ProjectRow["slug"], string> = {
  "salta-pay": links.projects.saltaPay,
  automotive: links.projects.automotive,
  restaurant: links.projects.restaurant,
};

/**
 * Tratamiento deliberadamente plano: filas con hairline, sin cards ni
 * thumbnails. No tienen que competir visualmente con los casos de estudio.
 *
 * El título es el enlace cuando hay URL. Lleva subrayado fijo en vez de
 * solo hover: es lo único que distingue una fila navegable de una que
 * todavía no lo es, y el hover no existe en touch. Si el slug no tiene URL
 * en lib/links.ts, la fila se renderiza como texto plano.
 */
export function OtherProjects({ projects }: { projects: ProjectsContent }) {
  return (
    <section id="proyectos" className="pb-section">
      <div className="mb-lede flex flex-wrap items-baseline justify-between gap-3">
        <SectionLabel as="h2">{projects.label}</SectionLabel>
        <SectionNote>{projects.note}</SectionNote>
      </div>

      <RevealGroup className="grid border-t-[0.5px] border-hair">
        {projects.rows.map((row) => (
          <RevealItem
            key={row.title}
            className="flex flex-wrap gap-x-gap-2 gap-y-2.5 border-b-[0.5px] border-hair py-row-lg"
          >
            <div className="min-w-0 flex-none basis-[22ch]">
              {projectHref[row.slug] ? (
                <a
                  href={projectHref[row.slug]}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block font-display text-lead font-semibold opsz-18 tracking-[-0.01em] text-ink underline decoration-[0.5px] underline-offset-4 hover:decoration-ink"
                >
                  {row.title}
                </a>
              ) : (
                <span className="block font-display text-lead font-semibold opsz-18 tracking-[-0.01em]">
                  {row.title}
                </span>
              )}
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
