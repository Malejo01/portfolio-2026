import Link from "next/link";
import type { LegalBlock, LegalDoc } from "@/content/agencia/legal";
import { senaMonto } from "@/lib/agencia/config";
import { fmt } from "@/lib/agencia/format";
import { RECARGO_MP } from "@/lib/agencia/recargo";

/**
 * Página legal: texto simple con el layout de la agencia. Los
 * `[PLACEHOLDERS]` se resaltan con `<mark>` para que Mauro los vea.
 */
export function LegalPage({ doc, related }: { doc: LegalDoc; related: { label: string; href: string }[] }) {
  return (
    <article className="wrap pb-24 pt-10 sm:pt-16">
      <div className="mx-auto max-w-[760px]">
        <span className="lbl lbl-o">{doc.label}</span>
        <h1 className="h mt-2.5 text-[36px] leading-[1.05] sm:text-[48px]">{doc.title}</h1>
        <p className="mt-3 text-sm text-muted">Última actualización: {doc.updated}</p>
        <div className="prose-ag mt-8">
          <p className="text-[17px] text-text">{rich(doc.intro)}</p>
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.blocks.map((b, i) => (
                <Block key={i} block={b} />
              ))}
            </section>
          ))}
        </div>
        {related.length ? (
          <nav aria-label="Otros documentos legales" className="card mt-12 flex flex-wrap items-center gap-x-5 gap-y-3 p-5">
            <span className="lbl">También</span>
            {related.map((r) => (
              <Link key={r.href} href={r.href} className="lnk">
                {r.label} →
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </article>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") return <p>{rich(block)}</p>;
  return (
    <ul>
      {block.list.map((item) => (
        <li key={item}>{rich(item)}</li>
      ))}
    </ul>
  );
}

/** Reemplaza `{SENA}`/`{RECARGO}`, marca `[PLACEHOLDERS]` y `código`. */
function rich(text: string): React.ReactNode[] {
  const filled = text
    .replaceAll("{SENA}", fmt(senaMonto()))
    .replaceAll("{RECARGO}", `${Math.round(RECARGO_MP * 100)} %`);
  return filled.split(/(\[[^\]]+\]|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("[") && part.endsWith("]")) return <mark key={i}>{part}</mark>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    return part;
  });
}
