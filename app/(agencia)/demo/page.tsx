import type { Metadata } from "next";
import { DemoForm } from "@/components/agencia/client/DemoForm";
import { DemoResumen } from "@/components/agencia/client/DemoResumen";
import { DemoModo, DemoSena } from "@/components/agencia/client/DemoSena";
import { SenaTabla } from "@/components/agencia/SenaTabla";
import { home } from "@/content/agencia/home";
import { demoCopy as copy } from "@/content/agencia/demo";
import { agendaGrandesHref } from "@/content/agencia/grandes";
import { aliases, combos, plans } from "@/content/agencia/pricing";
import { CALCOM_URL, senaAlias, waLink } from "@/lib/agencia/config";
import { fmt, montoPlanEscrito, senaMinima } from "@/lib/agencia/pricing";

export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.description,
  alternates: { canonical: "/demo" },
  openGraph: { title: copy.metaTitle, description: copy.description, url: "/demo", images: ["/og"] },
};

/** Cal.com en modo embebido: `?embed=true` es el embed sin el chrome de la página. */
function calEmbed(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}embed=true&theme=auto`;
}

/**
 * `/demo`: brief → seña → agenda. Estática: lo elegido (`?a=` o `?plan=`)
 * lo leen en el cliente el formulario, el resumen y la seña (escalonada,
 * tanda P2). Si corresponde el plan del proyecto por escrito, el encabezado
 * pasa a "Primero el plan por escrito" con la charla gratis. Todo lo demás
 * sale de variables de entorno en el build, con fallback a WhatsApp.
 */
export default function DemoPage() {
  const options = [...combos.map((c) => ({ id: c.id, name: `Combo ${c.name}` })), ...plans.map((p) => ({ id: p.id, name: p.name }))];
  const pe = copy.planEscrito;

  return (
    <section className="wrap pb-24 pt-10 sm:pt-16">
      <DemoModo
        demo={
          <>
            <span className="lbl lbl-o">{copy.label}</span>
            <h1 className="h h2">{copy.title}</h1>
            <p className="mb-0 mt-2 max-w-[44em] text-[17px] text-muted">{copy.lead.replace("{SENA}", fmt(senaMinima()))}</p>
          </>
        }
        planEscrito={
          <>
            <span className="lbl lbl-o">{pe.label}</span>
            <h1 className="h h2">{pe.title}</h1>
            <p className="mb-0 mt-2 max-w-[44em] text-[17px] text-muted">{pe.lead.replace("{PLAN}", fmt(montoPlanEscrito()))}</p>
            <a href={agendaGrandesHref} target="_blank" rel="noopener" className="btn btn-p mt-4">
              {pe.charla}
            </a>
          </>
        }
      />
      <DemoResumen copy={{ ...copy.resumen, monthlySuffix: home.pricing.monthlySuffix }} />

      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="card card-big p-6 sm:p-8">
          <span className="lbl lbl-o">{copy.steps.brief}</span>
          <h2 className="h mb-5 mt-2 text-2xl">{copy.brief.title}</h2>
          <DemoForm copy={copy} plans={options} aliases={{ ...aliases }} turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || undefined} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="card flex flex-col gap-3 p-6">
            <span className="lbl lbl-o">{copy.steps.sena}</span>
            <DemoSena copy={copy.sena} alias={senaAlias()}>
              <details className="plans border-t border-border pt-3">
                <summary className="lnk min-h-11">{copy.sena.tabla}</summary>
                <div className="mt-2 text-[14px]">
                  <SenaTabla titulo={false} />
                </div>
              </details>
            </DemoSena>
          </div>

          <div className="card flex flex-col gap-3 p-6">
            <span className="lbl lbl-o">{copy.steps.agenda}</span>
            <h2 className="h text-xl">{copy.agenda.title}</h2>
            <p className="m-0 text-sm leading-relaxed text-muted">{copy.agenda.body}</p>
            {CALCOM_URL ? (
              <iframe
                src={calEmbed(CALCOM_URL)}
                title={copy.agenda.frameTitle}
                loading="lazy"
                className="h-[560px] w-full rounded-14 border border-border bg-surf"
              />
            ) : (
              <a href={waLink("Quiero agendar una videollamada")} target="_blank" rel="noopener" className="btn btn-s">
                {copy.agenda.whatsapp}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
