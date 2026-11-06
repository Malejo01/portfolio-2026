/**
 * Isotipo de Malejo. SVG con `currentColor`: el color lo pone quien lo usa
 * (`text-acc` en el menú, el pie y el cierre). Geometría copiada de
 * `docs/agencia/referencia.html`; `strokeWidth` 4,8 por defecto y 3,2 en la
 * marca de agua del hero.
 */
export function MalejoMark({
  size = 30,
  strokeWidth = 4.8,
  className,
  style,
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="-22.2 -29.7 144.4 144.4"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ flex: "none", ...style }}
    >
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round">
        <path d="M-11.8 0 L-11.8 85 A11.8 11.8 0 0 0 11.8 85 L11.8 0 A11.8 11.8 0 0 0 -11.8 0 Z" />
        <path d="M88.2 0 L88.2 85 A11.8 11.8 0 0 0 111.8 85 L111.8 0 A11.8 11.8 0 0 0 88.2 0 Z" />
        <path d="M-8.34 8.34 L41.66 58.34 A11.8 11.8 0 0 0 58.34 41.66 L8.34 -8.34 A11.8 11.8 0 0 0 -8.34 8.34 Z" />
        <path d="M91.66 -8.34 L41.66 41.66 A11.8 11.8 0 0 0 58.34 58.34 L108.34 8.34 A11.8 11.8 0 0 0 91.66 -8.34 Z" />
        <circle cx="0" cy="0" r="9.8" />
        <circle cx="0" cy="85" r="9.8" />
        <circle cx="100" cy="0" r="9.8" />
        <circle cx="100" cy="85" r="9.8" />
        <circle cx="50" cy="50" r="9.8" />
      </g>
    </svg>
  );
}
