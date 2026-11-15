"use client";

import { track } from "@vercel/analytics";
import { emitir } from "@/lib/agencia/armado";
import { useArmado } from "./useArmado";

/**
 * "Agregar al armado" de cada tarjeta de `/soluciones` (tanda P2, Fase 4).
 * Es la isla más chica posible: no carga el catálogo (el id llega del
 * servidor) y solo emite `malejo:armado`; el carrito escucha y recalcula.
 * Agregado, alterna a "✓ Agregado · Quitar".
 *
 * Al agregar:
 * - avisa `malejo:vuelo` con el rectángulo de la tarjeta, para que el
 *   armador haga volar una miniatura hasta la barra (Fase 6 bis);
 * - vibra 12 ms si el teléfono puede y no hay movimiento reducido. Nunca al quitar.
 *
 * Sin JS no se ve (`.js-only`): en su lugar el servidor pone "Pedí tu demo".
 */
export const VUELO_EVENT = "malejo:vuelo";

export interface VueloDetail {
  /** De dónde sale la miniatura (la tarjeta). */
  desde: { x: number; y: number; w: number; h: number };
  nombre: string;
}

export function vibrar() {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    navigator.vibrate?.(12);
  } catch {}
}

export function AgregarBoton({
  id,
  nombre,
  labels,
  destacado = false,
  tipo = "item",
  compacto = false,
  className = "",
}: {
  /** En una fila (los extras): sin ancho completo. */
  compacto?: boolean;
  id: string;
  /** Un extra va a `armado.extras`. El id ya viene validado del servidor. */
  tipo?: "item" | "extra";
  nombre: string;
  labels: { agregar: string; agregado: string; quitar: string; quitarAria: string };
  /** El plan recomendado: botón principal (`btn-p`). */
  destacado?: boolean;
  className?: string;
}) {
  const armado = useArmado();
  const esta = armado.items.some((i) => i.id === id) || armado.extras.includes(id);

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (esta) {
      emitir({ accion: "quitar", id });
      track("armado_quitar", { id });
      return;
    }
    const tarjeta = e.currentTarget.closest("article, li, [data-vuelo]") ?? e.currentTarget;
    const r = tarjeta.getBoundingClientRect();
    emitir({ accion: "agregar", id, origen: "persona" }, (x) => ({ id: x, tipo }));
    track("armado_agregar", { origen: "persona", id });
    vibrar();
    window.dispatchEvent(new CustomEvent<VueloDetail>(VUELO_EVENT, { detail: { desde: { x: r.left, y: r.top, w: r.width, h: r.height }, nombre } }));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={esta}
      aria-label={esta ? labels.quitarAria.replace("{NOMBRE}", nombre) : `${labels.agregar}: ${nombre}`}
      className={`js-only btn btn-sm min-h-11 ${compacto ? "flex-none px-3" : "w-full"} ${esta ? "btn-s border-hi-t text-acc-text" : destacado ? "btn-p" : "btn-s"} ${className}`}
    >
      {esta ? (
        <>
          <span>{labels.agregado}</span>
          <span aria-hidden="true" className="text-muted">
            ·
          </span>
          <span className="font-semibold text-text underline underline-offset-2">{labels.quitar}</span>
        </>
      ) : (
        labels.agregar
      )}
    </button>
  );
}
