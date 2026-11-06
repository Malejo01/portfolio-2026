"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { MalejoCopy } from "@/content/agencia/malejo";

/**
 * Carga el flotante de Malejo fuera del primer render: espera a que el
 * navegador esté libre (`requestIdleCallback`, o 1,5 s donde no existe) y
 * recién ahí pide el chunk. `ssr: false`: no hay nada de él en el HTML.
 */
const MalejoWidget = dynamic(() => import("./MalejoWidget"), { ssr: false });

export function MalejoLoader(props: { copy: MalejoCopy; senaMonto: number; turnstileSiteKey?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ric = window.requestIdleCallback;
    if (ric) {
      const id = ric(() => setReady(true), { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return ready ? <MalejoWidget {...props} /> : null;
}
