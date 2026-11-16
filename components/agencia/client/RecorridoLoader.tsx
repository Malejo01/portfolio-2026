"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { RecorridoCopy } from "@/content/agencia/recorrido";
import { ABRIR_CHAT_EVENT } from "@/lib/agencia/abrir-chat";
import { CHAT_ABIERTO_EVENT, RECORRIDO_EVENT, leerMarca, marcar } from "@/lib/agencia/recorrido";

/**
 * El cargador del recorrido de bienvenida (tanda P3-4). Liviano y en todas
 * las páginas: decide **sin bajar el chunk** (`Recorrido`, con
 * `next/dynamic` y `ssr: false`) si hace falta.
 *
 * - **Solo, una vez:** en la home, si no hay `malejo-recorrido`, 4 s después
 *   de que el hero esté a la vista y con el navegador libre
 *   (`requestIdleCallback`). Si antes la persona abrió el chat, tocó alguno
 *   de los 3 botones, abrió el selector de estilos o scrolleó más allá del
 *   hero, se marca "saltado" y no vuelve solo.
 * - **Con el enlace** "¿Cómo uso la página?" (`malejo:recorrido`): siempre,
 *   en cualquier página, sin tocar la marca.
 */
const Recorrido = dynamic(() => import("./Recorrido").then((m) => m.Recorrido), { ssr: false });

const ESPERA_MS = 4000;

export function RecorridoLoader({ copy }: { copy: RecorridoCopy }) {
  const path = usePathname() || "/";
  const [abierto, setAbierto] = useState<null | "auto" | "enlace">(null);

  // El enlace: en cualquier página.
  useEffect(() => {
    const abrir = () => setAbierto("enlace");
    window.addEventListener(RECORRIDO_EVENT, abrir);
    return () => window.removeEventListener(RECORRIDO_EVENT, abrir);
  }, []);

  // Solo, la primera vez, en la home.
  useEffect(() => {
    if (path !== "/" || leerMarca()) return;
    const hero = document.getElementById("inicio");
    if (!hero) return;
    let timer = 0;
    let idle = 0;
    let listo = false;
    const cancelar = () => {
      if (listo) return;
      listo = true;
      marcar("saltado");
      limpiar();
    };
    const onScroll = () => {
      const fin = hero.getBoundingClientRect().bottom;
      if (fin < 0) cancelar();
    };
    const onClick = (e: Event) => {
      if ((e.target as Element | null)?.closest?.("[data-recorrido]")) cancelar();
    };
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting) || timer) return;
      io.disconnect();
      timer = window.setTimeout(() => {
        const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
        idle = ric(() => {
          if (listo || leerMarca()) return;
          listo = true;
          limpiar();
          setAbierto("auto");
        }) as unknown as number;
      }, ESPERA_MS);
    });
    function limpiar() {
      io.disconnect();
      window.clearTimeout(timer);
      if (idle && window.cancelIdleCallback) window.cancelIdleCallback(idle);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(CHAT_ABIERTO_EVENT, cancelar);
      window.removeEventListener(ABRIR_CHAT_EVENT, cancelar);
    }
    io.observe(hero);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    window.addEventListener(CHAT_ABIERTO_EVENT, cancelar);
    window.addEventListener(ABRIR_CHAT_EVENT, cancelar);
    return () => {
      listo = true;
      limpiar();
    };
  }, [path]);

  if (!abierto) return null;
  return <Recorrido copy={copy} origen={abierto} onCerrar={() => setAbierto(null)} />;
}
