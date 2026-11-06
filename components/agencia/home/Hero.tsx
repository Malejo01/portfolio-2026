import Link from "next/link";
import { home } from "@/content/agencia/home";
import { Icon } from "../icons";
import { MalejoMark } from "../MalejoMark";
import { Typewriter } from "../client/Typewriter";

/**
 * Hero bento (DISENO.md §4 Hero, `02-hero-*.png`). Las tres tarjetas de la
 * derecha no llevan entrada al scroll: están arriba del pliegue, y arrancar
 * en `opacity: 0` hasta hidratar empeoraba el LCP en celular.
 */
export function Hero() {
  const { hero } = home;

  return (
    <section id="inicio" className="wrap pt-4">
      <div className="grid grid-cols-1 gap-5 lg:min-h-[560px] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="card card-big relative flex flex-col justify-center gap-6 overflow-hidden p-7 sm:p-14">
          <MalejoMark
            size={420}
            strokeWidth={3.2}
            className="pointer-events-none absolute -bottom-[120px] -right-[90px] text-acc opacity-[.07]"
          />
          <span className="lbl lbl-o relative">{hero.label}</span>
          <h1
            className="h relative min-h-[90px] text-[44px] leading-[1.02] tracking-[-.03em] sm:min-h-[140px] sm:text-[68px]"
            aria-label={hero.ariaLabel}
          >
            <Typewriter lines={hero.lines} />
          </h1>
          <p className="relative m-0 max-w-[28em] text-[17px] leading-[1.55] text-muted sm:text-[19px]">{hero.lead}</p>
          <div className="relative flex flex-wrap gap-3">
            <Link href={hero.primary.href} className="btn btn-p">
              {hero.primary.label}
            </Link>
            <a href={hero.secondary.href} className="btn btn-s">
              {hero.secondary.label}
            </a>
          </div>
        </div>

        <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:justify-center lg:overflow-visible lg:px-0 lg:pb-0">
          {hero.cards.map((c) => (
            <div key={c.title} className="flex min-w-[260px] flex-1 lg:min-w-0 lg:flex-none">
              <div className="card lift flex flex-1 flex-col gap-2 p-6">
                <div className="flex items-center gap-3.5">
                  <span className="ic h-10 w-10">
                    <Icon name={c.icon} size={20} />
                  </span>
                  <span className="lbl">{c.label}</span>
                </div>
                <h2 className="h text-[21px]">{c.title}</h2>
                <p className="m-0 text-[15px] leading-normal text-muted">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
