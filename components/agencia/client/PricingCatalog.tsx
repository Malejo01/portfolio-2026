"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ComboCard, PlanCard, type ComboCopy, type PlanCopy } from "@/components/agencia/PlanCard";
import type { Category, Combo, Extra } from "@/content/agencia/pricing";
import { OPEN_CATEGORY_EVENT } from "@/lib/agencia/motion";
import { conRecargo, fmt, type Medio } from "@/lib/agencia/pricing";

/**
 * Catálogo de precios (DISENO.md §4 Precios, `05-precios-*.png`). Isla:
 * guarda la pestaña activa y el medio de pago. Los datos llegan como props
 * desde el servidor y todos los montos pasan por `lib/agencia/pricing.ts`.
 *
 * - Medio de pago: `role="radiogroup"`; Mercado Pago recalcula todo (+6 %,
 *   redondeo a $100). Las líneas `alt` son texto literal y no se recalculan.
 * - Pestañas: `role="tablist"` con flechas, Inicio y Fin.
 * - "Ver precios →" de los servicios abre una pestaña por evento
 *   (`OPEN_CATEGORY_EVENT`); `?cat=<key>` en la URL también.
 *
 * `heading` es el encabezado de la sección (Server Component), para que el
 * selector quede a su derecha como en la captura.
 */
export interface CatalogCopy extends PlanCopy, ComboCopy {
  medioLabel: string;
  transferencia: string;
  mp: string;
  mpChip: string;
  tabsLabel: string;
  combosLabel: string;
  combosTitle: string;
  extrasLabel: string;
}

export function PricingCatalog({
  categories,
  combos = [],
  extras = [],
  copy,
  heading,
  footer,
  idPrefix = "precios",
}: {
  categories: Category[];
  combos?: Combo[];
  extras?: Extra[];
  copy: CatalogCopy;
  heading?: React.ReactNode;
  footer?: React.ReactNode;
  idPrefix?: string;
}) {
  const [active, setActive] = useState(categories[0]?.key);
  const [medio, setMedio] = useState<Medio>("transferencia");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const single = categories.length === 1;

  const open = useCallback(
    (key: string) => {
      if (categories.some((c) => c.key === key)) setActive(key as Category["key"]);
    },
    [categories],
  );

  useEffect(() => {
    // `?cat=` se lee en el primer frame: la URL es estado externo.
    const raf = requestAnimationFrame(() => {
      const fromUrl = new URLSearchParams(window.location.search).get("cat");
      if (fromUrl) open(fromUrl);
    });
    const onOpen = (e: Event) => open(String((e as CustomEvent).detail));
    window.addEventListener(OPEN_CATEGORY_EVENT, onOpen);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(OPEN_CATEGORY_EVENT, onOpen);
    };
  }, [open]);

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const last = categories.length - 1;
    const next =
      e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
      : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(categories[next].key);
    tabRefs.current[next]?.focus();
  };

  const onMedioKey = (e: React.KeyboardEvent) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const next: Medio = medio === "mp" ? "transferencia" : "mp";
    setMedio(next);
    (e.currentTarget.querySelector(`[data-medio="${next}"]`) as HTMLElement | null)?.focus();
  };

  const category = categories.find((c) => c.key === active) ?? categories[0];
  if (!category) return null;

  const segBtn = (value: Medio, children: React.ReactNode) => {
    const on = medio === value;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={on}
        tabIndex={on ? 0 : -1}
        data-medio={value}
        onClick={() => setMedio(value)}
        className={`inline-flex h-10 items-center gap-1.5 rounded-[13px] px-4 text-sm font-semibold transition-colors ${
          on ? "bg-acc text-acc-ink shadow-btn" : "text-muted hover:text-text"
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        {heading}
        <div
          role="radiogroup"
          aria-label={copy.medioLabel}
          onKeyDown={onMedioKey}
          className="inline-flex flex-none self-start rounded-[18px] border border-border bg-surf p-[5px] shadow-inset sm:self-auto"
        >
          {segBtn("transferencia", copy.transferencia)}
          {segBtn(
            "mp",
            <>
              {copy.mp} <span className="tag tag-xs">{copy.mpChip}</span>
            </>,
          )}
        </div>
      </div>

      {single ? null : (
        <div
          role="tablist"
          aria-label={copy.tabsLabel}
          className="no-scrollbar mt-7 flex gap-1.5 overflow-x-auto rounded-[20px] border border-border bg-surf p-1.5 sm:flex-wrap sm:overflow-visible"
        >
          {categories.map((c, i) => {
            const on = c.key === category.key;
            return (
              <button
                key={c.key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${idPrefix}-tab-${c.key}`}
                aria-selected={on}
                aria-controls={`${idPrefix}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(c.key)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`h-11 flex-none whitespace-nowrap rounded-[14px] px-[18px] text-[15px] font-semibold transition-colors ${
                  on ? "bg-ic-bg text-acc-text" : "text-muted hover:text-text"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      <div
        id={`${idPrefix}-panel`}
        role={single ? undefined : "tabpanel"}
        aria-labelledby={single ? undefined : `${idPrefix}-tab-${category.key}`}
      >
        <p className="mb-0 mt-[18px] text-[15px] text-muted">{category.intro}</p>
        <div className="mt-[22px] grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {category.plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} medio={medio} copy={copy} />
          ))}
        </div>
        <p className="mb-0 mt-3.5 text-[13px] text-muted">{category.note}</p>
      </div>

      {combos.length ? (
        <>
          <div className="mt-14">
            <span className="lbl lbl-o">{copy.combosLabel}</span>
            <h3 className="h mt-2 text-[26px] sm:text-[30px]">{copy.combosTitle}</h3>
          </div>
          <div className="mt-[22px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {combos.map((combo, i) => (
              <ComboCard key={combo.id} combo={combo} medio={medio} copy={copy} highlight={i === 1} />
            ))}
          </div>
        </>
      ) : null}

      {extras.length ? (
        <div className="card mt-6 flex flex-wrap items-center gap-5 px-6 py-[22px]">
          <span className="lbl flex-none">{copy.extrasLabel}</span>
          <ul className="m-0 flex flex-1 list-none flex-wrap gap-2 p-0">
            {extras.map((e) => (
              <li key={e.id} className="chip h-[34px]">
                {e.name} <strong>{fmt(conRecargo(e.price, medio))}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {footer}
    </>
  );
}
