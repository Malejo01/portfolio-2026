import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui/Container";
import { getContent } from "@/lib/content";
import { getLocale } from "@/lib/locale";

/**
 * Skip link + nav + contenedor + footer: el marco visible del sitio.
 *
 * Existe como componente y no solo como layout porque `app/not-found.tsx`
 * lo necesita. El 404 de una URL no matcheada lo resuelve Next contra el
 * root layout —un `not-found.tsx` dentro del route group nunca llega a
 * dispararse para ese caso—, así que la página de 404 no hereda el layout
 * de `(marketing)` y tiene que montar el marco por su cuenta.
 */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
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
