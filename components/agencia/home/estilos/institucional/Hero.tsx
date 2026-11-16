import Link from "next/link";
import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { estiloCopy, getEstilo, selectorCopy } from "@/content/agencia/estilos";
import { waLink } from "@/lib/agencia/config";
import { personajes } from "@/lib/agencia/sprites";
import { Check } from "../../../icons";
import { Sprite } from "../../../Sprite";
import { AbrirChat } from "../../../client/AbrirChat";
import { PersonajeCiclo, PersonajeRapido } from "../../../client/EstiloSelector";

/**
 * Hero de Institucional (tanda P3-1, `docs/agencia/estilos/institucional/`
 * F-home-claro, F-home-oscuro y F-home-celular). Sobrio: H1 serif sin
 * tecleo, "IA" en petróleo subrayada en terracota, los dos botones y los
 * chips con su tilde de cada color.
 *
 * A la derecha, el ejemplo de la categoría que representa el estilo (webs):
 * la «Cooperativa del Valle» en una ventana de navegador, hecha con HTML y
 * CSS (decorativa: `aria-hidden`; la etiqueta y el link la nombran). Mauro
 * va en la esquina, con el selector rápido de personaje debajo.
 *
 * Celular primero (D8 de P2): arriba del pliegue van el H1, la bajada corta,
 * "Soy Mauro" en el recuadro salvia con el botón para cambiar de dibujo, los
 * dos botones y los chips. El ejemplo queda debajo.
 */
export function HeroInstitucional() {
  const { hero } = home;
  const c = estiloCopy.hero;
  const estilo = getEstilo("institucional")!;
  const ej = estilo.ejemploHero!;
  const wa = waLink(WHATSAPP_TEXTO);
  const tonos = ["tono-1", "tono-2", "tono-3"];

  return (
    <section data-solo-estilo="institucional" className="hero-inst">
      <div className="wrap grid grid-cols-1 gap-10 pb-10 pt-6 sm:pt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pb-[88px] lg:pt-[72px]">
        <div className="flex min-w-0 flex-col gap-[15px] sm:gap-[22px]">
          <span className="lbl lbl-raya text-[11px] text-etiqueta sm:text-[13px]">
            <span className="sm:hidden">{c.labelCorto}</span>
            <span className="hidden sm:inline">{c.label}</span>
          </span>
          <h1 className="h text-[34px] leading-[1.08] min-[380px]:text-[38px] sm:text-[56px]">
            {c.antes}
            <span className="ia-subrayada text-acc-text">{c.acento}</span>
            {c.despues}
          </h1>
          <p className="m-0 text-[16px] text-muted sm:hidden">{hero.leadCorto}</p>
          <p className="m-0 hidden max-w-[520px] text-[19px] leading-[1.6] text-muted sm:block">{hero.lead}</p>

          <div className="flex items-center gap-3 rounded-sm bg-tono-3-bg px-3 py-2.5 lg:hidden">
            <span className="flex h-[76px] w-12 flex-none items-end justify-center overflow-hidden">
              <Sprite alto={72} alt={estiloCopy.alt.normal} saludoAlEntrar />
            </span>
            <span className="flex min-w-0 flex-col text-[14px] leading-snug">
              <strong className="font-semibold">{hero.quien.nombre}</strong>
              <span className="text-muted">{hero.quien.rol}</span>
            </span>
            <PersonajeCiclo label={estiloCopy.cambiarPersonaje} className="ml-auto bg-surf text-tono-3" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <AbrirChat href={wa} className="btn btn-p w-full text-[16px] sm:w-auto" recorrido="malejo" prioridad={3}>
              {c.primary}
            </AbrirChat>
            <Link href={hero.secondary.href} data-recorrido="kit" data-recorrido-prioridad={2} className="btn btn-s w-full text-[16px] sm:w-auto">
              {c.secondary}
            </Link>
          </div>

          <ul
            aria-label={hero.chipsLabel}
            className="m-0 flex list-none justify-between gap-x-[22px] gap-y-2 border-t border-border p-0 pt-2.5 text-[12px] text-muted sm:mt-2 sm:flex-wrap sm:justify-start sm:border-0 sm:pt-0 sm:text-[14px]"
          >
            {hero.chips.map((chip, i) => (
              <li key={chip} className={`${tonos[i % 3]} flex items-center gap-1 sm:gap-2`}>
                <span className="tono-texto inline-flex">
                  <Check size={14} />
                </span>
                <span className="sm:hidden">{c.chipsCortos[i]}</span>
                <span className="hidden sm:inline">{chip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex min-w-0 flex-col gap-3">
          <span className="lbl text-[12px] text-etiqueta">{ej.etiqueta}</span>
          <div className="relative">
            <Ventana />
            <span className="pointer-events-none absolute -bottom-12 -right-3.5 hidden lg:block">
              <Sprite alto={176} alt={estiloCopy.alt.normal} saludoAlEntrar />
            </span>
          </div>
          <Link href={`/soluciones?cat=${estilo.categoria}`} className="lnk self-start underline underline-offset-4">
            {ej.link}
          </Link>
          <PersonajeRapido copy={selectorCopy} personajes={personajes()} className="mt-2 hidden justify-end lg:flex" />
        </div>
      </div>
    </section>
  );
}

/** La «Cooperativa del Valle» en una ventana de navegador. */
function Ventana() {
  const ej = getEstilo("institucional")!.ejemploHero!;
  return (
    <div aria-hidden="true" className="overflow-hidden border border-border bg-surf">
      <div className="flex items-center gap-1.5 border-b border-border bg-surf-2 px-3 py-2">
        <span className="h-[9px] w-[9px] rounded-full bg-border-2" />
        <span className="h-[9px] w-[9px] rounded-full bg-border-2" />
        <span className="h-[9px] w-[9px] rounded-full bg-border-2" />
        <span className="ml-2.5 flex-1 truncate border border-border bg-surf px-2.5 py-[3px] text-[12px] text-etiqueta">{ej.direccion}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b-[3px] border-tono-3 px-[18px] py-3">
        <span className="font-titulo font-bold text-titulo">{ej.marca}</span>
        <span className="text-[12px] text-etiqueta max-[459px]:hidden">{ej.menu}</span>
      </div>
      <div className="grid grid-cols-3 gap-3 p-[18px]">
        <div className="col-span-2 border-l-4 border-tono-1 bg-tono-1-bg p-[18px] max-[459px]:col-span-3">
          <div className="text-[11px] font-semibold uppercase tracking-[.08em] text-tono-1-texto">{ej.novedad.etiqueta}</div>
          <div className="mt-1 font-titulo text-[20px] font-semibold leading-snug text-titulo sm:text-[22px]">{ej.novedad.titulo}</div>
          <div className="mt-1.5 text-[13px] text-muted">{ej.novedad.bajada}</div>
        </div>
        <div className="flex flex-col gap-2 max-[459px]:col-span-3 max-[459px]:flex-row">
          {ej.laterales.map((l, i) => (
            <div key={l.titulo} className={`flex-1 p-2.5 text-[13px] text-muted ${i === 0 ? "bg-tono-2-bg" : "bg-tono-3-bg"}`}>
              {l.titulo}
              <br />
              <span className={`font-semibold ${i === 0 ? "text-tono-2-texto" : "text-tono-3-texto"}`}>{l.accion}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
