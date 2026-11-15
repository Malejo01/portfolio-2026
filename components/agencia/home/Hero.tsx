import Link from "next/link";
import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { waLink } from "@/lib/agencia/config";
import { Check } from "../icons";
import { MalejoMark } from "../MalejoMark";
import { AbrirChat } from "../client/AbrirChat";
import { SpriteVivo } from "../client/SpriteVivo";
import { Typewriter } from "../client/Typewriter";

/**
 * Hero bento (DISENO.md §4 Hero, `02-hero-*.png`). Tanda P2 (D7 y D8,
 * celular primero): "Software con IA para tu negocio." y, a 390 × 844 y a
 * 360 × 740, todo arriba del pliegue con la barra inferior incluida: el H1
 * tecleado, la bajada en una línea, Mauro (el sprite que saluda) con quién
 * es, los dos accesos apilados a lo ancho ("Hablar con Malejo" abre la hoja
 * del chat; "Armar mi solución" va a `/soluciones`) y los chips de
 * confianza. Desde `sm` vuelve la bajada larga y los botones van en fila.
 *
 * Los chips no llevan entrada al scroll: están arriba del pliegue, y
 * arrancar en `opacity: 0` hasta hidratar empeoraba el LCP en celular.
 */
export function Hero() {
  const { hero, team } = home;
  const wa = waLink(WHATSAPP_TEXTO);

  return (
    <section id="inicio" className="wrap pt-1 sm:pt-4">
      <div className="card card-big relative flex flex-col justify-center gap-3.5 overflow-hidden p-5 sm:gap-6 sm:p-12 lg:min-h-[440px]">
        <MalejoMark
          size={420}
          strokeWidth={3.2}
          className="pointer-events-none absolute -bottom-[120px] -right-[90px] text-acc opacity-[.07]"
        />
        <span className="lbl lbl-o relative hidden sm:block">{hero.label}</span>
        <h1
          className="h relative min-h-[64px] text-[31px] min-[340px]:min-h-[74px] min-[340px]:text-[36px] leading-[1.02] tracking-[-.03em] min-[380px]:min-h-[82px] min-[380px]:text-[40px] min-[420px]:text-[44px] sm:min-h-[140px] sm:text-[68px]"
          aria-label={hero.ariaLabel}
        >
          <Typewriter lines={hero.lines} />
        </h1>
        <p className="relative m-0 text-[15px] leading-[1.5] text-muted sm:hidden">{hero.leadCorto}</p>
        <p className="relative m-0 hidden max-w-[30em] text-[19px] leading-[1.55] text-muted sm:block">{hero.lead}</p>
        <div className="relative flex items-center gap-3">
          <span className="relative inline-flex h-16 w-14 flex-none justify-center overflow-hidden rounded-[18px] border border-border bg-ic-bg pt-1">
            <SpriteVivo label={team.spriteAlt} />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <strong className="text-[15px]">{hero.quien.nombre}</strong>
            <span className="text-[14px] text-muted">{hero.quien.rol}</span>
          </span>
        </div>
        <div className="relative flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <AbrirChat href={wa} className="btn btn-p w-full sm:w-auto">
            {hero.primary}
          </AbrirChat>
          <Link href={hero.secondary.href} className="btn btn-s w-full sm:w-auto">
            {hero.secondary.label}
          </Link>
        </div>
        <ul aria-label={hero.chipsLabel} className="relative m-0 flex list-none flex-wrap gap-1.5 p-0 sm:gap-2">
          {hero.chips.map((c) => (
            <li key={c} className="chip max-[639px]:gap-1 max-[639px]:px-2 max-[639px]:text-[12px]">
              <Check size={13} />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
