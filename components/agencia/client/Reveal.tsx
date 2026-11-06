"use client";

import { motion, useReducedMotion } from "framer-motion";
import { NO_STAGGER, STATIC, VIEWPORT, rise, stagger } from "@/lib/agencia/motion";

/**
 * Entrada al scroll M1. Los hijos llegan desde Server Components: la copy no
 * entra al bundle. Todo elemento animado lleva `data-reveal` (sin JS vuelve
 * a su estado final por la regla de `agencia.css`).
 *
 * No envuelvas una tarjeta `.lift` directamente con esto: Framer Motion deja
 * `transform: none` inline al terminar y le ganaría al `:hover`. Poné la
 * tarjeta adentro.
 */
type Tag = "div" | "section" | "article" | "li" | "ul";

export function Reveal({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: Tag }) {
  const reduced = useReducedMotion();
  const M = motion[as];
  return (
    <M data-reveal="" className={className} variants={reduced ? STATIC : rise} initial="hidden" whileInView="show" viewport={VIEWPORT}>
      {children}
    </M>
  );
}

export function RevealGroup({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: Tag }) {
  const reduced = useReducedMotion();
  const M = motion[as];
  return (
    <M data-reveal="" className={className} variants={reduced ? NO_STAGGER : stagger} initial="hidden" whileInView="show" viewport={VIEWPORT}>
      {children}
    </M>
  );
}

export function RevealItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: Tag }) {
  const reduced = useReducedMotion();
  const M = motion[as];
  return (
    <M data-reveal="" className={className} variants={reduced ? STATIC : rise}>
      {children}
    </M>
  );
}
