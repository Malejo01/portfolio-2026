import Link from "next/link";
import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { estiloCopy, getEstilo, selectorCopy } from "@/content/agencia/estilos";
import { waLink } from "@/lib/agencia/config";
import { personajes } from "@/lib/agencia/sprites";
import { Check, Icon } from "../../../icons";
import { Sprite } from "../../../Sprite";
import { AbrirChat } from "../../../client/AbrirChat";
import { PersonajeCiclo, PersonajeRapido } from "../../../client/EstiloSelector";
import { Garabato } from "../../../client/Garabato";

/**
 * Hero de Aula virtual (tanda P3-2, `docs/agencia/estilos/aula/` F-home-oscuro,
 * F-home-claro y F-home-celular): el pizarrón. Etiqueta y H1 en Caveat, la
 * "IA" con resaltador, el ejemplo «Instituto del Sol · Matemática I ·
 * Funciones» en un recuadro punteado (HTML y CSS, `aria-hidden`) y los
 * garabatos: "f(idea) = idea + IA", la flecha "¡mirá!" y, en oscuro, la
 * mancha de borrador. Mauro va en la esquina del ejemplo; el dibujo por
 * defecto del estilo es el anime (`estilos.ts → dibujoPorDefecto`).
 */
export function HeroAula() {
  const { hero } = home;
  const c = estiloCopy.hero;
  const a = estiloCopy.aula;
  const estilo = getEstilo("aula")!;
  const wa = waLink(WHATSAPP_TEXTO);
  const tonos = ["tono-1", "tono-2", "tono-3"];

  return (
    <section data-solo-estilo="aula" className="hero-aula relative">
      <span aria-hidden="true" className="mancha-borrador" />
      <div className="wrap relative grid grid-cols-1 gap-10 pb-10 pt-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pb-16 lg:pt-10">
        <div className="relative flex min-w-0 flex-col gap-[14px] sm:gap-5 lg:pt-[70px]">
          <span className="relative hidden h-[60px] w-[220px] lg:absolute lg:-top-1.5 lg:left-2 lg:block">
            <span className="block font-titulo text-[30px] leading-none text-tono-2">{a.garabatos.formula}</span>
            <Garabato trazos={["M4 6 C 60 16, 140 -2, 210 8"]} viewBox="0 0 220 16" ancho={3} className="absolute left-0 top-[42px] h-4 w-[210px] text-tono-1" />
          </span>
          <span className="font-titulo text-[24px] font-semibold leading-tight text-tono-3 sm:text-[30px]">
            <span className="sm:hidden">{a.labelCorto}</span>
            <span className="hidden sm:inline">{a.label}</span>
          </span>
          <h1 className="h text-[44px] leading-[1.02] min-[380px]:text-[48px] sm:text-[68px]">
            {c.antes}
            <span className="ia-resaltada text-acc-text">{c.acento}</span>
            {c.despues}
          </h1>
          <p className="m-0 text-[16px] text-muted sm:hidden">{hero.leadCorto}</p>
          <p className="m-0 hidden max-w-[520px] text-[19px] leading-[1.6] text-muted sm:block">{hero.lead}</p>

          <div className="flex items-center gap-3 rounded-md bg-surf-2 px-3 py-2.5 lg:hidden">
            <span className="flex h-[76px] w-12 flex-none items-end justify-center overflow-hidden">
              <Sprite alto={72} alt={estiloCopy.alt.normal} saludoAlEntrar />
            </span>
            <span className="flex min-w-0 flex-col text-[14px] leading-snug">
              <strong className="font-bold">{hero.quien.nombre}</strong>
              <span className="text-muted">{hero.quien.rol}</span>
            </span>
            <PersonajeCiclo label={estiloCopy.cambiarPersonaje} className="ml-auto border-2 border-dashed bg-transparent text-tono-3" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <AbrirChat href={wa} className="btn btn-p w-full text-[17px] sm:w-auto">
              {c.primary}
            </AbrirChat>
            <Link href={hero.secondary.href} className="btn btn-s w-full border-2 text-[17px] sm:w-auto">
              {c.secondary}
            </Link>
          </div>

          <ul aria-label={hero.chipsLabel} className="m-0 flex list-none justify-between gap-x-5 gap-y-1 p-0 text-[12px] text-muted sm:mt-1 sm:flex-wrap sm:justify-start sm:font-titulo sm:text-[24px]">
            {hero.chips.map((chip, i) => (
              <li key={chip} className={`${tonos[i % 3]} flex items-center gap-1 sm:gap-2`}>
                <span className="tono-texto inline-flex">
                  <Check size={16} />
                </span>
                <span className="sm:hidden">{c.chipsCortos[i]}</span>
                <span className="hidden sm:inline">{chip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex min-w-0 flex-col gap-3 lg:pt-[72px]">
          {/* La flecha "¡mirá!" baja desde arriba al ejemplo, sin cruzar el texto del hero. */}
          <span className="garabato absolute left-0 top-0 hidden h-[68px] w-[190px] text-tono-2 lg:block">
            <span aria-hidden="true" className="absolute left-0 top-0 font-titulo text-[26px] leading-none">
              {a.garabatos.mira}
            </span>
            <Garabato trazos={["M70 14 C 120 4, 168 18, 176 52", "M164 42 L176 56 L186 40"]} viewBox="0 0 190 68" ancho={3.5} className="absolute inset-0" />
          </span>
          <span className="font-titulo text-[26px] leading-tight text-tono-2">{a.ejemplo.etiqueta}</span>
          <div className="relative">
            <Pizarron />
            <span className="pointer-events-none absolute -bottom-1 -left-14 hidden lg:block">
              <Sprite alto={186} alt={estiloCopy.alt.normal} saludoAlEntrar />
            </span>
          </div>
          <Link href={`/soluciones?cat=${estilo.categoria}`} className="self-start font-bold text-acc-text underline underline-offset-4">
            {a.ejemplo.link}
          </Link>
          <PersonajeRapido copy={selectorCopy} personajes={personajes()} className="personaje-rapido mt-6 hidden lg:flex" />
        </div>
      </div>
    </section>
  );
}

/** «Instituto del Sol · Matemática I · Funciones». */
function Pizarron() {
  const e = estiloCopy.aula.ejemplo;
  return (
    <div aria-hidden="true" className="rounded-md border-2 border-dashed border-border bg-surf-2 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] font-bold uppercase tracking-[.08em] text-tono-1-texto">{e.instituto}</span>
        <span className="text-[12px] text-muted">{e.saludo}</span>
      </div>
      <div className="mt-2.5 font-titulo text-[30px] leading-[1.1] text-titulo">{e.curso}</div>
      <div className="mt-2.5">
        <div className="flex justify-between text-[12px] text-muted">
          <span>{e.avance}</span>
          <span>{e.avanceDe}</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-tono-1-bg">
          <div className="h-2 rounded-full bg-tono-1" style={{ width: `${e.avancePct}%` }} />
        </div>
      </div>
      <ul className="m-0 mt-2.5 list-none p-0">
        {e.clases.map((cl) => (
          <li key={cl.texto} className="flex items-center gap-2.5 border-b border-dashed border-border py-2 text-[14px] text-text">
            <span className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 border-tono-3 ${cl.hecha ? "bg-tono-3 text-bg" : ""}`}>
              {cl.hecha ? <Check size={12} /> : null}
            </span>
            {cl.texto}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-2.5 rounded-md bg-tono-2-bg px-3 py-2.5 text-[14px] text-text">
        <span className="inline-flex flex-none text-tono-2">
          <Icon name="ia" size={20} />
        </span>
        <span>
          <b>{e.asistente}</b> {e.pregunta}
        </span>
      </div>
    </div>
  );
}
