import Image from "next/image";
import { home } from "@/content/agencia/home";
import { MalejoMark } from "../MalejoMark";
import { Reveal } from "../client/Reveal";

/**
 * "Quién está detrás" (`07-sobre-mi-*.png`). La historia completa va en un
 * `<details>`: sin JS. Abierto, el botón baja debajo del texto y dice
 * "Ver menos" (CSS en `agencia.css`, bloque `.story`).
 */
export function About() {
  const { about } = home;

  return (
    <section id="sobre-mi" className="wrap pt-[72px] sm:pt-24">
      <Reveal>
        <div className="card card-big grid grid-cols-1 items-center gap-11 p-7 sm:grid-cols-[260px_minmax(0,1fr)] sm:p-11">
          <div className="relative mx-auto flex h-[300px] w-full max-w-[260px] items-center justify-center rounded-[22px] border border-dashed border-border-2 bg-(--mock-bg)">
            <span className="lbl">{about.photo}</span>
            <Image
              src="/agencia/sprites/malejo-bolsillos.png"
              alt={about.spriteAlt}
              width={54}
              height={123}
              unoptimized
              className="pixel absolute -bottom-px -right-[18px] h-[123px] w-[54px]"
            />
          </div>
          <div className="flex flex-col gap-3.5">
            <span className="lbl lbl-o inline-flex items-center gap-2">
              <MalejoMark size={18} className="text-acc" />
              {about.label}
            </span>
            <h2 className="h text-[30px] sm:text-[36px]">{about.title}</h2>
            <p className="m-0 text-[17px] leading-[1.6]">{about.body}</p>
            <details className="story">
              <summary className="btn btn-s btn-sm">
                <span className="story-more">{about.more}</span>
                <span className="story-less">{about.less}</span>
              </summary>
              <div className="flex flex-col gap-2.5 pt-0.5">
                {about.story.map((p) => (
                  <p key={p} className="m-0 text-base leading-[1.6] text-muted">
                    {p}
                  </p>
                ))}
              </div>
            </details>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
