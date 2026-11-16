import Link from "next/link";
import { home } from "@/content/agencia/home";
import { Check } from "../icons";
import { completarPagos } from "../pagos";
import { PlanDialog } from "../client/PlanDialog";
import { SenaTabla } from "../SenaTabla";
import { Reveal } from "../client/Reveal";
import { Garabato } from "../client/Garabato";
import { estiloCopy } from "@/content/agencia/estilos";
import { SUBRAYADO } from "./garabatos";

/**
 * Cómo trabajo (tanda P2, §6.5): 3 pasos, "Armás lo que necesitás → Lo
 * charlamos y ves tu demo → Pagás en 2 o 3 veces". El paso 2 abre el modal
 * de la seña escalonada ("¿Cómo funciona la seña?", con la tabla de
 * tramos). Una sola lista: en celular es una tarjeta con los pasos
 * numerados; desde `sm` cada paso es su propia tarjeta, en fila de 3.
 */
export function Steps() {
  const { steps } = home;
  const sena = (
    <PlanDialog variant="info" label={steps.sena.trigger} title={steps.sena.title} closeLabel={home.pricing.modal.cerrar} triggerClassName="lnk -my-1 min-h-11 self-start text-[14px]">
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {steps.sena.items.map((t) => (
          <li key={t} className="flex items-start gap-2">
            <Check />
            {completarPagos(t)}
          </li>
        ))}
      </ul>
      <SenaTabla />
    </PlanDialog>
  );

  return (
    <section id="como-trabajo" className="wrap pt-14 sm:pt-16">
      <Reveal className="relative">
        <span className="lbl lbl-o">{steps.label}</span>
        <h2 className="h h2">{steps.title}</h2>
        <span data-solo-estilo="aula" className="block h-4 w-[min(320px,80%)] text-tono-2">
          <Garabato trazos={[SUBRAYADO]} viewBox="0 0 320 16" ancho={4} className="h-4 w-full" />
        </span>
        <span data-solo-estilo="aula" aria-hidden="true" className="garabato absolute right-4 top-2 hidden -rotate-3 font-titulo text-[30px] text-tono-1 lg:block">
          {estiloCopy.aula.garabatos.demo}
        </span>
      </Reveal>
      <Reveal>
        <ol className="card m-0 mt-6 flex list-none flex-col gap-3 p-5 sm:mt-7 sm:grid sm:grid-cols-3 sm:gap-5 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          {steps.items.map((s, i) => (
            <li key={s.title} className={`con-tono tono-${(i % 3) + 1} paso-tono flex gap-3.5 sm:flex-col sm:gap-2.5 sm:rounded-22 sm:border sm:border-border sm:border-t-hl sm:bg-surf sm:p-5 sm:shadow-card`}>
              <span
                aria-hidden="true"
                className="paso-num inline-flex h-8 w-8 flex-none items-center justify-center rounded-10 bg-ic-bg font-mono text-sm font-semibold text-acc-text"
              >
                <span data-solo-estilo="tech">{i + 1}</span>
                <span data-solo-estilo="institucional">{String(i + 1).padStart(2, "0")}</span>
                <span data-solo-estilo="aula">
                  {steps.stepLabel} {i + 1}
                </span>
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="h text-[17px] sm:text-xl">
                  <span className="sr-only">
                    {steps.stepLabel} {i + 1}:{" "}
                  </span>
                  {s.title}
                </h3>
                <p className="m-0 text-sm leading-normal text-muted">{s.body}</p>
                {i === steps.pasoSena ? sena : null}
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 sm:mt-4">
        <Link href={steps.demo.href} className="lnk min-h-11 text-[15px]">
          {steps.demo.label}
        </Link>

      </div>
    </section>
  );
}
