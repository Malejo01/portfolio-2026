/** Chip de stack o highlight. Fondo un escalón por debajo del contenedor. */
export function Chip({
  children,
  surface = "paper",
}: {
  children: React.ReactNode;
  surface?: "paper" | "paper-2";
}) {
  return (
    <span
      className={`hairline rounded-chip border-hair px-[9px] py-1 ${
        surface === "paper" ? "bg-paper" : "bg-paper-2"
      }`}
    >
      {children}
    </span>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2 font-mono text-meta text-ink-soft">{children}</div>
  );
}

/**
 * Pill de estado. `live` usa el acento (es una afirmación fuerte: está
 * corriendo); `wip` se queda en tinta suave para no competir.
 */
export function StatusPill({
  children,
  tone = "live",
}: {
  children: React.ReactNode;
  tone?: "live" | "wip";
}) {
  if (tone === "wip") {
    return (
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-ink-soft" />
        {children}
      </span>
    );
  }

  return (
    <span className="hairline inline-flex items-center gap-[7px] rounded-pill border-accent px-2.5 py-[3px] text-accent">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}
