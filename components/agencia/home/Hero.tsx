import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { waLink } from "@/lib/agencia/config";
import { Check, Icon } from "../icons";
import { MalejoMark } from "../MalejoMark";
import { AbrirChat } from "../client/AbrirChat";
import { Typewriter } from "../client/Typewriter";

/**
 * Hero bento (DISENO.md §4 Hero, `02-hero-*.png`). Tanda R2: el título y el
 * tecleo no cambian; la acción principal abre el chat de Malejo. Tanda P1
 * (§4.1): las tres garantías pasan a una fila de chips de 3 o 4 palabras,
 * dentro de la misma tarjeta, debajo de los botones.
 *
 * Los chips no llevan entrada al scroll: están arriba del pliegue, y
 * arrancar en `opacity: 0` hasta hidratar empeoraba el LCP en celular.
 */
export function Hero() {
  const { hero } = home;
  const wa = waLink(WHATSAPP_TEXTO);

  return (
    <section id="inicio" className="wrap pt-4">
      <div className="card card-big relative flex flex-col justify-center gap-5 overflow-hidden p-5 sm:gap-6 sm:p-12 lg:min-h-[440px]">
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
        <ul aria-label={hero.chipsLabel} className="relative m-0 flex list-none flex-wrap gap-2 p-0">
          {hero.chips.map((c) => (
            <li key={c} className="chip">
              <Check size={14} />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
