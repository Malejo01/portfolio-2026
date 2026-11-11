"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { ABRIR_CHAT_EVENT } from "@/lib/agencia/abrir-chat";
import { Icon } from "../icons";

/**
 * Modal de la tanda P1 (`docs/agencia/precios-psicologia-2026-11-10.md` §5).
 * Una sola isla para las dos variantes:
 *
 * - `plan`: "Ver qué incluye" de un plan o "Ver qué trae" de un combo. Sin
 *   JS el disparador es un `<a href="/servicios/<cat>#<id>">`, donde el
 *   detalle está en un `<details>`; con JS el clic abre el modal.
 * - `info`: los modales chicos ("Formas de pago", "¿Cómo funciona la
 *   seña?", "Sumale extras", "Condiciones"). Sin JS, el mismo contenido va
 *   en un `<details>` (`.nojs-only`) y el botón se esconde (`.js-only`).
 *
 * El contenido llega como `children` desde un Server Component: la copy no
 * entra al bundle. `<dialog>` nativo con `showModal()`: atrapa el foco y
 * cierra con Esc solo. La isla suma el botón ✕, el clic en el fondo, el
 * bloqueo del scroll de la página y la devolución del foco al disparador.
 * Si alguien abre el chat de Malejo desde adentro ("Preguntale a Malejo"),
 * el modal se cierra para no tapar el widget.
 *
 * Entrada con Framer Motion (`LazyMotion` + `m`). No lleva `data-reveal`:
 * arranca cerrado y sin JS no se ve; el primer render no tiene estado
 * inicial animado. Con `prefers-reduced-motion`, aparece sin animación.
 */
export function PlanDialog({
  label,
  title,
  href,
  variant = "plan",
  closeLabel,
  triggerClassName = "lnk min-h-11",
  triggerAriaLabel,
  children,
}: {
  /** Texto del disparador ("Ver qué incluye"). */
  label: string;
  /** Título del modal (el nombre del plan, "Formas de pago"). */
  title: string;
  /** Sin JS, adónde lleva el disparador. Sin `href`, el respaldo es un `<details>`. */
  href?: string;
  variant?: "plan" | "info";
  closeLabel: string;
  triggerClassName?: string;
  triggerAriaLabel?: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [vez, setVez] = useState(0);
  const reduced = useReducedMotion();
  const titleId = useId();

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const html = document.documentElement;
    const onClose = () => {
      html.style.overflow = "";
      triggerRef.current?.focus();
    };
    const onChat = () => {
      if (d.open) d.close();
    };
    d.addEventListener("close", onClose);
    window.addEventListener(ABRIR_CHAT_EVENT, onChat);
    return () => {
      d.removeEventListener("close", onClose);
      window.removeEventListener(ABRIR_CHAT_EVENT, onChat);
      // Si el modal se desmonta abierto (navegación a /demo), se libera el scroll.
      if (d.open) html.style.overflow = "";
    };
  }, []);

  const abrir = () => {
    const d = dialogRef.current;
    if (!d || d.open) return;
    d.showModal();
    document.documentElement.style.overflow = "hidden";
    setVez((v) => v + 1);
  };

  const onTrigger = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    abrir();
  };

  return (
    <>
      {href ? (
        <a
          ref={(el) => {
            triggerRef.current = el;
          }}
          href={href}
          onClick={onTrigger}
          aria-haspopup="dialog"
          aria-label={triggerAriaLabel}
          className={triggerClassName}
        >
          {label}
        </a>
      ) : (
        <>
          <button
            ref={(el) => {
              triggerRef.current = el;
            }}
            type="button"
            onClick={onTrigger}
            aria-haspopup="dialog"
            aria-label={triggerAriaLabel}
            className={`js-only ${triggerClassName}`}
          >
            {label}
          </button>
          <details className="nojs-only plans">
            <summary className={triggerClassName}>{label}</summary>
            <div className="mt-3 flex flex-col gap-3 text-[15px] leading-[1.55]">{children}</div>
          </details>
        </>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="dlg m-auto"
        onClick={(e) => {
          // El `<dialog>` solo recibe el clic directo en el fondo: la tarjeta lo tapa.
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <LazyMotion features={domAnimation}>
          <m.div
            key={vez}
            initial={vez === 0 || reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
            className={`card card-big dlg-panel flex flex-col gap-4 p-5 sm:p-7 ${variant === "plan" ? "" : "text-[15px] leading-[1.55]"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id={titleId} className="h text-[24px] leading-[1.1] sm:text-[28px]">
                {title}
              </h2>
              <button type="button" className="ibtn" aria-label={closeLabel} onClick={() => dialogRef.current?.close()}>
                <Icon name="close" size={18} />
              </button>
            </div>
            {children}
          </m.div>
        </LazyMotion>
      </dialog>
    </>
  );
}
