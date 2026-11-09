/**
 * Íconos de trazo de la agencia, copiados de `docs/agencia/referencia.html`.
 * Sin estado: sirven tanto en Server Components como dentro de las islas.
 */
export type IconName =
  | "web"
  | "app"
  | "ia"
  | "cart"
  | "calendar"
  | "box"
  | "wrench"
  | "sun"
  | "moon"
  | "arrow"
  | "check"
  | "close"
  | "menu"
  | "chat"
  | "whatsapp"
  | "send";

const PATHS: Record<IconName, React.ReactNode> = {
  web: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
    </>
  ),
  app: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  ia: (
    <>
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <path d="M12 4v4M9 13h.01M15 13h.01" />
    </>
  ),
  cart: (
    <>
      <path d="M4 7h16l-1.5 9h-13z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="16" cy="20" r="1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  box: (
    <>
      <path d="M3 7l9-4 9 4-9 4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </>
  ),
  wrench: <path d="M14 6a4 4 0 0 0 5 5l-8 8a2 2 0 0 1-3-3l8-8a4 4 0 0 0-2-2z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12l5 5L20 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  chat: <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />,
  /** Globo con auricular, de trazo y en `currentColor`: no es el logo de WhatsApp. */
  whatsapp: (
    <>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
      <path d="M9.3 8.4c.3-.4.7-.5 1-.3l.8.5.4 1.6-.8.7c.4.9 1.1 1.6 2 2l.7-.8 1.6.4.5.8c.2.3.1.7-.3 1-.9.6-2 .6-3 .1a7 7 0 0 1-3-3c-.5-1-.5-2.1.1-3z" />
    </>
  ),
  send: <path d="M5 12h14M13 6l6 6-6 6" />,
};

const STROKE: Partial<Record<IconName, number>> = { check: 2.4, arrow: 2, close: 2, send: 2 };

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? STROKE[name] ?? 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ flex: "none" }}
    >
      {PATHS[name]}
    </svg>
  );
}

/** ✓ verde de los ítems de tarjeta. */
export function Check({ size = 16 }: { size?: number }) {
  return (
    <span className="inline-flex text-ok" style={{ marginTop: 1 }}>
      <Icon name="check" size={size} />
    </span>
  );
}
