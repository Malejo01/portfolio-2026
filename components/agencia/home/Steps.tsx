import { home } from "@/content/agencia/home";
import { senaMonto } from "@/lib/agencia/config";
import { fmt } from "@/lib/agencia/pricing";
import { Reveal, RevealGroup, RevealItem } from "../client/Reveal";

/** Reemplaza `{SENA}` por el monto de `SENA_MONTO` (default $20.000). */
export function withSena(text: string): string {
  return text.replaceAll("{SENA}", fmt(senaMonto()));
}

/** Cómo trabajo: 4 pasos (`04-como-trabajo-*.png`). */
export function Steps() {
  const { steps } = home;

  return (
    <section id="como-trabajo" className="wrap pt-[72px] sm:pt-24">
      <Reveal>
        <span className="lbl lbl-o">{steps.label}</span>
        <h2 className="h h2">{steps.title}</h2>
        <p className="mb-0 mt-2 text-[17px] text-muted">{withSena(steps.lead)}</p>
      </Reveal>
      <RevealGroup className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.items.map((s) => (
          <RevealItem key={s.label} className="flex">
            <div className="card flex flex-1 flex-col gap-2.5 p-6">
              <span className="lbl lbl-o">{s.label}</span>
              <h3 className="h text-xl">{withSena(s.title)}</h3>
              <p className="m-0 text-sm leading-normal text-muted">{s.body}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
