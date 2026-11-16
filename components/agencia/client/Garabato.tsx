"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

/**
 * Garabatos de tiza o fibrón (tanda P3-2, estilo Aula virtual): trazos SVG
 * decorativos (`aria-hidden`, sin clics) que se dibujan con `pathLength` la
 * primera vez que entran a la vista (`once: true`) y quedan quietos con
 * movimiento reducido. El texto que acompañe al trazo va como `children`
 * (HTML del servidor, en Caveat), así la copy no entra al bundle.
 *
 * Solo se ven en Aula (`data-solo-estilo="aula"` en quien los usa): sin JS no
 * hay estilo y no aparecen.
 */
export function Garabato({
  trazos,
  viewBox,
  className = "",
  ancho = 3,
  children,
  demora = 0,
}: {
  /** Atributos `d` de los trazos, en orden de dibujo. */
  trazos: string[];
  viewBox: string;
  className?: string;
  ancho?: number;
  children?: React.ReactNode;
  demora?: number;
}) {
  const reducido = useReducedMotion();
  return (
    <span aria-hidden="true" className={`garabato ${className}`}>
      {children}
      <LazyMotion features={domAnimation}>
        <svg viewBox={viewBox} className="block h-full w-full overflow-visible" fill="none" stroke="currentColor" strokeWidth={ancho} strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="none">
          {trazos.map((d, i) => (
            <m.path
              key={i}
              d={d}
              data-reveal=""
              vectorEffect="non-scaling-stroke"
              initial={reducido ? false : { pathLength: 0 }}
              /*
               * `useReducedMotion()` da `null` en el primer render, así que
               * `initial` ya montó el trazo en 0. Cuando la preferencia llega,
               * `animate` lo completa al instante, esté o no a la vista.
               */
              animate={reducido ? { pathLength: 1 } : undefined}
              whileInView={reducido ? undefined : { pathLength: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={reducido ? { duration: 0 } : { duration: 0.7, delay: demora + i * 0.25, ease: "easeInOut" }}
            />
          ))}
        </svg>
      </LazyMotion>
    </span>
  );
}
