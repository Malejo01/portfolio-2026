import type { FaqItem } from "@/content/agencia/home";
import { senaMonto } from "@/lib/agencia/config";
import { fmt } from "@/lib/agencia/format";

/**
 * Preguntas frecuentes (`08-faq-*.png`): `<details name>` hace el acordeón
 * exclusivo sin JS. Lo usan el cierre de la home (3 preguntas, `compact`,
 * todas cerradas) y cada `/servicios/[slug]` (3 preguntas, cerradas desde
 * la tanda P1: el detalle a un clic, §1.6). Las
 * respuestas salen de `conocimiento.ts`; `{SENA}` se completa acá, en el
 * servidor, con `SENA_MONTO`.
 */
export function FaqList({
  items,
  name = "faq",
  compact = false,
  primeraAbierta = !compact,
}: {
  items: readonly FaqItem[];
  name?: string;
  compact?: boolean;
  primeraAbierta?: boolean;
}) {
  const sena = fmt(senaMonto());
  return (
    <div className={`flex flex-col ${compact ? "mt-3 gap-2 lg:grid lg:grid-cols-3 lg:items-start lg:gap-3" : "mt-7 gap-3"}`}>
      {items.map((item, i) => (
        <details key={item.q} name={name} open={primeraAbierta && i === 0} className={`faq-item card ${compact ? "rounded-[16px] shadow-none" : ""}`}>
          <summary className={`flex items-center justify-between gap-4 font-semibold ${compact ? "min-h-12 px-4 py-2.5 text-[15px]" : "px-6 py-5 text-[17px]"}`}>
            {item.q}
            <span
              aria-hidden="true"
              className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-ic-bg text-lg text-acc-text"
            >
              <span className="faq-plus">+</span>
              <span className="faq-minus">−</span>
            </span>
          </summary>
          <p className={`m-0 leading-[1.6] text-muted ${compact ? "px-4 pb-4 text-sm" : "px-6 pb-[22px] text-[15px]"}`}>{item.a.replaceAll("{SENA}", sena)}</p>
        </details>
      ))}
    </div>
  );
}
