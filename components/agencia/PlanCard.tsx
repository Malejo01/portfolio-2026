import Link from "next/link";
import { home } from "@/content/agencia/home";
import { pagosCopy, type Combo, type Plan } from "@/content/agencia/pricing";
import { solucionDeCombo } from "@/content/agencia/servicios";
import { ahorro, ahorroEnPesos, fmt, lineaDePagos, lineaDePlan, mensualDeAnual, precioDePlan } from "@/lib/agencia/pricing";
import { PlanDialog } from "./client/PlanDialog";
import { Check } from "./icons";
import { ComboDetalle, PlanDetalle } from "./PlanDetalle";

/**
 * Tarjetas del catálogo (DISENO.md §4 Precios; tanda P1, §1 y §5 de
 * `docs/agencia/precios-psicologia-2026-11-10.md`). Server Components: las
 * usan `/precios` (paneles que arma el servidor) y `/servicios/[slug]`.
 * Todo precio pasa por `lib/agencia/pricing.ts` y siempre por
 * transferencia: el medio de pago se elige en el cotizador y en el modal.
 *
 * "La tarjeta dice para qué sirve, el modal dice qué trae" (§1.6): nombre,
 * para quién, plazo, total, la línea de pagos, el monto por mes y hasta 3
 * viñetas (`destacados`). El detalle completo va en `PlanDialog`.
 *
 * Sin JS, "Ver qué incluye" lleva a `/servicios/<cat>#<id>`. En la página de
 * la solución (`enPagina`) el detalle está ahí mismo, en un `<details>`
 * (`.nojs-only`), y el enlace se esconde.
 */

const { pricing } = home;

/** El `<details>` sin JS de `/servicios/<cat>`: el destino de `#<id>`. */
function DetalleSinJs({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <details className="nojs-only plans">
      <summary className="lnk min-h-11">{label}</summary>
      <div id={id} className="mt-3 flex scroll-mt-[104px] flex-col gap-4">
        {children}
      </div>
    </details>
  );
}

/** "Ver qué incluye": el modal y, en la página de la solución, su respaldo sin JS. */
function VerPlan({ plan, enPagina }: { plan: Plan; enPagina: boolean }) {
  const href = `/servicios/${plan.category}#${plan.id}`;
  return (
    <>
      <span className={enPagina ? "js-only contents" : "contents"}>
        <PlanDialog
          label={pricing.verIncluye}
          title={plan.name}
          href={href}
          closeLabel={pricing.modal.cerrar}
          triggerAriaLabel={`${pricing.verIncluye}: ${plan.name}`}
          triggerClassName="lnk min-h-11 self-center"
        >
          <PlanDetalle plan={plan} />
        </PlanDialog>
      </span>
      {enPagina ? (
        <DetalleSinJs id={plan.id} label={pricing.verIncluye}>
          <PlanDetalle plan={plan} />
        </DetalleSinJs>
      ) : null}
    </>
  );
}

/** El precio grande: "Pago único $249.000", "Por mes $25.000" o "$7.500 por mes, pagás el año junto". */
function Precio({ plan }: { plan: Plan }) {
  const p = precioDePlan(plan, "transferencia");
  const porMes = mensualDeAnual(plan);
  if (porMes != null) {
    return (
      <div>
        <span className="lbl text-[10px]">{p.etiqueta}</span>
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="h text-[34px] tracking-[-.02em]">{fmt(porMes)}</span>
          <span className="text-sm text-muted">{pagosCopy.anualUnidad}</span>
        </div>
      </div>
    );
  }
  const linea = lineaDePlan(plan);
  return (
    <div>
      <span className="lbl text-[10px]">{p.etiqueta}</span>
      <div className="flex flex-wrap items-baseline gap-1.5">
        {p.precio == null ? (
          <span className="text-sm text-muted">{p.texto}</span>
        ) : (
          <span className="h text-[34px] tracking-[-.02em]">{fmt(p.precio)}</span>
        )}
        {p.unidad ? <span className="text-sm text-muted">{p.unidad}</span> : null}
      </div>
      {/* La línea de pagos va en naranja de texto: no es la acción principal (§2). */}
      {linea ? <p className="m-0 text-sm font-semibold text-acc-text">{linea}</p> : null}
      {p.abono ? (
        <p className="m-0 text-sm">
          + <strong>{fmt(p.abono)}</strong>
          <span className="text-muted">{pricing.monthlySuffix}</span>
        </p>
      ) : null}
    </div>
  );
}

export function PlanCard({ plan, heading = "h3", enPagina = false }: { plan: Plan; heading?: "h2" | "h3"; enPagina?: boolean }) {
  const H = heading;

  return (
    <article className={`card lift relative flex flex-col gap-4 p-[26px] ${plan.rec ? "hi" : ""}`}>
      {plan.rec ? (
        <span className="absolute -top-3 left-6 rounded-full bg-acc px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase leading-none tracking-[.08em] text-acc-ink">
          {pricing.recommended}
        </span>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2.5">
          <H className="h text-xl">{plan.name}</H>
          {plan.time ? <span className="tag flex-none">⏱ {plan.time}</span> : null}
        </div>
        {plan.paraQuien ? <p className="m-0 line-clamp-2 text-[13px] leading-[1.45] text-muted">{plan.paraQuien}</p> : null}
      </div>
      <Precio plan={plan} />
      <ul className="m-0 flex list-none flex-col gap-[9px] p-0 text-sm">
        {plan.destacados.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-1">
        <Link
          href={`/demo?plan=${plan.id}`}
          className={`btn btn-sm min-h-11 w-full ${plan.rec ? "btn-p" : "btn-s"}`}
          aria-label={`${pricing.planCta}: ${plan.name}`}
        >
          {pricing.planCta}
        </Link>
        <VerPlan plan={plan} enPagina={enPagina} />
      </div>
    </article>
  );
}

/** Una fila de "Ver otras opciones" (§4.2.4): nombre, total, pagos y "Ver qué incluye". */
export function PlanFila({ plan, enPagina = false }: { plan: Plan; enPagina?: boolean }) {
  const p = precioDePlan(plan, "transferencia");
  const linea = lineaDePlan(plan);
  return (
    <li className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-col">
        <strong className="text-[15px] leading-snug">{plan.name}</strong>
        <span className="text-[14px] text-muted">
          {p.tipo === "desde" || p.tipo === "mensual" ? `${p.etiqueta} ` : ""}
          <strong className="text-text">{p.precio == null ? p.texto : fmt(p.precio)}</strong>
          {p.unidad && p.precio != null ? ` ${p.unidad}` : ""}
          {linea ? <span className="text-acc-text"> · {linea}</span> : null}
        </span>
      </div>
      <div className="flex-none">
        <VerPlan plan={plan} enPagina={enPagina} />
      </div>
    </li>
  );
}

export function ComboCard({ combo, highlight, enPagina = false }: { combo: Combo; highlight?: boolean; enPagina?: boolean }) {
  const linea = lineaDePagos(combo.price);
  const pagina = solucionDeCombo(combo.id);
  return (
    <article className={`card lift relative flex h-full flex-col gap-2.5 p-[22px] ${highlight ? "hi" : ""}`}>
      <h3 className="h m-0 text-[19px]">{combo.name}</h3>
      {combo.paraQuien ? <p className="m-0 text-[13px] leading-[1.45] text-muted">{combo.paraQuien}</p> : null}
      <div className="mt-auto">
        <div className="text-[13px] text-muted">
          {pricing.porSeparado} <span className="line-through">{fmt(combo.list)}</span>
        </div>
        <div className="h text-[28px]">{fmt(combo.price)}</div>
        <p className="m-0 text-[14px] font-semibold text-ok-text">
          {pricing.saveLabel} {fmt(ahorroEnPesos(combo))} <span className="text-[12px] font-normal">({ahorro(combo)}%)</span>
        </p>
        {linea ? <p className="m-0 text-sm font-semibold text-acc-text">{linea}</p> : null}
        {combo.monthly ? (
          <p className="m-0 text-[13px]">
            + <strong>{fmt(combo.monthly)}</strong>
            <span className="text-muted">{pricing.monthlySuffix}</span>
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <Link href={`/demo?plan=${combo.id}`} className="btn btn-s btn-sm min-h-11 w-full" aria-label={`${pricing.comboCta}: ${combo.name}`}>
          {pricing.comboCta}
        </Link>
        <span className={enPagina ? "js-only contents" : "contents"}>
          <PlanDialog
            label={pricing.verTrae}
            title={combo.name}
            href={`/servicios/${pagina ?? "webs"}#${combo.id}`}
            closeLabel={pricing.modal.cerrar}
            triggerAriaLabel={`${pricing.verTrae}: ${combo.name}`}
            triggerClassName="lnk min-h-11 self-center"
          >
            <ComboDetalle combo={combo} />
          </PlanDialog>
        </span>
        {enPagina ? (
          <DetalleSinJs id={combo.id} label={pricing.verTrae}>
            <ComboDetalle combo={combo} />
          </DetalleSinJs>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Pestaña "Proyectos grandes": los pasos (consultoría → diagnóstico →
 * sprint) en tarjetas numeradas, la línea de mantenimiento y el CTA de la
 * consultoría. Misma forma que `PlanCard` (DISENO.md §4): `card lift`, el
 * paso recomendado en `.hi`. No ofrecen 3 pagos: se paga por etapa.
 */
export function GrandesSteps({ plans }: { plans: Plan[] }) {
  const copy = pricing.grandes;
  const pasos = plans.filter((p) => p.mantenimientoPct == null);
  const external = /^https?:/.test(copy.cta.href);
  return (
    <>
      <ol className="m-0 mt-[22px] grid list-none grid-cols-1 items-stretch gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {pasos.map((plan, i) => {
          const p = precioDePlan(plan, "transferencia");
          return (
            <li key={plan.id} className={`card lift relative flex flex-col gap-4 p-[26px] ${plan.rec ? "hi" : ""}`}>
              <div className="flex items-start justify-between gap-2.5">
                <div>
                  <span className="lbl lbl-o text-[10px]">
                    {copy.stepLabel} {i + 1}
                  </span>
                  <h3 className="h mt-1 text-xl">{plan.name}</h3>
                </div>
                {plan.time ? <span className="tag flex-none">⏱ {plan.time}</span> : null}
              </div>
              <div>
                {p.precio == null ? (
                  <>
                    <span className="h block text-[34px] tracking-[-.02em]">{p.etiqueta}</span>
                    <span className="text-sm text-muted">{p.texto}</span>
                  </>
                ) : p.precio === 0 ? (
                  <span className="h text-[34px] tracking-[-.02em]">{copy.free}</span>
                ) : (
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="h text-[34px] tracking-[-.02em]">{fmt(p.precio)}</span>
                    {p.unidad ? <span className="text-sm text-muted">{p.unidad}</span> : null}
                  </div>
                )}
              </div>
              <ul className="m-0 flex list-none flex-col gap-[9px] p-0 text-sm">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-[15px] text-muted">{copy.maintenance}</p>
        <a href={copy.cta.href} {...(external ? { target: "_blank", rel: "noopener" } : {})} className="btn btn-p btn-sm min-h-11 flex-none">
          {copy.cta.label}
        </a>
      </div>
    </>
  );
}
