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
            <span className="h text-[22px] leading-tight">{p.texto}</span>
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
