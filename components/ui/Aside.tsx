import { Fragment } from "react";
import type { AsideItem } from "@/lib/types";

/**
 * El carril de anotación del sistema: siempre en mono, siempre sobre un
 * fondo distinto al del contenido y con borde propio (design-system.md §8).
 *
 * `separated` distingue los dos usos del diseño: el aside de perfil separa
 * cada bloque con hairline, el de hero y contacto solo separa el encabezado
 * de estado del resto.
 */
export function Aside({
  items,
  header,
  footer,
  separated = false,
  onPanel = false,
  className = "",
}: {
  items: AsideItem[];
  header?: React.ReactNode;
  /** Bloque libre al final — p. ej. el contacto del hero, que lleva enlace. */
  footer?: React.ReactNode;
  separated?: boolean;
  onPanel?: boolean;
  className?: string;
}) {
  const surface = onPanel
    ? "bg-panel-2 border-panel-hair text-panel-soft"
    : "bg-paper-2 border-hair text-ink-soft";
  const termTone = onPanel ? "text-panel-ink" : "text-ink";
  const rule = onPanel ? "bg-panel-hair" : "bg-hair";

  const divider = <div className={`h-[0.5px] ${rule}`} aria-hidden="true" />;

  return (
    <aside
      className={`hairline grid shrink basis-[27ch] content-start gap-[18px] rounded-aside p-aside-lg font-mono text-meta leading-[1.8] [min-width:min(100%,23ch)] ${surface} ${className}`}
    >
      {header}
      {header && divider}
      {items.map((item, i) => (
        <Fragment key={item.term ?? i}>
          {separated && i > 0 && divider}
          <div>
            {item.term && <span className={`block font-medium ${termTone}`}>{item.term}</span>}
            {item.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </div>
        </Fragment>
      ))}
      {footer}
    </aside>
  );
}

/** Punto de estado + texto. Va como `header` del Aside. */
export function AsideStatus({ children, onPanel = false }: { children: React.ReactNode; onPanel?: boolean }) {
  return (
    <div className={`flex items-center gap-[9px] ${onPanel ? "text-accent-panel" : "text-accent"}`}>
      <span
        aria-hidden="true"
        className={`size-[7px] flex-none rounded-full ${onPanel ? "bg-accent-panel" : "bg-accent"}`}
      />
      <span>{children}</span>
    </div>
  );
}

/** Variante de una sola nota: término + cuerpo, sin divisores. */
export function AsideNote({
  term,
  children,
  onPanel = false,
  className = "",
}: {
  term: string;
  children: React.ReactNode;
  onPanel?: boolean;
  className?: string;
}) {
  const surface = onPanel
    ? "bg-panel-2 border-panel-hair text-panel-soft"
    : "bg-paper-2 border-hair text-ink-soft";

  return (
    <aside
      className={`hairline shrink basis-[27ch] self-start rounded-aside p-aside font-mono text-meta leading-[1.8] [min-width:min(100%,23ch)] ${surface} ${className}`}
    >
      <span className={`mb-1.5 block font-medium ${onPanel ? "text-panel-ink" : "text-ink"}`}>
        {term}
      </span>
      {children}
    </aside>
  );
}
