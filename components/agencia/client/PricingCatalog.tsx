"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ComboCard, GrandesSteps, PlanCard, type ComboCopy, type GrandesCopy, type PlanCopy } from "@/components/agencia/PlanCard";
import type { Category, Combo, Extra } from "@/content/agencia/pricing";
import { MedioSwitch } from "./MedioSwitch";
import { montoDeExtra, type Medio } from "@/lib/agencia/pricing";

/**
 * Catálogo de precios (DISENO.md §4 Precios, `05-precios-*.png`). Isla:
 * guarda la pestaña activa y el medio de pago. Los datos llegan como props
 * desde el servidor y todos los montos pasan por `lib/agencia/pricing.ts`.
 *
 * - Medio de pago: `role="radiogroup"`; Mercado Pago recalcula todo (+6 %,
 *   redondeo a $100). Las líneas `alt` son texto literal y no se recalculan.
 * - Pestañas: `role="tablist"` con flechas, Inicio y Fin, desde `sm`. En
 *   celular las 7 pestañas no entraban y no se notaba que había más
 *   (auditoría P1-6): ahí va un `<select>` nativo con las mismas opciones.
 * - `?cat=<key>` en la URL abre esa pestaña.
 * - Las "otras formas de pago" de la categoría (`plan.alt`) van debajo de
 *   la grilla, no dentro de la tarjeta (tanda R2).
 *
 * `heading` es el encabezado de la sección (Server Component), para que el
 * selector quede a su derecha como en la captura.
 *
 * La pestaña "Proyectos grandes" no muestra planes sino los pasos
 * (`GrandesSteps`): consultoría sin cargo → diagnóstico → sprint.
 */
export interface CatalogCopy extends PlanCopy, ComboCopy {
  medioLabel: string;
  transferencia: string;
  mp: string;
  mpChip: string;
  tabsLabel: string;
  selectLabel: string;
  otrasFormasLabel: string;
  combosLabel: string;
  combosTitle: string;
  extrasLabel: string;
  /** Copy de la pestaña "Proyectos grandes" (pasos en vez de planes). */
  grandes?: GrandesCopy;
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
    return () => cancelAnimationFrame(raf);
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

  const category = categories.find((c) => c.key === active) ?? categories[0];
  if (!category) return null;

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        {heading}
        <MedioSwitch
          value={medio}
          onChange={setMedio}
          label={copy.medioLabel}
          transferencia={copy.transferencia}
          mp={copy.mp}
          mpChip={copy.mpChip}
          className="self-start sm:self-auto"
        />
      </div>

      {single ? null : (
        <div className="mt-6 sm:hidden">
          <label htmlFor={`${idPrefix}-select`} className="lbl mb-2 block">
            {copy.selectLabel}
          </label>
          <select
            id={`${idPrefix}-select`}
            value={category.key}
            onChange={(e) => setActive(e.target.value as Category["key"])}
            aria-controls={`${idPrefix}-panel`}
            className="h-12 w-full rounded-[14px] border border-border-2 bg-surf px-3.5 text-[16px] font-semibold text-text"
          >
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {single ? null : (
        <div
          role="tablist"
          aria-label={copy.tabsLabel}
          className="mt-7 hidden flex-wrap gap-1.5 rounded-[20px] border border-border bg-surf p-1.5 sm:flex"
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
        {category.key === "grandes" && copy.grandes ? (
          <GrandesSteps plans={category.plans} medio={medio} copy={{ ...copy, ...copy.grandes }} />
        ) : (
          <div className="mt-[22px] grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {category.plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} medio={medio} copy={copy} />
            ))}
          </div>
        )}
        <p className="mb-0 mt-3.5 text-[13px] text-muted">{category.note}</p>
        {category.plans.some((p) => p.alt) ? (
          <div className="mt-3 text-[13px] text-muted">
            <span className="lbl text-[10px]">{copy.otrasFormasLabel}</span>
            <ul className="m-0 mt-1 list-none p-0">
              {category.plans
                .filter((p) => p.alt)
                .map((p) => (
                  <li key={p.id}>
                    <strong className="text-text">{p.name}:</strong> {p.alt}
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
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
                {e.name} <strong>{montoDeExtra(e, medio)}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {footer}
    </>
  );
}
