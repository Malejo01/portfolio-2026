"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/agencia/icons";

/**
 * Botón hamburguesa + explorador lateral de celular (DISENO.md §8,
 * `12-celular-menu-*.png`). Visible debajo de 1024 px.
 *
 * El panel está siempre en el DOM (con `inert` cerrado) por dos motivos: la
 * transición de entrada es CSS puro y `SectionSpy` puede marcar el ítem
 * activo aunque el panel todavía no se haya abierto. Los ítems llegan como
 * `children` desde el servidor: acá solo vive el estado abierto/cerrado.
 *
 * Cierra con ✕, `Escape`, tocando el fondo o cualquier link. Bloquea el
 * scroll del fondo y atrapa el foco mientras está abierto.
 */
export function MobileMenu({
  openLabel,
  closeLabel,
  title,
  children,
}: {
  openLabel: string;
  closeLabel: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const focusables = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Pasar a escritorio con el panel abierto no debe dejar el scroll bloqueado.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const onPanelClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) setOpen(false);
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="ibtn lg:hidden"
        aria-label={openLabel}
        aria-expanded={open}
        aria-controls="explorador"
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" size={20} />
      </button>

      <div
        className={`fixed inset-0 z-[70] bg-black/50 transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      <div
        ref={panel}
        id="explorador"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        inert={!open}
        onClick={onPanelClick}
        className={`fixed inset-y-0 left-0 z-[71] flex w-[min(320px,86vw)] flex-col border-r border-border bg-surf transition-transform duration-200 ease-out motion-reduce:transition-none lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] flex-none items-center justify-between border-b border-border pl-[18px] pr-[18px]">
          <span className="lbl">{title}</span>
          <button ref={closeBtn} type="button" className="ibtn" aria-label={closeLabel} onClick={close}>
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
