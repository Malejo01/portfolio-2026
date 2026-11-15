"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "../icons";

/**
 * Hoja que sube desde abajo (tanda P2, Fase 6 bis): el armado en el celular
 * y la hoja de Contacto de la barra inferior. `<dialog>` nativo con
 * `showModal()` (atrapa el foco, Esc cierra) y la misma idea que
 * `PlanDialog`: el contenido llega como `children` y no se remonta al abrir.
 *
 * - Entra con resorte desde abajo y el fondo se oscurece con opacidad
 *   (`.hoja::backdrop`, CSS). Con `prefers-reduced-motion`, sin animación.
 * - Se cierra con ✕, tocando el fondo, con Esc o **deslizando hacia abajo**
 *   desde la manija (más de 80 px). Solo `transform` y `opacity`.
 * - Devuelve el foco a quien la abrió (`showModal` lo guarda; el `close`
 *   nativo lo restaura) y bloquea el scroll de la página mientras está abierta.
 * - `overscroll-behavior: contain` en el cuerpo, así el scroll no se escapa.
 *
 * Controlada: `abierta` la abre o la cierra; `onCerrar` avisa cuando la
 * persona la cerró (cualquier camino).
 */
const RESORTE = { type: "spring" as const, stiffness: 420, damping: 38, mass: 0.9 };

export function Hoja({
  abierta,
  onCerrar,
  titulo,
  cerrarLabel,
  children,
  pie,
}: {
  abierta: boolean;
  onCerrar: () => void;
  titulo: string;
  cerrarLabel: string;
  children: React.ReactNode;
  /** Lo que queda fijo abajo (el botón principal). */
  pie?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  const titleId = useId();
  const [arrastre, setArrastre] = useState(0);
  const inicio = useRef<number | null>(null);
  const onCerrarRef = useRef(onCerrar);
  useEffect(() => {
    onCerrarRef.current = onCerrar;
  });

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const html = document.documentElement;
    if (abierta && !d.open) {
      d.showModal();
      html.style.overflow = "hidden";
    } else if (!abierta && d.open) {
      d.close();
    }
  }, [abierta]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => {
      document.documentElement.style.overflow = "";
      setArrastre(0);
      onCerrarRef.current();
    };
    d.addEventListener("close", onClose);
    return () => {
      d.removeEventListener("close", onClose);
      if (d.open) document.documentElement.style.overflow = "";
    };
  }, []);

  const cerrar = () => ref.current?.close();

  const onPointerDown = (e: React.PointerEvent) => {
    inicio.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (inicio.current == null) return;
    setArrastre(Math.max(0, e.clientY - inicio.current));
  };
  const onPointerUp = () => {
    if (inicio.current == null) return;
    inicio.current = null;
    if (arrastre > 80) cerrar();
    else setArrastre(0);
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="hoja"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      <LazyMotion features={domAnimation}>
        <m.div
          initial={false}
          animate={abierta ? { y: 0, opacity: 1 } : { y: "100%", opacity: reduced ? 0 : 1 }}
          transition={reduced ? { duration: 0 } : RESORTE}
          className="hoja-panel card flex flex-col rounded-b-none"
        >
          <div
            style={arrastre ? { transform: `translateY(${arrastre}px)` } : undefined}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div
              className="flex flex-none touch-none flex-col items-stretch px-4 pb-2 pt-2"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <span aria-hidden="true" className="mx-auto mb-2 block h-1.5 w-10 rounded-full bg-border-h" />
              <div className="flex items-center justify-between gap-3">
                <h2 id={titleId} className="h text-[22px] leading-tight">
                  {titulo}
                </h2>
                <button type="button" className="ibtn" aria-label={cerrarLabel} onClick={cerrar}>
                  <Icon name="close" size={18} />
                </button>
              </div>
            </div>
            <div className="hoja-cuerpo min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
            {pie ? <div className="flex-none border-t border-border px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">{pie}</div> : null}
          </div>
        </m.div>
      </LazyMotion>
    </dialog>
  );
}
