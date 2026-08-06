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
export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme | null;
  children: React.ReactNode;
}) {
  // En SSR no hay DOM que leer: vale lo que dijo la cookie. Si no había,
  // "light" coincide con el HTML que se envió y el snapshot del cliente
  // corrige en el primer render si el sistema pedía oscuro.
  const getServerSnapshot = useCallback((): Theme => initialTheme ?? "light", [initialTheme]);
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
