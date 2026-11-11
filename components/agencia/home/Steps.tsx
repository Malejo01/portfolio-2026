import Link from "next/link";
import { home } from "@/content/agencia/home";
import { Check } from "../icons";
import { completarPagos } from "../pagos";
import { PlanDialog } from "../client/PlanDialog";
import { Reveal } from "../client/Reveal";

/**
 * Cómo trabajo (tanda P1, §4.1): 3 pasos, "Me contás → Ves tu demo en 72 h
 * → Pagás en 2 o 3 veces". La seña y el detalle van al modal "¿Cómo
 * funciona la seña?". Una sola lista: en celular es una tarjeta con los
 * pasos numerados; desde `sm` cada paso es su propia tarjeta, en fila de 3.
 */
export function Steps() {
  const { steps } = home;

  return (
    <section id="como-trabajo" className="wrap pt-14 sm:pt-16">
      <Reveal>
        <span className="lbl lbl-o">{steps.label}</span>
        <h2 className="h h2">{steps.title}</h2>
      </Reveal>
      <Reveal>
        <ol className="card m-0 mt-6 flex list-none flex-col gap-3 p-5 sm:mt-7 sm:grid sm:grid-cols-3 sm:gap-5 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          {steps.items.map((s, i) => (
            <li key={s.title} className="flex gap-3.5 sm:flex-col sm:gap-2.5 sm:rounded-[22px] sm:border sm:border-border sm:border-t-hl sm:bg-surf sm:p-5 sm:shadow-card">
              <span
                aria-hidden="true"
                className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-ic-bg font-mono text-sm font-semibold text-acc-text"
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="h text-[17px] sm:text-xl">
                  <span className="sr-only">
                    {steps.stepLabel} {i + 1}:{" "}
                  </span>
                  {s.title}
                </h3>
                <p className="m-0 text-sm leading-normal text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 sm:mt-4">
        <Link href={steps.demo.href} className="lnk min-h-11 text-[15px]">
          {steps.demo.label}
        </Link>
        <PlanDialog variant="info" label={steps.sena.trigger} title={steps.sena.title} closeLabel={home.pricing.modal.cerrar} triggerClassName="lnk min-h-11 text-[15px]">
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {steps.sena.items.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check />
                {completarPagos(t)}
              </li>
            ))}
          </ul>
        </PlanDialog>
      </div>
    </section>
  );
}
