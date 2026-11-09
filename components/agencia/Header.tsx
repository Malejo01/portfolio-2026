import Link from "next/link";
import { WHATSAPP_TEXTO } from "@/content/agencia/home";
import { site } from "@/content/agencia/site";
import { waLink } from "@/lib/agencia/config";
import { Icon } from "./icons";
import { MalejoMark } from "./MalejoMark";
import { AbrirChat } from "./client/AbrirChat";
import { MobileMenu } from "./client/MobileMenu";
import { SectionSpy } from "./client/SectionSpy";
import { ThemeTextToggle, ThemeToggle } from "./client/ThemeToggle";

/**
 * Menú en píldora, sticky (DISENO.md §4, `01-menu-*.png`). Sin el botón
 * "Estilo": no va en v1.
 *
 * Server Component: los links son HTML del servidor. Las únicas islas son
 * el botón de tema, el explorador de celular, `AbrirChat` (el botón
 * principal abre a Malejo; sin JS, WhatsApp) y `SectionSpy`, que marca el
 * link activo con `aria-current`. En celular, al lado del ☰ va un acceso
 * directo a WhatsApp de 44 × 44 (auditoría P1-2).
 */
export function Header() {
  const { nav, explorer } = site;
  const wa = waLink(WHATSAPP_TEXTO);

  return (
    // El blur va en `::before` y no en el header: `backdrop-filter` vuelve al
    // elemento el bloque contenedor de sus hijos `fixed`, y el explorador de
    // celular quedaría recortado al alto del header.
    <header className="sticky top-0 z-40 py-4 before:absolute before:inset-0 before:-z-10 before:bg-(--nav-bg) before:backdrop-blur-[12px]">
      <a
        href="#contenido"
        className="btn btn-p btn-sm sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-3 focus-visible:z-50"
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
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2.5 lg:ml-0 lg:gap-[18px]">
            <ThemeToggle toLight={nav.themeToLight} toDark={nav.themeToDark} className="hidden lg:inline-flex" />
            <AbrirChat href={wa} className="btn btn-p btn-sm hidden lg:inline-flex">
              <Icon name="chat" size={16} />
              {nav.cta}
            </AbrirChat>
            <a href={wa} target="_blank" rel="noopener" aria-label={nav.whatsapp} className="ibtn text-acc-text lg:hidden">
              <Icon name="whatsapp" size={20} />
            </a>
            <MobileMenu openLabel={explorer.open} closeLabel={explorer.close} title={explorer.title}>
              <nav aria-label={nav.ariaLabel} className="flex-1 overflow-y-auto px-2.5 py-3.5">
                <ul className="flex flex-col gap-1">
                  {explorer.links.map((l) => (
                    <li key={l.href}>
                      <ExplorerLink href={l.href} section={l.section} label={l.label} />
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="flex flex-none flex-col gap-3 border-t border-border p-[18px]">
                <AbrirChat href={wa} className="btn btn-p w-full">
                  <Icon name="chat" size={18} />
                  {nav.cta}
                </AbrirChat>
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

function ExplorerLink({ href, label, section }: { href: string; label: string; section?: string }) {
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
    </Link>
  );
}
