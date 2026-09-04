"use client";

import { motion } from "framer-motion";
import {
  DiagramFigure,
  diagramPalette,
  diagramSvgProps,
  useDiagramMotion,
} from "@/components/case-study/diagram-kit";
import type { RetrievalDiagramLabels } from "@/lib/types";

/**
 * El flujo de respuesta de Tuki. Mismo contrato que los otros dos diagramas:
 * no recibe data, los nodos son fijos y el layout es el argumento del caso.
 *
 * Es la tercera compuerta del sitio, y a propósito: es vocabulario visual que
 * el visitante ya aprendió en Qué Pinta Salta. Lo que cambia es qué hay a
 * cada lado. Acá el modelo está en la rama del **sí** —solo reformula cuando
 * hay fragmento del corpus— y la rama del **no** no es un descarte: deriva al
 * canal correspondiente. Las dos salidas tienen exactamente el mismo tamaño
 * porque saber cuándo no responder es la decisión de diseño, no un caso de
 * borde. La única diferencia entre ellas es el acento, que marca dónde
 * interviene el modelo.
 *
 * La cita de fuente vive en el nodo del modelo, como sublabel: la tarea de
 * Gemini no es responder, es reformular *citando el documento de origen*.
 * Separarlo en un nodo más rompía el ancho del lienzo sin sumar argumento.
 *
 * ── Geometría ────────────────────────────────────────────────────────────
 *
 * Horizontal: tres nodos de pipeline en una sola fila a media altura, la
 * compuerta en la cuarta columna y las dos salidas apiladas en la quinta,
 * como el lado derecho del diagrama de Qué Pinta Salta. El hueco entre la
 * compuerta y las salidas es más ancho que el resto (70 contra 30) para que
 * entren las curvas y las etiquetas sí/no sin pisarse.
 *
 * Vertical: todo apilado. La rama del "no" esquiva el nodo del modelo por el
 * margen derecho, igual que en el diagrama de MaestrIA.
 *
 * Las dos orientaciones se renderizan siempre y CSS elige cuál se ve
 * (breakpoint 760px). El `viewBox` reserva la altura, así que no hay CLS.
 * Los delays cierran antes de los 2s: ver `VIEWPORT_DIAGRAM` en
 * `lib/motion.ts`.
 */
export function RetrievalDiagram({
  labels,
  className = "",
}: {
  labels: RetrievalDiagramLabels;
  className?: string;
}) {
  const { node, edge } = useDiagramMotion();
  const p = diagramPalette("paper");
  const svgProps = diagramSvgProps(labels.alt);

  return (
    <DiagramFigure surface="paper" caption={labels.caption} className={className}>
      {/* ── Horizontal (≥760px): pipeline, compuerta, dos salidas ── */}
      <motion.svg {...svgProps} viewBox="0 0 940 360" className={`${svgProps.className} max-[759px]:hidden`}>
        <motion.g data-reveal="" variants={node(0.05)}>
          <rect x="10" y="136" width="150" height="88" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="24" y="174" fill={p.ink} fontSize="13.5">{labels.question.title}</text>
          <text x="24" y="198" fill={p.soft} fontSize="12">{labels.question.sub}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.22, 0.28)} d="M160 180 H190" fill="none" stroke={p.soft} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(0.3)}>
          <rect x="190" y="136" width="150" height="88" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="204" y="174" fill={p.ink} fontSize="13.5">{labels.embed.title}</text>
          <text x="204" y="198" fill={p.soft} fontSize="12">{labels.embed.sub}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.47, 0.28)} d="M340 180 H370" fill="none" stroke={p.soft} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(0.55)}>
          <rect x="370" y="136" width="150" height="88" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="384" y="174" fill={p.ink} fontSize="13.5">{labels.search.title}</text>
          <text x="384" y="198" fill={p.soft} fontSize="12">{labels.search.sub}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.72, 0.28)} d="M520 180 H550" fill="none" stroke={p.soft} strokeWidth="0.5" />

        {/* La compuerta es el único borde de 1px del sitio: el grosor es el énfasis. */}
        <motion.g data-reveal="" variants={node(0.82)}>
          <rect x="550" y="137" width="150" height="86" rx="3" fill={p.nodeFill} stroke={p.gateStroke} strokeWidth="1" />
          <text x="564" y="174" fill={p.ink} fontSize="13.5">{labels.gate.title}</text>
          <text x="564" y="198" fill={p.soft} fontSize="12">{labels.gate.sub}</text>
        </motion.g>

        {/* Sí: sube al modelo, en acento. No: baja a la derivación, neutro.
            Mismo trazo, misma longitud — solo cambia el color. */}
        <motion.path data-reveal="" variants={edge(1.05, 0.35)} d="M700 170 C 735 170 735 110 770 110" fill="none" stroke={p.accent} strokeWidth="0.5" />
        <motion.path data-reveal="" variants={edge(1.1, 0.35)} d="M700 190 C 735 190 735 270 770 270" fill="none" stroke={p.soft} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(1.2)}>
          <text x="712" y="150" fill={p.accent} fontSize="12">{labels.yes}</text>
        </motion.g>
        <motion.g data-reveal="" variants={node(1.22)}>
          <text x="712" y="226" fill={p.soft} fontSize="12">{labels.no}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(1.38)}>
          <rect x="770" y="66" width="160" height="88" rx="3" fill={p.accentFill} stroke={p.accent} strokeWidth="0.5" />
          <text x="784" y="96" fill={p.accent} fontSize="13.5">{labels.answer.title}</text>
          <text x="784" y="120" fill={p.accent} fontSize="12" opacity="0.9">{labels.answer.sub1}</text>
          <text x="784" y="138" fill={p.accent} fontSize="12" opacity="0.9">{labels.answer.sub2}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(1.45)}>
          <rect x="770" y="226" width="160" height="88" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="784" y="256" fill={p.ink} fontSize="13.5">{labels.refer.title}</text>
          <text x="784" y="280" fill={p.soft} fontSize="12">{labels.refer.sub1}</text>
          <text x="784" y="298" fill={p.soft} fontSize="12">{labels.refer.sub2}</text>
        </motion.g>
      </motion.svg>

      {/* ── Vertical (<760px): mismo grafo, apilado ──────────────── */}
      <motion.svg {...svgProps} viewBox="0 0 340 670" className={`${svgProps.className} min-[760px]:hidden`}>
        <motion.g data-reveal="" variants={node(0.03)}>
          <rect x="20" y="8" width="300" height="72" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="34" y="39" fill={p.ink} fontSize="17" fontWeight="500">{labels.question.title}</text>
          <text x="34" y="64" fill={p.soft} fontSize="15">{labels.question.sub}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.2, 0.28)} d="M110 80 V112" fill="none" stroke={p.soft} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(0.28)}>
          <rect x="20" y="112" width="300" height="72" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="34" y="143" fill={p.ink} fontSize="17" fontWeight="500">{labels.embed.title}</text>
          <text x="34" y="168" fill={p.soft} fontSize="15">{labels.embed.sub}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.45, 0.28)} d="M110 184 V216" fill="none" stroke={p.soft} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(0.53)}>
          <rect x="20" y="216" width="300" height="72" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="34" y="247" fill={p.ink} fontSize="17" fontWeight="500">{labels.search.title}</text>
          <text x="34" y="272" fill={p.soft} fontSize="15">{labels.search.sub}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(0.7, 0.28)} d="M110 288 V320" fill="none" stroke={p.soft} strokeWidth="0.5" />

        <motion.g data-reveal="" variants={node(0.8)}>
          <rect x="20" y="320" width="300" height="78" rx="3" fill={p.nodeFill} stroke={p.gateStroke} strokeWidth="1" />
          <text x="34" y="353" fill={p.ink} fontSize="17" fontWeight="500">{labels.gate.title}</text>
          <text x="34" y="378" fill={p.soft} fontSize="15">{labels.gate.sub}</text>
        </motion.g>

        <motion.path data-reveal="" variants={edge(1.0, 0.3)} d="M110 398 V440" fill="none" stroke={p.accent} strokeWidth="0.5" />
        <motion.g data-reveal="" variants={node(1.1)}>
          <text x="120" y="424" fill={p.accent} fontSize="15">{labels.yes}</text>
        </motion.g>

        {/* La rama "no" esquiva el nodo del modelo por el margen derecho. */}
        <motion.path data-reveal="" variants={edge(1.05, 0.55)} d="M250 398 V414 H332 V550 H170 V568" fill="none" stroke={p.soft} strokeWidth="0.5" strokeLinejoin="round" />
        <motion.g data-reveal="" variants={node(1.12)}>
          <text x="258" y="412" fill={p.soft} fontSize="15">{labels.no}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(1.35)}>
          <rect x="20" y="440" width="300" height="88" rx="3" fill={p.accentFill} stroke={p.accent} strokeWidth="0.5" />
          <text x="34" y="470" fill={p.accent} fontSize="17" fontWeight="500">{labels.answer.title}</text>
          <text x="34" y="496" fill={p.accent} fontSize="15" opacity="0.9">{labels.answer.sub1}</text>
          <text x="34" y="518" fill={p.accent} fontSize="15" opacity="0.9">{labels.answer.sub2}</text>
        </motion.g>

        <motion.g data-reveal="" variants={node(1.6)}>
          <rect x="20" y="568" width="300" height="88" rx="3" fill={p.nodeFill} stroke={p.nodeStroke} strokeWidth="0.5" />
          <text x="34" y="598" fill={p.ink} fontSize="17" fontWeight="500">{labels.refer.title}</text>
          <text x="34" y="624" fill={p.soft} fontSize="15">{labels.refer.sub1}</text>
          <text x="34" y="646" fill={p.soft} fontSize="15">{labels.refer.sub2}</text>
        </motion.g>
      </motion.svg>
    </DiagramFigure>
  );
}
