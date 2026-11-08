import Link from "next/link";
import type { Combo, Plan } from "@/content/agencia/pricing";
import { ahorro, conRecargo, fmt, precioDePlan, type Medio } from "@/lib/agencia/pricing";
import { Check } from "./icons";

/**
 * Tarjetas del catálogo (DISENO.md §4 Precios, `05-precios-*.png`). Sin
 * estado: las usa `PricingCatalog` (isla) y cualquier Server Component que
 * necesite mostrar un plan. Todo precio pasa por `lib/agencia/pricing.ts`.
 */

export interface PlanCopy {
  recommended: string;
  planCta: string;
  monthlySuffix: string;
}

export function PlanCard({ plan, medio, copy }: { plan: Plan; medio: Medio; copy: PlanCopy }) {
  const p = precioDePlan(plan, medio);

  return (
    <article className={`card lift relative flex flex-col gap-4 p-[26px] ${plan.rec ? "hi" : ""}`}>
      {plan.rec ? (
        <span className="absolute -top-3 left-6 rounded-full bg-acc px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase leading-none tracking-[.08em] text-acc-ink">
          {copy.recommended}
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-2.5">
        <h3 className="h text-xl">{plan.name}</h3>
        {plan.time ? <span className="tag flex-none">⏱ {plan.time}</span> : null}
      </div>
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
        {p.abono ? (
          <div className="text-sm">
            + <strong>{fmt(p.abono)}</strong>
            <span className="text-muted">{copy.monthlySuffix}</span>
          </div>
        ) : null}
        {plan.alt ? <div className="mt-1 text-[13px] text-muted">{plan.alt}</div> : null}
      </div>
      <ul className="m-0 flex list-none flex-col gap-[9px] p-0 text-sm">
        {plan.items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-2.5">
        {plan.proof ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span aria-hidden="true" className="text-[8px] text-acc">
              ●
            </span>
            {plan.proof}
          </span>
        ) : null}
        <Link
          href={`/demo?plan=${plan.id}`}
          className={`btn btn-sm w-full ${plan.rec ? "btn-p" : "btn-s"}`}
          aria-label={`${copy.planCta}: ${plan.name}`}
        >
          {copy.planCta}
        </Link>
      </div>
    </article>
  );
}

export interface ComboCopy {
  saveLabel: string;
  comboCta: string;
}

export function ComboCard({
  combo,
  medio,
  copy,
  highlight,
}: {
  combo: Combo;
  medio: Medio;
  copy: ComboCopy;
  highlight?: boolean;
}) {
  return (
    <article className={`card lift relative flex h-full flex-col gap-2.5 p-[22px] ${highlight ? "hi" : ""}`}>
      <span className="absolute right-[18px] top-[18px] rounded-lg bg-save-bg px-2 py-[5px] font-mono text-[10px] font-semibold uppercase leading-none tracking-[.06em] text-ok-text">
        {copy.saveLabel} {ahorro(combo)}%
      </span>
      <h4 className="h m-0 pr-[92px] text-[19px]">{combo.name}</h4>
      <p className="m-0 text-[13px] leading-[1.45] text-muted">{combo.parts}</p>
      <div className="mt-auto">
        <div className="text-[13px] text-muted line-through">{fmt(conRecargo(combo.list, medio))}</div>
        <div className="h text-[28px]">{fmt(conRecargo(combo.price, medio))}</div>
        <div className="text-[13px]">
          + <strong>{fmt(conRecargo(combo.monthly, medio))}</strong>
          <span className="text-muted">/mes</span>
        </div>
      </div>
      <Link
        href={`/demo?plan=${combo.id}`}
        className="btn btn-s btn-sm w-full"
        aria-label={`${copy.comboCta}: ${combo.name}`}
      >
        {copy.comboCta}
      </Link>
    </article>
  );
}

export interface GrandesCopy {
  stepLabel: string;
  free: string;
  maintenance: string;
  cta: { label: string; href: string };
}

/**
 * Pestaña "Proyectos grandes": los pasos (consultoría → diagnóstico →
 * sprint) en tarjetas numeradas, la línea de mantenimiento y el CTA de la
 * consultoría. Misma forma que `PlanCard` (DISENO.md §4): `card lift`, el
 * paso recomendado en `.hi`, precios desde `precioDePlan`.
 */
export function GrandesSteps({ plans, medio, copy }: { plans: Plan[]; medio: Medio; copy: GrandesCopy & PlanCopy }) {
  const pasos = plans.filter((p) => p.mantenimientoPct == null);
  const external = /^https?:/.test(copy.cta.href);
  return (
    <>
      <ol className="m-0 mt-[22px] grid list-none grid-cols-1 items-stretch gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {pasos.map((plan, i) => {
          const p = precioDePlan(plan, medio);
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
              {plan.proof ? (
                <span className="mt-auto inline-flex items-center gap-1.5 text-xs text-muted">
                  <span aria-hidden="true" className="text-[8px] text-acc">
                    ●
                  </span>
                  {plan.proof}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-[15px] text-muted">{copy.maintenance}</p>
        <a
          href={copy.cta.href}
          {...(external ? { target: "_blank", rel: "noopener" } : {})}
          className="btn btn-p btn-sm flex-none"
        >
          {copy.cta.label}
        </a>
      </div>
    </>
  );
}
