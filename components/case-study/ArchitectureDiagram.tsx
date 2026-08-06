"use client";

import { motion, useReducedMotion } from "framer-motion";
import { STATIC_EDGE, STATIC_NODE, VIEWPORT_DIAGRAM, diagramNode, drawEdge } from "@/lib/motion";
import type { DiagramLabels } from "@/lib/types";

/**
 * El diagrama no recibe data: los nodos son fijos y semánticos. Si mañana
 * se suma una fuente se edita este SVG, no se pasa un array — el layout de
 * los carriles es parte del argumento, no un detalle de render.
 *
 * Se renderizan las dos orientaciones y CSS elige cuál se ve (breakpoint
 * 760px del diseño). El `viewBox` de cada variante reserva la altura vía
 * aspect-ratio, así que el bloque no salta cuando cargan las fuentes.
 *
 * Los sublabels del carril del modelo van a `opacity: 0.9` en las dos
 * orientaciones. El diseño aprobado traía 0.85 en la horizontal, pero
 * mezclado sobre `--accent-fill` en modo claro eso da 4.23:1, por debajo
 * del 4.5:1 que pide AA a 12px. 0.9 llega a 4.70:1 y ya era el valor de
 * la vertical: unifica en vez de introducir uno nuevo.
 */
export function ArchitectureDiagram({
  labels,
  className = "",
}: {
  labels: DiagramLabels;
  className?: string;
}) {
  const reduced = useReducedMotion();

  const node = (delay: number) => (reduced ? STATIC_NODE : diagramNode(delay));
  const edge = (delay: number, duration?: number) =>
    reduced ? STATIC_EDGE : drawEdge(delay, duration);

  const svgProps = {
    role: "img" as const,
    "aria-label": labels.alt,
    initial: "hidden" as const,
    whileInView: "show" as const,
    viewport: VIEWPORT_DIAGRAM,
    className: "block h-auto w-full font-mono",
  };

  return (
    <figure className={`hairline m-0 rounded-card border-hair bg-paper-2 p-diagram ${className}`}>
      {/* ── Horizontal (≥760px): cuatro columnas, dos carriles ──── */}
      <motion.svg {...svgProps} viewBox="0 0 940 360" className={`${svgProps.className} max-[759px]:hidden`}>
        <motion.g data-reveal="" variants={node(0.05)}>
          <rect x="8" y="66" width="200" height="88" rx="3" fill="var(--paper)" stroke="var(--hair)" strokeWidth="0.5" />
          <text x="26" y="96" fill="var(--ink)" fontSize="13.5">{labels.sources.title}</text>
          <text x="26" y="120" fill="var(--ink-soft)" fontSize="12">{labels.sources.a}</text>
          <text x="26" y="138" fill="var(--ink-soft)" fontSize="12">{labels.sources.b}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(0.18)}>
          <rect x="8" y="226" width="200" height="88" rx="3" fill="var(--accent-fill)" stroke="var(--accent)" strokeWidth="0.5" />
          <text x="26" y="264" fill="var(--accent)" fontSize="13.5">{labels.instagram.title}</text>
          <text x="26" y="288" fill="var(--accent)" fontSize="12" opacity="0.9">{labels.instagram.sub}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(0.5)}>
          <rect x="268" y="66" width="200" height="88" rx="3" fill="var(--paper)" stroke="var(--hair)" strokeWidth="0.5" />
          <text x="286" y="104" fill="var(--ink)" fontSize="13.5">{labels.normalize.title}</text>
          <text x="286" y="128" fill="var(--ink-soft)" fontSize="12">{labels.normalize.sub}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(0.63)}>
          <rect x="268" y="226" width="200" height="88" rx="3" fill="var(--accent-fill)" stroke="var(--accent)" strokeWidth="0.5" />
          <text x="286" y="264" fill="var(--accent)" fontSize="13.5">{labels.model.title}</text>
          <text x="286" y="288" fill="var(--accent)" fontSize="12" opacity="0.9">{labels.model.sub}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.95, 0.45)} d="M208 110 H268" fill="none" stroke="var(--ink-soft)" strokeWidth="0.5" />
        <motion.path data-reveal="" variants={edge(1.05, 0.45)} d="M208 270 H268" fill="none" stroke="var(--accent)" strokeWidth="0.5" />

        {/* La compuerta es el único borde de 1px del sitio: el grosor es el énfasis. */}
        <motion.g data-reveal="" variants={node(1.35)}>
          <rect x="528" y="147" width="170" height="86" rx="3" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
          <text x="548" y="182" fill="var(--ink)" fontSize="13.5">{labels.gate.title}</text>
          <text x="548" y="202" fill="var(--ink-soft)" fontSize="12">{labels.gate.sub1}</text>
          <text x="548" y="219" fill="var(--ink-soft)" fontSize="12">{labels.gate.sub2}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(1.8)} d="M468 110 C 500 110 496 170 528 170" fill="none" stroke="var(--ink-soft)" strokeWidth="0.5" />
        <motion.path data-reveal="" variants={edge(1.9)} d="M468 270 C 500 270 496 210 528 210" fill="none" stroke="var(--accent)" strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(2.3)}>
          <rect x="758" y="66" width="180" height="88" rx="3" fill="var(--paper)" stroke="var(--hair)" strokeWidth="0.5" />
          <text x="776" y="104" fill="var(--ink)" fontSize="13.5">{labels.published.title}</text>
          <text x="776" y="128" fill="var(--ink-soft)" fontSize="12">{labels.published.sub}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(2.42)}>
          <rect x="758" y="226" width="180" height="88" rx="3" fill="var(--paper)" stroke="var(--hair)" strokeWidth="0.5" />
          <text x="776" y="264" fill="var(--ink)" fontSize="13.5">{labels.review.title}</text>
          <text x="776" y="288" fill="var(--ink-soft)" fontSize="12">{labels.review.sub}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(2.75)} d="M698 170 C 730 170 726 110 758 110" fill="none" stroke="var(--ink-soft)" strokeWidth="0.5" />
        <motion.path data-reveal="" variants={edge(2.85)} d="M698 210 C 730 210 726 270 758 270" fill="none" stroke="var(--ink-soft)" strokeWidth="0.5" />
      </motion.svg>

      {/* ── Vertical (<760px): mismo grafo, apilado ──────────────── */}
      <motion.svg {...svgProps} viewBox="0 0 340 770" className={`${svgProps.className} min-[760px]:hidden`}>
        <motion.g data-reveal="" variants={node(0.05)}>
          <rect x="20" y="8" width="300" height="88" rx="3" fill="var(--paper)" stroke="var(--hair)" strokeWidth="0.5" />
          <text x="34" y="38" fill="var(--ink)" fontSize="17" fontWeight="500">{labels.sources.title}</text>
          <text x="34" y="64" fill="var(--ink-soft)" fontSize="15">{labels.sources.a}</text>
          <text x="34" y="86" fill="var(--ink-soft)" fontSize="15">{labels.sources.b}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.75, 0.4)} d="M90 96 V124" fill="none" stroke="var(--ink-soft)" strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(0.4)}>
          <rect x="20" y="124" width="300" height="72" rx="3" fill="var(--paper)" stroke="var(--hair)" strokeWidth="0.5" />
          <text x="34" y="155" fill="var(--ink)" fontSize="17" fontWeight="500">{labels.normalize.title}</text>
          <text x="34" y="180" fill="var(--ink-soft)" fontSize="15">{labels.normalize.sub}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(0.9)}>
          <rect x="20" y="236" width="300" height="72" rx="3" fill="var(--accent-fill)" stroke="var(--accent)" strokeWidth="0.5" />
          <text x="34" y="267" fill="var(--accent)" fontSize="17" fontWeight="500">{labels.instagram.title}</text>
          <text x="34" y="292" fill="var(--accent)" fontSize="15" opacity="0.9">{labels.instagram.sub}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(1.55, 0.4)} d="M170 308 V336" fill="none" stroke="var(--accent)" strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(1.2)}>
          <rect x="20" y="336" width="300" height="72" rx="3" fill="var(--accent-fill)" stroke="var(--accent)" strokeWidth="0.5" />
          <text x="34" y="367" fill="var(--accent)" fontSize="17" fontWeight="500">{labels.model.title}</text>
          <text x="34" y="392" fill="var(--accent)" fontSize="15" opacity="0.9">{labels.model.sub}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(1.9)}>
          <rect x="20" y="470" width="300" height="94" rx="3" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
          <text x="34" y="503" fill="var(--ink)" fontSize="17" fontWeight="500">{labels.gate.title}</text>
          <text x="34" y="529" fill="var(--ink-soft)" fontSize="15">{labels.gate.sub1}</text>
          <text x="34" y="551" fill="var(--ink-soft)" fontSize="15">{labels.gate.sub2}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(2.3, 0.7)} d="M90 196 V212 H36 V452 H110 V470" fill="none" stroke="var(--ink-soft)" strokeWidth="0.5" strokeLinejoin="round" />
        <motion.path data-reveal="" variants={edge(2.45, 0.45)} d="M230 408 V470" fill="none" stroke="var(--accent)" strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(2.9)}>
          <rect x="20" y="600" width="300" height="66" rx="3" fill="var(--paper)" stroke="var(--hair)" strokeWidth="0.5" />
          <text x="34" y="629" fill="var(--ink)" fontSize="17" fontWeight="500">{labels.published.title}</text>
          <text x="34" y="654" fill="var(--ink-soft)" fontSize="15">{labels.published.sub}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(3.02)}>
          <rect x="20" y="694" width="300" height="66" rx="3" fill="var(--paper)" stroke="var(--hair)" strokeWidth="0.5" />
          <text x="34" y="723" fill="var(--ink)" fontSize="17" fontWeight="500">{labels.review.title}</text>
          <text x="34" y="748" fill="var(--ink-soft)" fontSize="15">{labels.review.sub}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(3.35, 0.4)} d="M110 564 V600" fill="none" stroke="var(--ink-soft)" strokeWidth="0.5" />
        <motion.path data-reveal="" variants={edge(3.45, 0.7)} d="M230 564 V578 H304 V680 H190 V694" fill="none" stroke="var(--ink-soft)" strokeWidth="0.5" strokeLinejoin="round" />
      </motion.svg>

      <figcaption className="mt-[clamp(16px,2.4vw,24px)] flex items-center gap-2.5 font-mono text-meta text-ink-soft">
        <span
          aria-hidden="true"
          className="hairline size-3.5 flex-none rounded-chip border-accent bg-accent-fill"
        />
        <span>{labels.caption}</span>
      </figcaption>
    </figure>
  );
}
