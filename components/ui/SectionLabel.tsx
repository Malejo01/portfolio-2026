/**
 * El label de sección es uno de los dos únicos usos del acento (el otro es
 * la acción principal). Sobre panel oscuro sube en luminosidad para AA.
 *
 * `as` existe porque el label es lo único que nombra a las secciones que no
 * llevan titular propio (Experiencia, Casos, Proyectos): ahí tiene que ser
 * `h2` o la sección no existe en el árbol de headings, que es como se
 * recorre la página con lector de pantalla. Donde sí hay un `h2` real
 * —Perfil, Contacto— el label sigue siendo `p` para no duplicarlo.
 *
 * El render es idéntico en los dos casos: preflight de Tailwind ya iguala
 * `font-size` y `font-weight` del heading, y `m-0` anula el margen.
 */
export function SectionLabel({
  children,
  as: Tag = "p",
  onPanel = false,
  className = "",
}: {
  children: React.ReactNode;
  as?: "p" | "h2";
  onPanel?: boolean;
  className?: string;
}) {
  return (
    <Tag
      className={`m-0 font-mono text-meta tracking-[0.1em] uppercase ${
        onPanel ? "text-accent-panel" : "text-accent"
      } ${className}`}
    >
      {children}
    </Tag>
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
