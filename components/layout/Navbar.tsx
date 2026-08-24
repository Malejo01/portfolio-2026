import Link from "next/link";
import { LocaleToggle } from "@/components/ui/LocaleToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { localized } from "@/lib/routes";
import type { Locale, NavContent } from "@/lib/types";

/**
 * Sticky de 58px. No hay menú hamburguesa: en angosto el nav colapsa a los
 * dos destinos que importan (Casos, Contacto) y los toggles. Un drawer para
 * cinco anclas sería más JS del que el problema pide.
 *
 * Los enlaces son texto de 13px, así que su caja natural mide ~22px de alto:
 * por debajo del mínimo de 44px que pide WCAG 2.5.8. `min-h` los estira sin
 * mover nada — sobra altura dentro de la barra de 58px y el `items-center`
 * del contenedor los mantiene ópticamente en la misma línea.
 */
const NAV_LINK = "inline-flex min-h-[44px] items-center text-ink-soft";

export function Navbar({ nav, locale }: { nav: NavContent; locale: Locale }) {
  const compact = nav.links.filter((l) => l.href === "/#casos" || l.href === "/#contacto");

  return (
    <header className="sticky top-0 z-20 border-b-[0.5px] border-hair bg-paper">
      <nav className="mx-auto flex h-[58px] w-full max-w-[1240px] items-center justify-between gap-4 px-gutter">
        <Link
          href={localized("/", locale)}
          className="inline-flex min-h-[44px] items-center font-display font-bold opsz-14 text-body tracking-[-0.01em] text-ink no-underline hover:no-underline"
        >
          {nav.wordmark}
        </Link>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-[clamp(10px,2.2vw,26px)] font-mono text-meta tracking-[0.02em]">
          <div className="hidden min-w-0 flex-wrap items-center justify-end gap-[clamp(12px,2.2vw,26px)] md:flex">
            {nav.links.map((link) => (
              <Link key={link.href} href={localized(link.href, locale)} className={NAV_LINK}>
                {link.label}
              </Link>
            ))}
            <span aria-hidden="true" className="h-[18px] w-[0.5px] bg-hair" />
          </div>

          <div className="flex items-center gap-4 md:hidden">
            {compact.map((link) => (
              <Link key={link.href} href={localized(link.href, locale)} className={NAV_LINK}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* gap-3, no gap-2: los toggles conservan su tamaño visual pero
              extienden el área táctil a 44px con un ::after centrado, y con
              8px de separación esas dos áreas se pisaban 1,5px. */}
          <div className="flex items-center gap-3">
            <LocaleToggle locale={locale} ariaLabel={nav.localeToggleAria} />
            <ThemeToggle label={nav.themeToggleAria} />
          </div>
        </div>
      </nav>
    </header>
  );
}
