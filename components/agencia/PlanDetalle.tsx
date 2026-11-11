import Link from "next/link";
import { conocimiento, fraseDeCosto } from "@/content/agencia/conocimiento";
import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { getCategory, getPlan, pagosConfig, type Combo, type Plan } from "@/content/agencia/pricing";
import { waLink } from "@/lib/agencia/config";
import {
  ahorro,
  ahorroEnPesos,
  anualPorMes,
  fmt,
  lineaDePagos,
  lineaDePlan,
  lineaDeTarjeta,
  pagosDe,
  pagosDePlan,
  precioDePlan,
  type Pagos,
} from "@/lib/agencia/pricing";
import { AbrirChat } from "./client/AbrirChat";
import { Check, Icon } from "./icons";

/**
 * El detalle de un plan o de un combo: lo que va adentro del modal "Ver qué
 * incluye" (§5 de `docs/agencia/precios-psicologia-2026-11-10.md`) y, sin
 * JS, en el `<details>` de `/servicios/<cat>`. Server Component: llega a
 * `PlanDialog` como `children`.
 *
 * Orden de §5: para quién y plazo → precio con los pagos → qué incluye →
 * qué no incluye (con el "uso es la nafta" si el plan usa IA o WhatsApp) →
 * después del primer año → otra forma de pago → "Lo quiero" y "Preguntale a
 * Malejo". Todo precio pasa por `lib/agencia/pricing.ts`.
 */

const { pricing } = home;
const copy = pricing.modal;

/** "o 2 pagos de $X · o tarjeta hasta 6 cuotas" (solo si arriba ya están los 3 pagos). */
function otrasFormas(pagos: Pagos): string {
  if (!pagos.tres) return lineaDeTarjeta(pagos);
  return copy.otrasFormas
    .replace("{N}", String(pagos.dos.length))
    .replace("{MONTO}", fmt(pagos.dos[0]))
    .replace("{CUOTAS}", String(pagosConfig.tarjetaMaxCuotas));
}

function Lista({ items, marca = "check" }: { items: readonly string[]; marca?: "check" | "no" }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px] leading-[1.45]">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2">
          {marca === "check" ? (
            <Check />
          ) : (
            <span aria-hidden="true" className="mt-[3px] inline-flex h-4 w-4 flex-none items-center justify-center text-muted">
              <Icon name="close" size={14} />
            </span>
          )}
          {t}
        </li>
      ))}
    </ul>
  );
}

function Bloque({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t border-border pt-4">
      <h3 className="lbl m-0">{title}</h3>
      {children}
    </section>
  );
}

/** "El uso es como la nafta…" para los planes que usan IA o WhatsApp oficial. */
function Nafta({ usa }: { usa: readonly string[] }) {
  if (!usa.length) return null;
  return <p className="m-0 text-[14px] leading-[1.5] text-muted">{fraseDeCosto(conocimiento.modeloDeCostos.uso)}</p>;
}

function Botones({ id, nombre }: { id: string; nombre: string }) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-border pt-4 sm:flex-row">
      <Link href={`/demo?plan=${id}`} className="btn btn-p min-h-11 sm:flex-1">
        {pricing.planCta}
      </Link>
      <AbrirChat href={waLink(WHATSAPP_TEXTO)} tema={copy.tema.replace("{PLAN}", nombre)} className="btn btn-s min-h-11 sm:flex-1">
        <Icon name="chat" size={18} />
        {copy.ask}
      </AbrirChat>
    </div>
  );
}

export function PlanDetalle({ plan }: { plan: Plan }) {
  const p = precioDePlan(plan, "transferencia");
  const pagos = pagosDePlan(plan);
  const anual = anualPorMes(plan);
  const category = getCategory(plan.category);
  const renovacion = plan.category === "webs" ? getPlan("renovacion") : undefined;
  const despues = [category?.note, renovacion ? `${renovacion.name}: ${anualPorMes(renovacion)}.` : ""].filter(Boolean) as string[];

  return (
    <>
      {/* 1 · Para quién y plazo */}
      <div className="flex flex-col gap-1.5">
        {plan.paraQuien ? <p className="m-0 text-[15px] leading-[1.5] text-muted">{plan.paraQuien}</p> : null}
        {plan.time ? (
          <p className="m-0 text-[13px] text-muted">
            {copy.plazo}: <strong className="text-text">{plan.time}</strong>
          </p>
        ) : null}
      </div>

      {/* 2 · Precio y pagos */}
      <div>
        <span className="lbl text-[10px]">{p.etiqueta}</span>
        <div className="flex flex-wrap items-baseline gap-1.5">
          {p.precio == null ? (
            <span className="text-sm text-muted">{p.texto}</span>
          ) : (
            <span className="h text-[32px] tracking-[-.02em]">{fmt(p.precio)}</span>
          )}
          {p.unidad ? <span className="text-sm text-muted">{p.unidad}</span> : null}
        </div>
        {anual ? <p className="m-0 text-[15px] font-semibold text-acc-text">{anual}</p> : null}
        {pagos ? (
          <>
            <p className="m-0 text-[15px] font-semibold text-acc-text">{lineaDePlan(plan)}</p>
            <p className="m-0 text-[13px] text-muted">{otrasFormas(pagos)}</p>
          </>
        ) : null}
        {p.abono ? (
          <p className="m-0 mt-1 text-sm">
            + <strong>{fmt(p.abono)}</strong>
            <span className="text-muted">{pricing.monthlySuffix}</span>
          </p>
        ) : null}
      </div>

      {/* 3 · Qué incluye */}
      <Bloque title={copy.incluye}>
        <Lista items={plan.items} />
      </Bloque>

      {/* 4 · Qué no incluye */}
      <Bloque title={copy.noIncluye}>
        <Lista items={plan.noIncluye} marca="no" />
        <Nafta usa={plan.usaServiciosDeTerceros} />
      </Bloque>

      {/* 5 · Después del primer año (webs) o lo que hay que saber de la categoría */}
      {despues.length ? (
        <Bloque title={plan.category === "webs" ? copy.despues : copy.nota}>
          {despues.map((t) => (
            <p key={t} className="m-0 text-[14px] leading-[1.5] text-muted">
              {t}
            </p>
          ))}
        </Bloque>
      ) : null}

      {/* 6 · Otra forma de pago */}
      {plan.alt ? (
        <Bloque title={copy.alt}>
          <p className="m-0 text-[14px] leading-[1.5] text-muted">{plan.alt}</p>
        </Bloque>
      ) : null}

      {/* 7 · Botones */}
      <Botones id={plan.id} nombre={plan.name} />
    </>
  );
}

export function ComboDetalle({ combo }: { combo: Combo }) {
  const pagos = pagosDe(combo.price);
  const partes = combo.planIds.map((id) => getPlan(id)).filter((p): p is Plan => Boolean(p));

  return (
    <>
      <p className="m-0 text-[15px] leading-[1.5] text-muted">{combo.paraQuien}</p>

      <div>
        <p className="m-0 text-[13px] text-muted">
          {pricing.porSeparado} <span className="line-through">{fmt(combo.list)}</span>
        </p>
        <span className="h text-[32px] tracking-[-.02em]">{fmt(combo.price)}</span>
        <p className="m-0 text-[15px] font-semibold text-ok-text">
          {pricing.saveLabel} {fmt(ahorroEnPesos(combo))} <span className="text-[12px] font-normal">({ahorro(combo)}%)</span>
        </p>
        {pagos ? (
          <>
            <p className="m-0 text-[15px] font-semibold text-acc-text">{lineaDePagos(combo.price)}</p>
            <p className="m-0 text-[13px] text-muted">{otrasFormas(pagos)}</p>
          </>
        ) : null}
        {combo.monthly ? (
          <p className="m-0 mt-1 text-sm">
            + <strong>{fmt(combo.monthly)}</strong>
            <span className="text-muted">{pricing.monthlySuffix}</span>
          </p>
        ) : null}
      </div>

      <Bloque title={copy.trae}>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {partes.map((p) => (
            <li key={p.id} className="flex flex-col gap-1">
              <strong className="flex items-start gap-2 text-[15px]">
                <Check />
                {p.name}
              </strong>
              <span className="pl-6 text-[14px] leading-[1.45] text-muted">{p.destacados.join(" · ")}</span>
            </li>
          ))}
        </ul>
      </Bloque>

      <Bloque title={copy.noIncluye}>
        <Lista items={combo.noIncluye} marca="no" />
        <Nafta usa={combo.usaServiciosDeTerceros} />
      </Bloque>

      <Botones id={combo.id} nombre={combo.name} />
    </>
  );
}
