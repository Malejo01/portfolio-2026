/**
 * Saludo y festejo del personaje (tanda P3-1): una vez cada uno, nunca en
 * bucle. `reproducir(caja, "saludo")` pone `data-anim` en el `[data-sprite]`
 * y lo saca al terminar; el CSS (`agencia.css`, "Sprites") muestra la tira y
 * corre la animación. Con movimiento reducido no hace nada: queda la pose
 * quieta (`normal` u `ok`).
 *
 * Antes de mostrar la tira la descarga y la decodifica: las tiras de saludo y
 * festejo son `loading="lazy"` con `display: none` y, sin esto, el primer
 * cuadro saldría en blanco.
 */
const MS: Record<"saludo" | "festejo", number> = { saludo: 2100, festejo: 1870 };

export function movimientoReducido(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** La tira del dibujo que se ve (el que no está en `display: none`). */
function tiraVisible(caja: Element, anim: "saludo" | "festejo"): HTMLImageElement | null {
  for (const s of caja.querySelectorAll<HTMLElement>(".sprite")) {
    if (getComputedStyle(s).display !== "none") return s.querySelector<HTMLImageElement>(`.tira-${anim}`);
  }
  return null;
}

export async function reproducir(caja: Element | null | undefined, anim: "saludo" | "festejo"): Promise<void> {
  if (!caja || movimientoReducido() || caja.hasAttribute("data-anim")) return;
  const img = tiraVisible(caja, anim);
  if (!img) return;
  try {
    const pre = new Image();
    pre.src = img.currentSrc || img.src;
    await pre.decode();
  } catch {
    return;
  }
  caja.setAttribute("data-anim", anim);
  const fin = () => caja.removeAttribute("data-anim");
  img.addEventListener("animationend", fin, { once: true });
  // Respaldo: si la animación no corre (pestaña oculta), igual se termina.
  window.setTimeout(fin, MS[anim] + 200);
}
