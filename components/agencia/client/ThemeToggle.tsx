"use client";

import { Icon } from "@/components/agencia/icons";
import { useAgenciaTheme } from "./theme";

/**
 * Botón de tema 44×44 del menú: sol en oscuro, luna en claro (DISENO.md §4).
 * Las etiquetas llegan del servidor.
 */
export function ThemeToggle({
  toLight,
  toDark,
  className = "",
}: {
  toLight: string;
  toDark: string;
  className?: string;
}) {
  const { theme, toggle } = useAgenciaTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      className={`ibtn ${className}`}
      onClick={toggle}
      aria-label={dark ? toLight : toDark}
      title={dark ? toLight : toDark}
    >
      <Icon name={dark ? "sun" : "moon"} size={20} />
    </button>
  );
}

/** La línea "Modo oscuro / Modo claro" del pie del explorador de celular. */
export function ThemeTextToggle({
  darkLabel,
  lightLabel,
  toLight,
  toDark,
}: {
  darkLabel: string;
  lightLabel: string;
  toLight: string;
  toDark: string;
}) {
  const { theme, toggle } = useAgenciaTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? toLight : toDark}
      className="lbl inline-flex min-h-11 items-center gap-2 rounded-lg px-1 normal-case tracking-normal"
    >
      <Icon name={dark ? "moon" : "sun"} size={16} />
      {dark ? darkLabel : lightLabel}
    </button>
  );
}
