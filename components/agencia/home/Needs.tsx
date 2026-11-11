import Link from "next/link";
import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { getCategory } from "@/content/agencia/pricing";
import { soluciones, type Solucion } from "@/content/agencia/servicios";
import { waLink } from "@/lib/agencia/config";
import { desdeDeCategoria, fmt } from "@/lib/agencia/pricing";
import { Icon } from "../icons";
import { AbrirChat } from "../client/AbrirChat";
import { Reveal, RevealGroup, RevealItem } from "../client/Reveal";

/**
 * "Desde $177.000 · 3 × $59.000": el menor pago único de la categoría con
 * sus pagos, o el menor monto por mes en Mantenimiento ("Desde $7.500 por
 * mes"). Sale de `desdeDeCategoria()`, nunca escrito a mano.
 */
export function desdeDe(s: Pick<Solucion, "category">): { monto: string; pagos: string | null } | null {
  const category = getCategory(s.category);
  const d = category && desdeDeCategoria(category);
  if (!d) return null;
  return { monto: `${fmt(d.precio)}${d.porMes ? home.needs.porMes : ""}`, pagos: d.pagos };
}

/**
 * Las seis baldosas de "¿Qué necesitás?" (tanda P1, §4.1 y Fase 3 bis B):
 * el problema y "Desde $X · 3 × $Y", sin línea de descripción. En la home
 * llevan a `/precios?cat=<categoría>` con esa categoría elegida (sin JS,
 * `/precios` abre en la primera y el visitante elige); en `/servicios`, a la
 * página de la solución. "Preguntale a Malejo" abre el chat con ese tema
 * (queda por encima del link de la tarjeta). Son links: sin estado ni
 * `searchParams`, así la home sigue estática.
 *
 * `RevealItem` envuelve a la tarjeta y no al revés: un `.lift` con `Reveal`
 * perdería el `:hover` por el `transform: none` inline.
 */
export function NeedTiles({ heading = "h3", destino = "precios" }: { heading?: "h2" | "h3"; destino?: "precios" | "servicios" }) {
  const H = heading;
  const { needs } = home;
  const wa = waLink(WHATSAPP_TEXTO);

  return (
    <RevealGroup className="mt-6 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 sm:mt-7 sm:gap-4 lg:grid-cols-3 lg:gap-5">
      {soluciones.map((s) => {
        const desde = desdeDe(s);
        const href = destino === "precios" ? `/precios?cat=${s.category}` : `/servicios/${s.category}`;
        return (
          <RevealItem key={s.category} className="flex min-w-0">
            <article className="card lift relative flex min-w-0 flex-1 flex-col gap-2 p-4 sm:gap-2.5 sm:p-5">
              <span className="ic h-9 w-9 sm:h-11 sm:w-11">
                <Icon name={s.icon} size={20} />
              </span>
              <H className="h text-[17px] leading-[1.15] sm:text-[22px]">
                <Link href={href} className="no-underline after:absolute after:inset-0 after:rounded-[22px] after:content-['']">
                  {s.problema}
                </Link>
              </H>
              <div className="mt-auto flex flex-col gap-1 border-t border-border pt-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-3">
                {desde ? (
                  <span className="inline-flex flex-wrap items-baseline gap-x-1.5 text-[13px] text-muted sm:text-sm">
                    {needs.fromLabel} <strong className="text-[15px] text-text sm:text-base">{desde.monto}</strong>
                    {desde.pagos ? <span className="text-acc-text">· {desde.pagos}</span> : null}
                  </span>
                ) : null}
                <AbrirChat href={wa} tema={s.tema} className="lnk relative z-10 -my-2 min-h-11 whitespace-normal text-[13px]">
                  {needs.ask}
                </AbrirChat>
              </div>
            </article>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}

/**
 * Debajo de la grilla: "Ver todos los precios" como botón (ancho completo en
 * celular, Fase 3 bis B) y el link a proyectos a medida. `id="precios"`
 * mantiene vivos los `/#precios` compartidos.
 */
export function NeedLinks() {
  const { needs } = home;
  return (
    <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
      <span id="precios" className="flex scroll-mt-[104px]">
        <Link href={needs.precios.href} className="btn btn-s w-full sm:w-auto">
          {needs.precios.label}
          <Icon name="arrow" size={16} />
        </Link>
      </span>
      <Link href={needs.grandes.href} className="lnk min-h-11 text-[15px]">
        {needs.grandes.label}
      </Link>
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
