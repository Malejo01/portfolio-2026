import Link from "next/link";

type Tone = "solid" | "ghost";
type Surface = "paper" | "paper-2" | "panel";

const styles: Record<Surface, Record<Tone, string>> = {
  paper: {
    solid: "bg-accent text-accent-ink border-accent font-medium hover:bg-accent-hover hover:border-accent-hover",
    ghost: "bg-paper text-ink border-hair hover:border-ink-soft",
  },
  "paper-2": {
    solid: "bg-accent text-accent-ink border-accent font-medium hover:bg-accent-hover hover:border-accent-hover",
    ghost: "bg-paper-2 text-ink border-hair hover:border-ink-soft",
  },
  panel: {
    solid: "bg-accent-panel text-panel border-accent-panel font-medium hover:bg-accent-panel-hover hover:border-accent-panel-hover",
    ghost: "bg-transparent text-panel-ink border-panel-hair hover:border-panel-soft",
  },
};

const base =
  "hairline inline-flex items-center rounded-chip px-5 py-3 font-mono text-meta no-underline transition-colors hover:no-underline";

/**
 * Un solo componente para todos los CTAs. `external` decide entre <a> y
 * <Link>: los anchors internos (#perfil) y las rutas usan el router;
 * los links salientes y `mailto:` no.
 */
export function ButtonLink({
  href,
  children,
  tone = "ghost",
  surface = "paper",
  external = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  tone?: Tone;
  surface?: Surface;
  external?: boolean;
  className?: string;
}) {
  const cls = `${base} ${styles[surface][tone]} ${className}`;

  if (external || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={cls}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/** Fila de CTAs. Filtra los que todavía no tienen URL en lib/links.ts. */
export function ButtonRow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-wrap gap-2.5 ${className}`}>{children}</div>;
}
