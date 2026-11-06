"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { NO_STAGGER, STATIC, VIEWPORT, rise, stagger } from "@/lib/agencia/motion";

/**
 * Entrada al scroll M1. Los hijos llegan desde Server Components: la copy no
 * entra al bundle. Todo elemento animado lleva `data-reveal` (sin JS vuelve
 * a su estado final por la regla de `agencia.css`).
 *
 * `LazyMotion` + `m` en vez de `motion`: solo carga las features de
 * animación del DOM (~la mitad del bundle de Framer Motion), que es lo que
 * más pesaba en el Total Blocking Time de la home en celular.
 *
 * No envuelvas una tarjeta `.lift` directamente con esto: Framer Motion deja
 * `transform: none` inline al terminar y le ganaría al `:hover`. Poné la
 * tarjeta adentro.
 */
type Tag = "div" | "section" | "article" | "li" | "ul";

export function Reveal({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: Tag }) {
  const reduced = useReducedMotion();
  const M = m[as];
  return (
    <LazyMotion features={domAnimation}>
      <M data-reveal="" className={className} variants={reduced ? STATIC : rise} initial="hidden" whileInView="show" viewport={VIEWPORT}>
        {children}
      </M>
    </LazyMotion>
  );
}

export function RevealGroup({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: Tag }) {
  const reduced = useReducedMotion();
  const M = m[as];
  return (
    <LazyMotion features={domAnimation}>
      <M data-reveal="" className={className} variants={reduced ? NO_STAGGER : stagger} initial="hidden" whileInView="show" viewport={VIEWPORT}>
        {children}
      </M>
    </LazyMotion>
  );
}

export function RevealItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: Tag }) {
  const reduced = useReducedMotion();
  const M = m[as];
  return (
    <M data-reveal="" className={className} variants={reduced ? STATIC : rise}>
      {children}
    </M>
  );
}
