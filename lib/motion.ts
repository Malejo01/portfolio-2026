import type { Transition, Variants } from "framer-motion";

/** Curva única del sitio. Coincide con el `ease-out` del diseño aprobado. */
export const EASE_OUT: Transition["ease"] = [0.16, 1, 0.3, 1];

/**
 * `amount` va tal cual como `threshold` del IntersectionObserver — Framer
 * Motion no lo acota (ver motion/features/viewport/index.mjs). Un elemento
 * más alto que `1 / amount` viewports nunca llega a intersectar y se queda
 * en `opacity: 0` para siempre.
 *
 * Con 0.3 el límite son 3.3 viewports: el bloque de Perfil (~1340px) roza
 * ese borde en un teléfono apaisado de 400px de alto. Con 0.2 el límite
 * sube a 5 viewports y el peor caso del sitio queda con 50% de margen.
 * La diferencia visual es que el bloque entra un poco antes.
 */
export const VIEWPORT = { once: true, amount: 0.2 } as const;

/**
 * El diagrama dispara antes que el resto del sitio, por dos razones que se
 * suman: `amount` bajo (basta un borde visible) y `margin` inferior positivo,
 * que agranda el rectángulo del IntersectionObserver 260px hacia abajo — el
 * diagrama empieza a dibujarse mientras todavía está bajo el pliegue.
 *
 * Sin esto, a velocidad de scroll normal el visitante llegaba al diagrama con
 * la secuencia recién arrancando y veía nodos vacíos. Es el mismo motivo por
 * el que la cascada de delays de los dos diagramas se cierra antes de los 2s:
 * el reveal tiene que estar terminado cuando el ojo llega, no empezando.
 */
export const VIEWPORT_DIAGRAM = {
  once: true,
  amount: 0.1,
  margin: "0px 0px 260px 0px",
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/** Nodo del diagrama: mismo `riseIn`, con delay explícito por nodo. */
export const diagramNode = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT, delay } },
});

/** Arista del diagrama: se dibuja con pathLength, no con dasharray a mano. */
export const drawEdge = (delay: number, duration = 0.5): Variants => ({
  hidden: { pathLength: 0 },
  show: { pathLength: 1, transition: { duration, ease: EASE_OUT, delay } },
});

/** Estado final inmediato, para `prefers-reduced-motion: reduce`. */
export const STATIC_NODE: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

export const STATIC_EDGE: Variants = {
  hidden: { pathLength: 1 },
  show: { pathLength: 1 },
};
