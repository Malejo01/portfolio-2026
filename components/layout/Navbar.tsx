import Link from "next/link";
import { LocaleToggle } from "@/components/ui/LocaleToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { Locale, NavContent } from "@/lib/types";

/**
 * Sticky de 58px. No hay menú hamburguesa: en angosto el nav colapsa a los
 * dos destinos que importan (Casos, Contacto) y los toggles. Un drawer para
 * cinco anclas sería más JS del que el problema pide.
 */
export function Navbar({ nav, locale }: { nav: NavContent; locale: Locale }) {
  const compact = nav.links.filter((l) => l.href === "/#casos" || l.href === "/#contacto");

  return (
    <header className="sticky top-0 z-20 border-b-[0.5px] border-hair bg-paper">
      <nav className="mx-auto flex h-[58px] w-full max-w-[1240px] items-center justify-between gap-4 px-gutter">
        <Link
          href="/"
          className="font-display font-bold opsz-14 text-body tracking-[-0.01em] text-ink no-underline hover:no-underline"
        >
          {nav.wordmark}
        </Link>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-[clamp(10px,2.2vw,26px)] font-mono text-meta tracking-[0.02em]">
          <div className="hidden min-w-0 flex-wrap items-center justify-end gap-[clamp(12px,2.2vw,26px)] md:flex">
            {nav.links.map((link) => (
              <Link key={link.href} href={link.href} className="text-ink-soft">
                {link.label}
              </Link>
            ))}
            <span aria-hidden="true" className="h-[18px] w-[0.5px] bg-hair" />
          </div>

          <div className="flex items-center gap-3 md:hidden">
            {compact.map((link) => (
              <Link key={link.href} href={link.href} className="text-ink-soft">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LocaleToggle locale={locale} ariaLabel={nav.localeToggleAria} />
            <ThemeToggle label={nav.themeToggleAria} />
          </div>
        </div>
      </nav>
    </header>
  );
}
