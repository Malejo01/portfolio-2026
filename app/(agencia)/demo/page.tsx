import type { Metadata } from "next";
import { DemoForm } from "@/components/agencia/client/DemoForm";
import { DemoResumen } from "@/components/agencia/client/DemoResumen";
import { home } from "@/content/agencia/home";
import { demoCopy as copy } from "@/content/agencia/demo";
import { aliases, combos, plans } from "@/content/agencia/pricing";
import { CALCOM_URL, SENA_URL, senaAlias, senaMonto, waLink } from "@/lib/agencia/config";
import { fmt } from "@/lib/agencia/format";

export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.description,
  alternates: { canonical: "/demo" },
  openGraph: { title: copy.metaTitle, description: copy.description, url: "/demo", images: ["/og"] },
};

const sena = (t: string) => t.replaceAll("{SENA}", fmt(senaMonto()));

/** Cal.com en modo embebido: `?embed=true` es el embed sin el chrome de la página. */
function calEmbed(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}embed=true&theme=auto`;
}

/**
 * `/demo`: brief → seña → agenda. Estática: el plan elegido (`?plan=`) lo
 * leen en el cliente el formulario y el resumen (total, pagos y la seña), y todo lo demás sale de variables de
 * entorno en el build, con fallback a WhatsApp.
 */
export default function DemoPage() {
  const options = [...combos.map((c) => ({ id: c.id, name: `Combo ${c.name}` })), ...plans.map((p) => ({ id: p.id, name: p.name }))];
  const alias = senaAlias();

  return (
    <section className="wrap pb-24 pt-10 sm:pt-16">
      <span className="lbl lbl-o">{copy.label}</span>
      <h1 className="h h2">{copy.title}</h1>
      <p className="mb-0 mt-2 max-w-[44em] text-[17px] text-muted">{sena(copy.lead)}</p>
      <DemoResumen copy={{ ...copy.resumen, monthlySuffix: home.pricing.monthlySuffix }} sena={sena(copy.resumen.sena)} />

      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="card card-big p-6 sm:p-8">
          <span className="lbl lbl-o">{copy.steps.brief}</span>
          <h2 className="h mb-5 mt-2 text-2xl">{copy.brief.title}</h2>
          <DemoForm copy={copy} plans={options} aliases={{ ...aliases }} turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || undefined} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="card flex flex-col gap-3 p-6">
            <span className="lbl lbl-o">{copy.steps.sena}</span>
            <h2 className="h text-xl">{sena(copy.sena.title)}</h2>
            <p className="m-0 text-sm leading-relaxed text-muted">{copy.sena.body}</p>
            {SENA_URL ? (
              <a href={SENA_URL} target="_blank" rel="noopener" className="btn btn-p">
                {copy.sena.pay} · {fmt(senaMonto())}
              </a>
            ) : alias ? (
              <div className="rounded-[14px] border border-border bg-surf-2 p-4">
                <span className="lbl text-[10px]">{copy.sena.alias}</span>
                <div className="mt-1 font-mono text-lg font-semibold">{alias}</div>
              </div>
            ) : (
              <a href={waLink(copy.sena.whatsappText)} target="_blank" rel="noopener" className="btn btn-s">
                {copy.sena.whatsapp}
              </a>
            )}
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
                className="h-[560px] w-full rounded-[14px] border border-border bg-surf"
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
