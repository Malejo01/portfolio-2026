import { home, type FaqItem } from "@/content/agencia/home";
import { senaMonto } from "@/lib/agencia/config";
import { fmt } from "@/lib/agencia/format";
import { Reveal } from "../client/Reveal";

/**
 * FAQ (`08-faq-*.png`): `<details name="faq">` hace el acordeón exclusivo
 * sin JS. La primera abierta. Se reutiliza en `/servicios/[slug]`. Las
 * respuestas salen de `conocimiento.ts`; `{SENA}` se completa acá, en el
 * servidor, con `SENA_MONTO`.
 */
export function FaqList({ items, name = "faq" }: { items: readonly FaqItem[]; name?: string }) {
  const sena = fmt(senaMonto());
  return (
    <div className="mt-7 flex flex-col gap-3">
      {items.map((item, i) => (
        <details key={item.q} name={name} open={i === 0} className="faq-item card">
          <summary className="flex items-center justify-between gap-4 px-6 py-5 text-[17px] font-semibold">
            {item.q}
            <span
              aria-hidden="true"
              className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-ic-bg text-lg text-acc-text"
            >
              <span className="faq-plus">+</span>
              <span className="faq-minus">−</span>
            </span>
          </summary>
          <p className="m-0 px-6 pb-[22px] text-[15px] leading-[1.6] text-muted">{item.a.replaceAll("{SENA}", sena)}</p>
        </details>
      ))}
    </div>
  );
}

export function Faq() {
  const { faq } = home;
  return (
    <section id="faq" className="wrap max-w-[920px] pt-[72px] sm:pt-24">
      <Reveal>
        <span className="lbl lbl-o">{faq.label}</span>
        <h2 className="h h2">{faq.title}</h2>
      </Reveal>
      <FaqList items={faq.items} />
    </section>
  );
}
