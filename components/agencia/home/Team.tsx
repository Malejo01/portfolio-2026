import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { home, proyectosDeLaHome } from "@/content/agencia/home";
import { MalejoMark } from "../MalejoMark";
import { ProjectVideo } from "../client/ProjectVideo";
import { Reveal } from "../client/Reveal";

/**
 * La foto de Mauro, si existe `public/agencia/marca/mauro.jpg`. Se resuelve
 * al importar el módulo, en el build: la home sigue estática y, cuando Mauro
 * suba la foto, alcanza con un redeploy. Sin foto va solo el sprite, sin el
 * recuadro punteado de "foto profesional" (tanda R2).
 */
const FOTO = "/agencia/marca/mauro.jpg";
const HAY_FOTO = existsSync(path.join(process.cwd(), "public", FOTO));

export function Retrato({ className = "" }: { className?: string }) {
  const { team } = home;
  if (HAY_FOTO) {
    return (
      <Image
        src={FOTO}
        alt={team.photoAlt}
        width={160}
        height={160}
        className={`h-24 w-24 flex-none rounded-[22px] object-cover sm:h-28 sm:w-28 ${className}`}
      />
    );
  }
  return (
    <span className={`relative inline-flex h-24 w-20 flex-none items-end justify-center overflow-hidden rounded-[22px] bg-ic-bg sm:h-28 sm:w-24 ${className}`}>
      <Image
        src="/agencia/sprites/malejo-bolsillos.png"
        alt={team.spriteAlt}
        width={54}
        height={123}
        unoptimized
        className="pixel -mb-6 h-[123px] w-[54px]"
      />
    </span>
  );
}

/**
 * "Quién te va a atender" (auditoría §6.3): Mauro en dos líneas y 3
 * proyectos contados por el problema que resuelven, sin etiquetas de
 * tecnología. Une las secciones viejas de Proyectos y Sobre mí; por eso
 * conserva los dos `id` (`#proyectos`, `#sobre-mi`) que había enlazados.
 *
 * Los proyectos son MP4 sobre su póster, a la misma altura que el póster
 * solo: el video no suma alto. En celular van en carrusel horizontal.
 */
export function Team() {
  const { team } = home;
  const proyectos = proyectosDeLaHome();

  return (
    <section id="proyectos" className="wrap pt-14 sm:pt-16">
      <span id="sobre-mi" className="block scroll-mt-[104px]" />
      <Reveal>
        <span className="lbl lbl-o inline-flex items-center gap-2">
          <MalejoMark size={18} className="text-acc" />
          {team.label}
        </span>
      </Reveal>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)] lg:gap-5">
        <Reveal>
          <div className="card card-big flex h-full flex-row items-center gap-5 p-5 sm:p-7 lg:flex-col lg:items-start">
            <Retrato />
            <div className="flex flex-col gap-2">
              <h2 className="h text-[24px] leading-[1.1] sm:text-[28px]">{team.title}</h2>
              {team.body.map((p) => (
                <p key={p} className="m-0 text-[15px] leading-[1.55] text-muted">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="flex flex-col gap-3">
          <h3 className="lbl m-0">{team.projectsTitle}</h3>
          <ul className="no-scrollbar -mx-5 m-0 flex list-none gap-3 overflow-x-auto p-0 px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0">
            {proyectos.map((p) => (
              <li key={p.key} className="flex w-[78%] flex-none sm:w-[46%] lg:w-auto">
                <article className="card lift relative flex flex-1 flex-col gap-2.5 p-3">
                  <div className="shot aspect-[960/439] rounded-[14px]">
                    <ProjectVideo
                      src={`/agencia/proyectos/${p.key}.mp4`}
                      poster={`/agencia/proyectos/${p.key}.jpg`}
                      label={`${p.nombre}: ${p.problema}`}
                      className="block h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 px-1.5 pb-1">
                    <span className="lbl lbl-o text-[10px]">{p.nombre}</span>
                    <h4 className="h text-[17px] leading-[1.2]">
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener"
                        className="no-underline after:absolute after:inset-0 after:rounded-[22px] after:content-['']"
                      >
                        {p.problema}
                      </a>
                    </h4>
                    <p className="m-0 text-[13px] leading-[1.45] text-muted">
                      {team.parecido}{" "}
                      <Link href={`/servicios/${p.solucion}`} className="relative z-10 font-semibold text-acc-text no-underline hover:underline">
                        {p.parecido}
                      </Link>
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <Link href={team.more.href} className="lnk min-h-11 self-start text-[15px]">
            {team.more.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
