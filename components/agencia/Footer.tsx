import Link from "next/link";
import { site } from "@/content/agencia/site";
import { MalejoMark } from "./MalejoMark";

/**
 * Pie (DISENO.md §4, `10-pie-*.png`): marca + tres columnas. Los links miden
 * 44 px de alto (área táctil, auditoría P1-10); en celular van en dos
 * columnas para que el pie no se estire.
 */
export function Footer() {
  const { footer } = site;

  return (
    <footer className="border-t border-border">
      <div className="wrap grid grid-cols-2 gap-x-5 gap-y-6 pb-10 pt-9 sm:grid-cols-3 sm:gap-8 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="col-span-2 flex flex-col gap-2 sm:col-span-3 lg:col-span-1">
          <span className="inline-flex items-center gap-2.5">
            <MalejoMark size={28} className="text-acc" />
            <span className="h text-2xl">{site.name}</span>
          </span>
          <p className="m-0 max-w-[24em] text-sm text-muted">{footer.tagline}</p>
        </div>
        {footer.columns.map((col) => (
          <div key={col.label} className={`flex flex-col text-[14px] leading-[1.3] ${col.links.length > 2 ? "row-span-2 sm:row-span-1" : ""}`}>
            <span className="lbl mb-1">{col.label}</span>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className="flex min-h-11 items-center text-text no-underline hover:text-acc-text sm:min-h-8">
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
