"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { THEME_COOKIE, type Theme } from "@/lib/types";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function persist(theme: Theme) {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function hasThemeCookie() {
  return document.cookie.includes(`${THEME_COOKIE}=`);
}

/**
 * La fuente de verdad del tema es la clase `dark` en <html>, no un useState:
 * el script inline de <head> ya la escribió antes del primer paint, y
 * duplicarla en React solo abre la puerta a que las dos se desincronicen.
 * `useSyncExternalStore` lee esa clase y se resuscribe cuando cambia.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * Mínimo por diseño: los tokens CSS resuelven el swap de tema, así que lo
 * único que hace este provider es alternar la clase en <html> y persistir la
 * elección. Ningún componente ramifica por tema en JS.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // "light" no es un default arbitrario: es exactamente lo que dice el HTML
  // que sale del servidor. Los tokens claros viven en `:root` y el oscuro es
  // siempre un override por clase, y esa clase ya no la escribe el servidor
  // —la pone el script inline antes del primer paint—, así que en SSR el
  // documento es claro por definición. El snapshot del cliente lee el DOM ya
  // corregido.
  const getServerSnapshot = useCallback((): Theme => "light", []);
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Sin cookie, seguir al sistema si el usuario lo cambia con la pestaña
  // abierta. Solo toca el DOM; el MutationObserver propaga el cambio.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (hasThemeCookie()) return;
      apply(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    apply(next);
    persist(next);
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}
