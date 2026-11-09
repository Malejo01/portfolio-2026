"use client";

import { useEffect } from "react";

/**
 * Marca con `aria-current` el link del menú de la sección visible. No
 * renderiza nada: los links son HTML del servidor (menú de escritorio y
 * explorador de celular) con `data-nav-section="<id>"`, y esto solo les
 * cambia el atributo. Así la copy del menú no viaja en el bundle.
 *
 * Fuera de la home la sección sale del pathname: cada página marca **su**
 * ítem (`/servicios/*` → Soluciones, `/precios` → Precios, `/blog/*` →
 * Blog). `/cotizador`, `/demo` y los legales no marcan ninguno: antes
 * Precios quedaba activo en `/servicios` y `/cotizador` (auditoría P1-9).
 */
const ROUTE_SECTIONS: [prefix: string, section: string][] = [
  ["/blog", "blog"],
  ["/servicios", "servicios"],
  ["/precios", "precios"],
];

function mark(section: string | null) {
  document.querySelectorAll<HTMLElement>("[data-nav-section]").forEach((el) => {
    if (el.dataset.navSection === section) el.setAttribute("aria-current", "true");
    else el.removeAttribute("aria-current");
  });
}

export function SectionSpy() {
  useEffect(() => {
    const path = window.location.pathname;
    if (path !== "/") {
      const hit = ROUTE_SECTIONS.find(([prefix]) => path.startsWith(prefix));
      mark(hit ? hit[1] : null);
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    if (!sections.length) return;

    // La sección activa es la que cruza la franja del medio de la pantalla.
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        const current = sections.find((s) => visible.get(s.id));
        if (current) mark(current.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return null;
}
