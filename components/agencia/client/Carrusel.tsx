"use client";

import { Children, useEffect, useRef, useState } from "react";
import { Icon } from "../icons";

/**
 * Carrusel de planes del celular (tanda P2, Fase 6 bis). El scroll es
 * **nativo** (`scroll-snap-type: x mandatory`, sin librerías): con o sin
 * JS, las tarjetas se deslizan y hacen snap. Las tarjetas llegan como
 * `children` desde el servidor; la isla solo suma:
 *
 * - los puntos `○ ● ○` (botones con `aria-label` "Plan 2 de 3") y, con
 *   puntero fino, las flechas;
 * - la tarjeta activa en `scale(1)` y las demás en `0.96` (`data-activa`,
 *   transición de `transform` en CSS; nada de ancho ni alto).
 *
 * Desde 760 px no es carrusel: la misma lista pasa a grilla por CSS
 * (`.carrusel`) y los controles se esconden.
 */
export function Carrusel({
  children,
  label,
  labels,
}: {
  children: React.ReactNode;
  label: string;
  labels: { anterior: string; siguiente: string; punto: string; puntos: string };
}) {
  const pista = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const [activa, setActiva] = useState(0);

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    let raf = 0;
    const medir = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const slides = [...el.children] as HTMLElement[];
        const centro = el.scrollLeft + el.clientWidth / 2;
        let mejor = 0;
        let dist = Infinity;
        slides.forEach((s, i) => {
          const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - centro);
          if (d < dist) {
            dist = d;
            mejor = i;
          }
        });
        setActiva(mejor);
      });
    };
    el.addEventListener("scroll", medir, { passive: true });
    return () => {
      el.removeEventListener("scroll", medir);
      cancelAnimationFrame(raf);
    };
  }, []);

  const ir = (i: number) => {
    const el = pista.current;
    const s = el?.children[i] as HTMLElement | undefined;
    if (!el || !s) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: s.offsetLeft - (el.clientWidth - s.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className="carrusel-caja">
      <div ref={pista} className="carrusel no-scrollbar" role="group" aria-label={label}>
        {items.map((child, i) => (
          <div key={i} className="carrusel-slide" data-activa={i === activa ? "" : undefined}>
            {child}
          </div>
        ))}
      </div>
      {items.length > 1 ? (
        <div className="carrusel-controles js-only mt-2 flex items-center justify-center gap-1">
          <button type="button" className="carrusel-flecha ibtn h-11 w-11" aria-label={labels.anterior} disabled={activa === 0} onClick={() => ir(activa - 1)}>
            <Icon name="arrow" size={16} className="rotate-180" />
          </button>
          <div role="group" aria-label={labels.puntos} className="flex items-center">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={labels.punto.replace("{N}", String(i + 1)).replace("{T}", String(items.length))}
                aria-current={i === activa ? "true" : undefined}
                onClick={() => ir(i)}
                className="inline-flex h-11 w-9 items-center justify-center"
              >
                <span aria-hidden="true" className={`block h-2.5 w-2.5 rounded-full border border-border-h transition-colors ${i === activa ? "bg-acc border-acc" : "bg-transparent"}`} />
              </button>
            ))}
          </div>
          <button type="button" className="carrusel-flecha ibtn h-11 w-11" aria-label={labels.siguiente} disabled={activa === items.length - 1} onClick={() => ir(activa + 1)}>
            <Icon name="arrow" size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
