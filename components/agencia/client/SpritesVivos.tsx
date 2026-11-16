"use client";

import { useEffect } from "react";
import { reproducir } from "@/lib/agencia/sprite-anim";

const SALUDO_HERO_KEY = "malejo-saludo-hero";

/**
 * Una sola isla para todos los sprites de la página (tanda P3-1; reemplaza a
 * `SpriteVivo`): pone `data-visible` a los `[data-sprite]` que están a la
 * vista (el idle solo corre ahí) y, la primera vez en la sesión que el
 * personaje del hero aparece (`data-saludo-entrada`), lo hace saludar.
 *
 * Mira los sprites que agregan después (el chat) con un MutationObserver
 * liviano. Sin JS no hay `data-visible` y se ve la pose quieta. Desde P3-3
 * también marca `data-visto` en las etiquetas de precio (`EtiquetaPrecio`).
 */
export function SpritesVivos() {
  useEffect(() => {
    const vistos = new WeakSet<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) {
          el.setAttribute("data-visible", "");
          if (el.hasAttribute("data-saludo-entrada") && e.intersectionRatio > 0) saludoDeEntrada(el);
        } else el.removeAttribute("data-visible");
      }
    });
    const mirar = () => {
      for (const el of document.querySelectorAll("[data-sprite]")) {
        if (vistos.has(el)) continue;
        vistos.add(el);
        io.observe(el);
      }
    };
    mirar();
    // Tanda P3-3: las etiquetas de precio de Tienda se balancean una vez al entrar.
    const vistas = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.setAttribute("data-visto", "");
        vistas.unobserve(e.target);
      }
    });
    const etiquetas = new WeakSet<Element>();
    const mirarEtiquetas = () => {
      for (const el of document.querySelectorAll("[data-etiqueta-precio]")) {
        if (etiquetas.has(el)) continue;
        etiquetas.add(el);
        vistas.observe(el);
      }
    };
    mirarEtiquetas();
    let pendiente = 0;
    const mo = new MutationObserver(() => {
      if (pendiente) return;
      pendiente = requestAnimationFrame(() => {
        pendiente = 0;
        mirar();
        mirarEtiquetas();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      vistas.disconnect();
      mo.disconnect();
      cancelAnimationFrame(pendiente);
    };
  }, []);
  return null;
}

function saludoDeEntrada(el: HTMLElement) {
  // Hay dos heroes (uno por estilo) y uno está oculto: saluda el que se ve.
  if (el.offsetParent === null) return;
  try {
    if (sessionStorage.getItem(SALUDO_HERO_KEY)) return;
    sessionStorage.setItem(SALUDO_HERO_KEY, "1");
  } catch {}
  void reproducir(el, "saludo");
}
