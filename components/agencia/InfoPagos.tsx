import Link from "next/link";
import { conocimiento, fraseDeCosto } from "@/content/agencia/conocimiento";
import { home } from "@/content/agencia/home";
import { extras } from "@/content/agencia/pricing";
import { montoDeExtra } from "@/lib/agencia/pricing";
import { PlanDialog } from "./client/PlanDialog";
import { Check, Icon, type IconName } from "./icons";
import { completarPagos } from "./pagos";

/**
 * Bloques de información de la tanda P1, todos Server Components: el
 * contenido llega a `PlanDialog` (variante `info`) como `children`.
 *
 * - `FormasDePago`: el modal "Formas de pago" (§2).
 * - `PagosFranja`: "2 pagos · 3 pagos sin interés · tarjeta hasta 6 cuotas"
 *   y "Ver detalle" (§4.2.7).
 * - `CostosFranja`: el auto, el taller y la nafta (Fase 3 bis E). Sin montos.
 * - `ExtrasModal`: "Sumale extras", una fila por extra (Fase 3 bis C).
 * - `CondicionesModal`: la letra chica completa (§4.3).
 */

const { pricing } = home;
const { pagos } = pricing;

/** El contenido del modal "Formas de pago". `extra` = líneas propias de la solución. */
export function FormasDePago({
  extra = [],
  aparte = [],
  aparteLabel = "",
}: {
  extra?: readonly string[];
  aparte?: readonly string[];
  aparteLabel?: string;
}) {
  return (
    <>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {pagos.opciones.map((o) => (
          <li key={o.title} className="flex items-start gap-2.5">
            <Check />
            <span>
              <strong>{o.title}.</strong> <span className="text-muted">{completarPagos(o.body)}</span>
            </span>
          </li>
        ))}
      </ul>
      <ul className="m-0 flex list-none flex-col gap-1.5 border-t border-border p-0 pt-4 text-[14px] text-muted">
        {[...pagos.notas, ...extra].map((t) => (
          <li key={t}>{completarPagos(t)}</li>
        ))}
      </ul>
      {aparte.length ? (
        <div className="border-t border-border pt-4">
          <h3 className="lbl m-0">{aparteLabel}</h3>
          <ul className="m-0 mt-1.5 flex list-none flex-col gap-1 p-0 text-[14px] text-muted">
            {aparte.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

export function PagosFranja({ extra, aparte, aparteLabel }: { extra?: readonly string[]; aparte?: readonly string[]; aparteLabel?: string }) {
  return (
    <div className="card flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <span className="lbl">{pagos.title}</span>
        <p className="m-0 text-[15px] font-semibold">{pagos.franja.map(completarPagos).join(" · ")}</p>
      </div>
      <PlanDialog variant="info" label={pagos.verDetalle} title={pagos.title} closeLabel={pricing.modal.cerrar} triggerClassName="lnk min-h-11 self-start">
        <FormasDePago extra={extra} aparte={aparte} aparteLabel={aparteLabel} />
      </PlanDialog>
    </div>
  );
}

const COSTOS: { key: "sistema" | "mantenimiento" | "uso"; icon: IconName }[] = [
  { key: "sistema", icon: "app" },
  { key: "mantenimiento", icon: "wrench" },
  { key: "uso", icon: "ia" },
];

/** El auto, el taller y la nafta: las mismas palabras de `conocimiento.modeloDeCostos`. */
export function CostosFranja() {
  const m = conocimiento.modeloDeCostos;
  return (
    <section aria-label={m.titulo} className="card px-5 py-4">
      <span className="lbl">{m.titulo}</span>
      <ul className="m-0 mt-3 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-3 md:gap-5">
        {COSTOS.map(({ key, icon }) => (
          <li key={key} className="flex items-start gap-3">
            <span className="ic h-9 w-9">
              <Icon name={icon} size={18} />
            </span>
            <p className="m-0 text-[14px] leading-[1.45] text-muted">{fraseDeCosto(m[key])}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "Sumale extras": una fila por extra, nombre a la izquierda y monto a la derecha. Nada de chips. */
export function ExtrasModal() {
  const e = pricing.extras;
  return (
    <PlanDialog variant="info" label={e.trigger} title={e.title} closeLabel={pricing.modal.cerrar} triggerClassName="btn btn-s btn-sm min-h-11">
      <p className="m-0 text-muted">{e.lead}</p>
      <ul className="m-0 list-none p-0">
        {extras.map((x) => (
          <li key={x.id} className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
            <span className="min-w-0">{x.name}</span>
            {/* El monto no se corta; el texto "a cotizar" del dominio sí puede. */}
            <strong className={`text-right ${x.price == null ? "max-w-[50%] text-[13px] font-semibold text-muted" : "flex-none whitespace-nowrap"}`}>
              {montoDeExtra(x, "transferencia")}
            </strong>
          </li>
        ))}
      </ul>
      <Link href={e.cotizador.href} className="lnk min-h-11 self-start">
        {e.cotizador.label}
      </Link>
    </PlanDialog>
  );
}

/** La letra chica en una línea y "Ver condiciones" (§4.3). */
export function CondicionesModal() {
  const c = pricing.condiciones;
  return (
    <div className="flex flex-wrap items-center gap-x-2 text-[13px] leading-[1.55] text-muted">
      <span>{pricing.legal}</span>
      <PlanDialog variant="info" label={c.trigger} title={c.title} closeLabel={pricing.modal.cerrar} triggerClassName="lnk min-h-11 text-[13px]">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {c.items.map((t) => (
            <li key={t} className="flex items-start gap-2">
              <Check />
              {t}
            </li>
          ))}
        </ul>
      </PlanDialog>
    </div>
  );
}
