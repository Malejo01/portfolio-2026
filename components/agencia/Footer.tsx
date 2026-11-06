import Link from "next/link";
import { site } from "@/content/agencia/site";
import { MalejoMark } from "./MalejoMark";

/** Pie (DISENO.md §4, `10-pie-*.png`): marca + tres columnas. */
export function Footer() {
  const { footer } = site;

  return (
    <footer className="border-t border-border">
      <div className="wrap grid grid-cols-1 gap-8 pb-12 pt-10 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="flex flex-col gap-2 sm:col-span-3 lg:col-span-1">
          <span className="inline-flex items-center gap-2.5">
            <MalejoMark size={28} className="text-acc" />
            <span className="h text-2xl">{site.name}</span>
          </span>
          <p className="m-0 max-w-[24em] text-sm text-muted">{footer.tagline}</p>
        </div>
        {footer.columns.map((col) => (
          <div key={col.label} className="flex flex-col gap-2.5 text-[14px] leading-[normal]">
            <span className="lbl">{col.label}</span>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className="text-text no-underline hover:text-acc-text">
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
