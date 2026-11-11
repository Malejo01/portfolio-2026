"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../icons";

/**
 * Selector de categoría de `/precios` (tanda P1, Fase 3 bis A). La isla solo
 * guarda **qué categoría se ve**: los paneles (tarjetas, "Ver otras
 * opciones", combos y modales) los arma el servidor en `PricingSection` y
 * llegan como `panels`, así la copy y los precios no entran al bundle.
 *
 * - Una sola lista `role="tablist"` con dos formas: en celular, grilla de 2
 *   columnas con las 7 categorías a la vista (ícono + etiqueta corta, 44 px
 *   de alto mínimo); desde `sm`, la barra de pestañas de siempre. La activa,
 *   en los dos casos, con fondo `acc` y texto `acc-ink`. Flechas, Inicio y
 *   Fin mueven el foco como en las pestañas.
 * - `?cat=<key>` abre esa pestaña (se lee en el cliente: la ruta sigue
 *   estática) y cada cambio la escribe con `history.replaceState`.
 * - En celular, después de tocar una categoría, scroll suave al inicio de
 *   los planes; con `prefers-reduced-motion`, sin scroll.
 * - El selector de medio de pago salió de acá (D6): los precios van por
 *   transferencia y Mercado Pago queda en el cotizador y en el modal.
 */
export interface CategoriaTab {
  key: string;
  label: string;
  /** Etiqueta corta de la grilla del celular ("Web", "Agenda"). */
  short: string;
  icon: IconName;
}

export function PricingCatalog({
  categories,
  panels,
  tabsLabel,
  viendo,
  heading,
  idPrefix = "precios",
}: {
  categories: CategoriaTab[];
  /** Un panel por categoría, armado en el servidor. */
  panels: Record<string, React.ReactNode>;
  tabsLabel: string;
  /** "Estás viendo: {CAT}". */
  viendo: string;
  heading?: React.ReactNode;
  idPrefix?: string;
}) {
  const [active, setActive] = useState(categories[0]?.key);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  const open = useCallback(
    (key: string) => {
      if (categories.some((c) => c.key === key)) setActive(key);
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

  const elegir = (key: string, { scroll }: { scroll: boolean }) => {
    setActive(key);
    const url = new URL(window.location.href);
    url.searchParams.set("cat", key);
    window.history.replaceState(window.history.state, "", url);
    // Solo en celular: la grilla ocupa media pantalla y los planes quedan abajo.
    if (scroll && !reduced && window.matchMedia("(max-width: 639px)").matches) {
      requestAnimationFrame(() => titleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const last = categories.length - 1;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? (i === last ? 0 : i + 1)
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (i === 0 ? last : i - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    elegir(categories[next].key, { scroll: false });
    tabRefs.current[next]?.focus();
  };

  const current = categories.find((c) => c.key === active) ?? categories[0];
  if (!current) return null;

  return (
    <>
      {heading}

      <div
        role="tablist"
        aria-label={tabsLabel}
        className="mt-6 grid grid-cols-2 gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-1.5 sm:rounded-[20px] sm:border sm:border-border sm:bg-surf sm:p-1.5"
      >
        {categories.map((c, i) => {
          const on = c.key === current.key;
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
              aria-controls={`${idPrefix}-panel-${c.key}`}
              tabIndex={on ? 0 : -1}
              onClick={() => elegir(c.key, { scroll: true })}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`flex min-h-11 min-w-0 items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[14px] font-semibold leading-tight transition-colors sm:h-11 sm:flex-none sm:whitespace-nowrap sm:px-[18px] sm:text-[15px] ${
                on
                  ? "bg-acc text-acc-ink"
                  : "border border-border bg-surf text-text shadow-card sm:border-0 sm:bg-transparent sm:text-muted sm:shadow-none sm:hover:text-text"
              }`}
            >
              <Icon name={c.icon} size={18} className="flex-none sm:hidden" />
              <span className="min-w-0 sm:hidden">{c.short}</span>
              <span className="hidden sm:inline">{c.label}</span>
            </button>
          );
        })}
      </div>

      <h2 ref={titleRef} className="h mt-7 scroll-mt-[96px] text-[22px] sm:text-[26px]" aria-live="polite">
        {viendo.replace("{CAT}", current.label)}
      </h2>

      {categories.map((c) => (
        <div
          key={c.key}
          id={`${idPrefix}-panel-${c.key}`}
          role="tabpanel"
          aria-labelledby={`${idPrefix}-tab-${c.key}`}
          hidden={c.key !== current.key}
        >
          {panels[c.key]}
        </div>
      ))}
    </>
  );
}
