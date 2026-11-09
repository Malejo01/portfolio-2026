"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { MalejoCopy } from "@/content/agencia/malejo";
import { ABRIR_CHAT_EVENT, type AbrirChatDetail } from "@/lib/agencia/abrir-chat";

/**
 * Carga el flotante de Malejo fuera del primer render: espera a que el
 * navegador esté libre (`requestIdleCallback`, o 1,5 s donde no existe) y
 * recién ahí pide el chunk. `ssr: false`: no hay nada de él en el HTML.
 *
 * Tanda R2: también escucha `malejo:abrir` (lo disparan los botones
 * `AbrirChat`). Si llega antes de que el widget cargue, fuerza la carga y
 * el widget se abre al montar, con el tema ya enviado. Cancela el evento
 * para avisarle al botón "lo atiendo yo"; si el chunk del widget falló, no
 * lo cancela y el botón sigue a WhatsApp.
 */
let fallo = false;

const MalejoWidget = dynamic(
  () =>
    import("./MalejoWidget").catch(() => {
      fallo = true;
      return { default: () => null };
    }),
  { ssr: false },
);

export interface PedidoChat extends AbrirChatDetail {
  /** Contador: cada pedido es distinto aunque repita el tema. */
  n: number;
}

export function MalejoLoader(props: { copy: MalejoCopy; senaMonto: number; turnstileSiteKey?: string }) {
  const [ready, setReady] = useState(false);
  const [pedido, setPedido] = useState<PedidoChat | null>(null);

  useEffect(() => {
    const ric = window.requestIdleCallback;
    let cancel: () => void;
    if (ric) {
      const id = ric(() => setReady(true), { timeout: 3000 });
      cancel = () => window.cancelIdleCallback(id);
    } else {
      const t = setTimeout(() => setReady(true), 1500);
      cancel = () => clearTimeout(t);
    }

    const onAbrir = (e: Event) => {
      if (fallo) return;
      e.preventDefault();
      const detail = (e as CustomEvent<AbrirChatDetail>).detail ?? {};
      setReady(true);
      setPedido((p) => ({ tema: detail.tema, n: (p?.n ?? 0) + 1 }));
    };
    window.addEventListener(ABRIR_CHAT_EVENT, onAbrir);
    return () => {
      cancel();
      window.removeEventListener(ABRIR_CHAT_EVENT, onAbrir);
    };
  }, []);

  return ready ? <MalejoWidget {...props} pedido={pedido} /> : null;
}
