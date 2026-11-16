"use client";

import { pedirRecorrido } from "@/lib/agencia/recorrido";

/**
 * "¿Cómo uso la página?" (tanda P3-4): abre el recorrido de bienvenida en
 * cualquier página, sin tocar la marca de "ya lo vio". Va en el pie, en el
 * menú del celular y al final del panel de estilos. Sin JS no hay recorrido,
 * así que no se muestra (`.js-only`). `alAbrir` cierra lo que esté abierto
 * (el panel de estilos) antes de empezar.
 */
export function ComoUsar({ label, className = "", alAbrir }: { label: string; className?: string; alAbrir?: () => void }) {
  return (
    <button
      type="button"
      data-cierra-menu=""
      className={`js-only ${className}`}
      onClick={() => {
        alAbrir?.();
        // Un cuadro después, para que el menú o el panel ya se hayan cerrado.
        requestAnimationFrame(() => pedirRecorrido());
      }}
    >
      {label}
    </button>
  );
}
