import Link from "next/link";
import { site } from "@/content/agencia/site";
import { MalejoMark } from "./MalejoMark";
import { MobileMenu } from "./client/MobileMenu";
import { SectionSpy } from "./client/SectionSpy";
import { ThemeTextToggle, ThemeToggle } from "./client/ThemeToggle";

/**
 * Menú en píldora, sticky (DISENO.md §4, `01-menu-*.png`). Sin el botón
 * "Estilo": no va en v1.
 *
 * Server Component: los links son HTML del servidor. Las únicas islas son
 * el botón de tema, el explorador de celular y `SectionSpy`, que marca el
 * link activo con `aria-current`.
 */
export function Header() {
  const { nav, explorer } = site;

  return (
    // El blur va en `::before` y no en el header: `backdrop-filter` vuelve al
    // elemento el bloque contenedor de sus hijos `fixed`, y el explorador de
    // celular quedaría recortado al alto del header.
    <header className="sticky top-0 z-40 py-4 before:absolute before:inset-0 before:-z-10 before:bg-(--nav-bg) before:backdrop-blur-[12px]">
      <a
        href="#contenido"
        className="btn btn-p btn-sm absolute left-4 top-3 -translate-y-24 focus-visible:translate-y-0"
      >
        {site.skip}
      </a>
      <div className="wrap">
        <nav
          aria-label={nav.ariaLabel}
          className="card flex items-center gap-[18px] rounded-[18px] py-2 pl-[22px] pr-2"
        >
          <Link href="/" aria-label={nav.home} className="inline-flex items-center gap-2.5 no-underline">
            <MalejoMark size={30} className="text-acc" />
            <span className="h text-[22px]">{site.name}</span>
          </Link>

          <ul className="hidden flex-1 gap-1 lg:flex">
            {nav.links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  data-nav-section={l.section}
                  className="inline-flex items-center gap-1.5 rounded-[14px] px-3.5 py-2 text-[15px] text-muted no-underline transition-colors hover:text-text aria-[current=true]:bg-ic-bg aria-[current=true]:text-acc-text"
                >
                  {l.label}
                  {l.chip ? <span className="tag tag-xs">{l.chip}</span> : null}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-[18px] lg:ml-0">
            <ThemeToggle toLight={nav.themeToLight} toDark={nav.themeToDark} className="hidden lg:inline-flex" />
            <Link href={nav.cta.href} className="btn btn-p btn-sm hidden lg:inline-flex">
              {nav.cta.label}
            </Link>
            <MobileMenu openLabel={explorer.open} closeLabel={explorer.close} title={explorer.title}>
              <nav aria-label={nav.ariaLabel} className="flex-1 overflow-y-auto px-2.5 py-3.5">
                <ul className="flex flex-col gap-1">
                  {explorer.links.map((l) => (
                    <li key={l.href}>
                      <ExplorerLink href={l.href} section={l.section} label={l.label} />
                    </li>
                  ))}
                </ul>
                <hr className="mx-3.5 my-3.5 border-0 border-t border-border" />
                <ExplorerLink
                  href={explorer.portfolio.href}
                  label={explorer.portfolio.label}
                  chip={explorer.portfolio.chip}
                />
              </nav>
              <div className="flex flex-none flex-col gap-3 border-t border-border p-[18px]">
                <Link href={nav.cta.href} className="btn btn-p w-full">
                  {nav.cta.label}
                </Link>
                <div className="flex justify-end">
                  <ThemeTextToggle
                    darkLabel={explorer.darkLabel}
                    lightLabel={explorer.lightLabel}
                    toLight={nav.themeToLight}
                    toDark={nav.themeToDark}
                  />
                </div>
              </div>
            </MobileMenu>
          </div>
        </nav>
      </div>
      <SectionSpy />
    </header>
  );
}

function ExplorerLink({
  href,
  label,
  section,
  chip,
}: {
  href: string;
  label: string;
  section?: string;
  chip?: string;
}) {
  return (
    <Link
      href={href}
      data-nav-section={section}
      className="group flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-[17px] text-text no-underline aria-[current=true]:bg-ic-bg aria-[current=true]:font-semibold aria-[current=true]:text-acc-text"
    >
      <span aria-hidden="true" className="text-[10px] text-muted group-aria-[current=true]:text-acc-text">
        ▸
      </span>
      <span className="flex-1">{label}</span>
      {chip ? <span className="tag tag-xs">{chip}</span> : null}
    </Link>
  );
}
