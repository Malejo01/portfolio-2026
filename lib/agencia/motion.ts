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

/**
 * Entrada al scrollear (tanda P2, Fase 6 bis): fade y subida de 16 px. El
 * `custom` es el índice del hijo en su grupo: el escalonado se corta en el
 * cuarto (máximo 4 por grupo), así una grilla de 6 no tarda en completarse.
 */
export const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", delay: Math.min(i, 3) * 0.07 } }),
};

/** El grupo no escalona por su cuenta: cada hijo trae su índice (`RevealItem i`). */
export const stagger: Variants = {
  hidden: {},
  show: {},
};

export const STATIC: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

export const NO_STAGGER: Variants = { hidden: {}, show: {} };
