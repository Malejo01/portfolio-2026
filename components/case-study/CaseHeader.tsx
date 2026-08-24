import Link from "next/link";
import { StatusPill } from "@/components/ui/Chip";
import { localized } from "@/lib/routes";
import type { Locale } from "@/lib/types";

/**
 * Encabezado común a las dos páginas de caso: migas + estado + título +
 * bajada. Lo que cambia entre casos es la composición del cuerpo, no esto.
 */
export function CaseHeader({
  status,
  statusTone = "live",
  year,
  kicker,
  title,
  subtitle,
  backLabel,
  locale,
  onPanel = false,
}: {
  status: string;
  statusTone?: "live" | "wip";
  year: string;
  kicker?: string;
  title: string;
  subtitle: string;
  backLabel: string;
  locale: Locale;
  onPanel?: boolean;
}) {
  return (
    <header className={onPanel ? "text-panel-ink" : undefined}>
      <Link
        href={localized("/#casos", locale)}
        className={`inline-flex items-center gap-2 font-mono text-meta no-underline hover:underline ${
          onPanel ? "text-panel-soft hover:text-panel-ink" : "text-ink-soft hover:text-ink"
        }`}
      >
        <span aria-hidden="true">←</span>
        {backLabel}
      </Link>

      <div
        className={`mt-lede flex flex-wrap items-center gap-2.5 font-mono text-meta ${
          onPanel ? "text-panel-soft" : "text-ink-soft"
        }`}
      >
        <StatusPill tone={statusTone}>{status}</StatusPill>
        <span>{year}</span>
        {kicker && <span>· {kicker}</span>}
      </div>

      <h1 className="mt-3.5 mb-0 font-display text-title leading-[1.08] font-semibold opsz-48 tracking-[-0.02em]">
        {title}
      </h1>

      <p
        className={`mt-4 mb-0 max-w-[34ch] font-display text-decision leading-[1.05] font-semibold opsz-72 tracking-[-0.025em] ${
          onPanel ? "text-panel-ink" : "text-ink"
        }`}
      >
        {subtitle}
      </p>
    </header>
  );
}

/** H2 de subsección dentro de un caso. */
export function CaseHeading({
  children,
  onPanel = false,
  className = "",
}: {
  children: React.ReactNode;
  onPanel?: boolean;
  className?: string;
}) {
  return (
    <h2
      className={`font-display text-sub font-semibold opsz-18 tracking-[-0.01em] ${
        onPanel ? "text-panel-ink" : "text-ink"
      } ${className}`}
    >
      {children}
    </h2>
  );
}
