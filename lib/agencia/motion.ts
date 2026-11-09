import type { Variants } from "framer-motion";

/**
 * Movimiento M1 de la agencia (DISENO.md §7). Separado de `lib/motion.ts`
 * del portfolio a propósito: son sistemas distintos.
 *
 * `amount: 0.2` por el mismo límite duro documentado en CLAUDE.md: Framer
 * Motion lo pasa sin clamp como `threshold`, y un bloque más alto que
 * 1/amount viewports nunca intersecta. Con 0.2 el límite es 5 viewports; el
 * bloque más alto de la home (precios en celular) queda por debajo.
 */
export const VIEWPORT = { once: true, amount: 0.2 } as const;

export const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const STATIC: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

export const NO_STAGGER: Variants = { hidden: {}, show: {} };
