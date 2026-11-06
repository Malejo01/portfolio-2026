import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";
import { AGENCIA_THEME_COOKIE } from "@/lib/agencia/theme";

/**
 * Tema de la agencia. La fuente de verdad es la clase `dark` en `<html>`,
 * escrita por el script inline del layout (`app/(agencia)/layout.tsx`)
 * antes del primer paint. Acá solo se lee (con `useSyncExternalStore`) y se
 * alterna. Cookie propia, `malejo-theme`: el tema de la agencia y el del
 * portfolio son independientes.
 */

export type AgenciaTheme = "dark" | "light";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot(): AgenciaTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** El default de la agencia es oscuro, y es lo que asume el HTML del servidor. */
function getServerSnapshot(): AgenciaTheme {
  return "dark";
}

function apply(theme: AgenciaTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function useAgenciaTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Respaldo del script inline, mismo motivo que en `components/ThemeProvider`:
  // en un 404 Next monta el layout en el cliente y el <script> viaja como
  // dato, no corre. Si `<html>` no tiene `js`, se replica acá antes del paint.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("js")) return;
    root.classList.add("js");
    const m = document.cookie.match(new RegExp(`(?:^|; )${AGENCIA_THEME_COOKIE}=(dark|light)`));
    apply(m && m[1] === "light" ? "light" : "dark");
  }, []);

  const toggle = useCallback(() => {
    const next: AgenciaTheme = getSnapshot() === "dark" ? "light" : "dark";
    apply(next);
    document.cookie = `${AGENCIA_THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  return { theme, toggle };
}
