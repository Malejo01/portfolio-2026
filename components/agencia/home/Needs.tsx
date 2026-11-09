import Link from "next/link";
import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { getCategory } from "@/content/agencia/pricing";
import { soluciones, type Solucion } from "@/content/agencia/servicios";
import { waLink } from "@/lib/agencia/config";
import { fmt } from "@/lib/agencia/pricing";
import { Icon } from "../icons";
import { AbrirChat } from "../client/AbrirChat";
import { Reveal, RevealGroup, RevealItem } from "../client/Reveal";

/**
 * El "Desde" de cada solución sale del catálogo: el menor pago único de la
 * categoría (o la menor cuota mensual, en Mantenimiento). Nunca escrito a mano.
 */
export function desdeDe(s: Pick<Solucion, "category" | "from">): string {
  const plans = getCategory(s.category)?.plans ?? [];
  const values = plans
    .map((p) => (s.from.basis === "impl" ? p.impl : p.monthly))
    .filter((v): v is number => typeof v === "number" && v > 0);
  return values.length ? `${fmt(Math.min(...values))}${s.from.suffix}` : "";
}

/**
 * Las seis baldosas de "¿Qué necesitás?" (auditoría §6.3): el problema, una
 * línea, el "Desde" y un link a `/servicios/[slug]` que cubre toda la
 * tarjeta. "Preguntale a Malejo" abre el chat con ese tema (queda por encima
 * del link de la tarjeta). Son links: sin estado ni `searchParams`, así la
 * home sigue estática. Dos columnas en celular, tres en escritorio.
 *
 * `RevealItem` envuelve a la tarjeta y no al revés: un `.lift` con `Reveal`
 * perdería el `:hover` por el `transform: none` inline.
 */
export function NeedTiles({ heading = "h3" }: { heading?: "h2" | "h3" }) {
  const H = heading;
  const { needs } = home;
  const wa = waLink(WHATSAPP_TEXTO);

  return (
    <RevealGroup className="mt-6 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 sm:mt-7 sm:gap-4 lg:grid-cols-3 lg:gap-5">
      {soluciones.map((s) => (
        <RevealItem key={s.category} className="flex min-w-0">
          <article className="card lift relative flex min-w-0 flex-1 flex-col gap-2 p-4 sm:gap-2.5 sm:p-5">
            <span className="ic h-9 w-9 sm:h-11 sm:w-11">
              <Icon name={s.icon} size={20} />
            </span>
            <H className="h text-[17px] leading-[1.15] sm:text-[22px]">
              <Link
                href={`/servicios/${s.category}`}
                className="no-underline after:absolute after:inset-0 after:rounded-[22px] after:content-['']"
              >
                {s.problema}
              </Link>
            </H>
            <p className="m-0 line-clamp-3 text-[13px] leading-[1.45] text-muted sm:line-clamp-none sm:text-[15px]">{s.description}</p>
            <div className="mt-auto flex flex-col gap-1 border-t border-border pt-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-3">
              <span className="inline-flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted sm:text-sm">
                {needs.fromLabel} <strong className="text-[15px] text-text sm:text-base">{desdeDe(s)}</strong>
                <Icon name="arrow" size={14} className="hidden text-acc-text sm:block" />
              </span>
              <AbrirChat href={wa} tema={s.tema} className="lnk relative z-10 -my-2 min-h-11 whitespace-normal text-[13px]">
                {needs.ask}
              </AbrirChat>
            </div>
          </article>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

/** Los dos links de debajo de la grilla. `id="precios"` mantiene vivos los `/#precios` compartidos. */
export function NeedLinks() {
  const { needs } = home;
  return (
    <div className="mt-4 flex flex-col gap-1 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
      <Link href={needs.grandes.href} className="lnk min-h-11 text-[15px]">
        {needs.grandes.label}
      </Link>
      <span id="precios" className="scroll-mt-[104px]">
        <Link href={needs.precios.href} className="lnk min-h-11 text-[15px]">
          {needs.precios.label}
        </Link>
      </span>
    </div>
  );
}

export function Needs() {
  const { needs } = home;
  return (
    <section id="servicios" className="wrap pt-14 sm:pt-16">
      <Reveal>
        <span className="lbl lbl-o">{needs.label}</span>
        <h2 className="h h2">{needs.title}</h2>
      </Reveal>
      <NeedTiles />
      <NeedLinks />
    </section>
  );
}
