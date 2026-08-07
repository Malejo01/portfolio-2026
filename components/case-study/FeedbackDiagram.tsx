"use client";

import { motion } from "framer-motion";
import {
  DiagramFigure,
  diagramPalette,
  diagramSvgProps,
  useDiagramMotion,
} from "@/components/case-study/diagram-kit";
import type { FeedbackDiagramLabels } from "@/lib/types";

/**
 * El ciclo de corrección de MaestrIA. Mismo contrato que
 * `ArchitectureDiagram`: no recibe data, los nodos son fijos y el layout es
 * el argumento del caso — la bifurcación asimétrica *es* la decisión
 * didáctica (por "sí" se cierra en un paso, por "no" hay que atravesar el
 * diagnóstico antes de llegar a la respuesta).
 *
 * Va sobre `panel` porque la página del caso es el tercer momento oscuro del
 * sitio. Sobre esa superficie el nodo del modelo se marca con borde y texto
 * acento y sin tinte de fondo: `--accent-fill` es claro en modo claro y el
 * panel es oscuro en los dos temas (ver `diagram-kit`).
 *
 * Las dos orientaciones se renderizan siempre y CSS elige cuál se ve, con el
 * mismo breakpoint de 760px que usa el diagrama de Qué Pinta Salta. El
 * `viewBox` reserva la altura, así que no hay CLS.
 */
export function FeedbackDiagram({
  labels,
  className = "",
}: {
  labels: FeedbackDiagramLabels;
  className?: string;
}) {
  const { node, edge } = useDiagramMotion();
  const p = diagramPalette("panel");
  const svgProps = diagramSvgProps(labels.alt);

  return (
    <DiagramFigure surface="panel" caption={labels.caption} className={className}>
      {/* ── Horizontal (≥760px): compuerta al centro, dos ramas ─── */}
      <motion.svg {...svgProps} viewBox="0 0 940 420" className={`${svgProps.className} max-[759px]:hidden`}>
        <motion.g data-reveal="" variants={node(0.05)}>
          <rect x="8" y="170" width="196" height="84" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="26" y="218" fill={p.ink} fontSize="13.5">{labels.answer}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.4, 0.4)} d="M204 212 H244" fill="none" stroke={p.soft} strokeWidth="0.5" />

        {/* La compuerta es el único borde de 1px del sitio: el grosor es el énfasis. */}
        <motion.g data-reveal="" variants={node(0.7)}>
          <rect x="244" y="171" width="160" height="82" rx="3" fill={p.nodeFill} stroke={p.gateStroke} strokeWidth="1" />
          <text x="262" y="218" fill={p.ink} fontSize="13.5">{labels.gate}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(1.1, 0.55)} d="M404 190 H434 V78 H474" fill="none" stroke={p.soft} strokeWidth="0.5" strokeLinejoin="round" />
        <motion.path data-reveal="" variants={edge(1.2, 0.55)} d="M404 234 H434 V338 H474" fill="none" stroke={p.accent} strokeWidth="0.5" strokeLinejoin="round" />

        <motion.g data-reveal="" variants={node(1.35)}>
          <text x="442" y="140" fill={p.soft} fontSize="12">{labels.yes}</text>
        </motion.g>
        <motion.g data-reveal="" variants={node(1.45)}>
          <text x="442" y="292" fill={p.accent} fontSize="12">{labels.no}</text>
        </motion.g>

        {/* Rama "sí": se cierra en un paso, en neutro. */}
        <motion.g data-reveal="" variants={node(1.6)}>
          <rect x="474" y="40" width="196" height="76" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="492" y="84" fill={p.ink} fontSize="13.5">{labels.confirm}</text>
        </motion.g>

        {/* Rama "no": los dos pasos del modelo, y recién después la respuesta. */}
        <motion.g data-reveal="" variants={node(1.72)}>
          <rect x="474" y="300" width="196" height="76" rx="3" fill={p.accentFill} stroke={p.accent} strokeWidth="0.5" />
          <text x="492" y="344" fill={p.accent} fontSize="13.5">{labels.classify}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(2.1, 0.4)} d="M670 338 H712" fill="none" stroke={p.accent} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(2.35)}>
          <rect x="712" y="300" width="196" height="76" rx="3" fill={p.accentFill} stroke={p.accent} strokeWidth="0.5" />
          <text x="730" y="344" fill={p.accent} fontSize="13.5">{labels.explain}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(2.75, 0.5)} d="M810 300 V116" fill="none" stroke={p.soft} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(3.05)}>
          <rect x="712" y="40" width="196" height="76" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="730" y="84" fill={p.ink} fontSize="13.5">{labels.correct}</text>
        </motion.g>
      </motion.svg>

      {/* ── Vertical (<760px): mismo grafo, apilado ──────────────── */}
      <motion.svg {...svgProps} viewBox="0 0 340 620" className={`${svgProps.className} min-[760px]:hidden`}>
        <motion.g data-reveal="" variants={node(0.05)}>
          <rect x="20" y="8" width="300" height="64" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="34" y="48" fill={p.ink} fontSize="17" fontWeight="500">{labels.answer}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.45, 0.35)} d="M110 72 V108" fill="none" stroke={p.soft} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(0.7)}>
          <rect x="20" y="108" width="300" height="78" rx="3" fill={p.nodeFill} stroke={p.gateStroke} strokeWidth="1" />
          <text x="34" y="154" fill={p.ink} fontSize="17" fontWeight="500">{labels.gate}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(1.1, 0.35)} d="M110 186 V226" fill="none" stroke={p.soft} strokeWidth="0.5" />
        <motion.g data-reveal="" variants={node(1.3)}>
          <text x="120" y="212" fill={p.soft} fontSize="15">{labels.yes}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(1.45)}>
          <rect x="20" y="226" width="300" height="64" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="34" y="266" fill={p.ink} fontSize="17" fontWeight="500">{labels.confirm}</text>
        </motion.g>

        {/* La rama "no" esquiva el nodo de confirmación por el margen derecho. */}
        <motion.path data-reveal="" variants={edge(1.75, 0.7)} d="M250 186 V202 H332 V334 H170 V350" fill="none" stroke={p.accent} strokeWidth="0.5" strokeLinejoin="round" />
        <motion.g data-reveal="" variants={node(1.9)}>
          <text x="258" y="200" fill={p.accent} fontSize="15">{labels.no}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(2.2)}>
          <rect x="20" y="350" width="300" height="64" rx="3" fill={p.accentFill} stroke={p.accent} strokeWidth="0.5" />
          <text x="34" y="390" fill={p.accent} fontSize="17" fontWeight="500">{labels.classify}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(2.6, 0.35)} d="M170 414 V450" fill="none" stroke={p.accent} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(2.8)}>
          <rect x="20" y="450" width="300" height="64" rx="3" fill={p.accentFill} stroke={p.accent} strokeWidth="0.5" />
          <text x="34" y="490" fill={p.accent} fontSize="17" fontWeight="500">{labels.explain}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(3.15, 0.35)} d="M170 514 V550" fill="none" stroke={p.soft} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(3.35)}>
          <rect x="20" y="550" width="300" height="64" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="34" y="590" fill={p.ink} fontSize="17" fontWeight="500">{labels.correct}</text>
        </motion.g>
      </motion.svg>
    </DiagramFigure>
  );
}
