"use client";

import type { Medio } from "@/lib/agencia/pricing";

/**
 * Selector "Transferencia | Mercado Pago +6%" (DISENO.md §4 Precios).
 * `role="radiogroup"` con flechas. Lo comparten el catálogo y el cotizador.
 */
export function MedioSwitch({
  value,
  onChange,
  label,
  transferencia,
  mp,
  mpChip,
  className = "",
}: {
  value: Medio;
  onChange: (m: Medio) => void;
  label: string;
  transferencia: string;
  mp: string;
  mpChip: string;
  className?: string;
}) {
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const next: Medio = value === "mp" ? "transferencia" : "mp";
    onChange(next);
    e.currentTarget.querySelector<HTMLElement>(`[data-medio="${next}"]`)?.focus();
  };

  const option = (m: Medio, children: React.ReactNode) => {
    const on = value === m;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={on}
        tabIndex={on ? 0 : -1}
        data-medio={m}
        onClick={() => onChange(m)}
        className={`inline-flex h-10 items-center gap-1.5 rounded-[13px] px-4 text-sm font-semibold transition-colors ${
          on ? "bg-acc text-acc-ink shadow-btn" : "text-muted hover:text-text"
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
      className={`inline-flex flex-none rounded-[18px] border border-border bg-surf p-[5px] shadow-inset ${className}`}
    >
      {option("transferencia", transferencia)}
      {option(
        "mp",
        <>
          {mp} <span className="tag tag-xs">{mpChip}</span>
        </>,
      )}
    </div>
  );
}
