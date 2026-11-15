"use client";

import { useEffect, useRef } from "react";

/**
 * El sprite de Mauro que saluda en la primera pantalla (tanda P2, Fase 6
 * bis). La animación es **CSS** (`steps()` sobre `malejo-saludo.png`, dos
 * cuadros: manos en los bolsillos y pulgar arriba, en un loop lento): acá
 * solo se pausa cuando sale de la pantalla (`data-visible`). Con movimiento
 * reducido, o sin JS, queda quieto en el primer cuadro.
 */
export function SpriteVivo({ label }: { label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.setAttribute("data-visible", "");
      else el.removeAttribute("data-visible");
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <span ref={ref} role="img" aria-label={label} className="sprite-saludo" />;
}
