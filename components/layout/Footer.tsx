import type { FooterContent } from "@/lib/types";

export function Footer({ footer }: { footer: FooterContent }) {
  return (
    <footer className="flex flex-wrap justify-between gap-x-6 gap-y-2 py-[clamp(24px,3.4vw,40px)] font-mono text-meta text-ink-soft">
      <span>{footer.credit}</span>
      <span>{footer.built}</span>
      <span>{footer.scale}</span>
    </footer>
  );
}
