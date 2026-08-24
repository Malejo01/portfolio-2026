"use client";

import { useReducedMotion } from "framer-motion";
import { STATIC_EDGE, STATIC_NODE, VIEWPORT_DIAGRAM, diagramNode, drawEdge } from "@/lib/motion";

/**
 * Primitivos compartidos por los diagramas de caso.
 *
 * Lo que se comparte es el *estilo*: paleta resuelta por superficie, envoltura
 * de la figura con su leyenda, y el cableado de motion (`pathLength` para las
 * aristas, delay por nodo, salida inmediata con `prefers-reduced-motion`).
 *
 * Lo que NO se comparte es la geometría. Cada diagrama escribe sus propios
 * `rect`/`path`: los offsets de texto de `ArchitectureDiagram` están ajustados
 * a mano nodo por nodo (un nodo con un sublabel centra distinto que uno con
 * dos) y meterlos en una fórmula común los movería uno o dos píxeles. El
 * layout es parte del argumento del caso, no un detalle de render.
 */
export type DiagramSurface = "paper" | "panel";

export interface DiagramPalette {
  /** Fondo de la figura, un escalón por encima del nodo. */
  figureClass: string;
  captionClass: string;
  swatchClass: string;
  nodeFill: string;
  nodeStroke: string;
  /** La compuerta: único borde de 1px del sitio. */
  gateStroke: string;
  ink: string;
  soft: string;
  accent: string;
  /**
   * Relleno del nodo acentuado. Sobre `paper` existe `--accent-fill`; sobre
   * `panel` no hay equivalente — `--accent-fill` es claro en modo claro y el
   * panel es oscuro en los dos temas, así que ahí el acento se marca con
   * borde y texto, sin tinte de fondo.
   */
  accentFill: string;
}

export function diagramPalette(surface: DiagramSurface): DiagramPalette {
  if (surface === "panel") {
    return {
      figureClass: "border-panel-hair bg-panel-2",
      captionClass: "text-panel-soft",
      /**
       * Relleno sólido, no el tratamiento del nodo. Sobre `panel` el nodo
       * acentuado no lleva tinte de fondo, y copiar eso al swatch daba un
       * cuadrado del color de la superficie con un borde fino: se leía como
       * un checkbox sin tildar, no como una muestra de color. La leyenda
       * tiene que nombrar el color; el nodo tiene que ser el nodo.
       */
      swatchClass: "border-accent-panel bg-accent-panel",
      nodeFill: "var(--panel)",
      nodeStroke: "var(--panel-hair)",
      gateStroke: "var(--panel-ink)",
      ink: "var(--panel-ink)",
      soft: "var(--panel-soft)",
      accent: "var(--accent-panel)",
      accentFill: "var(--panel)",
    };
  }

  return {
    figureClass: "border-hair bg-paper-2",
    captionClass: "text-ink-soft",
    swatchClass: "border-accent bg-accent-fill",
    nodeFill: "var(--paper)",
    nodeStroke: "var(--hair)",
    gateStroke: "var(--ink)",
    ink: "var(--ink)",
    soft: "var(--ink-soft)",
    accent: "var(--accent)",
    accentFill: "var(--accent-fill)",
  };
}

/**
 * Variantes de nodo y arista ya resueltas contra `prefers-reduced-motion`.
 * Con reduced, todo arranca en su estado final.
 */
export function useDiagramMotion() {
  const reduced = useReducedMotion();

  return {
    node: (delay: number) => (reduced ? STATIC_NODE : diagramNode(delay)),
    edge: (delay: number, duration?: number) =>
      reduced ? STATIC_EDGE : drawEdge(delay, duration),
  };
}

/** Props comunes de cada `<motion.svg>`: rol de imagen + entrada por viewport. */
export function diagramSvgProps(alt: string) {
  return {
    role: "img" as const,
    "aria-label": alt,
    initial: "hidden" as const,
    whileInView: "show" as const,
    viewport: VIEWPORT_DIAGRAM,
    className: "block h-auto w-full font-mono",
  };
}

/**
 * Figura + leyenda. El cuadradito de la leyenda repite el tratamiento del
 * nodo acentuado, que es lo que la frase explica.
 */
export function DiagramFigure({
  surface = "paper",
  caption,
  children,
  className = "",
}: {
  surface?: DiagramSurface;
  caption: string;
  children: React.ReactNode;
  className?: string;
}) {
  const p = diagramPalette(surface);

  return (
    <figure className={`hairline m-0 rounded-card p-diagram ${p.figureClass} ${className}`}>
      {children}

      <figcaption
        className={`mt-[clamp(16px,2.4vw,24px)] flex items-center gap-2.5 font-mono text-meta ${p.captionClass}`}
      >
        <span
          aria-hidden="true"
          className={`hairline size-3.5 flex-none rounded-chip ${p.swatchClass}`}
        />
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
