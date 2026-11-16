"use client";

import { track } from "@vercel/analytics";
import { abrirChat } from "@/lib/agencia/abrir-chat";
import { Icon } from "../icons";

/**
 * Los dos caminos de `/soluciones` (tanda P2, D6): "Ya sé lo que quiero"
 * baja al catálogo (un ancla: anda sin JS) y "Ayudame a elegir" abre a
 * Malejo en modo armado (sin tema: la bienvenida trae las opciones). Sin JS,
 * o si el chat no está, sigue a WhatsApp. Cuenta cuál se eligió
 * (`soluciones_camino`).
 */
export function Caminos({ yaSe, ayudame, whatsapp }: { yaSe: string; ayudame: string; whatsapp: string }) {
  return (
    <div className="mt-5 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener"
        className="btn btn-p w-full min-[420px]:w-auto"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          track("soluciones_camino", { camino: "ayudame" });
          if (abrirChat({})) e.preventDefault();
        }}
      >
        <Icon name="chat" size={18} />
        {ayudame}
      </a>
      <a href="#catalogo" className="btn btn-s w-full min-[420px]:w-auto" onClick={() => track("soluciones_camino", { camino: "ya_se" })}>
        {yaSe}
        <Icon name="arrow" size={16} className="rotate-90" />
      </a>
    </div>
  );
}
