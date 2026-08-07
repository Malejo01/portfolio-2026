import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * Composición común a 404 y error: el mismo bloque en la columna de
 * lectura, sobre `paper`. No usa panel — los tres momentos de panel del
 * sitio están reservados (hero, MaestrIA, contacto) y una pantalla de
 * fallo no es un cuarto momento de énfasis.
 *
 * El `h1` es el título; el label va de `p`, como en el resto del sitio.
 */
export function StatusPage({
  label,
  title,
  body,
  children,
}: {
  label: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-[52vh] flex-col justify-center py-section">
      <SectionLabel className="mb-3.5">{label}</SectionLabel>

      <h1 className="mt-0 mb-lede max-w-[18ch] font-display text-title leading-[1.08] font-semibold opsz-48 tracking-[-0.02em]">
        {title}
      </h1>

      <p className="mt-0 mb-cta max-w-[52ch] text-ink-soft">{body}</p>

      {children}
    </section>
  );
}
