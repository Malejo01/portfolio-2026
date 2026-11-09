import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { waLink } from "@/lib/agencia/config";
import { Icon } from "../icons";
import { MalejoMark } from "../MalejoMark";
import { AbrirChat } from "../client/AbrirChat";
import { Typewriter } from "../client/Typewriter";

/**
 * Hero bento (DISENO.md §4 Hero, `02-hero-*.png`). Tanda R2: el título y el
 * tecleo no cambian; la acción principal abre el chat de Malejo y las tres
 * tarjetas pasan a ser garantías. En celular las garantías van en lista
 * (no en carrusel), compactas, para que el bloque entre en una pantalla.
 *
 * Las tarjetas no llevan entrada al scroll: están arriba del pliegue, y
 * arrancar en `opacity: 0` hasta hidratar empeoraba el LCP en celular.
 */
export function Hero() {
  const { hero } = home;
  const wa = waLink(WHATSAPP_TEXTO);

  return (
    <section id="inicio" className="wrap pt-4">
      <div className="grid grid-cols-1 gap-4 lg:min-h-[480px] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-5">
        <div className="card card-big relative flex flex-col justify-center gap-5 overflow-hidden p-5 sm:gap-6 sm:p-12">
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
            <AbrirChat href={wa} className="btn btn-p">
              <Icon name="chat" size={18} />
              {hero.primary}
            </AbrirChat>
            <a href={wa} className="btn btn-s" target="_blank" rel="noopener">
              <Icon name="whatsapp" size={18} />
              {hero.secondary}
            </a>
          </div>
        </div>

        <ul aria-label={hero.cardsLabel} className="m-0 flex list-none flex-col gap-3 p-0 lg:justify-center lg:gap-4">
          {hero.cards.map((c) => (
            <li key={c.title} className="card flex items-start gap-3.5 p-4 sm:p-6">
              <span className="ic h-9 w-9 sm:h-10 sm:w-10">
                <Icon name={c.icon} size={18} />
              </span>
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <h2 className="h text-[17px] leading-tight sm:text-[21px]">{c.title}</h2>
                <p className="m-0 text-[14px] leading-normal text-muted sm:text-[15px]">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
