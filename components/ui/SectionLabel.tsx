/**
 * El label de sección es uno de los dos únicos usos del acento (el otro es
 * la acción principal). Sobre panel oscuro sube en luminosidad para AA.
 */
export function SectionLabel({
  children,
  onPanel = false,
  className = "",
}: {
  children: React.ReactNode;
  onPanel?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`m-0 font-mono text-meta tracking-[0.1em] uppercase ${
        onPanel ? "text-accent-panel" : "text-accent"
      } ${className}`}
    >
      {children}
    </p>
  );
}

export function SectionNote({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`m-0 font-mono text-meta text-ink-soft ${className}`}>{children}</p>;
}
