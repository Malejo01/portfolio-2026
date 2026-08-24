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
 * ── Por qué la horizontal son dos filas y no una U ────────────────────────
 *
 * La versión anterior cerraba la rama "no" con un tramo vertical que subía
 * desde "Explica en contexto" hasta "Respuesta correcta", parada en la fila
 * de arriba al lado de "Confirmación". Dos problemas medidos, no de gusto:
 *
 * 1. Sin puntas de flecha —el diagrama no las usa— ese tramo vertical se
 *    puede leer en los dos sentidos, y "Respuesta correcta" quedaba
 *    ópticamente pareada con "Confirmación" como si fueran hermanas de la
 *    misma bifurcación. Son cosas distintas: una cierra el "sí", la otra es
 *    el final del "no".
 * 2. El grafo dibujaba una U y dejaba el tercio izquierdo del lienzo vacío.
 *
 * Ahora cada rama es una fila que se lee de izquierda a derecha y termina en
 * la última columna: arriba el "sí" en un salto, abajo los tres pasos del
 * "no". El orden de lectura hace el trabajo que harían las flechas, y las
 * dos filas comparten columna final, que es lo que dice el caso — las dos
 * ramas terminan, pero una recorre más camino.
 *
 * Las dos orientaciones se renderizan siempre y CSS elige cuál se ve, con el
 * mismo breakpoint de 760px que usa el diagrama de Qué Pinta Salta. El
 * `viewBox` reserva la altura, así que no hay CLS.
 *
 * Los delays cierran antes de los 2s a propósito: ver `VIEWPORT_DIAGRAM` en
 * `lib/motion.ts`.
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
      {/* ── Horizontal (≥760px): dos filas, una por rama ─────────── */}
      <motion.svg {...svgProps} viewBox="0 0 940 300" className={`${svgProps.className} max-[759px]:hidden`}>
        <motion.g data-reveal="" variants={node(0.05)}>
          <rect x="8" y="26" width="196" height="80" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="26" y="72" fill={p.ink} fontSize="13.5">{labels.answer}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.28, 0.28)} d="M204 66 H244" fill="none" stroke={p.soft} strokeWidth="0.5" />

        {/* La compuerta es el único borde de 1px del sitio: el grosor es el énfasis. */}
        <motion.g data-reveal="" variants={node(0.42)}>
          <rect x="244" y="25" width="160" height="82" rx="3" fill={p.nodeFill} stroke={p.gateStroke} strokeWidth="1" />
          <text x="262" y="72" fill={p.ink} fontSize="13.5">{labels.gate}</text>
        </motion.g>

        {/* Rama "sí": un solo tramo hasta la última columna. Lo largo del
            tramo es el argumento — no pasa nada en el medio. */}
        <motion.path data-reveal="" variants={edge(0.62, 0.5)} d="M404 66 H734" fill="none" stroke={p.soft} strokeWidth="0.5" />
        {/* Rama "no": baja por el centro de la compuerta. */}
        <motion.path data-reveal="" variants={edge(0.68, 0.38)} d="M324 107 V194" fill="none" stroke={p.accent} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(0.8)}>
          <text x="424" y="54" fill={p.soft} fontSize="12">{labels.yes}</text>
        </motion.g>
        <motion.g data-reveal="" variants={node(0.82)}>
          <text x="336" y="156" fill={p.accent} fontSize="12">{labels.no}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(0.95)}>
          <rect x="734" y="26" width="198" height="80" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="752" y="72" fill={p.ink} fontSize="13.5">{labels.confirm}</text>
        </motion.g>

        {/* Los dos pasos del modelo, y recién en la última columna la respuesta. */}
        <motion.g data-reveal="" variants={node(0.98)}>
          <rect x="244" y="194" width="198" height="80" rx="3" fill={p.accentFill} stroke={p.accent} strokeWidth="0.5" />
          <text x="262" y="240" fill={p.accent} fontSize="13.5">{labels.classify}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(1.18, 0.28)} d="M442 234 H489" fill="none" stroke={p.accent} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(1.32)}>
          <rect x="489" y="194" width="198" height="80" rx="3" fill={p.accentFill} stroke={p.accent} strokeWidth="0.5" />
          <text x="507" y="240" fill={p.accent} fontSize="13.5">{labels.explain}</text>
        </motion.g>

        {/* Neutro: acá se sale del carril del modelo. */}
        <motion.path data-reveal="" variants={edge(1.5, 0.28)} d="M687 234 H734" fill="none" stroke={p.soft} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(1.62)}>
          <rect x="734" y="194" width="198" height="80" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="752" y="240" fill={p.ink} fontSize="13.5">{labels.correct}</text>
        </motion.g>
      </motion.svg>

      {/* ── Vertical (<760px): mismo grafo, apilado ──────────────── */}
      <motion.svg {...svgProps} viewBox="0 0 340 620" className={`${svgProps.className} min-[760px]:hidden`}>
        <motion.g data-reveal="" variants={node(0.05)}>
          <rect x="20" y="8" width="300" height="64" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="34" y="48" fill={p.ink} fontSize="17" fontWeight="500">{labels.answer}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.3, 0.28)} d="M110 72 V108" fill="none" stroke={p.soft} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(0.45)}>
          <rect x="20" y="108" width="300" height="78" rx="3" fill={p.nodeFill} stroke={p.gateStroke} strokeWidth="1" />
          <text x="34" y="154" fill={p.ink} fontSize="17" fontWeight="500">{labels.gate}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.65, 0.3)} d="M110 186 V226" fill="none" stroke={p.soft} strokeWidth="0.5" />
        <motion.g data-reveal="" variants={node(0.75)}>
          <text x="120" y="212" fill={p.soft} fontSize="15">{labels.yes}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(0.85)}>
          <rect x="20" y="226" width="300" height="64" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="34" y="266" fill={p.ink} fontSize="17" fontWeight="500">{labels.confirm}</text>
        </motion.g>

        {/* La rama "no" esquiva el nodo de confirmación por el margen derecho. */}
        <motion.path data-reveal="" variants={edge(0.72, 0.55)} d="M250 186 V202 H332 V334 H170 V350" fill="none" stroke={p.accent} strokeWidth="0.5" strokeLinejoin="round" />
        <motion.g data-reveal="" variants={node(0.8)}>
          <text x="258" y="200" fill={p.accent} fontSize="15">{labels.no}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(1.05)}>
          <rect x="20" y="350" width="300" height="64" rx="3" fill={p.accentFill} stroke={p.accent} strokeWidth="0.5" />
          <text x="34" y="390" fill={p.accent} fontSize="17" fontWeight="500">{labels.classify}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(1.25, 0.28)} d="M170 414 V450" fill="none" stroke={p.accent} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(1.4)}>
          <rect x="20" y="450" width="300" height="64" rx="3" fill={p.accentFill} stroke={p.accent} strokeWidth="0.5" />
          <text x="34" y="490" fill={p.accent} fontSize="17" fontWeight="500">{labels.explain}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(1.6, 0.28)} d="M170 514 V550" fill="none" stroke={p.soft} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(1.75)}>
          <rect x="20" y="550" width="300" height="64" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="34" y="590" fill={p.ink} fontSize="17" fontWeight="500">{labels.correct}</text>
        </motion.g>
      </motion.svg>
    </DiagramFigure>
  );
}
