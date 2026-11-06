import Link from "next/link";
import { home, type ServiceCard } from "@/content/agencia/home";
import { getCategory } from "@/content/agencia/pricing";
import { fmt } from "@/lib/agencia/pricing";
import { Check, Icon } from "../icons";
import { Reveal, RevealGroup, RevealItem } from "../client/Reveal";
import { ServiceLink } from "../client/ServiceLink";

/**
 * El "Desde" de cada servicio sale del catálogo: la menor implementación de
 * la categoría (o el menor abono, en Mantenimiento). Nunca escrito a mano.
 */
export function desdeDe(card: Pick<ServiceCard, "category" | "from">): string {
  const plans = getCategory(card.category)?.plans ?? [];
  const values = plans
    .map((p) => (card.from.basis === "impl" ? p.impl : p.monthly))
    .filter((v): v is number => typeof v === "number");
  return values.length ? `${fmt(Math.min(...values))}${card.from.suffix}` : "";
}

/**
 * Seis tarjetas de servicio (`03-servicios-*.png`). `linkMode` decide a
 * dónde lleva "Ver precios →": en la home abre la pestaña del catálogo; en
 * `/servicios` va a la página de la categoría.
 */
export function ServiceCards({ linkMode = "tab" }: { linkMode?: "tab" | "page" }) {
  const { services } = home;

  return (
    <RevealGroup className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.cards.map((s) => (
        <RevealItem key={s.title} className="flex">
          <article className="card lift flex flex-1 flex-col gap-3.5 p-[26px]">
            <div className="flex items-center gap-3.5">
              <span className="ic">
                <Icon name={s.icon} size={22} />
              </span>
              <span className="lbl">{s.label}</span>
            </div>
            <h3 className="h text-2xl">{s.title}</h3>
            <p className="m-0 text-[15px] leading-normal text-muted">{s.description}</p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
              {s.items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3.5">
              <span className="text-sm text-muted">
                {services.fromLabel} <strong className="text-base text-text">{desdeDe(s)}</strong>
              </span>
              {linkMode === "tab" ? (
                <ServiceLink category={s.category} className="lnk">
                  {services.cta}
                  <Icon name="arrow" size={16} />
                  <span className="sr-only">: {s.title}</span>
                </ServiceLink>
              ) : (
                <Link href={`/servicios/${s.category}`} className="lnk">
                  {services.cta}
                  <Icon name="arrow" size={16} />
                  <span className="sr-only">: {s.title}</span>
                </Link>
              )}
            </div>
          </article>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

export function Services() {
  const { services } = home;
  return (
    <section id="servicios" className="wrap pt-[72px] sm:pt-24">
      <Reveal>
        <span className="lbl lbl-o">{services.label}</span>
        <h2 className="h h2">{services.title}</h2>
      </Reveal>
      <ServiceCards />
    </section>
  );
}
