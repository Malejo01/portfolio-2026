"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { site } from "@/content/agencia/site";
import { abrirChat } from "@/lib/agencia/abrir-chat";
import { agendaLink } from "@/lib/agencia/config";
import { Icon } from "../icons";
import { Sprite } from "../Sprite";
import { Hoja } from "./Hoja";

/**
 * Barra de navegación inferior tipo app (tanda P2, Fase 6 bis), solo debajo
 * de 760 px: **Inicio · Soluciones · Malejo · Contacto**. Malejo va al
 * centro, en un círculo naranja apenas más alto que la barra, y reemplaza
 * a la burbuja flotante del chat en el celular. Contacto abre una hoja chica
 * con WhatsApp, la videollamada y "Pedí tu demo".
 *
 * - El activo sale de la ruta (`usePathname`, `aria-current="page"`): no lee
 *   cookies ni headers, así las rutas siguen estáticas.
 * - Alto de 56 px más el área segura (`--nav-inf`, en `agencia.css`); el
 *   `body` deja ese mismo espacio abajo. En `/soluciones`, la barra del
 *   armado va justo encima.
 * - Sin JS no se muestra (`.js-only`): quedan el header y los links de siempre.
 */
type Copy = (typeof site)["bottomNav"];

export function BottomNav({ copy, whatsapp }: { copy: Copy; whatsapp: string }) {
  const path = usePathname() || "/";
  const [contacto, setContacto] = useState(false);
  const activo = path === "/" ? "inicio" : path === "/soluciones" || path.startsWith("/servicios/") ? "soluciones" : null;

  const item = "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-muted no-underline aria-[current=page]:text-acc-text";

  return (
    <>
      <nav aria-label={copy.ariaLabel} className="nav-inf js-only fixed inset-x-0 bottom-0 z-[45] border-t border-border bg-(--nav-bg) backdrop-blur-[12px] min-[760px]:hidden">
        <ul className="m-0 flex h-14 list-none items-stretch gap-1 px-2">
          <li className="flex flex-1">
            <Link href={copy.inicio.href} aria-current={activo === "inicio" ? "page" : undefined} className={item}>
              <Icon name="home" size={22} />
              {copy.inicio.label}
            </Link>
          </li>
          <li className="flex flex-1">
            <Link href={copy.soluciones.href} aria-current={activo === "soluciones" ? "page" : undefined} className={item}>
              <Icon name="grid" size={22} />
              {copy.soluciones.label}
            </Link>
          </li>
          <li className="flex flex-1 justify-center">
            <button
              type="button"
              data-malejo-abrir
              aria-label={copy.malejo.aria}
              onClick={() => {
                const abierto = abrirChat({});
                track("cta_chat", { pagina: location.pathname, tema: false, destino: abierto ? "chat" : "whatsapp", desde: "barra" });
                if (!abierto) window.open(whatsapp, "_blank", "noopener");
              }}
              className="-mt-4 flex min-w-0 flex-col items-center gap-0.5 text-[11px] font-semibold text-text"
            >
              {/* Tanda P3-1: la cabeza del dibujo activo, sobre el color del botón de Malejo del estilo. */}
              <span className="inline-flex h-14 w-14 items-start justify-center overflow-hidden rounded-full border-4 border-bg bg-malejo-btn pt-1 text-malejo-btn-ink shadow-btn">
                <Sprite pose="ok" alto={104} alt="" />
              </span>
              {copy.malejo.label}
            </button>
          </li>
          <li className="flex flex-1">
            <button type="button" aria-haspopup="dialog" aria-expanded={contacto} onClick={() => setContacto(true)} className={item}>
              <Icon name="phone" size={22} />
              {copy.contacto.label}
            </button>
          </li>
        </ul>
      </nav>
      <div className="min-[760px]:hidden">
        <Hoja abierta={contacto} onCerrar={() => setContacto(false)} titulo={copy.contacto.titulo} cerrarLabel={copy.contacto.cerrar}>
          <div className="flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
            <a href={whatsapp} target="_blank" rel="noopener" className="btn btn-p w-full" onClick={() => track("chat_clic", { destino: "whatsapp", desde: "barra" })}>
              <Icon name="whatsapp" size={18} />
              {copy.contacto.whatsapp}
            </a>
            <a href={agendaLink()} target="_blank" rel="noopener" className="btn btn-s w-full">
              <Icon name="calendar" size={18} />
              {copy.contacto.agenda}
            </a>
            <Link href={copy.contacto.demo.href} className="btn btn-s w-full" onClick={() => setContacto(false)}>
              {copy.contacto.demo.label}
            </Link>
          </div>
        </Hoja>
      </div>
    </>
  );
}
