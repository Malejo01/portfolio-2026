"use client";

import { useTheme } from "@/components/ThemeProvider";

/**
 * El chip mide 30px, que es el tamaño del diseño aprobado y está por debajo
 * del mínimo táctil de 44px (WCAG 2.5.8). En vez de agrandar el botón —lo
 * que rompería la barra de 58px y el ritmo del nav— el ::after centrado
 * extiende solo el área de toque. Es transparente, vive dentro del botón,
 * así que el click sigue llegando al mismo handler. Misma constante en
 * `LocaleToggle`: si cambia una, cambia la otra.
 */
export const TAP_TARGET_44 =
  "relative after:absolute after:top-1/2 after:left-1/2 after:size-[44px] after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

/**
 * Los dos íconos se renderizan siempre y la clase `dark` de <html> decide
 * cuál se ve. Así el botón muestra el estado correcto desde el primer paint,
 * antes de que hidrate React — no hay parpadeo del ícono.
 */
export function ThemeToggle({ label, onPanel = false }: { label: string; onPanel?: boolean }) {
  const { toggleTheme } = useTheme();

  const tone = onPanel
    ? "border-panel-hair text-panel-soft hover:text-panel-ink hover:border-panel-soft"
    : "border-hair text-ink-soft hover:text-ink hover:border-ink-soft";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      className={`hairline grid size-[30px] cursor-pointer place-items-center rounded-chip bg-transparent transition-colors ${TAP_TARGET_44} ${tone}`}
    >
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="size-[15px] dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      >
        <circle cx="10" cy="10" r="3.6" />
        <path d="M10 1.6v2M10 16.4v2M18.4 10h-2M3.6 10h-2M15.94 4.06l-1.41 1.41M5.47 14.53l-1.41 1.41M15.94 15.94l-1.41-1.41M5.47 5.47L4.06 4.06" />
      </svg>
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="hidden size-[15px] dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      >
        <path d="M16.5 12.4A7 7 0 0 1 7.6 3.5a7 7 0 1 0 8.9 8.9Z" />
      </svg>
    </button>
  );
}
