import Link from "next/link";
import { home, type Project } from "@/content/agencia/home";
import { Icon } from "../icons";
import { ProjectVideo } from "../client/ProjectVideo";
import { Reveal, RevealGroup, RevealItem } from "../client/Reveal";

/**
 * Proyectos (`06-proyectos-*.png`): AfinIA Jobs grande, Qué Pinta Salta y
 * Tuki apilados, MaestrIA a todo el ancho. Las capturas son MP4 en loop
 * sobre su póster (`public/agencia/proyectos/`).
 */
function Shot({ project, radius }: { project: Project; radius: string }) {
  return (
    <div className={`shot aspect-[960/439] ${radius}`}>
      <ProjectVideo
        src={`/agencia/proyectos/${project.key}.mp4`}
        poster={`/agencia/proyectos/${project.key}.jpg`}
        label={project.alt}
        className="block h-full w-full object-cover object-top"
      />
    </div>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {tags.map((t) => (
        <li key={t} className="tag">
          {t}
        </li>
      ))}
    </ul>
  );
}

export function Projects() {
  const { projects } = home;
  const { featured, side, wide } = projects;

  return (
    <section id="proyectos" className="wrap pt-[72px] sm:pt-24">
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="lbl lbl-o">{projects.label}</span>
          <h2 className="h h2">{projects.title}</h2>
          <p className="mb-0 mt-2 text-[17px] text-muted">{projects.lead}</p>
        </div>
        <Link href={projects.all.href} className="lnk text-[15px]">
          {projects.all.label}
        </Link>
      </Reveal>

      <RevealGroup className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <RevealItem className="flex">
          <article className="card card-big lift flex flex-1 flex-col gap-[18px] p-3.5">
            <Shot project={featured} radius="rounded-[20px]" />
            <div className="flex items-end justify-between gap-4 px-3.5 pb-3">
              <div>
                <span className="lbl lbl-o text-[11px]">{featured.label}</span>
                <h3 className="h mt-1.5 text-[28px] sm:text-[32px]">{featured.name}</h3>
                <p className="mb-2.5 mt-1 text-[15px] text-muted">{featured.description}</p>
                <Tags tags={featured.tags} />
              </div>
              <a
                href={featured.href}
                className="btn btn-p h-12 w-12 flex-none rounded-[14px] p-0"
                aria-label={projects.featuredCta}
                target="_blank"
                rel="noopener"
              >
                <Icon name="arrow" size={16} />
              </a>
            </div>
          </article>
        </RevealItem>

        <div className="grid grid-cols-1 gap-5 lg:grid-rows-2">
          {side.map((p) => (
            <RevealItem key={p.key} className="flex">
              <article className="card lift relative flex flex-1 flex-col gap-3 p-3">
                <Shot project={p} radius="rounded-[14px]" />
                <div className="px-2 pb-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="h text-xl">
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener"
                        className="no-underline after:absolute after:inset-0 after:rounded-[22px] after:content-['']"
                      >
                        {p.name}
                      </a>
                    </h3>
                    <span className="lbl lbl-o text-[10px]">{p.label}</span>
                  </div>
                  <p className="mb-0 mt-1.5 text-sm leading-[1.45] text-muted">{p.description}</p>
                </div>
              </article>
            </RevealItem>
          ))}
        </div>

        <RevealItem className="flex lg:col-span-2">
          <article className="card card-big lift grid flex-1 grid-cols-1 items-center gap-7 p-3.5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <Shot project={wide} radius="rounded-[20px]" />
            <div className="flex flex-col gap-3 px-3.5 pb-3 lg:py-2.5 lg:pl-0 lg:pr-[18px]">
              <span className="lbl lbl-o text-[11px]">{wide.label}</span>
              <h3 className="h text-[28px] sm:text-[32px]">{wide.name}</h3>
              <p className="m-0 text-base leading-[1.55] text-muted">{wide.description}</p>
              <Tags tags={wide.tags} />
              <div>
                <a href={wide.href} className="btn btn-s btn-sm" target="_blank" rel="noopener">
                  {projects.wideCta}
                  <Icon name="arrow" size={16} />
                </a>
              </div>
            </div>
          </article>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
