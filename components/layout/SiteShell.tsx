import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/Container";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/types";

/**
 * Skip link + nav + contenedor + footer: el marco visible del sitio.
 *
 * Existe como componente y no solo como layout porque las páginas de 404 lo
 * necesitan por su cuenta.
 *
 * El locale llega por prop. Antes lo resolvía con `getLocale()`, que leía
 * `cookies()` y volvía dinámica cualquier ruta que montara este marco — o
 * sea, todas.
 */
export function SiteShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const content = getContent(locale);

  return (
    <>
      <a
        href="#main"
        className="hairline sr-only rounded-chip border-hair bg-paper px-4 py-2 font-mono text-meta text-ink focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        {content.nav.skipToContent}
      </a>
      <Navbar nav={content.nav} locale={locale} />
      <Container>
        <main id="main">{children}</main>
        <Footer footer={content.footer} />
      </Container>
    </>
  );
}
